"""Legacy Bridge / Multi-Agency Integration Router.

Provides HAVEN's gateway to legacy government systems so caseworkers can submit
applications, check status, and pull eligibility info without leaving HAVEN.

Integrations are simulated (no live federal endpoints) but use realistic agency
schemas, fields, mock IDs, and response patterns so the UX is production-true.
"""
from __future__ import annotations

import asyncio
import hashlib
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import get_current_user, require_role
from agency_adapters import get_adapter, has_live_config
from database import (
    application_tracking_col,
    audit_log_col,
    cases_col,
    db,
    serialize_doc,
    serialize_list,
    users_col,
    utcnow,
)
from models import new_id

router = APIRouter(prefix="/integrations", tags=["integrations"])

integrations_col = db["integrations"]
integration_submissions_col = db["integration_submissions"]
integration_tokens_col = db["integration_tokens"]
oauth_states_col = db["oauth_states"]


DEFAULT_AGENCIES = [
    {
        "code": "HUD_SEC8",
        "name": "HUD — Section 8 Housing Choice Voucher",
        "agency": "U.S. Department of Housing and Urban Development",
        "category": "housing",
        "jurisdiction": "federal",
        "description": "Housing Choice Voucher (Section 8) program for low-income families.",
        "icon": "home",
        "endpoint": "https://api.hud.gov/section8/v1/applications",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "ssn", "dob", "address", "household_size", "income"],
        "sla_days": 30,
        "connected": True,
        "contact": "1-800-955-2232",
    },
    {
        "code": "SSA_SSI",
        "name": "SSA — Supplemental Security Income",
        "agency": "Social Security Administration",
        "category": "benefits",
        "jurisdiction": "federal",
        "description": "SSI cash assistance for aged, blind, and disabled with limited income.",
        "icon": "shield-check",
        "endpoint": "https://secure.ssa.gov/ssi/v2/intake",
        "auth_type": "saml",
        "required_fields": ["full_name", "ssn", "dob", "address", "disability_status"],
        "sla_days": 90,
        "connected": True,
        "contact": "1-800-772-1213",
    },
    {
        "code": "USDA_SNAP",
        "name": "USDA — SNAP (CalFresh)",
        "agency": "U.S. Department of Agriculture",
        "category": "food",
        "jurisdiction": "federal/state",
        "description": "Supplemental Nutrition Assistance Program — food benefits via EBT.",
        "icon": "utensils",
        "endpoint": "https://api.fns.usda.gov/snap/v3/apply",
        "auth_type": "api_key",
        "required_fields": ["full_name", "household_size", "income", "address", "citizenship"],
        "sla_days": 30,
        "connected": True,
        "contact": "1-877-847-3663",
    },
    {
        "code": "CMS_MEDICAID",
        "name": "CMS — Medicaid / Medi-Cal",
        "agency": "Centers for Medicare & Medicaid Services",
        "category": "health",
        "jurisdiction": "federal/state",
        "description": "Medical coverage for low-income individuals and families.",
        "icon": "heart-pulse",
        "endpoint": "https://api.dhcs.ca.gov/medi-cal/v2/applications",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "ssn", "dob", "household_size", "income", "address"],
        "sla_days": 45,
        "connected": True,
        "contact": "1-800-541-5555",
    },
    {
        "code": "VA_BENEFITS",
        "name": "VA — Veterans Benefits Administration",
        "agency": "U.S. Department of Veterans Affairs",
        "category": "benefits",
        "jurisdiction": "federal",
        "description": "Disability compensation, pension, healthcare, and housing for veterans.",
        "icon": "award",
        "endpoint": "https://api.va.gov/services/vba/v2/claims",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "ssn", "dod_id", "service_dates", "discharge_type"],
        "sla_days": 125,
        "connected": True,
        "contact": "1-800-827-1000",
    },
    {
        "code": "IRS_EFILE",
        "name": "IRS — VITA Free Tax Filing",
        "agency": "Internal Revenue Service",
        "category": "benefits",
        "jurisdiction": "federal",
        "description": "Volunteer Income Tax Assistance e-filing for low-income filers.",
        "icon": "file-text",
        "endpoint": "https://api.irs.gov/vita/v1/efile",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "ssn", "dob", "address", "income", "dependents"],
        "sla_days": 21,
        "connected": True,
        "contact": "1-800-906-9887",
    },
    {
        "code": "DMV_ID",
        "name": "DMV — REAL ID / Replacement ID",
        "agency": "California DMV",
        "category": "identity",
        "jurisdiction": "state",
        "description": "State ID issuance / replacement for unhoused or recovering residents.",
        "icon": "id-card",
        "endpoint": "https://api.dmv.ca.gov/realid/v1/intake",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "dob", "address", "residency_proof"],
        "sla_days": 14,
        "connected": True,
        "contact": "1-800-777-0133",
    },
    {
        "code": "DOL_UI",
        "name": "DOL — Unemployment Insurance (EDD)",
        "agency": "U.S. Department of Labor / CA EDD",
        "category": "employment",
        "jurisdiction": "federal/state",
        "description": "Unemployment Insurance claim filing and tracking.",
        "icon": "briefcase",
        "endpoint": "https://api.edd.ca.gov/ui/v3/claims",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "ssn", "last_employer", "address", "income"],
        "sla_days": 21,
        "connected": True,
        "contact": "1-800-300-5616",
    },
    {
        "code": "HHS_TANF",
        "name": "HHS — TANF / CalWORKs",
        "agency": "Health & Human Services",
        "category": "benefits",
        "jurisdiction": "federal/state",
        "description": "Temporary Assistance for Needy Families — cash aid for low-income families.",
        "icon": "users",
        "endpoint": "https://api.dss.ca.gov/calworks/v1/intake",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "ssn", "household_size", "address", "income", "children"],
        "sla_days": 45,
        "connected": True,
        "contact": "1-877-410-8827",
    },
    {
        "code": "CPS_REPORT",
        "name": "CPS — Child Welfare Referral",
        "agency": "County Child Protective Services",
        "category": "family",
        "jurisdiction": "county",
        "description": "Mandated reporting and family services referral.",
        "icon": "shield",
        "endpoint": "https://api.sccgov.org/sscw/v1/referrals",
        "auth_type": "saml",
        "required_fields": ["reporter_name", "household_address", "children_names", "concern"],
        "sla_days": 1,
        "connected": True,
        "contact": "1-833-722-5437",
    },
    {
        "code": "COURT_EFILE",
        "name": "Court e-Filing — Eviction Defense",
        "agency": "Santa Clara County Superior Court",
        "category": "legal",
        "jurisdiction": "county",
        "description": "E-file responsive pleadings, request continuances, set up legal aid pairing.",
        "icon": "scale",
        "endpoint": "https://efile.sccsuperiorcourt.org/api/v1",
        "auth_type": "oauth2",
        "required_fields": ["case_number", "defendant_name", "address", "hearing_date"],
        "sla_days": 3,
        "connected": True,
        "contact": "1-408-882-2700",
    },
    {
        "code": "WIC_CA",
        "name": "WIC — Women, Infants & Children",
        "agency": "CA Dept of Public Health",
        "category": "health",
        "jurisdiction": "federal/state",
        "description": "Supplemental nutrition for pregnant women, infants, and young children.",
        "icon": "baby",
        "endpoint": "https://api.cdph.ca.gov/wic/v1/intake",
        "auth_type": "oauth2",
        "required_fields": ["full_name", "dob", "household_size", "income", "address", "pregnancy_status"],
        "sla_days": 10,
        "connected": True,
        "contact": "1-888-942-9675",
    },
]


