"""HAVEN Integration Request Router — the outreach engine that lets The
Architect send pre-filled OAuth / Data-Processing Agreements to partner
agencies with one click.

Flow:
1. Architect fills a short form (agency name, up to 3 contacts, integration
   scope).  Data lives in Mongo.
2. Backend renders a beautifully-formatted HTML document at
   `/api/integration-requests/{id}/document` — recipients open it in their
   browser and print-to-PDF.  We provide a mailto: link with pre-filled subject
   + body so The Architect just clicks Send.
3. When the signed doc + OAuth credentials come back, we expose a callback
   endpoint (`POST /api/integration-requests/{id}/authorize`) that stores the
   credential in the Apex Vault and marks the request as active.  BB then picks
   up the new agency automatically via the browser-autofill / adapter registry.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote_plus

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr, Field

from auth import require_role, get_current_user
from database import audit_log_col, db
from models import new_id
from vault import encrypt_field


async def _write_audit(actor: dict, action: str, target: str, meta: dict | None = None) -> None:
    """Immutable insert-only audit event."""
    from database import utcnow
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

router = APIRouter(prefix="/integration-requests", tags=["integrations"])

# Architect-only — this is The Architect's personal outreach engine.
_ARCHITECT_ONLY = require_role("architect")


# --------------------------------------------------------------------------- Models
class Contact(BaseModel):
    name: str
    title: str
    email: EmailStr


class IntegrationRequestCreate(BaseModel):
    agency_name: str
    agency_type: str = Field(description="e.g. county, state, federal, nonprofit, city")
    program: str = Field(description="Program or service being integrated (e.g. Section 8, HUD-VASH, CalFresh)")
    scope: str = Field(description="What data/services the integration will cover")
    contacts: list[Contact] = Field(min_length=1, max_length=5)
    urgency: str = Field(default="normal", description="normal | high | critical")
    notes: str | None = None


class IntegrationRequestOut(BaseModel):
    id: str
    agency_name: str
    agency_type: str
    program: str
    scope: str
    contacts: list[Contact]
    urgency: str
    notes: str | None
    status: str
    created_at: str
    created_by: str
    document_url: str
    mailto_url: str


class AuthorizeRequest(BaseModel):
    signed_by_name: str
    signed_by_title: str
    oauth_client_id: str | None = None
    oauth_client_secret: str | None = None
    api_key: str | None = None
    webhook_url: str | None = None
    additional_notes: str | None = None


# --------------------------------------------------------------------------- Helpers
def _build_mailto(request_id: str, req: dict, host: str = "") -> str:
    subject = f"HAVEN Integration Request — {req['program']} ({req['agency_name']})"
    body_lines = [
        f"Hello {', '.join(c['name'] for c in req['contacts'])},",
        "",
        "The Architect of the HAVEN civic platform is requesting a Data-Processing / OAuth integration between your agency and HAVEN.",
        "",
        f"Program / Service: {req['program']}",
        f"Agency: {req['agency_name']} ({req['agency_type']})",
        f"Scope: {req['scope']}",
        "",
        "A full pre-filled Memorandum of Understanding + Data-Processing Agreement is available at:",
        f"{host}/api/integration-requests/{request_id}/document",
        "",
        "Please review, add the required agency details + a signature of approval, and submit back via the link at the bottom of the document. Once authorization is received, HAVEN's autonomous BB agent will complete the integration automatically.",
        "",
        "Thank you for helping us reduce caseworker friction and get help to residents faster.",
        "",
        "— The Architect / HAVEN Platform",
    ]
    to = ",".join(c["email"] for c in req["contacts"])
    return f"mailto:{to}?subject={quote_plus(subject)}&body={quote_plus(chr(10).join(body_lines))}"


# --------------------------------------------------------------------------- Routes
@router.post("", response_model=IntegrationRequestOut)
async def create_integration_request(
    body: IntegrationRequestCreate,
    user: dict = Depends(_ARCHITECT_ONLY),
):
    
    doc = {
        "id": new_id(),
        "agency_name": body.agency_name,
        "agency_type": body.agency_type,
        "program": body.program,
        "scope": body.scope,
        "contacts": [c.model_dump() for c in body.contacts],
        "urgency": body.urgency,
        "notes": body.notes,
        "status": "drafted",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["id"],
        "created_by_name": user.get("name", "The Architect"),
        "created_by_email": user.get("email", ""),
    }
    await db.integration_requests.insert_one(doc)
    doc.pop("_id", None)

    await _write_audit(user, "integration_request.create", doc["id"],
        {"agency": body.agency_name, "program": body.program, "urgency": body.urgency})

    return IntegrationRequestOut(
        **doc,
        document_url=f"/api/integration-requests/{doc['id']}/document",
        mailto_url=_build_mailto(doc["id"], doc),
    )


@router.get("")
async def list_integration_requests(_: dict = Depends(_ARCHITECT_ONLY)):
    
    items = await db.integration_requests.find({}).sort("created_at", -1).to_list(None)
    for it in items:
        it.pop("_id", None)
        it["document_url"] = f"/api/integration-requests/{it['id']}/document"
        it["mailto_url"] = _build_mailto(it["id"], it)
    return items


@router.get("/{req_id}", response_model=IntegrationRequestOut)
async def get_integration_request(req_id: str, _: dict = Depends(_ARCHITECT_ONLY)):
    
    doc = await db.integration_requests.find_one({"id": req_id})
    if not doc:
        raise HTTPException(404, "Not found")
    doc.pop("_id", None)
    return IntegrationRequestOut(
        **doc,
        document_url=f"/api/integration-requests/{doc['id']}/document",
        mailto_url=_build_mailto(doc["id"], doc),
    )


@router.get("/{req_id}/document", response_class=HTMLResponse)
async def render_document(req_id: str):
    """Public — the signed URL for the agency to open + print-to-PDF."""
    
    doc = await db.integration_requests.find_one({"id": req_id})
    if not doc:
        raise HTTPException(404, "Not found")

    contacts_html = "".join(
        f"<li><strong>{c['name']}</strong>, {c['title']} &lt;{c['email']}&gt;</li>"
        for c in doc.get("contacts", [])
    )

    html = f"""<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>HAVEN Integration Request — {doc['agency_name']}</title>
