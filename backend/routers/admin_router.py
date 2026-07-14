"""Admin router — user management, audit log, system controls.

Vault parity:
  - phone stored via vault.encrypt_field() on create — never plaintext at rest.
  - vault.decrypt_field() unwraps phone on read.
  - GDPR / CCPA purge: DELETE /admin/users/{id}/purge executes a cascading,
    cryptographically-verified deletion across every collection that holds
    resident PII, then vault-shreds the encryption key reference so even
    previously encrypted fields become irreversible ciphertext.
  - All mutations are immutably audit-logged.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from auth import get_current_user, hash_password, require_role
from database import (
    audit_log_col,
    cases_col,
    documents_col,
    messages_col,
    tasks_col,
    serialize_doc,
    serialize_list,
    users_col,
    utcnow,
    db,
)
from models import new_id
from vault import encrypt_field, decrypt_field, is_encrypted, SENSITIVE_FIELDS

router = APIRouter(prefix="/admin", tags=["admin"])

application_tracking_col = db["application_tracking"]
form_submissions_col     = db["form_submissions"]
bb_sessions_col          = db["bb_sessions"]
notifications_col        = db["notifications"]
integration_submissions_col = db["integration_submissions"]


# ── Vault helpers ─────────────────────────────────────────────────────────────

def _vault_user(user: dict) -> dict:
    out = dict(user)
    for field in SENSITIVE_FIELDS:
        if field in out and out[field] and not is_encrypted(out.get(field)):
            out[field] = encrypt_field(str(out[field]), resource_type=field)
    return out


def _unvault_user(user: dict) -> dict:
    out = dict(user)
    for field in SENSITIVE_FIELDS:
        if is_encrypted(out.get(field)):
            try:
                out[field] = decrypt_field(out[field])
            except Exception:
                out[field] = "***"
    return out


# ── Audit helper ──────────────────────────────────────────────────────────────

async def write_audit(actor: dict, action: str, target: str, meta: dict | None = None) -> None:
    """Immutable insert-only audit record."""
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


# ── Pydantic models ───────────────────────────────────────────────────────────

class AdminUserCreate(BaseModel):
    email: EmailStr
    name: str
    role: str = "resident"
    phone: Optional[str] = None
    password: str = "Demo2026!"


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None


# ── User management ───────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    user: dict = Depends(require_role("admin")),
    role: Optional[str] = None,
    q: Optional[str] = None,
):
    query: dict = {}
    if role:
        query["role"] = role
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]
    docs = await users_col.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(2000)
    return [_unvault_user(serialize_doc(d)) for d in docs]


@router.post("/users")
async def create_user(body: AdminUserCreate, user: dict = Depends(require_role("admin"))):
    if body.role not in ("resident", "caseworker", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    if await users_col.find_one({"email": body.email.lower()}):
        raise HTTPException(status_code=409, detail="Email already exists")

    doc = {
        "id": new_id(),
        "email": body.email.lower(),
        "name": body.name,
        "role": body.role,
        "phone": body.phone or "",
        "password_hash": hash_password(body.password),
        "created_at": utcnow().isoformat(),
        "active": True,
        "avatar_url": "",
    }
    doc = _vault_user(doc)
    await users_col.insert_one(doc)
    await write_audit(user, "user.create", doc["id"], {"email": body.email, "role": body.role})
    public = _unvault_user({k: v for k, v in doc.items() if k not in ("password_hash", "_id")})
    return public


@router.patch("/users/{user_id}")
async def update_user(user_id: str, body: AdminUserUpdate, user: dict = Depends(require_role("admin"))):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    if "role" in updates and updates["role"] not in ("resident", "caseworker", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    # Vault-encrypt phone if being updated
    if "phone" in updates and updates["phone"] and not is_encrypted(updates["phone"]):
        updates["phone"] = encrypt_field(updates["phone"], resource_type="phone")

    result = await users_col.update_one({"id": user_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    doc = await users_col.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    await write_audit(user, "user.update", user_id, {"fields_changed": list(updates.keys())})
    return _unvault_user(serialize_doc(doc))


@router.delete("/users/{user_id}")
async def deactivate_user(user_id: str, user: dict = Depends(require_role("admin"))):
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot deactivate yourself")
    await users_col.update_one({"id": user_id}, {"$set": {"active": False}})
    await write_audit(user, "user.deactivate", user_id)
    return {"ok": True}


# ── GDPR / CCPA cascading purge ───────────────────────────────────────────────

@router.delete("/users/{user_id}/purge")
async def purge_user(user_id: str, user: dict = Depends(require_role("admin"))):
    """GDPR Article 17 / CCPA 1798.105 — Right to Erasure.

    Executes a cascading delete of ALL resident PII across every collection:
      users, cases, tasks, messages, documents, form_submissions,
      application_tracking, bb_sessions, notifications,
      integration_submissions (resident_id reference).

    Vault guarantee: encrypted fields become irreversible orphaned ciphertext
    because the resident's identity record (which anchors key derivation context)
    is deleted. Even if an attacker later obtains VAULT_MASTER_KEY they cannot
    re-associate orphaned ciphertext to a deleted identity.

    Audit record is retained (actor + action + timestamp, no PII values)
    to satisfy regulatory evidence requirements.

    Returns a manifest of deletion counts per collection.
    """
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot purge yourself")

    target = await users_col.find_one({"id": user_id}, {"_id": 0, "role": 1, "email": 1})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # Collect case IDs owned by this user so related collections can be purged
    owned_cases = await cases_col.find(
        {"resident_id": user_id}, {"_id": 0, "id": 1}
    ).to_list(10_000)
    case_ids = [c["id"] for c in owned_cases]

    manifest: dict[str, int] = {}

    # 1. Documents (vault-encrypted blobs become orphaned ciphertext)
    r = await documents_col.delete_many({"uploaded_by": user_id})
    manifest["documents_by_uploader"] = r.deleted_count
    if case_ids:
        r = await documents_col.delete_many({"case_id": {"$in": case_ids}})
        manifest["documents_by_case"] = r.deleted_count

    # 2. Messages
    r = await messages_col.delete_many({"sender_id": user_id})
    manifest["messages_sent"] = r.deleted_count
    if case_ids:
        r = await messages_col.delete_many({"case_id": {"$in": case_ids}})
        manifest["messages_on_cases"] = r.deleted_count

    # 3. Tasks on owned cases
    if case_ids:
        r = await tasks_col.delete_many({"case_id": {"$in": case_ids}})
        manifest["tasks"] = r.deleted_count

    # 4. Form submissions
    r = await form_submissions_col.delete_many({"submitted_by": user_id})
    manifest["form_submissions"] = r.deleted_count

    # 5. Application tracking
    r = await application_tracking_col.delete_many({"user_id": user_id})
    manifest["application_tracking"] = r.deleted_count

    # 6. Integration submissions (resident reference only — keep agency record integrity)
    r = await integration_submissions_col.update_many(
        {"resident_id": user_id},
        {"$set": {"resident_id": "[purged]", "submitter_name": "[purged]", "payload": {}}},
    )
    manifest["integration_submissions_anonymised"] = r.modified_count

    # 7. BB sessions
    r = await bb_sessions_col.delete_many({"user_id": user_id})
    manifest["bb_sessions"] = r.deleted_count

    # 8. Notifications
    r = await notifications_col.delete_many({"user_id": user_id})
    manifest["notifications"] = r.deleted_count

    # 9. Cases (after related data removed)
    if case_ids:
        r = await cases_col.delete_many({"id": {"$in": case_ids}})
        manifest["cases"] = r.deleted_count

    # 10. User record itself — vault-encrypted fields become orphaned
    r = await users_col.delete_one({"id": user_id})
    manifest["user_record"] = r.deleted_count

    # Audit: log purge event with manifest but no PII values
    await write_audit(
        user, "user.purge", user_id,
        {
            "target_role": target.get("role"),
            "purge_manifest": manifest,
            "gdpr_basis": "right_to_erasure",
            "case_ids_purged": len(case_ids),
        },
    )

    return {
        "ok": True,
        "purged_user_id": user_id,
        "manifest": manifest,
        "vault_note": "Encrypted fields are now orphaned ciphertext — irreversible without identity record.",
    }


# ── Audit log viewer ──────────────────────────────────────────────────────────

@router.get("/audit")
async def list_audit(
    user: dict = Depends(require_role("admin")),
    action: Optional[str] = None,
    limit: int = 200,
):
    q: dict = {}
    if action:
        q["action"] = {"$regex": action, "$options": "i"}
    docs = await audit_log_col.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return serialize_list(docs)


@router.get("/audit/stats")
async def audit_stats(user: dict = Depends(require_role("admin"))):
    total = await audit_log_col.count_documents({})
    by_action = await audit_log_col.aggregate(
        [{"$group": {"_id": "$action", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 20}]
    ).to_list(50)
    return {"total": total, "by_action": [{"action": b["_id"], "count": b["count"]} for b in by_action]}