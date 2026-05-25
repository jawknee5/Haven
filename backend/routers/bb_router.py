"""BB router — chat, form analysis, autofill, browser control, application tracking.

This is the heart of HAVEN's AI showcase. BB combines:
1. Claude Sonnet 4.5 powered conversation (via Emergent Universal Key)
2. Form field detection & semantic autofill
3. Live headless browser automation (Playwright)
4. Application tracking across agencies
5. Crisis detection
"""
from __future__ import annotations

import asyncio
import base64
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from bb_brain import (
    bb_analyze_form_html,
    bb_chat,
    bb_classify_intent,
    bb_intro,
    bb_map_user_data_to_fields,
)
from browser_engine import (
    close_session,
    get_or_create_session,
    get_session,
    list_sessions,
)
from database import (
    application_tracking_col,
    bb_sessions_col,
    cases_col,
    serialize_doc,
    serialize_list,
    utcnow,
    users_col,
)
from models import (
    BBApplicationTrackRequest,
    BBAutofillRequest,
    BBBrowserActionRequest,
    BBBrowserStartRequest,
    BBChatRequest,
    BBFormAnalyzeRequest,
    new_id,
)

router = APIRouter(prefix="/bb", tags=["bb"])


# ====== CHAT ======
@router.post("/chat")
async def chat(payload: BBChatRequest, user: dict = Depends(get_current_user)):
    intent = await bb_classify_intent(payload.message)
    context = {
        "user_name": user["name"],
        "user_role": user["role"],
        "intent": intent,
        **(payload.context or {}),
    }
    reply = await bb_chat(payload.session_id, payload.message, role=user["role"], context=context)

    # Persist message pair
    await bb_sessions_col.update_one(
        {"session_id": payload.session_id, "user_id": user["id"]},
        {
            "$setOnInsert": {
                "id": new_id(),
                "session_id": payload.session_id,
                "user_id": user["id"],
                "created_at": utcnow().isoformat(),
            },
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": payload.message, "ts": utcnow().isoformat()},
                        {"role": "assistant", "content": reply, "ts": utcnow().isoformat()},
                    ]
                }
            },
            "$set": {"last_message_at": utcnow().isoformat()},
        },
        upsert=True,
    )

    return {
        "reply": reply,
        "intent": intent,
        "session_id": payload.session_id,
        "timestamp": utcnow().isoformat(),
    }


@router.get("/intro")
async def intro(user: dict = Depends(get_current_user)):
    text = await bb_intro(user["role"], user["name"])
    return {"reply": text, "role": user["role"]}


@router.get("/sessions/{session_id}/history")
async def get_history(session_id: str, user: dict = Depends(get_current_user)):
    doc = await bb_sessions_col.find_one({"session_id": session_id, "user_id": user["id"]}, {"_id": 0})
    if not doc:
        return {"session_id": session_id, "messages": []}
    return serialize_doc(doc)


# ====== FORM ANALYSIS & AUTOFILL ======
@router.post("/forms/analyze")
async def analyze_form(payload: BBFormAnalyzeRequest, user: dict = Depends(get_current_user)):
    result = bb_analyze_form_html(payload.form_html)
    return {"status": "ok", **result}


def _build_user_data_payload(user: dict, case: Optional[dict]) -> dict:
    full_name = user.get("name", "")
    parts = full_name.split(" ", 1)
    first_name = parts[0] if parts else ""
    last_name = parts[1] if len(parts) > 1 else ""
    intake = (case or {}).get("intake_data", {}) if case else {}
    return {
        "full_name": full_name,
        "first_name": first_name,
        "last_name": last_name,
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "address": intake.get("address", ""),
        "city": intake.get("city", ""),
        "state": intake.get("state", ""),
        "zip": intake.get("zip", ""),
        "dob": intake.get("dob", ""),
        "ssn": intake.get("ssn", ""),
        "income": intake.get("income", ""),
        "household_size": intake.get("household_size", ""),
        "employer": intake.get("employer", ""),
        "occupation": intake.get("occupation", ""),
    }


@router.post("/forms/autofill")
async def autofill_form(payload: BBAutofillRequest, user: dict = Depends(get_current_user)):
    target_user = user
    if payload.user_id and payload.user_id != user["id"]:
        # caseworker filling on behalf of a resident
        u = await users_col.find_one({"id": payload.user_id}, {"_id": 0, "password_hash": 0})
        if u:
            target_user = u
    case = None
    if payload.case_id:
        case = await cases_col.find_one({"id": payload.case_id}, {"_id": 0})
    user_data = _build_user_data_payload(target_user, case)
    analyzed = bb_analyze_form_html(payload.form_html)
    mapping = bb_map_user_data_to_fields(analyzed["fields"], user_data)
    missing = [f for f in analyzed["fields"] if f.get("required") and f.get("selector") not in mapping]
    return {
        "status": "ready" if not missing else "needs_input",
        "field_count": analyzed["field_count"],
        "fields": analyzed["fields"],
        "mapping": mapping,
        "user_data_used": user_data,
        "missing_required": [
            {"label": f.get("label") or f.get("name") or f.get("placeholder"), "selector": f.get("selector")}
            for f in missing
        ],
    }