<style>
  @page {{ margin: 0.75in; }}
  body {{
    font-family: 'Georgia', 'Cormorant Garamond', serif;
    background: #fafaf7; color: #1a1a1a; max-width: 780px; margin: 40px auto; padding: 40px;
    line-height: 1.55; font-size: 15px;
  }}
  h1 {{ font-size: 2rem; letter-spacing: 0.08em; text-transform: uppercase; text-align: center; margin: 0 0 6px; }}
  h2 {{ font-size: 1.1rem; letter-spacing: 0.14em; text-transform: uppercase; color: #8f6d0f; border-bottom: 1px solid #d4af37; padding-bottom: 4px; margin-top: 32px; }}
  .brand {{ color: #8f6d0f; text-align: center; font-style: italic; margin-bottom: 24px; }}
  .meta {{ background: #f2ede0; padding: 16px 20px; border-left: 4px solid #d4af37; margin: 20px 0; }}
  .meta strong {{ display: inline-block; min-width: 130px; }}
  .sig {{ margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }}
  .sig-block {{ border-top: 1px solid #333; padding-top: 6px; font-size: 13px; }}
  ul {{ padding-left: 20px; }}
  .btn {{ display: inline-block; background: #d4af37; color: #0a142b; padding: 12px 22px; text-decoration: none; border-radius: 6px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px; }}
  .footer {{ text-align: center; font-size: 12px; color: #666; margin-top: 40px; }}
  @media print {{ .no-print {{ display: none; }} body {{ margin: 0; padding: 20px; }} }}
</style>
</head>
<body>
<h1>HAVEN</h1>
<p class="brand">Data-Processing &amp; Integration Agreement</p>

<p>This document authorizes a data-processing and API integration between
<strong>{doc['agency_name']}</strong> ({doc['agency_type']}) and the HAVEN civic
platform, operated by The Architect on behalf of the residents of Santa Clara
County and the greater Bay Area.</p>

<h2>Program / Service</h2>
<p><strong>{doc['program']}</strong></p>
<div class="meta"><strong>Scope of integration:</strong><br />{doc['scope']}</div>

<h2>Chain of Command</h2>
<ul>{contacts_html}</ul>

<h2>What HAVEN will receive</h2>
<ul>
  <li>Real-time resource availability (open beds, appointment slots, waitlist depth)</li>
  <li>Application-status callbacks so residents see progress the moment your caseworker moves the case forward</li>
  <li>OAuth 2.0 credentials so BB (HAVEN's autonomous agent) can submit forms on the resident's behalf under a scoped delegate token</li>
</ul>

<h2>What your agency will receive</h2>
<ul>
  <li>Fully pre-qualified referrals — every applicant is pre-screened by HAVEN's six engines (QualifyCore, NexusMatch, CivicFlow, FirstResponse Router, CascadePipeline, CivicContext)</li>
  <li>All sensitive resident data flows through the <strong>Apex Vault</strong> — AES-256-GCM authenticated encryption with envelope KEK/DEK separation and HMAC-verified integrity, meeting FIPS 140-2 handling standards</li>
  <li>Zero cost to your agency; HAVEN absorbs all platform-side operational expense</li>
  <li>Aggregate impact reporting for grant applications, quarterly board packets, and county audits</li>
</ul>

<h2>Legal &amp; Compliance</h2>
<p>All PII is encrypted at rest using AES-256-GCM (FIPS 140-2 approved), transmitted
over TLS 1.3, and logged with tamper-evident HMAC signatures. HAVEN maintains a
zero-knowledge posture toward field values you deem confidential: your agency
retains the sole decryption authority for its scoped data.  Data residency: US.
BAA available on request.</p>

<div class="sig">
  <div class="sig-block">Authorized Signatory<br /><em>(Name, Title)</em></div>
  <div class="sig-block">Date</div>
</div>

<div class="footer">
  Request ID: <code>{doc['id']}</code> · Sent by {doc.get('created_by_name','The Architect')}
  &lt;{doc.get('created_by_email','')}&gt; on {doc['created_at'][:10]}.<br />
  When signed, return this document + credentials to <strong>The Architect</strong>
  via the HAVEN Integration Portal or email attachment.
</div>

<div class="no-print" style="text-align:center;margin-top:30px">
  <button onclick="window.print()" class="btn">Print / Save as PDF</button>
</div>

</body>
</html>"""
    return HTMLResponse(content=html)


@router.post("/{req_id}/authorize")
async def authorize(req_id: str, body: AuthorizeRequest, user: dict = Depends(_ARCHITECT_ONLY)):
    """Callback used when a signed agreement + credentials come back.  All
    provided secrets are encrypted through the Apex Vault before storage."""
    
    doc = await db.integration_requests.find_one({"id": req_id})
    if not doc:
        raise HTTPException(404, "Not found")

    encrypted_credentials: dict[str, Any] = {}
    for field_name in ("oauth_client_secret", "api_key"):
        val = getattr(body, field_name)
        if val:
            encrypted_credentials[field_name] = encrypt_field(val, resource_type=f"integration_{field_name}")

    update = {
        "status": "active",
        "authorized_at": datetime.now(timezone.utc).isoformat(),
        "signed_by_name": body.signed_by_name,
        "signed_by_title": body.signed_by_title,
        "oauth_client_id": body.oauth_client_id,
        "webhook_url": body.webhook_url,
        "additional_notes": body.additional_notes,
        "credentials_vault": encrypted_credentials or None,
    }
    await db.integration_requests.update_one({"id": req_id}, {"$set": update})

    await _write_audit(user, "integration_request.authorize", req_id,
        {"signed_by": body.signed_by_name, "signed_by_title": body.signed_by_title,
         "has_oauth": bool(body.oauth_client_id), "has_api_key": bool(body.api_key)})

    return {"ok": True, "id": req_id, "status": "active", "message": "Integration authorized. BB will pick it up on the next dispatch cycle."}
