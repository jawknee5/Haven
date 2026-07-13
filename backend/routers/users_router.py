"""Users router — list residents/caseworkers for assignment + self-service profile update."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user, require_role
from database import users_col, serialize_doc, serialize_list, utcnow
from models import UserPublic

router = APIRouter(prefix="/users", tags=["users"])


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


@router.get("")
async def list_users(role: str | None = None, user: dict = Depends(require_role("caseworker", "admin"))):
    q = {}
    if role:
        q["role"] = role
    docs = await users_col.find(q, {"_id": 0, "password_hash": 0}).to_list(1000)
    return serialize_list(docs)


@router.patch("/me", response_model=UserPublic)
async def update_me(payload: UserUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    updates["updated_at"] = utcnow().isoformat()
    await users_col.update_one({"id": user["id"]}, {"$set": updates})
    doc = await users_col.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return serialize_doc(doc)
