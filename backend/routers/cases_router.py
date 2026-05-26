"""Case management router."""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from auth import get_current_user, require_role
from database import (
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

router = APIRouter(prefix="/cases", tags=["cases"])


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
    await cases_col.insert_one(case_doc)
    return serialize_doc(case_doc)


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
    return serialize_list(docs)


@router.get("/{case_id}")
async def get_case(case_id: str, user: dict = Depends(get_current_user)):
    doc = await cases_col.find_one({"id": case_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Case not found")
    if user["role"] == "resident" and doc["resident_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    # enrich with related entities
    tasks = await tasks_col.find({"case_id": case_id}, {"_id": 0}).to_list(200)
    msgs = await messages_col.find({"case_id": case_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    docs = await documents_col.find({"case_id": case_id}, {"_id": 0}).to_list(200)
    return {
        "case": serialize_doc(doc),
        "tasks": serialize_list(tasks),
        "messages": serialize_list(msgs),
        "documents": serialize_list(docs),
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
    updates["updated_at"] = utcnow().isoformat()
    result = await cases_col.update_one({"id": case_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    doc = await cases_col.find_one({"id": case_id}, {"_id": 0})
    return serialize_doc(doc)


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
    doc = await cases_col.find_one({"id": case_id}, {"_id": 0})
    return serialize_doc(doc)
