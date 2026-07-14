"""Form templates router — 13 pre-built agency forms + BB autofill + single-form PDF export."""
from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from auth import get_current_user
from database import audit_log_col, cases_col, db, serialize_doc, serialize_list, utcnow
from data.form_templates import FORM_TEMPLATES
from models import new_id
from vault import decrypt_field, is_encrypted, protect_document, SENSITIVE_FIELDS

router = APIRouter(prefix="/form-templates", tags=["form-templates"])

submissions_col = db["form_submissions"]


# ── helpers ──────────────────────────────────────────────────────────────────
def _template_by_id(tid: str) -> dict:
    for t in FORM_TEMPLATES:
        if t["id"] == tid:
            return t
    return {}


def _unvault_value(val):
    """Decrypt a field value if it is a vault envelope, else return as-is."""
    if is_encrypted(val):
        try:
            return decrypt_field(val)
        except Exception:
            return ""
    return val


def _autofill_from_user(user: dict, case: Optional[dict]) -> dict:
    """Deterministic autofill — maps known user/case fields, no LLM cost.
    All values are vault-decrypted before mapping so autofill never returns
    ciphertext dicts instead of human-readable values.
    """
    full = user.get("name", "")
    parts = full.split(" ", 1)
    intake = (case or {}).get("intake_data", {}) if case else {}
    return {
        "full_name":       full,
        "first_name":      parts[0] if parts else "",
        "last_name":       parts[1] if len(parts) > 1 else "",
        "email":           user.get("email", ""),
        "phone":           _unvault_value(user.get("phone", "")),
        "address":         _unvault_value(intake.get("address", "")),
        "city":            _unvault_value(intake.get("city", "")),
        "state":           _unvault_value(intake.get("state", "")),
        "zip":             _unvault_value(intake.get("zip", "")),
        "dob":             _unvault_value(intake.get("dob", "")),
        "ssn":             _unvault_value(intake.get("ssn", "")),
        "income":          _unvault_value(intake.get("income", "")),
        "household_size":  _unvault_value(intake.get("household_size", "")),
        "employer":        _unvault_value(intake.get("employer", "")),
    }