# ============ Pydantic models ============
class IntegrationToggle(BaseModel):
    connected: bool


class IntegrationCreate(BaseModel):
    code: str
    name: str
    agency: str
    category: str = "general"
    jurisdiction: str = "federal"
    description: str = ""
    icon: str = "link"
    endpoint: str = ""
    auth_type: str = "oauth2"
    required_fields: list[str] = Field(default_factory=list)
    sla_days: int = 30
    contact: str = ""


class SubmissionCreate(BaseModel):
    integration_code: str
    case_id: str
    payload: dict = Field(default_factory=dict)
    notes: str = ""


async def write_audit(actor: dict, action: str, target: str, meta: Optional[dict] = None):
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


async def ensure_default_integrations() -> None:
    if await integrations_col.count_documents({}) > 0:
        return
    for agency in DEFAULT_AGENCIES:
        await integrations_col.insert_one(
            {
                "id": new_id(),
                **agency,
                "created_at": utcnow().isoformat(),
                "last_sync": utcnow().isoformat(),
                "submissions_count": 0,
                "avg_response_ms": random.randint(180, 720),
                "uptime": round(random.uniform(98.5, 99.99), 2),
            }
        )


# ============ Integration catalog ============
@router.get("")
async def list_integrations(user: dict = Depends(get_current_user)):
    docs = await integrations_col.find({}, {"_id": 0}).sort("name", 1).to_list(500)
    return serialize_list(docs)


