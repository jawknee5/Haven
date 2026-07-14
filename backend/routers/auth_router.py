"""Auth router for HAVEN.

Vault parity:
  - phone is passed through vault.encrypt_field() before insert so it is stored
    as an AES-256-GCM envelope, never as plaintext (phone is in SENSITIVE_FIELDS).
  - vault.decrypt_field() unwraps phone on read so the API surface is transparent.
  - Register and login events are audit-logged for SOC 2 CC6.1 / CC6.3 evidence.
  - password_hash is never returned to the caller (stripped before serialization).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from auth import create_token, get_current_user, hash_password, verify_password
from database import audit_log_col, users_col, utcnow
from models import UserLogin, UserPublic, UserRegister, new_id
from vault import encrypt_field, decrypt_field, is_encrypted, SENSITIVE_FIELDS

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Audit helper ──────────────────────────────────────────────────────────────

async def _write_audit(actor_id: str, actor_role: str, action: str, meta: dict | None = None) -> None:
    await audit_log_col.insert_one(
        {
            "id": new_id(),
            "actor_id": actor_id,
            "actor_name": None,   # name not yet available at register/login
            "actor_role": actor_role,
            "action": action,
            "target": actor_id,
            "meta": meta or {},
            "created_at": utcnow().isoformat(),
        }
    )


# ── Field helpers ─────────────────────────────────────────────────────────────

def _vault_user_fields(user: dict) -> dict:
    """Encrypt any SENSITIVE_FIELDS present in user doc before DB insert."""
    out = dict(user)
    for field in SENSITIVE_FIELDS:
        if field in out and out[field] and not is_encrypted(out[field]):
            out[field] = encrypt_field(str(out[field]), resource_type=field)
    return out


def _unvault_user_fields(user: dict) -> dict:
    """Decrypt any vault-encrypted fields for API response. Never mutates DB doc."""
    out = dict(user)
    for field in SENSITIVE_FIELDS:
        if field in out and is_encrypted(out[field]):
            try:
                out[field] = decrypt_field(out[field])
            except Exception:
                out[field] = "***"
    return out


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register")
async def register(payload: UserRegister):
    if payload.role not in ("resident", "caseworker", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    existing = await users_col.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = {
        "id": new_id(),
        "email": payload.email.lower(),
        "name": payload.name,
        "role": payload.role,
        "phone": payload.phone or "",
        "password_hash": hash_password(payload.password),
        "created_at": utcnow().isoformat(),
        "avatar_url": "",
        "active": True,
    }

    # Vault-protect sensitive fields (phone, etc.) before persistence
    user = _vault_user_fields(user)
    await users_col.insert_one(user)
    await _write_audit(user["id"], user["role"], "auth.register", {"email": payload.email})

    token = create_token(user["id"], user["role"], user["email"])
    public = _unvault_user_fields({k: v for k, v in user.items() if k not in ("password_hash", "_id")})
    return {"token": token, "user": public}


@router.post("/login")
async def login(payload: UserLogin):
    user = await users_col.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.get("active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    await _write_audit(user["id"], user["role"], "auth.login", {"email": payload.email})

    token = create_token(user["id"], user["role"], user["email"])
    public = _unvault_user_fields({k: v for k, v in user.items() if k not in ("password_hash", "_id")})
    return {"token": token, "user": public}


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return _unvault_user_fields(user)
