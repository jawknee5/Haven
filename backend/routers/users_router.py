"""Users router — list residents/caseworkers for assignment."""
from fastapi import APIRouter, Depends

from auth import get_current_user, require_role
from database import users_col, serialize_list

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def list_users(role: str | None = None, user: dict = Depends(require_role("caseworker", "admin"))):
    q = {}
    if role:
        q["role"] = role
    docs = await users_col.find(q, {"_id": 0, "password_hash": 0}).to_list(1000)
    return serialize_list(docs)
