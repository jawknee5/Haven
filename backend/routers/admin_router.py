"""Admin router — user management, audit log, system controls."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from auth import get_current_user, hash_password, require_role
from database import audit_log_col, serialize_doc, serialize_list, users_col, utcnow
from models import new_id

router = APIRouter(prefix="/admin", tags=["admin"])


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


async def write_audit(actor: dict, action: str, target: str, meta: dict | None = None):
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
    return serialize_list(docs)


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
    await users_col.insert_one(doc)
    await write_audit(user, "user.create", doc["id"], {"email": body.email, "role": body.role})
    public = {k: v for k, v in doc.items() if k not in ("password_hash", "_id")}
    return public


@router.patch("/users/{user_id}")
async def update_user(user_id: str, body: AdminUserUpdate, user: dict = Depends(require_role("admin"))):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    if "role" in updates and updates["role"] not in ("resident", "caseworker", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    result = await users_col.update_one({"id": user_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    doc = await users_col.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    await write_audit(user, "user.update", user_id, updates)
    return serialize_doc(doc)


@router.delete("/users/{user_id}")
async def deactivate_user(user_id: str, user: dict = Depends(require_role("admin"))):
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot deactivate yourself")
    await users_col.update_one({"id": user_id}, {"$set": {"active": False}})
    await write_audit(user, "user.deactivate", user_id)
    return {"ok": True}


# ============ Audit log viewer ============
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