def _build_pdf_single(template: dict, submission: dict, user_name: str, user_email: str) -> bytes:
    """Build single-form PDF using reportlab. Returns bytes."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
        )
        from reportlab.lib.enums import TA_CENTER

        HAVEN_GOLD  = colors.HexColor("#D4AF37")
        HAVEN_NAVY  = colors.HexColor("#0B1020")
        HAVEN_LIGHT = colors.HexColor("#F7F8FB")

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter,
                                leftMargin=0.75*inch, rightMargin=0.75*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("title", parent=styles["Heading1"],
                                     textColor=HAVEN_GOLD, fontSize=18, spaceAfter=4)
        sub_style   = ParagraphStyle("sub",   parent=styles["Normal"],
                                     textColor=colors.grey, fontSize=10, spaceAfter=12)
        label_style = ParagraphStyle("label", parent=styles["Normal"],
                                     fontSize=9, textColor=colors.grey)
        value_style = ParagraphStyle("value", parent=styles["Normal"],
                                     fontSize=11)

        story = []

        # Header bar
        header_data = [[Paragraph("<b>HAVEN</b> — Help has a home.", ParagraphStyle(
            "hdr", parent=styles["Normal"], textColor=colors.white, fontSize=14))]]
        header_table = Table(header_data, colWidths=[7*inch])
        header_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), HAVEN_NAVY),
            ("TOPPADDING",    (0,0), (-1,-1), 10),
            ("BOTTOMPADDING", (0,0), (-1,-1), 10),
            ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.2*inch))

        story.append(Paragraph(template.get("name", "Form"), title_style))
        story.append(Paragraph(f"Agency: {template.get('agency', '')} &nbsp;·&nbsp; Category: {template.get('category','').title()}", sub_style))
        story.append(HRFlowable(width="100%", thickness=1, color=HAVEN_GOLD))
        story.append(Spacer(1, 0.1*inch))

        # Meta table
        sid  = submission.get("id", "")
        ts   = submission.get("submitted_at", utcnow().isoformat())
        case_id = submission.get("case_id", "—")
        meta = [
            ["Submission ID", sid[:16]],
            ["Submitted",     ts[:19].replace("T", " ")],
            ["Applicant",     user_name],
            ["Email",         user_email],
            ["Case ID",       case_id or "—"],
        ]
        meta_table = Table(meta, colWidths=[2*inch, 5*inch])
        meta_table.setStyle(TableStyle([
            ("FONTSIZE",      (0,0), (-1,-1), 9),
            ("TEXTCOLOR",     (0,0), (0,-1), colors.grey),
            ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
            ("BACKGROUND",    (0,0), (-1,-1), HAVEN_LIGHT),
            ("ROWBACKGROUNDS",(0,0), (-1,-1), [HAVEN_LIGHT, colors.white]),
            ("GRID",          (0,0), (-1,-1), 0.25, colors.lightgrey),
            ("TOPPADDING",    (0,0), (-1,-1), 5),
            ("BOTTOMPADDING", (0,0), (-1,-1), 5),
            ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 0.2*inch))

        # Responses
        story.append(Paragraph("<b>Form Responses</b>", styles["Heading3"]))
        story.append(Spacer(1, 0.05*inch))

        data_dict = submission.get("data", {})
        fields = template.get("fields", [])
        rows = []
        for f in fields:
            fname = f["name"]
            val = str(data_dict.get(fname, "—"))
            rows.append([
                Paragraph(f["label"], label_style),
                Paragraph(val if val not in ("", "None") else "—", value_style),
            ])
        if rows:
            resp_table = Table(rows, colWidths=[2.5*inch, 4.5*inch])
            resp_table.setStyle(TableStyle([
                ("ROWBACKGROUNDS", (0,0), (-1,-1), [HAVEN_LIGHT, colors.white]),
                ("GRID",          (0,0), (-1,-1), 0.25, colors.lightgrey),
                ("TOPPADDING",    (0,0), (-1,-1), 6),
                ("BOTTOMPADDING", (0,0), (-1,-1), 6),
                ("LEFTPADDING",   (0,0), (-1,-1), 6),
                ("VALIGN",        (0,0), (-1,-1), "TOP"),
            ]))
            story.append(resp_table)

        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(
            f"<i>Generated by HAVEN · {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>",
            ParagraphStyle("footer", parent=styles["Normal"], fontSize=8, textColor=colors.grey),
        ))

        doc.build(story)
        return buf.getvalue()

    except ImportError:
        # reportlab not installed — return a minimal valid PDF stub
        stub = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        stub += b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        stub += b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n"
        stub += b"xref\n0 4\n0000000000 65535 f\n"
        stub += b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF"
        return stub


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("")
async def list_templates(user: dict = Depends(get_current_user)):
    return [
        {k: v for k, v in t.items() if k != "fields"}
        for t in FORM_TEMPLATES
    ]


@router.get("/submissions/mine")
async def my_submissions(user: dict = Depends(get_current_user)):
    docs = await submissions_col.find(
        {"submitted_by": user["id"]}, {"_id": 0}
    ).sort("submitted_at", -1).to_list(500)
    return serialize_list(docs)


@router.get("/submissions/{submission_id}/pdf")
async def download_submission_pdf(submission_id: str, user: dict = Depends(get_current_user)):
    sub = await submissions_col.find_one({"id": submission_id}, {"_id": 0})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    # auth: resident can only fetch their own
    if user["role"] == "resident" and sub.get("submitted_by") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    template = _template_by_id(sub.get("template_id", ""))
    pdf_bytes = _build_pdf_single(
        template, sub,
        user_name=sub.get("applicant_name", user["name"]),
        user_email=sub.get("applicant_email", user.get("email", "")),
    )
    tid = sub.get("template_id", "form")
    filename = f"HAVEN_{tid}_{submission_id[:8]}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: str, user: dict = Depends(get_current_user)):
    sub = await submissions_col.find_one({"id": submission_id}, {"_id": 0})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user["role"] == "resident" and sub.get("submitted_by") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return serialize_doc(sub)


@router.get("/{template_id}")
async def get_template(template_id: str, user: dict = Depends(get_current_user)):
    t = _template_by_id(template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return t


@router.post("/{template_id}/autofill")
async def autofill_template(
    template_id: str,
    case_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    t = _template_by_id(template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    case = None
    if case_id:
        case = await cases_col.find_one({"id": case_id}, {"_id": 0})
    values = _autofill_from_user(user, case)
    # Map to template fields
    filled: dict[str, str] = {}
    missing: list[str] = []
    for f in t.get("fields", []):
        fname = f["name"]
        val = values.get(fname, "")
        if val not in (None, ""):
            filled[fname] = str(val)
        elif f.get("required"):
            missing.append(fname)
    return {"template_id": template_id, "filled": filled, "missing_required": missing}


class SubmitPayload(BaseModel):
    data: dict
    case_id: Optional[str] = None


@router.post("/{template_id}/submit")
async def submit_template(
    template_id: str,
    body: SubmitPayload,
    user: dict = Depends(get_current_user),
):
    t = _template_by_id(template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    sid = new_id()
    doc = {
        "id": sid,
        "template_id": template_id,
        "template_name": t["name"],
        "agency": t["agency"],
        "category": t["category"],
        "integration_code": t.get("integration_code"),
        "case_id": body.case_id,
        "submitted_by": user["id"],
        "applicant_name": user["name"],
        "applicant_email": user.get("email", ""),
        # Vault-protect sensitive fields in submission data before persistence
        "data": protect_document(body.data),
        "submitted_at": utcnow().isoformat(),
    }
    await submissions_col.insert_one(doc)
    await audit_log_col.insert_one({
        "id": new_id(),
        "actor_id": user.get("id"),
        "actor_name": user.get("name"),
        "actor_role": user.get("role"),
        "action": "template.submit",
        "target": sid,
        "meta": {"template_id": template_id, "agency": t["agency"], "case_id": body.case_id},
        "created_at": utcnow().isoformat(),
    })
    return serialize_doc(doc)
