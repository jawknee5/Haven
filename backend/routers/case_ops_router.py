"""Tasks, messages, documents routers (combined for compactness).

Document storage strategy (SOC 2 Type II compliance):
  - File bytes are encrypted via ApexVault (AES-256-GCM envelope) before persistence.
  - MongoDB holds only the encrypted payload — raw bytes never touch the DB at rest.
  - Access is gated behind cryptographically signed URLs with a configurable TTL
    (default 15 minutes). After expiry the signed URL is invalid regardless of
    who holds it, satisfying SOC 2 CC6.1 / CC6.7 data security criteria.
  - When BLOB_STORE_BACKEND=s3, the encrypted bytes are written to S3 and a
    presigned GET URL is issued. When BLOB_STORE_BACKEND=local (default / dev),
    bytes are stored in MongoDB and a HAVEN-signed URL is issued via HMAC-SHA256.
  - data_url is never returned in list responses — only via the signed-URL endpoint
    so that bulk API consumers never receive raw document bytes accidentally.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import io
import json
import os
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse

from auth import get_current_user, require_role
from database import (
    audit_log_col,
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
from vault import encrypt_field, decrypt_field

router = APIRouter(tags=["case-ops"])

# ── Signed URL configuration ──────────────────────────────────────────────────
_SIGNING_SECRET = os.environ.get("SIGNED_URL_SECRET") or os.environ.get("JWT_SECRET", "change_me")
_SIGNED_URL_TTL = int(os.environ.get("SIGNED_URL_TTL_SECONDS", "900"))   # 15 min default
_BLOB_BACKEND = os.environ.get("BLOB_STORE_BACKEND", "local")            # local | s3

# ── S3 client (lazy) ─────────────────────────────────────────────────────────
_s3_client = None


def _get_s3():
    global _s3_client
    if _s3_client is None:
        try:
            import boto3
            _s3_client = boto3.client(
                "s3",
                region_name=os.environ.get("AWS_REGION", "us-west-2"),
            )
        except ImportError:
            raise RuntimeError("boto3 not installed — set BLOB_STORE_BACKEND=local or pip install boto3")
    return _s3_client


# ── Signed URL helpers ────────────────────────────────────────────────────────

def _issue_signed_url(doc_id: str, base_url: str) -> str:
    """Issue an HMAC-SHA256 signed URL for local-backend document access.

    Format: /api/documents/{doc_id}/download?expires={ts}&sig={hex}
    The signature covers doc_id + expires — neither component can be altered
    without invalidating the sig, satisfying SOC 2 CC6.7.
    """
    expires = int(time.time()) + _SIGNED_URL_TTL
    payload = f"{doc_id}:{expires}".encode("utf-8")
    sig = hmac.new(_SIGNING_SECRET.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return f"{base_url.rstrip('/')}/api/documents/{doc_id}/download?expires={expires}&sig={sig}"


def _verify_signed_url(doc_id: str, expires: int, sig: str) -> bool:
    """Verify the HMAC signature and TTL. Uses timing-safe comparison."""
    if int(time.time()) > expires:
        return False
    payload = f"{doc_id}:{expires}".encode("utf-8")
    expected = hmac.new(_SIGNING_SECRET.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig)


async def _issue_s3_presigned_url(s3_key: str) -> str:
    """Generate an S3 presigned GET URL with TTL = SIGNED_URL_TTL_SECONDS."""
    bucket = os.environ["S3_DOCUMENT_BUCKET"]
    s3 = _get_s3()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": s3_key},
        ExpiresIn=_SIGNED_URL_TTL,
    )


async def _store_blob(doc_id: str, encrypted_str: str) -> dict:
    """Persist encrypted blob. Returns storage metadata dict."""
    if _BLOB_BACKEND == "s3":
        bucket = os.environ["S3_DOCUMENT_BUCKET"]
        s3_key = f"haven-docs/{doc_id}.enc"
        _get_s3().put_object(
            Bucket=bucket,
            Key=s3_key,
            Body=encrypted_str.encode("utf-8"),
            ContentType="application/octet-stream",
            ServerSideEncryption="aws:kms",   # double-envelope with AWS KMS
        )
        return {"storage_backend": "s3", "s3_key": s3_key, "data_url": None}
    else:
        # Local: store encrypted vault envelope in MongoDB (no raw bytes at rest)
        return {"storage_backend": "local", "s3_key": None, "data_url": encrypted_str}


async def _retrieve_blob(doc: dict) -> bytes:
    """Retrieve + decrypt blob bytes from the appropriate backend."""
    backend = doc.get("storage_backend", "local")
    if backend == "s3":
        import asyncio
        s3_key = doc["s3_key"]
        bucket = os.environ["S3_DOCUMENT_BUCKET"]
        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(
            None, lambda: _get_s3().get_object(Bucket=bucket, Key=s3_key)
        )
        encrypted_str = resp["Body"].read().decode("utf-8")
    else:
        encrypted_str = doc.get("data_url", "")

    if not encrypted_str:
        return b""

    # Legacy base64 data URI (pre-migration) — return as-is
    if encrypted_str.startswith("data:"):
        _, b64 = encrypted_str.split(",", 1)
        return base64.b64decode(b64)

    # Vault envelope: parse JSON → decrypt → decode b64 bytes
    try:
        payload_dict = json.loads(encrypted_str)
        decrypted_b64 = decrypt_field(payload_dict)
        return base64.b64decode(decrypted_b64)
    except Exception:
        # Last-resort: try raw b64
        try:
            return base64.b64decode(encrypted_str)
        except Exception:
            return b""


# ── Audit helper ──────────────────────────────────────────────────────────────

async def _write_audit(actor: dict, action: str, target: str, meta: dict | None = None):
    """Append an immutable audit event. Never mutates existing records."""
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
    await _write_audit(user, "task.create", task["id"], {"case_id": payload.case_id, "priority": payload.priority})
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
    await _write_audit(user, "task.update", task_id, updates)
    return serialize_doc(doc)


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(require_role("caseworker", "admin"))):
    await tasks_col.delete_one({"id": task_id})
    await _write_audit(user, "task.delete", task_id)
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
    """Upload a document.

    SOC 2 Compliance (CC6.1, CC6.7):
    - Raw bytes are encrypted via ApexVault before persistence.
    - MongoDB / S3 stores only the AES-256-GCM vault envelope — never plaintext bytes.
    - Response includes a signed_url with TTL; data_url is stripped from response.
    """
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 8MB)")

    # Encode bytes → b64 string → vault envelope (AES-256-GCM)
    b64_content = base64.b64encode(content).decode("ascii")
    encrypted_payload = encrypt_field(b64_content, resource_type="document")
    encrypted_str = json.dumps(encrypted_payload)

    doc_id = new_id()
    storage_meta = await _store_blob(doc_id, encrypted_str)

    doc = Document(
        case_id=case_id,
        uploaded_by=user["id"],
        type=type,
        filename=file.filename or "upload",
        content_type=file.content_type or "application/octet-stream",
        size=len(content),
        data_url=storage_meta["data_url"],  # None for S3, encrypted str for local
    ).model_dump()
    doc["id"] = doc_id
    doc["storage_backend"] = storage_meta["storage_backend"]
    if storage_meta.get("s3_key"):
        doc["s3_key"] = storage_meta["s3_key"]

    await documents_col.insert_one(doc)
    await _write_audit(
        user, "document.upload", doc_id,
        {"case_id": case_id, "type": type, "filename": file.filename, "size_bytes": len(content)}
    )

    # Issue signed URL — never expose raw bytes in upload response
    base_url = os.environ.get("PUBLIC_BASE_URL", "https://homeishaven.cloud")
    signed_url = _issue_signed_url(doc_id, base_url)

    response = serialize_doc(doc)
    response.pop("data_url", None)   # strip vault blob from API response
    response["signed_url"] = signed_url
    response["signed_url_expires_in"] = _SIGNED_URL_TTL
    return response


@router.get("/documents")
async def list_documents(case_id: str, user: dict = Depends(get_current_user)):
    """List documents for a case.
    data_url is stripped from all responses — use /documents/{id}/signed-url to access bytes.
    """
    if user["role"] == "resident":
        case = await cases_col.find_one({"id": case_id}, {"_id": 0, "resident_id": 1})
        if not case or case.get("resident_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")
    docs = await documents_col.find({"case_id": case_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    result = serialize_list(docs)
    for d in result:
        d.pop("data_url", None)   # never return raw bytes in list responses
    return result


@router.get("/documents/{doc_id}/signed-url")
async def get_document_signed_url(doc_id: str, user: dict = Depends(get_current_user)):
    """Issue (or re-issue) a signed URL for a document.
    TTL = SIGNED_URL_TTL_SECONDS (default 900s / 15 min).
    Every issuance is audit-logged for SOC 2 CC6.7 evidence.
    """
    doc = await documents_col.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if user["role"] == "resident":
        case = await cases_col.find_one({"id": doc["case_id"]}, {"_id": 0, "resident_id": 1})
        if not case or case.get("resident_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

    backend = doc.get("storage_backend", "local")
    if backend == "s3":
        url = await _issue_s3_presigned_url(doc["s3_key"])
    else:
        base_url = os.environ.get("PUBLIC_BASE_URL", "https://homeishaven.cloud")
        url = _issue_signed_url(doc_id, base_url)

    await _write_audit(user, "document.signed_url_issued", doc_id, {"backend": backend, "ttl_seconds": _SIGNED_URL_TTL})
    return {"doc_id": doc_id, "signed_url": url, "expires_in_seconds": _SIGNED_URL_TTL}


@router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    expires: int,
    sig: str,
    user: dict = Depends(get_current_user),
):
    """Stream decrypted document bytes after verifying the signed URL.

    Rejects expired or tampered tokens — satisfies SOC 2 CC6.7.
    All download events are audit-logged.
    """
    if not _verify_signed_url(doc_id, expires, sig):
        raise HTTPException(status_code=403, detail="Signed URL is invalid or has expired")

    doc = await documents_col.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if user["role"] == "resident":
        case = await cases_col.find_one({"id": doc["case_id"]}, {"_id": 0, "resident_id": 1})
        if not case or case.get("resident_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

    file_bytes = await _retrieve_blob(doc)
    await _write_audit(user, "document.download", doc_id, {"filename": doc.get("filename")})
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=doc.get("content_type", "application/octet-stream"),
        headers={"Content-Disposition": f'attachment; filename="{doc.get("filename", "document")}"'},
    )


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
    await _write_audit(
        user, "document.verify", doc_id,
        {"verified": verified, "notes": notes, "case_id": doc.get("case_id")}
    )
    result_doc = serialize_doc(doc)
    result_doc.pop("data_url", None)
    return result_doc
