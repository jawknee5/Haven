"""Custom form builder + resources routers.

Vault parity:
  - POST /forms/{id}/submit passes data through protect_document() so
    sensitive fields (ssn, dob, income, phone, etc.) are vault-encrypted
    before persistence.
  - form create, update, delete, and submit are all audit-logged.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user, require_role
from database import (
    audit_log_col,
    cases_col,
    forms_col,
    form_submissions_col,
    resources_col,
    tasks_col,
    serialize_doc,
    serialize_list,
    utcnow,
)
from models import Form, FormCreate, FormSubmission, FormUpdate, Resource, new_id
from vault import protect_document

router = APIRouter(tags=["forms-resources"])


# ── Audit helper ──────────────────────────────────────────────────────────────

async def _write_audit(actor: dict, action: str, target: str, meta: dict | None = None) -> None:
    await audit_log_col.insert_one({
        "id": new_id(),
        "actor_id": actor.get("id"),
        "actor_name": actor.get("name"),
        "actor_role": actor.get("role"),
        "action": action,
        "target": target,
        "meta": meta or {},
        "created_at": utcnow().isoformat(),
    })


# ===== FORMS =====

@router.post("/forms")
async def create_form(payload: FormCreate, user: dict = Depends(require_role("caseworker", "admin"))):
    f = Form(
        name=payload.name,
        description=payload.description or "",
        fields=payload.fields,
        category=payload.category,
        created_by=user["id"],
    ).model_dump()
    await forms_col.insert_one(f)
    await _write_audit(user, "form.create", f["id"], {"name": payload.name, "category": payload.category})
    return serialize_doc(f)


@router.get("/forms")
async def list_forms(user: dict = Depends(get_current_user)):
    docs = await forms_col.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return serialize_list(docs)


@router.get("/forms/{form_id}")
async def get_form(form_id: str, user: dict = Depends(get_current_user)):
    doc = await forms_col.find_one({"id": form_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Form not found")
    return serialize_doc(doc)


@router.patch("/forms/{form_id}")
async def update_form(form_id: str, payload: FormUpdate, user: dict = Depends(require_role("caseworker", "admin"))):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    result = await forms_col.update_one({"id": form_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Form not found")
    doc = await forms_col.find_one({"id": form_id}, {"_id": 0})
    await _write_audit(user, "form.update", form_id, {"fields_changed": list(updates.keys())})
    return serialize_doc(doc)


@router.delete("/forms/{form_id}")
async def delete_form(form_id: str, user: dict = Depends(require_role("caseworker", "admin"))):
    await forms_col.delete_one({"id": form_id})
    await _write_audit(user, "form.delete", form_id)
    return {"ok": True}


@router.post("/forms/{form_id}/submit")
async def submit_form(form_id: str, data: dict, user: dict = Depends(get_current_user)):
    form_doc = await forms_col.find_one({"id": form_id})
    if not form_doc:
        raise HTTPException(status_code=404, detail="Form not found")

    case_id = data.pop("__case_id", None)

    # Vault-protect any sensitive fields in the submission payload before persistence
    protected_data = protect_document(data)

    sub = FormSubmission(
        form_id=form_id,
        case_id=case_id,
        submitted_by=user["id"],
        data=protected_data,
    ).model_dump()
    await form_submissions_col.insert_one(sub)
    await _write_audit(
        user, "form.submit", sub["id"],
        {"form_id": form_id, "case_id": case_id}
    )
    return serialize_doc(sub)


@router.get("/forms/{form_id}/submissions")
async def list_submissions(form_id: str, user: dict = Depends(require_role("caseworker", "admin"))):
    docs = await form_submissions_col.find({"form_id": form_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return serialize_list(docs)


# ===== RESOURCES =====

@router.get("/resources")
async def list_resources(type: str | None = None):
    q = {}
    if type:
        q["type"] = type
    docs = await resources_col.find(q, {"_id": 0}).to_list(1000)
    return serialize_list(docs)


@router.post("/resources")
async def create_resource(payload: Resource, user: dict = Depends(require_role("caseworker", "admin"))):
    doc = payload.model_dump()
    if not doc.get("id"):
        doc["id"] = new_id()
    await resources_col.insert_one(doc)
    await _write_audit(user, "resource.create", doc["id"], {"name": payload.name, "type": payload.type})
    return serialize_doc(doc)


# ===== ANALYTICS =====

@router.get("/analytics/caseworker")
async def caseworker_analytics(user: dict = Depends(require_role("caseworker", "admin"))):
    pipeline = [
        {"$match": {"caseworker_id": user["id"]} if user["role"] == "caseworker" else {}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    status_groups = await cases_col.aggregate(pipeline).to_list(50)
    base_q = {"caseworker_id": user["id"]} if user["role"] == "caseworker" else {}
    total_cases  = await cases_col.count_documents(base_q)
    active_cases = await cases_col.count_documents({**base_q, "status": "active"})
    open_tasks   = await tasks_col.count_documents({**base_q, "status": "open"})
    high_urgency = await cases_col.count_documents({**base_q, "urgency_score": {"$gte": 75}})
    return {
        "total_cases": total_cases,
        "active_cases": active_cases,
        "open_tasks": open_tasks,
        "high_urgency": high_urgency,
        "status_breakdown": {g["_id"]: g["count"] for g in status_groups},
    }


@router.get("/analytics/admin")
async def admin_analytics(user: dict = Depends(require_role("admin"))):
    from database import users_col, cases_col
    total_users    = await users_col.count_documents({})
    residents      = await users_col.count_documents({"role": "resident"})
    caseworkers    = await users_col.count_documents({"role": "caseworker"})
    total_cases    = await cases_col.count_documents({})
    active_cases   = await cases_col.count_documents({"status": "active"})
    resolved_cases = await cases_col.count_documents({"status": "resolved"})
    total_resources = await resources_col.count_documents({})
    return {
        "total_users": total_users,
        "residents": residents,
        "caseworkers": caseworkers,
        "total_cases": total_cases,
        "active_cases": active_cases,
        "resolved_cases": resolved_cases,
        "total_resources": total_resources,
    }