"""Users router — list residents/caseworkers for assignment + self-service profile update.

Vault parity:
  - PATCH /users/me decrypts phone before returning and re-encrypts on update.
  - Phone update is audit-logged.
  - list_users decrypts sensitive fields for caseworker/admin callers.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user, require_role
from database import audit_log_col, users_col, serialize_doc, serialize_list, utcnow
from models import UserPublic, new_id
from vault import encrypt_field, decrypt_field, is_encrypted, SENSITIVE_FIELDS

router = APIRouter(prefix="/users", tags=["users"])


# ── Vault helpers ─────────────────────────────────────────────────────────────

def _unvault_user(user: dict) -> dict:
    out = dict(user)
    for field in SENSITIVE_FIELDS:
        if is_encrypted(out.get(field)):
            try:
                out[field] = decrypt_field(out[field])
            except Exception:
                out[field] = "***"
    return out


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


# ── Models ────────────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
async def list_users(role: str | None = None, user: dict = Depends(require_role("caseworker", "admin"))):
    q = {}
    if role:
        q["role"] = role
    docs = await users_col.find(q, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [_unvault_user(serialize_doc(d)) for d in docs]


@router.patch("/me", response_model=UserPublic)
async def update_me(payload: UserUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    # Vault-encrypt phone before persistence
    if "phone" in updates and updates["phone"] and not is_encrypted(updates["phone"]):
        updates["phone"] = encrypt_field(updates["phone"], resource_type="phone")

    updates["updated_at"] = utcnow().isoformat()
    await users_col.update_one({"id": user["id"]}, {"$set": updates})
    await _write_audit(user, "user.update_self", user["id"], {"fields_changed": [k for k in updates if k != "updated_at"]})

    doc = await users_col.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return _unvault_user(serialize_doc(doc))
