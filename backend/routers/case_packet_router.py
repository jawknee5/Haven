"""Case packet router — GET /cases/{case_id}/packet.pdf
Builds an 8-section PDF bundle suitable for court appearances, agency handoffs, and appeals.
Auth: resident owner | assigned caseworker | admin | architect → 200
      different resident → 403   |   nonexistent case → 404
"""
from __future__ import annotations

import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from auth import get_current_user
from database import (
    cases_col, db, documents_col, messages_col, tasks_col, users_col,
    utcnow,
)

router = APIRouter(tags=["case-packet"])

submissions_col = db["form_submissions"]


def _page_header(story, label: str, styles):
    """Append a navy section-header bar + spacer."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import Table, TableStyle, Spacer
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.platypus import Paragraph

        HAVEN_NAVY = colors.HexColor("#0B1020")
        hdr = Table(
            [[Paragraph(f"<b>{label}</b>",
                        ParagraphStyle("sh", parent=styles["Normal"],
                                       textColor=colors.white, fontSize=12))]],
            colWidths=[7 * inch],
        )
        hdr.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), HAVEN_NAVY),
            ("TOPPADDING",    (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ]))
        story.append(hdr)
        story.append(Spacer(1, 0.12 * inch))
    except ImportError:
        pass


def _kv_table(rows: list[tuple[str, str]], styles, col_widths=(2.2, 4.8)):
    """Return a 2-column key/value Table flowable."""
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import Table, TableStyle, Paragraph
    from reportlab.lib.styles import ParagraphStyle

    HAVEN_LIGHT = colors.HexColor("#F7F8FB")
    lbl = ParagraphStyle("lbl", parent=styles["Normal"], fontSize=9, textColor=colors.grey)
    val = ParagraphStyle("val", parent=styles["Normal"], fontSize=10)
    data = [[Paragraph(k, lbl), Paragraph(str(v) if v not in (None, "") else "—", val)]
            for k, v in rows]
    t = Table(data, colWidths=[col_widths[0] * inch, col_widths[1] * inch])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [HAVEN_LIGHT, colors.white]),
        ("GRID",           (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ("TOPPADDING",     (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 5),
        ("LEFTPADDING",    (0, 0), (-1, -1), 6),
        ("VALIGN",         (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def _build_packet(case: dict, tasks: list, messages: list, documents: list,
                  submissions: list, resident: dict, caseworker: dict) -> bytes:
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
            HRFlowable, PageBreak,
        )
        from reportlab.lib.styles import ParagraphStyle

        HAVEN_GOLD  = colors.HexColor("#D4AF37")
        HAVEN_NAVY  = colors.HexColor("#0B1020")
        HAVEN_LIGHT = colors.HexColor("#F7F8FB")

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter,
                                leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                                topMargin=0.75 * inch, bottomMargin=0.75 * inch)
        styles = getSampleStyleSheet()
        story  = []

        def gold(text, size=11):
            return Paragraph(f"<b>{text}</b>",
                             ParagraphStyle("g", parent=styles["Normal"],
                                            textColor=HAVEN_GOLD, fontSize=size))

        def body(text, size=10):
            return Paragraph(text,
                             ParagraphStyle("b", parent=styles["Normal"], fontSize=size))

        def grey(text, size=9):
            return Paragraph(text,
                             ParagraphStyle("gr", parent=styles["Normal"],
                                            textColor=colors.grey, fontSize=size))

        # ── 1. COVER ────────────────────────────────────────────────────────
        story.append(Spacer(1, 0.4 * inch))
        story.append(gold("HAVEN — Help has a home.", size=22))
        story.append(Spacer(1, 0.1 * inch))
        story.append(HRFlowable(width="100%", thickness=2, color=HAVEN_GOLD))
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph("CASE PACKET", ParagraphStyle(
            "cp", parent=styles["Normal"], fontSize=16, textColor=HAVEN_NAVY)))
        story.append(Spacer(1, 0.1 * inch))

        cid = case.get("id", "")
        cover_rows = [
            ("Case ID",        cid),
            ("Title",          case.get("title", "")),
            ("Category",       (case.get("category") or "").title()),
            ("Status",         (case.get("status") or "").title()),
            ("Urgency Score",  f"{case.get('urgency_score', 0)}/100"),
            ("Resident",       resident.get("name", "—")),
            ("Caseworker",     caseworker.get("name", "—") if caseworker else "Unassigned"),
            ("Created",        (case.get("created_at") or "")[:19].replace("T", " ")),
            ("Last Updated",   (case.get("updated_at") or "")[:19].replace("T", " ")),
            ("Prepared At",    datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")),
        ]
        story.append(_kv_table(cover_rows, styles))
        story.append(PageBreak())

        # ── 2. CASE SUMMARY ─────────────────────────────────────────────────
        _page_header(story, "2. Case Summary", styles)
        story.append(body(case.get("description", "No description provided.")))
        story.append(Spacer(1, 0.15 * inch))
        intake = case.get("intake_data") or {}
        if intake:
            story.append(gold("Intake Data", size=11))
            story.append(Spacer(1, 0.05 * inch))
            story.append(_kv_table([(k, str(v)) for k, v in intake.items()], styles))
        story.append(PageBreak())

        # ── 3. PEOPLE ───────────────────────────────────────────────────────
        _page_header(story, "3. People", styles)
        res_rows = [
            ("Name",  resident.get("name", "—")),
            ("Email", resident.get("email", "—")),
            ("Phone", resident.get("phone", "—")),
            ("Role",  "Resident"),
        ]
        story.append(gold("Resident", 11))
        story.append(_kv_table(res_rows, styles))
        story.append(Spacer(1, 0.15 * inch))
        if caseworker:
            cw_rows = [
                ("Name",  caseworker.get("name", "—")),
                ("Email", caseworker.get("email", "—")),
                ("Phone", caseworker.get("phone", "—")),
                ("Role",  "Caseworker"),
            ]
            story.append(gold("Caseworker", 11))
            story.append(_kv_table(cw_rows, styles))
        story.append(PageBreak())

        # ── 4. SUBMITTED APPLICATIONS ────────────────────────────────────────
        _page_header(story, "4. Submitted Applications", styles)
        if submissions:
            for sub in submissions:
                story.append(gold(sub.get("template_name", sub.get("template_id", "Form")), 10))
                sub_rows = [
                    ("Agency",       sub.get("agency", "—")),
                    ("Submitted At", (sub.get("submitted_at") or "")[:19].replace("T", " ")),
                ]
                for k, v in (sub.get("data") or {}).items():
                    sub_rows.append((k, str(v)))
                story.append(_kv_table(sub_rows, styles))
                story.append(Spacer(1, 0.15 * inch))
        else:
            story.append(grey("No form submissions on file for this case."))
        story.append(PageBreak())

        # ── 5. DOCUMENTS INDEX ───────────────────────────────────────────────
        _page_header(story, "5. Documents Index", styles)
        if documents:
            doc_rows = [["Filename", "Type", "Uploaded", "Verified"]]
            for d in documents:
                doc_rows.append([
                    d.get("filename", "—"),
                    d.get("type", "—"),
                    (d.get("created_at") or "")[:10],
                    "✓" if d.get("verified") else "—",
                ])
            doc_table = Table(doc_rows, colWidths=[2.8*inch, 1.2*inch, 1.5*inch, 1.5*inch])
            doc_table.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, 0), HAVEN_NAVY),
                ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
                ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",      (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS",(0, 1), (-1, -1), [HAVEN_LIGHT, colors.white]),
                ("GRID",          (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("TOPPADDING",    (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING",   (0, 0), (-1, -1), 6),
            ]))
            story.append(doc_table)
        else:
            story.append(grey("No documents uploaded for this case."))
        story.append(PageBreak())

        # ── 6. TASKS & NOTES ────────────────────────────────────────────────
        _page_header(story, "6. Tasks & Notes", styles)
        if tasks:
            task_rows = [["Title", "Priority", "Status", "Due Date"]]
            for t in tasks:
                task_rows.append([
                    t.get("title", "—"),
                    (t.get("priority") or "—").title(),
                    (t.get("status") or "—").replace("_", " ").title(),
                    t.get("due_date") or "—",
                ])
            task_table = Table(task_rows, colWidths=[3.5*inch, 1*inch, 1.2*inch, 1.3*inch])
            task_table.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, 0), HAVEN_NAVY),
                ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
                ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",      (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS",(0, 1), (-1, -1), [HAVEN_LIGHT, colors.white]),
                ("GRID",          (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("TOPPADDING",    (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING",   (0, 0), (-1, -1), 6),
            ]))
            story.append(task_table)
        else:
            story.append(grey("No tasks on file for this case."))
        story.append(PageBreak())

        # ── 7. MESSAGE DIGEST (last 20) ──────────────────────────────────────
        _page_header(story, "7. Message Digest (last 20)", styles)
        if messages:
            for msg in messages[-20:]:
                sender = msg.get("sender_name", "Unknown")
                ts     = (msg.get("created_at") or "")[:16].replace("T", " ")
                content = msg.get("content", "")
                story.append(grey(f"{sender}  ·  {ts}", 8))
                story.append(body(content, 10))
                story.append(Spacer(1, 0.08 * inch))
        else:
            story.append(grey("No messages on file for this case."))
        story.append(PageBreak())

        # ── 8. ATTESTATION FOOTER ────────────────────────────────────────────
        _page_header(story, "8. Attestation", styles)
        story.append(body(
            "This case packet was generated by the HAVEN platform as a factual record of "
            "the case data, form submissions, documents, tasks, and communications on file "
            "at the time of generation. The contents reflect information provided by the "
            "resident, caseworker, and agency integrations."
        ))
        story.append(Spacer(1, 0.2 * inch))
        story.append(_kv_table([
            ("Generated At",   datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")),
            ("Case ID",        cid),
            ("Prepared by",    "HAVEN Platform — homeishaven.cloud"),
        ], styles))

        doc.build(story)
        return buf.getvalue()

    except ImportError:
        # reportlab not available — return minimal valid PDF stub
        stub = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        stub += b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        stub += b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n"
        stub += b"xref\n0 4\n0000000000 65535 f\n"
        stub += b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF"
        return stub


@router.get("/cases/{case_id}/packet.pdf")
async def download_case_packet(case_id: str, user: dict = Depends(get_current_user)):
    case = await cases_col.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Auth: resident owner | assigned caseworker | admin | architect
    role = user["role"]
    if role == "resident" and case["resident_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if role == "caseworker" and case.get("caseworker_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Fetch all related data
    tasks       = await tasks_col.find({"case_id": case_id}, {"_id": 0}).to_list(500)
    messages    = await messages_col.find({"case_id": case_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    documents   = await documents_col.find({"case_id": case_id}, {"_id": 0}).to_list(500)
    submissions = await submissions_col.find(
        {"$or": [{"case_id": case_id}, {"submitted_by": case["resident_id"]}]},
        {"_id": 0},
    ).sort("submitted_at", 1).to_list(200)

    resident   = await users_col.find_one({"id": case["resident_id"]}, {"_id": 0, "password_hash": 0}) or {}
    caseworker = None
    if case.get("caseworker_id"):
        caseworker = await users_col.find_one({"id": case["caseworker_id"]}, {"_id": 0, "password_hash": 0})

    pdf_bytes = _build_packet(case, tasks, messages, documents, submissions, resident, caseworker)
    filename  = f"HAVEN_CasePacket_{case_id[:8]}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
