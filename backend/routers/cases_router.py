"""Case management router.

Vault parity (matches ApexVault guarantees):
  - intake_data fields (ssn, dob, income, phone, address_line1, etc.) are passed
    through vault.protect_document() before every insert/update so they are stored
    as AES-256-GCM envelopes — never as plaintext.
  - vault.unprotect_document() decrypts on read so the API surface is transparent.
  - Every state-mutating operation (create, update, claim) writes an immutable
    audit record via _write_audit().
  - get_case strips data_url from embedded document listings — raw bytes are only
    accessible via the signed-URL endpoint in case_ops_router.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user, require_role
from database import (
    audit_log_col,
    cases_col,
    documents_col,
    messages_col,
    tasks_col,
    users_col,
    serialize_doc,
    serialize_list,
    utcnow,
)
from models import Case, CaseCreate, CaseUpdate, new_id
from vault import protect_document, unprotect_document

router = APIRouter(prefix="/cases", tags=["cases"])


# ── Immutable audit helper ────────────────────────────────────────────────────

async def _write_audit(actor: dict, action: str, target: str, meta: dict | None = None) -> None:
    """Append an immutable audit event. Insert-only — never updates existing records."""
    await audit_log_col.insert_one(
        {
            "id": new_id(),
            "actor_id": actor.get("id"),
            "actor_name": actor.get("name"),
            "actor_role": actor.get("role"),
            "action": action,
            "target": target,
            "meta": meta or {},
            "created_at": utcnow().isoformat(),
        }
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("")
async def create_case(payload: CaseCreate, user: dict = Depends(get_current_user)):
    resident_id = payload.resident_id or user["id"]
    resident = await users_col.find_one({"id": resident_id}, {"_id": 0, "password_hash": 0})

    case_doc = Case(
        title=payload.title,
        description=payload.description,
        resident_id=resident_id,
        resident_name=(resident or {}).get("name", "Unknown"),
        urgency_score=payload.urgency_score,
        category=payload.category,
    ).model_dump()

    # Vault-protect any sensitive fields inside intake_data before persistence
    if case_doc.get("intake_data"):
        case_doc["intake_data"] = protect_document(case_doc["intake_data"])

    await cases_col.insert_one(case_doc)
    await _write_audit(
        user, "case.create", case_doc["id"],
        {"resident_id": resident_id, "category": payload.category, "urgency": payload.urgency_score},
    )

    # Return with intake_data decrypted for caller
    out = serialize_doc(case_doc)
    if out.get("intake_data"):
        out["intake_data"] = unprotect_document(out["intake_data"])
    return out


@router.get("")
async def list_cases(
    user: dict = Depends(get_current_user),
    status: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to_me: bool = False,
):
    query: dict = {}
    if user["role"] == "resident":
        query["resident_id"] = user["id"]
    if user["role"] == "caseworker" and assigned_to_me:
        query["caseworker_id"] = user["id"]
    if status:
        query["status"] = status
    if category:
        query["category"] = category

    docs = await cases_col.find(query, {"_id": 0}).sort("urgency_score", -1).to_list(500)
    result = serialize_list(docs)
    for doc in result:
        if doc.get("intake_data"):
            doc["intake_data"] = unprotect_document(doc["intake_data"])
    return result


@router.get("/{case_id}")
async def get_case(case_id: str, user: dict = Depends(get_current_user)):
    doc = await cases_col.find_one({"id": case_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Case not found")
    if user["role"] == "resident" and doc["resident_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    tasks = await tasks_col.find({"case_id": case_id}, {"_id": 0}).to_list(200)
    msgs = await messages_col.find({"case_id": case_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    raw_docs = await documents_col.find({"case_id": case_id}, {"_id": 0}).to_list(200)

    # Decrypt intake_data vault fields
    case_out = serialize_doc(doc)
    if case_out.get("intake_data"):
        case_out["intake_data"] = unprotect_document(case_out["intake_data"])

    # Strip blob bytes from embedded document listing — use signed-URL endpoint for downloads
    docs_out = serialize_list(raw_docs)
    for d in docs_out:
        d.pop("data_url", None)

    return {
        "case": case_out,
        "tasks": serialize_list(tasks),
        "messages": serialize_list(msgs),
        "documents": docs_out,
    }


@router.patch("/{case_id}")
async def update_case(
    case_id: str,
    payload: CaseUpdate,
    user: dict = Depends(require_role("caseworker", "admin")),
):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")

    if "caseworker_id" in updates and updates["caseworker_id"]:
        cw = await users_col.find_one({"id": updates["caseworker_id"]})
        if cw:
            updates["caseworker_name"] = cw.get("name", "")

    # Vault-protect any sensitive intake_data being updated
    if "intake_data" in updates and updates["intake_data"]:
        updates["intake_data"] = protect_document(updates["intake_data"])

    updates["updated_at"] = utcnow().isoformat()
    result = await cases_col.update_one({"id": case_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")

    # Audit: log field names changed but not values (avoid logging PII in audit meta)
    await _write_audit(
        user, "case.update", case_id,
        {"fields_changed": [k for k in updates if k != "updated_at"]},
    )

    doc = await cases_col.find_one({"id": case_id}, {"_id": 0})
    out = serialize_doc(doc)
    if out.get("intake_data"):
        out["intake_data"] = unprotect_document(out["intake_data"])
    return out


@router.post("/{case_id}/claim")
async def claim_case(case_id: str, user: dict = Depends(require_role("caseworker"))):
    result = await cases_col.update_one(
        {"id": case_id},
        {
            "$set": {
                "caseworker_id": user["id"],
                "caseworker_name": user["name"],
                "status": "active",
                "updated_at": utcnow().isoformat(),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")

    await _write_audit(user, "case.claim", case_id, {"caseworker_id": user["id"]})

    doc = await cases_col.find_one({"id": case_id}, {"_id": 0})
    out = serialize_doc(doc)
    if out.get("intake_data"):
        out["intake_data"] = unprotect_document(out["intake_data"])
    return out
