"""Custom form builder + resources routers."""
from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user, require_role
from database import (
    forms_col,
    form_submissions_col,
    resources_col,
    cases_col,
    tasks_col,
    serialize_doc,
    serialize_list,
    utcnow,
)
from models import Form, FormCreate, FormSubmission, FormUpdate, Resource, new_id

router = APIRouter(tags=["forms-resources"])


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
    return serialize_doc(doc)


@router.delete("/forms/{form_id}")
async def delete_form(form_id: str, user: dict = Depends(require_role("caseworker", "admin"))):
    await forms_col.delete_one({"id": form_id})
    return {"ok": True}


@router.post("/forms/{form_id}/submit")
async def submit_form(form_id: str, data: dict, user: dict = Depends(get_current_user)):
    form_doc = await forms_col.find_one({"id": form_id})
    if not form_doc:
        raise HTTPException(status_code=404, detail="Form not found")
    sub = FormSubmission(
        form_id=form_id,
        case_id=data.pop("__case_id", None),
        submitted_by=user["id"],
        data=data,
    ).model_dump()
    await form_submissions_col.insert_one(sub)
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
    total_cases = await cases_col.count_documents(base_q)
    active_cases = await cases_col.count_documents({**base_q, "status": "active"})
    open_tasks = await tasks_col.count_documents({**base_q, "status": "open"})
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
    total_users = await users_col.count_documents({})
    residents = await users_col.count_documents({"role": "resident"})
    caseworkers = await users_col.count_documents({"role": "caseworker"})
    total_cases = await cases_col.count_documents({})
    active_cases = await cases_col.count_documents({"status": "active"})
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
