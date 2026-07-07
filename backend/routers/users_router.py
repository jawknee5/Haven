"""Users router — list residents/caseworkers for assignment, expose /me + case-number update."""
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import get_current_user, require_role
from database import users_col, serialize_list
from vault import encrypt_field, decrypt_field

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def list_users(role: str | None = None, user: dict = Depends(require_role("caseworker", "admin"))):
    q: dict = {}
    if role:
        q["role"] = role
    docs = await users_col.find(q, {"_id": 0, "password_hash": 0}).to_list(1000)
    return serialize_list(docs)


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    doc = await users_col.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(404, "User not found")
    # Decrypt sensitive numbers for owner display
    if isinstance(doc.get("case_number"), dict):
        try:
            doc["case_number"] = decrypt_field(doc["case_number"])
        except Exception:
            doc["case_number"] = "***"
    if isinstance(doc.get("ssn"), dict):
        doc["ssn"] = "***-**-****"  # never return SSN plaintext even to owner
    return doc


class CaseNumberUpdate(BaseModel):
    case_number: str = Field(min_length=1, max_length=64)
    agency: str | None = Field(default=None, description="Which agency issued the case number (e.g. HUD, County SSA)")


@router.patch("/me/case-number")
async def update_case_number(body: CaseNumberUpdate, user: dict = Depends(get_current_user)):
    """Allow residents AND caseworkers to attach an existing agency case number to
    their HAVEN profile. The value is encrypted via the Apex Vault before storage
    and is only decrypted for the owning user (or by BB when submitting a form to
    the corresponding agency).
    """
    update = {
        "case_number": encrypt_field(body.case_number.strip(), resource_type="case_number"),
        "case_number_agency": body.agency,
        "case_number_updated_at": datetime.now(timezone.utc).isoformat(),
    }
    r = await users_col.update_one({"id": user["id"]}, {"$set": update})
    if not r.matched_count:
        raise HTTPException(404, "User not found")
    return {"ok": True, "message": "Case number stored in Apex Vault. BB will use it for autofill on this agency's portals."}
