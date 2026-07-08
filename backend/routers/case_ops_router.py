"""Tasks, messages, documents routers (combined for compactness)."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from auth import get_current_user, require_role
from database import (
    cases_col,
    documents_col,
    messages_col,
    tasks_col,
    serialize_doc,
    serialize_list,
    utcnow,
)
from models import (
    Document,
    Message,
    MessageCreate,
    Task,
    TaskCreate,
    TaskUpdate,
    new_id,
)
import base64
import json
import logging

from scanner import scan_document
from vault import encrypt_field, decrypt_field

logger = logging.getLogger("haven.case_ops")

router = APIRouter(tags=["case-ops"])

SCANNABLE_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}


# ===== TASKS =====
@router.post("/tasks")
async def create_task(payload: TaskCreate, user: dict = Depends(require_role("caseworker", "admin"))):
    task = Task(
        case_id=payload.case_id,
        caseworker_id=user["id"],
        title=payload.title,
        description=payload.description or "",
        due_date=payload.due_date,
        priority=payload.priority,
    ).model_dump()
    await tasks_col.insert_one(task)
    return serialize_doc(task)


@router.get("/tasks")
async def list_tasks(
    user: dict = Depends(get_current_user),
    case_id: str | None = None,
    status: str | None = None,
):
    q: dict = {}
    if user["role"] == "caseworker":
        q["caseworker_id"] = user["id"]
    if case_id:
        q["case_id"] = case_id
    if status:
        q["status"] = status
    docs = await tasks_col.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return serialize_list(docs)


@router.patch("/tasks/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate, user: dict = Depends(require_role("caseworker", "admin"))):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    result = await tasks_col.update_one({"id": task_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    doc = await tasks_col.find_one({"id": task_id}, {"_id": 0})
    return serialize_doc(doc)


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(require_role("caseworker", "admin"))):
    await tasks_col.delete_one({"id": task_id})
    return {"ok": True}


# ===== MESSAGES =====
@router.post("/messages")
async def send_message(payload: MessageCreate, user: dict = Depends(get_current_user)):
    msg = Message(
        case_id=payload.case_id,
        sender_id=user["id"],
        sender_name=user["name"],
        sender_role=user["role"],
        recipient_id=payload.recipient_id,
        content=payload.content,
    ).model_dump()
    await messages_col.insert_one(msg)
    return serialize_doc(msg)


@router.get("/messages")
async def list_messages(case_id: str, user: dict = Depends(get_current_user)):
    # ownership: residents can only see messages on their own cases
    if user["role"] == "resident":
        case = await cases_col.find_one({"id": case_id}, {"_id": 0, "resident_id": 1})
        if not case or case.get("resident_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")
    docs = await messages_col.find({"case_id": case_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return serialize_list(docs)


# ===== DOCUMENTS =====
@router.post("/documents")
async def upload_document(
    case_id: str = Form(...),
    type: str = Form("other"),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 8MB demo)")
    data_url = (
        f"data:{file.content_type};base64,"
        + base64.b64encode(content).decode("ascii")
    )
    doc = Document(
        case_id=case_id,
        uploaded_by=user["id"],
        type=type,
        filename=file.filename or "upload",
        content_type=file.content_type or "application/octet-stream",
        size=len(content),
        data_url=data_url,
    ).model_dump()
    await documents_col.insert_one(doc)
    return serialize_doc(doc)


@router.post("/documents/scan")
async def scan_and_file_document(
    case_id: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Universal Document Scanner: OCR + AI classify + auto-file into the Locker."""
    if (file.content_type or "") not in SCANNABLE_TYPES:
        raise HTTPException(status_code=415, detail="Scanner supports JPG, PNG, WEBP, and PDF only")
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 8MB)")

    try:
        result = await scan_document(content, file.content_type)
    except Exception as e:
        logger.exception("Document scan failed")
        msg = str(e)
        if "Budget has been exceeded" in msg:
            raise HTTPException(status_code=402, detail="AI scan unavailable: Universal Key balance is empty. Top up at Profile → Universal Key.")
        raise HTTPException(status_code=500, detail=f"BB couldn't read this document: {msg[:200]}")

    key_fields = result.get("key_fields") or {}
    extracted_text = result.get("extracted_text") or ""
    vault_payload = encrypt_field(
        json.dumps({"key_fields": key_fields, "extracted_text": extracted_text}),
        resource_type="document_extraction",
    )

    data_url = f"data:{file.content_type};base64," + base64.b64encode(content).decode("ascii")
    doc = Document(
        case_id=case_id,
        uploaded_by=user["id"],
        type=result["category"],
        filename=file.filename or "scan",
        content_type=file.content_type or "application/octet-stream",
        size=len(content),
        data_url=data_url,
        scanned=True,
        classification=result["category"],
        confidence=result["confidence"],
        extracted_summary=result.get("summary") or "",
        extracted_vault=vault_payload,
        expiration_date=result.get("expiration_date"),
        notes=result.get("title") or "",
    ).model_dump()
    await documents_col.insert_one(doc)

    saved = serialize_doc(doc)
    saved.pop("extracted_vault", None)
    return {
        "document": saved,
        "classification": result["category"],
        "confidence": result["confidence"],
        "title": result.get("title"),
        "summary": result.get("summary"),
        "key_fields": key_fields,
        "is_legible": result.get("is_legible", True),
    }


@router.get("/documents/{doc_id}/extracted")
async def get_extracted_data(doc_id: str, user: dict = Depends(get_current_user)):
    """Decrypt Apex Vault extraction for the document owner or staff."""
    doc = await documents_col.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if user["role"] == "resident" and doc.get("uploaded_by") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not doc.get("extracted_vault"):
        raise HTTPException(status_code=404, detail="No extracted data for this document")
    try:
        data = json.loads(decrypt_field(doc["extracted_vault"]))
    except Exception:
        raise HTTPException(status_code=500, detail="Vault decryption failed")
    return {"doc_id": doc_id, **data}


@router.get("/documents")
async def list_documents(case_id: str, user: dict = Depends(get_current_user)):
    if user["role"] == "resident":
        case = await cases_col.find_one({"id": case_id}, {"_id": 0, "resident_id": 1})
        if not case or case.get("resident_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")
    docs = await documents_col.find({"case_id": case_id}, {"_id": 0, "extracted_vault": 0}).sort("created_at", -1).to_list(500)
    return serialize_list(docs)


@router.patch("/documents/{doc_id}/verify")
async def verify_document(
    doc_id: str,
    verified: bool = True,
    notes: str = "",
    user: dict = Depends(require_role("caseworker", "admin")),
):
    result = await documents_col.update_one(
        {"id": doc_id},
        {"$set": {"verified": verified, "verified_by": user["id"], "notes": notes}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = await documents_col.find_one({"id": doc_id}, {"_id": 0})
    return serialize_doc(doc)
