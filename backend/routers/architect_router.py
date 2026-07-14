"""HAVEN Architect Router — the superuser control tower.

Gated to `admin` role only. Exposes:
- Real-time platform metrics (users, cases, resources, BB sessions, engine runs)
- Full user CRUD (list, view, edit, disable, promote/demote)
- Apex Vault status (algorithm, active version, rotation age)
- Engine health check (runs a synthetic pipeline through all 6 engines)
"""
from __future__ import annotations
import time
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth import require_role, hash_password
from database import (
    users_col, cases_col, resources_col, tasks_col,
    messages_col, forms_col, audit_log_col, db,
)
from engines import default_context, run_all_engines
from vault import ApexVault, encrypt_field, decrypt_field, is_encrypted, SENSITIVE_FIELDS
import os


def _unvault_user(user: dict) -> dict:
    out = dict(user)
    for field in SENSITIVE_FIELDS:
        if is_encrypted(out.get(field)):
            try:
                out[field] = decrypt_field(out[field])
            except Exception:
                out[field] = "***"
    return out


async def _write_audit(actor_id: str, actor_role: str, action: str, target: str, meta: dict | None = None) -> None:
    from models import new_id
    from database import utcnow
    await audit_log_col.insert_one({
        "id": new_id(),
        "actor_id": actor_id,
        "actor_name": None,
        "actor_role": actor_role,
        "action": action,
        "target": target,
        "meta": meta or {},
        "created_at": utcnow().isoformat(),
    })

router = APIRouter(prefix="/architect", tags=["architect"])


# All Architect endpoints are locked to `role="architect"` — that role is
# reserved exclusively for the platform's creator/owner (Johnathan Rodriquez).
# Admins have their own separate /admin console; they cannot enter here.
_ARCHITECT_ONLY = require_role("architect")


# --------------------------------------------------------------------------- Metrics
@router.get("/metrics")
async def metrics(_: dict = Depends(_ARCHITECT_ONLY)):
    now = datetime.now(timezone.utc)
    since_24h = (now - timedelta(hours=24)).isoformat()

    users_total = await users_col.count_documents({})
    residents = await users_col.count_documents({"role": "resident"})
    caseworkers = await users_col.count_documents({"role": "caseworker"})
    admins = await users_col.count_documents({"role": "admin"})

    cases_total = await cases_col.count_documents({})
    cases_open = await cases_col.count_documents({"status": {"$ne": "closed"}})
    cases_urgent = await cases_col.count_documents({"urgency_score": {"$gte": 7}})
    cases_24h = await cases_col.count_documents({"created_at": {"$gte": since_24h}})

    resources_total = await resources_col.count_documents({})
    tasks_total = await tasks_col.count_documents({})
    tasks_open = await tasks_col.count_documents({"status": {"$ne": "done"}})
    messages_total = await messages_col.count_documents({})

    # BB session count (from any bb_sessions collection, else 0)
    bb_sessions = 0
    try:
        bb_sessions = await db.bb_sessions.count_documents({})
    except Exception:
        pass

    integration_requests = 0
    try:
        integration_requests = await db.integration_requests.count_documents({})
    except Exception:
        pass

    return {
        "generated_at": now.isoformat(),
        "users": {"total": users_total, "residents": residents, "caseworkers": caseworkers, "admins": admins},
        "cases": {"total": cases_total, "open": cases_open, "urgent": cases_urgent, "last_24h": cases_24h},
        "resources": {"total": resources_total},
        "tasks": {"total": tasks_total, "open": tasks_open},
        "messages": {"total": messages_total},
        "bb_sessions": bb_sessions,
        "integration_requests": integration_requests,
    }


# --------------------------------------------------------------------------- Users CRUD
@router.get("/users")
async def list_users(
    q: str | None = Query(None),
    role: str | None = Query(None),
    limit: int = Query(100, le=500),
    _: dict = Depends(_ARCHITECT_ONLY),
):
    filt: dict = {}
    if role:
        filt["role"] = role
    if q:
        filt["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]
    users = await users_col.find(filt, {"password_hash": 0}).limit(limit).to_list(None)
    result = []
    for u in users:
        u.pop("_id", None)
        result.append(_unvault_user(u))
    return result


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    role: str | None = None
    phone: str | None = None
    disabled: bool | None = None
    password: str | None = None  # new password (will be hashed)


@router.patch("/users/{user_id}")
async def update_user(user_id: str, body: UserUpdate, actor: dict = Depends(_ARCHITECT_ONLY)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if "password" in updates:
        updates["password_hash"] = hash_password(updates.pop("password"))
    # Vault-encrypt phone before persistence
    if "phone" in updates and updates["phone"] and not is_encrypted(updates["phone"]):
        updates["phone"] = encrypt_field(updates["phone"], resource_type="phone")
    if not updates:
        raise HTTPException(400, "No fields to update")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    r = await users_col.update_one({"id": user_id}, {"$set": updates})
    if not r.matched_count:
        raise HTTPException(404, "User not found")
    await _write_audit(actor["id"], actor["role"], "architect.user_update", user_id, {"fields_changed": list(updates.keys())})
    return {"ok": True}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, _: dict = Depends(_ARCHITECT_ONLY)):
    r = await users_col.update_one({"id": user_id}, {"$set": {"disabled": True}})
    if not r.matched_count:
        raise HTTPException(404, "User not found")
    return {"ok": True, "action": "disabled"}


# --------------------------------------------------------------------------- Vault status
@router.get("/vault/status")
async def vault_status(_: dict = Depends(_ARCHITECT_ONLY)):
    return {
        "name": "Apex Vault",
        "algo": "AES-256-GCM",
        "kdf": "scrypt (N=2^14, r=8, p=1, maxmem=64MB)",
        "envelope": "DEK/KEK",
        "master_key_configured": bool(os.environ.get("VAULT_MASTER_KEY") or os.environ.get("JWT_SECRET")),
        "master_key_source": "VAULT_MASTER_KEY" if os.environ.get("VAULT_MASTER_KEY") else "JWT_SECRET (fallback)",
        "integrity_check": "HMAC-SHA256 timing-safe compare",
        "supported_fields": sorted(list({"ssn", "dob", "case_number", "income", "bank_account", "phone", "address_line1"})),
    }


# --------------------------------------------------------------------------- Engine health
@router.post("/engines/self-test")
async def engines_self_test(_: dict = Depends(_ARCHITECT_ONLY)):
    """Run a synthetic resident intake through all six engines and return timings."""
    ctx = default_context(user_id="synthetic-architect-probe", name="Architect Probe")
    ctx.needs = ["housing", "food", "health"]

    t0 = time.perf_counter()
    ctx = await run_all_engines(ctx, db=db)
    dt = (time.perf_counter() - t0) * 1000  # ms

    return {
        "ok": True,
        "elapsed_ms": round(dt, 2),
        "crisis_level": ctx.crisisLevel,
        "history_events": len(ctx.history),
        "sample": {
            "events": [
                {"type": e.type, "payload_keys": list(e.payload.keys())}
                for e in ctx.history
            ]
        },
    }