# ====== APPLICATION TRACKING ======
@router.post("/applications/track")
async def track_application(payload: BBApplicationTrackRequest, user: dict = Depends(get_current_user)):
    track = {
        "id": new_id(),
        "case_id": payload.case_id,
        "user_id": user["id"],
        "agency_name": payload.agency_name,
        "application_id": payload.application_id,
        "application_url": payload.application_url,
        "status": "submitted",
        "required_documents": payload.required_documents,
        "submitted_at": utcnow().isoformat(),
        "last_checked": utcnow().isoformat(),
        "notes": payload.notes or "",
    }
    await application_tracking_col.insert_one(track)
    return serialize_doc(track)


@router.get("/applications/status/{tracking_id}")
async def get_tracking(tracking_id: str, user: dict = Depends(get_current_user)):
    doc = await application_tracking_col.find_one({"id": tracking_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Tracking not found")
    return serialize_doc(doc)


@router.get("/applications/summary")
async def applications_summary(user: dict = Depends(get_current_user)):
    docs = await application_tracking_col.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    return {"count": len(docs), "applications": serialize_list(docs)}


@router.get("/applications/case/{case_id}")
async def applications_for_case(case_id: str, user: dict = Depends(get_current_user)):
    docs = await application_tracking_col.find({"case_id": case_id}, {"_id": 0}).to_list(500)
    return serialize_list(docs)


# ====== BROWSER CONTROL ======
@router.post("/browser/start")
async def browser_start(payload: BBBrowserStartRequest, user: dict = Depends(get_current_user)):
    session_id = f"bb-browser-{user['id']}"
    sess = await get_or_create_session(session_id, payload.url or "about:blank")
    screenshot = await sess.screenshot()
    return {
        "session_id": session_id,
        "url": await sess.url(),
        "title": await sess.title(),
        "screenshot": screenshot,
    }


@router.post("/browser/action")
async def browser_action(payload: BBBrowserActionRequest, user: dict = Depends(get_current_user)):
    sess = get_session(payload.session_id)
    if not sess:
        # auto-start
        sess = await get_or_create_session(payload.session_id, "about:blank")

    action = payload.action.lower()
    result: dict = {"ok": True}

    async with sess.lock:
        if action == "navigate":
            result = await sess.navigate(payload.payload.get("url", ""))
        elif action == "fill":
            result = await sess.fill(
                payload.payload.get("selector", ""),
                str(payload.payload.get("value", "")),
            )
        elif action == "click":
            result = await sess.click(payload.payload.get("selector", ""))
        elif action == "type":
            result = await sess.type_text(
                payload.payload.get("selector", ""),
                str(payload.payload.get("text", "")),
                int(payload.payload.get("delay", 30)),
            )
        elif action == "submit":
            result = await sess.submit(payload.payload.get("selector"))
        elif action == "back":
            result = await sess.back()
        elif action == "forward":
            result = await sess.forward()
        elif action == "scroll":
            result = await sess.scroll(int(payload.payload.get("dy", 400)))
        elif action == "extract":
            html = await sess.extract_form_html()
            fields = await sess.extract_form_fields()
            result = {"ok": True, "form_html": html, "fields": fields}
        elif action == "screenshot":
            pass  # screenshot returned below
        elif action == "autofill_all":
            # Use stored mapping (selector -> value) and fill each one in real browser
            mapping = payload.payload.get("mapping") or {}
            filled = []
            errors = []
            for selector, info in mapping.items():
                value = info.get("value") if isinstance(info, dict) else info
                if value is None or value == "":
                    continue
                r = await sess.fill(selector, str(value))
                if r.get("ok"):
                    filled.append({"selector": selector, "value": value})
                else:
                    errors.append({"selector": selector, "error": r.get("error")})
            result = {"ok": True, "filled": filled, "errors": errors}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {action}")

        screenshot = await sess.screenshot()
        url = await sess.url()
        title = await sess.title()

    return {
        "result": result,
        "url": url,
        "title": title,
        "screenshot": screenshot,
        "session_id": payload.session_id,
    }


@router.post("/browser/stop")
async def browser_stop(session_id: str, user: dict = Depends(get_current_user)):
    # ownership check: session_id format is "bb-browser-<user_id>"
    expected = f"bb-browser-{user['id']}"
    if session_id != expected and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your session")
    await close_session(session_id)
    return {"ok": True}


@router.get("/browser/sessions")
async def browser_sessions(user: dict = Depends(get_current_user)):
    return {"sessions": list_sessions()}
