"""HAVEN Universal Document Scanner — OCR + AI classification + auto-file.

Pipeline: upload (image/PDF) -> render to image -> GPT-4o vision (OCR + classify)
-> Apex Vault encrypt extracted PII -> auto-file into the Document Locker.
"""
from __future__ import annotations
import base64
import json
import logging
import os
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

logger = logging.getLogger("haven.scanner")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
SCANNER_MODEL = ("openai", "gpt-4o")

CATEGORIES = [
    "identity",          # driver's license, state ID, passport
    "social_security",   # SSN card, SSA letters
    "birth_certificate",
    "medical",           # records, prescriptions, insurance cards
    "benefits",          # EBT/CalFresh, SSI/SSDI, Medi-Cal award letters
    "housing",           # lease, voucher, shelter letters, utility bills
    "income",            # pay stubs, W-2, employer letters
    "legal",             # court docs, citations, restraining orders
    "other",
]

SYSTEM_PROMPT = """You are BB, Haven's document intake assistant. You read scanned civic documents \
for residents experiencing housing/food/health insecurity. You perform OCR and classification. \
Respond ONLY with a single valid JSON object, no markdown fences, no prose."""

USER_PROMPT = f"""Read this document image carefully. Perform full OCR, then classify and extract.

Return ONLY this JSON object:
{{
  "category": "<one of: {', '.join(CATEGORIES)}>",
  "confidence": <0.0-1.0>,
  "title": "<short human title, e.g. 'California Driver License — John Smith'>",
  "summary": "<1-2 sentence plain-language summary of what this document is and why it matters>",
  "extracted_text": "<full OCR text of the document>",
  "key_fields": {{ "<field name>": "<value>" }},
  "expiration_date": "<YYYY-MM-DD or null>",
  "is_legible": <true|false>
}}

key_fields should capture identifiers like full name, document number, dates, issuing agency, case numbers, amounts.
If the image is not a document (random photo), use category "other", confidence 0, is_legible false."""


def pdf_to_image_b64(pdf_bytes: bytes) -> str:
    """Render first page of a PDF to PNG base64 using PyMuPDF."""
    import fitz
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc.load_page(0)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    png = pix.tobytes("png")
    doc.close()
    return base64.b64encode(png).decode("ascii")


async def scan_document(content: bytes, content_type: str) -> dict:
    """Send document image to GPT-4o vision; return classification dict."""
    if not EMERGENT_LLM_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")

    if content_type == "application/pdf":
        image_b64 = pdf_to_image_b64(content)
    else:
        image_b64 = base64.b64encode(content).decode("ascii")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"scanner-{uuid.uuid4().hex[:12]}",
        system_message=SYSTEM_PROMPT,
    ).with_model(*SCANNER_MODEL)

    msg = UserMessage(text=USER_PROMPT, file_contents=[ImageContent(image_base64=image_b64)])
    raw = await chat.send_message(msg)
    text = str(raw).strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start == -1 or end == -1:
            raise ValueError(f"Scanner returned non-JSON output: {text[:200]}")
        result = json.loads(text[start:end + 1])

    if result.get("category") not in CATEGORIES:
        result["category"] = "other"
    result["confidence"] = float(result.get("confidence") or 0)
    return result