# IMPORTANT: /submissions must be registered BEFORE /{integration_code}
# so FastAPI's route matcher picks the literal route first.
@router.get("/submissions")
async def list_submissions(
    user: dict = Depends(get_current_user),
    case_id: Optional[str] = None,
    integration_code: Optional[str] = None,
    status: Optional[str] = None,
):
    q: dict = {}
    if case_id:
        q["case_id"] = case_id
    if integration_code:
        q["integration_code"] = integration_code
    if status:
        q["status"] = status
    if user["role"] == "resident":
        q["resident_id"] = user["id"]
    docs = await integration_submissions_col.find(q, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return serialize_list(docs)


@router.get("/{integration_code}")
async def get_integration(integration_code: str, user: dict = Depends(get_current_user)):
    doc = await integrations_col.find_one({"code": integration_code}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Integration not found")
    return serialize_doc(doc)


@router.patch("/{integration_code}/toggle")
async def toggle_integration(
    integration_code: str,
    body: IntegrationToggle,
    user: dict = Depends(require_role("admin")),
):
    result = await integrations_col.update_one(
        {"code": integration_code},
        {"$set": {"connected": body.connected, "last_sync": utcnow().isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")
    doc = await integrations_col.find_one({"code": integration_code}, {"_id": 0})
    await write_audit(user, "integration.toggle", integration_code, {"connected": body.connected})
    return serialize_doc(doc)


@router.post("")
async def create_integration(body: IntegrationCreate, user: dict = Depends(require_role("admin"))):
    if await integrations_col.find_one({"code": body.code}):
        raise HTTPException(status_code=409, detail="Integration code already exists")
    doc = {
        "id": new_id(),
        **body.model_dump(),
        "connected": True,
        "submissions_count": 0,
        "avg_response_ms": 300,
        "uptime": 99.9,
        "created_at": utcnow().isoformat(),
        "last_sync": utcnow().isoformat(),
    }
    await integrations_col.insert_one(doc)
    await write_audit(user, "integration.create", body.code, {"agency": body.agency})
    return serialize_doc(doc)


@router.delete("/{integration_code}")
async def delete_integration(integration_code: str, user: dict = Depends(require_role("admin"))):
    await integrations_col.delete_one({"code": integration_code})
    await write_audit(user, "integration.delete", integration_code)
    return {"ok": True}


# ============ Submissions (Legacy Bridge) ============
@router.post("/submit")
async def submit_to_agency(body: SubmissionCreate, user: dict = Depends(get_current_user)):
    integ = await integrations_col.find_one({"code": body.integration_code}, {"_id": 0})
    if not integ:
        raise HTTPException(status_code=404, detail="Integration not found")
    if not integ.get("connected"):
        raise HTTPException(status_code=400, detail="Integration is currently disconnected")
    case = await cases_col.find_one({"id": body.case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if user["role"] == "resident" and case["resident_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Load OAuth tokens for this integration if present (live mode)
    tokens_doc = await integration_tokens_col.find_one({"integration_code": body.integration_code}, {"_id": 0})
    adapter = get_adapter(integ, tokens=tokens_doc)
    try:
        result = await adapter.submit(body.payload or {}, case)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Agency adapter error: {e}")

    confirmation_id = result["confirmation_id"]
    status = result["status"]
    message = result["message"]
    missing = result.get("missing_fields", [])

    sub = {
        "id": new_id(),
        "integration_code": body.integration_code,
        "integration_name": integ.get("name"),
        "agency_name": integ.get("agency"),
        "case_id": body.case_id,
        "resident_id": case["resident_id"],
        "caseworker_id": case.get("caseworker_id"),
        "submitted_by": user["id"],
        "submitter_name": user["name"],
        "confirmation_id": confirmation_id,
        "status": status,
        "missing_fields": missing,
        "payload": body.payload,
        "notes": body.notes,
        "adapter_mode": result.get("mode", adapter.mode),
        "submitted_at": utcnow().isoformat(),
        "sla_days": integ.get("sla_days", 30),
        "expected_response_by": result.get("expected_response_by") or (datetime.now(timezone.utc) + timedelta(days=integ.get("sla_days", 30))).isoformat(),
        "last_status_update": utcnow().isoformat(),
        "timeline": [
            {"ts": utcnow().isoformat(), "event": "submitted", "detail": message},
        ],
        "raw_response": result.get("raw_response", {}),
    }
    await integration_submissions_col.insert_one(sub)
    await integrations_col.update_one({"code": body.integration_code}, {"$inc": {"submissions_count": 1}})

    # Mirror to application_tracking for resident dashboards
    await application_tracking_col.insert_one(
        {
            "id": new_id(),
            "case_id": body.case_id,
            "user_id": case["resident_id"],
            "agency_name": integ["agency"],
            "integration_code": body.integration_code,
            "application_id": confirmation_id,
            "application_url": integ.get("endpoint"),
            "status": status,
            "required_documents": integ.get("required_fields", []),
            "submitted_at": utcnow().isoformat(),
            "last_checked": utcnow().isoformat(),
            "notes": body.notes,
        }
    )

    await write_audit(
        user,
        "agency.submit",
        body.integration_code,
        {"case_id": body.case_id, "confirmation_id": confirmation_id, "status": status, "mode": adapter.mode},
    )
    return serialize_doc(sub)


@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: str, user: dict = Depends(get_current_user)):
    doc = await integration_submissions_col.find_one({"id": submission_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user["role"] == "resident" and doc.get("resident_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return serialize_doc(doc)


@router.post("/submissions/{submission_id}/sync")
async def sync_submission(submission_id: str, user: dict = Depends(get_current_user)):
    """Sync status via the agency adapter (live API call if env-configured, else simulated)."""
    doc = await integration_submissions_col.find_one({"id": submission_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user["role"] == "resident" and doc.get("resident_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    integ = await integrations_col.find_one({"code": doc["integration_code"]}, {"_id": 0})
    if not integ:
        raise HTTPException(status_code=404, detail="Integration no longer exists")

    if has_live_config(integ["code"]):
        tokens_doc = await integration_tokens_col.find_one({"integration_code": integ["code"]}, {"_id": 0})
        adapter = get_adapter(integ, tokens=tokens_doc)
        try:
            r = await adapter.sync_status(doc["confirmation_id"])
            new_status = r["status"]
            message = r.get("message", "Status updated from agency")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Agency sync error: {e}")
    else:
        # simulated progression
        progression = {
            "submitted": [("under_review", "Application moved to under review", 0.6),
                           ("needs_action", "Agency requested additional documentation", 0.25),
                           ("submitted", "No change since last sync", 0.15)],
            "under_review": [("under_review", "Still under review", 0.4),
                              ("approved", "Application approved", 0.35),
                              ("needs_action", "Caseworker requested clarification", 0.15),
                              ("denied", "Application denied", 0.10)],
            "needs_action": [("needs_action", "Still awaiting requested documentation", 0.7),
                              ("under_review", "Resumed review after documents received", 0.3)],
            "approved": [("approved", "Status unchanged", 1.0)],
            "denied": [("denied", "Status unchanged", 1.0)],
        }
        options = progression.get(doc.get("status", "submitted"), [("submitted", "No change", 1.0)])
        r = random.random()
        cum = 0.0
        new_status, message = options[0][0], options[0][1]
        for s, m, w in options:
            cum += w
            if r <= cum:
                new_status, message = s, m
                break

    timeline_entry = {"ts": utcnow().isoformat(), "event": new_status, "detail": message}
    await integration_submissions_col.update_one(
        {"id": submission_id},
        {
            "$set": {"status": new_status, "last_status_update": utcnow().isoformat()},
            "$push": {"timeline": timeline_entry},
        },
    )
    await application_tracking_col.update_many(
        {"application_id": doc.get("confirmation_id")},
        {"$set": {"status": new_status, "last_checked": utcnow().isoformat()}},
    )
    updated = await integration_submissions_col.find_one({"id": submission_id}, {"_id": 0})
    await write_audit(user, "agency.sync", doc.get("integration_code", ""), {"submission_id": submission_id, "new_status": new_status})
    return serialize_doc(updated)


# ============ OAuth 2.0 flow for connecting to a live agency ============
@router.get("/{integration_code}/oauth/meta")
async def oauth_meta(integration_code: str, user: dict = Depends(get_current_user)):
    """Tells the UI whether this integration is configured for live OAuth or simulated."""
    integ = await integrations_col.find_one({"code": integration_code}, {"_id": 0})
    if not integ:
        raise HTTPException(status_code=404, detail="Integration not found")
    live = has_live_config(integration_code)
    tokens = await integration_tokens_col.find_one({"integration_code": integration_code}, {"_id": 0})
    return {
        "code": integration_code,
        "mode": "live" if live else "simulated",
        "live_configured": live,
        "authorized": bool(tokens),
        "authorized_at": tokens.get("authorized_at") if tokens else None,
    }


@router.get("/{integration_code}/oauth/start")
async def oauth_start(integration_code: str, user: dict = Depends(require_role("admin"))):
    integ = await integrations_col.find_one({"code": integration_code}, {"_id": 0})
    if not integ:
        raise HTTPException(status_code=404, detail="Integration not found")
    if not has_live_config(integration_code):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Live OAuth not configured for {integration_code}. "
                f"Set env vars: {integration_code}_OAUTH_AUTHORIZE_URL, "
                f"{integration_code}_OAUTH_TOKEN_URL, "
                f"{integration_code}_OAUTH_CLIENT_ID, "
                f"{integration_code}_OAUTH_CLIENT_SECRET, "
                f"{integration_code}_API_BASE."
            ),
        )
    adapter = get_adapter(integ)
    state = new_id()
    redirect_uri = os.environ.get("OAUTH_REDIRECT_URI")
    if not redirect_uri:
        raise HTTPException(status_code=500, detail="OAUTH_REDIRECT_URI is not configured")
    url = await adapter.get_authorize_url(redirect_uri=redirect_uri, state=state)
    if not url:
        raise HTTPException(status_code=500, detail="Adapter could not build authorize URL")
    await oauth_states_col.insert_one(
        {"state": state, "integration_code": integration_code, "user_id": user["id"], "created_at": utcnow().isoformat()}
    )
    await write_audit(user, "integration.oauth_start", integration_code)
    return {"authorize_url": url, "state": state, "redirect_uri": redirect_uri}


@router.get("/oauth/callback")
async def oauth_callback(code: str, state: str):
    """Universal OAuth callback. Routes to the right adapter based on stored state."""
    record = await oauth_states_col.find_one({"state": state}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    integration_code = record["integration_code"]
    integ = await integrations_col.find_one({"code": integration_code}, {"_id": 0})
    if not integ:
        raise HTTPException(status_code=404, detail="Integration not found")
    adapter = get_adapter(integ)
    redirect_uri = os.environ.get("OAUTH_REDIRECT_URI")
    if not redirect_uri:
        raise HTTPException(status_code=500, detail="OAUTH_REDIRECT_URI is not configured")
    try:
        tokens = await adapter.exchange_code(code, redirect_uri)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OAuth exchange failed: {e}")
    await integration_tokens_col.update_one(
        {"integration_code": integration_code},
        {
            "$set": {
                "integration_code": integration_code,
                "access_token": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token"),
                "expires_in": tokens.get("expires_in"),
                "token_type": tokens.get("token_type", "bearer"),
                "raw": tokens,
                "authorized_at": utcnow().isoformat(),
            }
        },
        upsert=True,
    )
    await oauth_states_col.delete_one({"state": state})
    return {"ok": True, "integration_code": integration_code, "mode": tokens.get("mode", "live")}


@router.post("/{integration_code}/oauth/disconnect")
async def oauth_disconnect(integration_code: str, user: dict = Depends(require_role("admin"))):
    await integration_tokens_col.delete_one({"integration_code": integration_code})
    await write_audit(user, "integration.oauth_disconnect", integration_code)
    return {"ok": True}


# ============ Stats for dashboards ============
@router.get("/_/stats")
async def integrations_stats(user: dict = Depends(get_current_user)):
    total_integrations = await integrations_col.count_documents({})
    connected_count = await integrations_col.count_documents({"connected": True})
    submissions_total = await integration_submissions_col.count_documents({})
    submissions_pending = await integration_submissions_col.count_documents(
        {"status": {"$in": ["submitted", "under_review", "needs_action"]}}
    )
    submissions_approved = await integration_submissions_col.count_documents({"status": "approved"})
    by_category_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
    ]
    by_category = await integrations_col.aggregate(by_category_pipeline).to_list(50)
    # how many integrations have live OAuth env configured
    live_configured = sum(1 for i in await integrations_col.find({}, {"_id": 0, "code": 1}).to_list(500) if has_live_config(i["code"]))
    authorized = await integration_tokens_col.count_documents({})
    return {
        "total_integrations": total_integrations,
        "connected": connected_count,
        "disconnected": total_integrations - connected_count,
        "submissions_total": submissions_total,
        "submissions_pending": submissions_pending,
        "submissions_approved": submissions_approved,
        "by_category": {b["_id"]: b["count"] for b in by_category},
        "live_configured": live_configured,
        "live_authorized": authorized,
    }
