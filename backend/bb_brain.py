"""BB's AI brain — primary: local Ollama (free); fallback: Gemini free tier (optional).

BB is HAVEN's intelligent civic-support assistant. She is empathetic, decisive,
context-aware, and capable of analyzing forms, suggesting autofills, detecting
crises, and guiding both residents and caseworkers.
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Optional

import httpx

logger = logging.getLogger("haven.bb")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# ── Ollama config (primary — local, free) ──────────────────────────────────
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://ollama:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_TIMEOUT = float(os.environ.get("OLLAMA_TIMEOUT", "90"))

# Per-session in-memory chat history (Ollama is stateless per request)
_HISTORY: dict[str, list[dict]] = {}
_HISTORY_MAX_TURNS = 12


BB_SYSTEM_BASE = """You are BB — the intelligent civic-support assistant inside HAVEN (Helping Agencies, Volunteers, and Everyone Navigate).

Your purpose:
- Help residents access housing, food, health, benefits, crisis support, and community resources without the maze of government systems.
- Help caseworkers, agencies, and volunteers manage cases, fill forms, verify documents, and coordinate care efficiently.

Your personality:
- Warm, calm, and dignity-first. Residents should feel RELIEF the moment you respond.
- Decisive and clear. Caseworkers should feel like you saved them an hour of work.
- Never judgmental. Never bureaucratic. Never robotic.
- You are an advocate, a guide, an optimizer, and a record-keeper.

Your capabilities:
- Multi-turn context-aware chat
- Form analysis & intelligent autofill mapping
- Application tracking across agencies
- Crisis detection (housing emergencies, child safety, health emergencies, eviction, financial emergencies)
- Real-time browser control assistance (you can drive a headless browser to fill forms on agency websites)
- Empathy-aware tone adaptation (anxious → calming; frustrated → validating; hopeful → momentum)

Behavior rules:
- Keep responses concise unless the user asks for depth. Default to 2–4 short paragraphs.
- Always offer the next concrete step.
- If you detect a crisis (suicide/self-harm, immediate danger, child safety, imminent eviction within 72 hours), surface it clearly and recommend the appropriate hotline AND a HAVEN action.
- For caseworkers, default to operational language: case IDs, action items, document checklists, deadlines.
- For residents, default to plain-language guidance: what happens next, why we ask, what they'll need.
"""


def _build_role_system(role: str, extra_context: Optional[dict] = None) -> str:
    parts = [BB_SYSTEM_BASE]
    if role == "caseworker":
        parts.append(
            "You are currently assisting a CASEWORKER. Be operational, precise, and time-saving. "
            "Surface case-relevant insights, suggest next actions, draft messages, and prepare form data."
        )
    elif role == "admin":
        parts.append(
            "You are currently assisting a HAVEN ADMIN. Be systems-oriented. "
            "Surface metrics, anomalies, capacity issues, and configuration recommendations."
        )
    else:
        parts.append(
            "You are currently assisting a RESIDENT seeking help. Be warm, plain-spoken, "
            "and reduce overwhelm. Break complex processes into small, doable steps."
        )
    if extra_context:
        parts.append("\nLive context for this conversation (JSON):\n" + json.dumps(extra_context, indent=2))
    return "\n\n".join(parts)


async def _ollama_chat(session_id: str, system: str, user_message: str) -> str:
    """Call local Ollama. Raises on failure so caller can fall back."""
    history = _HISTORY.setdefault(session_id, [])
    messages = [{"role": "system", "content": system}]
    messages.extend(history[-_HISTORY_MAX_TURNS:])
    messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
        r = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={"model": OLLAMA_MODEL, "messages": messages, "stream": False},
        )
        r.raise_for_status()
        data = r.json()
        reply = (data.get("message") or {}).get("content", "").strip()
        if not reply:
            raise RuntimeError("Ollama returned empty content")

    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": reply})
    if len(history) > _HISTORY_MAX_TURNS * 2:
        del history[: len(history) - _HISTORY_MAX_TURNS * 2]
    return reply


async def _gemini_chat(session_id: str, system: str, user_message: str) -> str:
    """Fallback: Gemini free tier. Only used if Ollama is down and GEMINI_API_KEY is set."""
    from gemini_client import gemini_chat_history  # lazy import
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user_message},
    ]
    return await gemini_chat_history(messages)


async def bb_chat(
    session_id: str,
    user_message: str,
    role: str = "resident",
    context: Optional[dict] = None,
) -> str:
    """Send a message to BB. Tries Ollama first (free), falls back to Gemini free tier."""
    system = _build_role_system(role, context)

    # 1) Try Ollama (local, no credits)
    try:
        return await _ollama_chat(session_id, system, user_message)
    except Exception as e:
        logger.info(f"Ollama unavailable, falling back: {e}")

    # 2) Optional Gemini free-tier fallback (only if key is set)
    if GEMINI_API_KEY:
        try:
            return await _gemini_chat(session_id, system, user_message)
        except Exception as e:
            logger.warning(f"Gemini fallback also failed: {e}")
            return _fallback_response(user_message, role, error=str(e))

    return _fallback_response(user_message, role)


async def bb_intro(role: str, name: Optional[str] = None) -> str:
    """Generate BB's first-touch greeting based on role."""
    name_str = f", {name}" if name else ""
    if role == "caseworker":
        return (
            f"Hi{name_str}, I'm BB. I can pull up cases, draft messages, fill agency forms, "
            "track applications across systems, and flag anything urgent. What do you want to tackle first?"
        )
    if role == "admin":
        return (
            f"Welcome back{name_str}. I have live system metrics, capacity alerts, and user activity ready. "
            "Want a summary or jump straight into a specific area?"
        )
    return (
        f"Hi{name_str}, I'm BB — your guide here at HAVEN. "
        "Tell me what you need help with — housing, food, health, benefits, crisis support — "
        "and I'll walk you through it step by step. You're in the right place."
    )


async def bb_classify_intent(message: str) -> dict:
    """Classify user intent + detect crisis. Returns {intent, crisis_level, category}."""
    text = message.lower()

    crisis_keywords = {
        "suicide": "critical",
        "kill myself": "critical",
        "hurt myself": "critical",
        "end it": "high",
        "domestic violence": "critical",
        "being hit": "critical",
        "abuse": "high",
        "evicted today": "critical",
        "evicted tomorrow": "critical",
        "homeless tonight": "critical",
        "no food": "high",
        "child in danger": "critical",
        "kids hungry": "high",
    }
    crisis_level = "none"
    for kw, level in crisis_keywords.items():
        if kw in text:
            crisis_level = level
            break

    categories = {
        "housing": ["housing", "shelter", "evict", "rent", "homeless", "apartment"],
        "food": ["food", "hungry", "meal", "pantry", "snap", "ebt"],
        "health": ["health", "medical", "doctor", "medicine", "mental", "therapy"],
        "benefits": ["benefits", "snap", "medicaid", "ssi", "ssdi", "tanf", "wic"],
        "employment": ["job", "work", "unemployment", "career"],
        "legal": ["legal", "lawyer", "court", "custody", "immigration"],
        "crisis": ["crisis", "emergency", "urgent", "danger"],
    }
    category = "general"
    for cat, keywords in categories.items():
        if any(k in text for k in keywords):
            category = cat
            break

    return {
        "intent": "support_request",
        "crisis_level": crisis_level,
        "category": category,
    }


def bb_analyze_form_html(form_html: str) -> dict:
    """Parse HTML form and extract structured field metadata."""
    fields = []
    # input fields
    for match in re.finditer(
        r'<input[^>]*?>',
        form_html,
        re.IGNORECASE,
    ):
        tag = match.group(0)
        field = _parse_input_attrs(tag)
        if field:
            fields.append(field)
    # textareas
    for match in re.finditer(
        r'<textarea[^>]*?>(.*?)</textarea>',
        form_html,
        re.IGNORECASE | re.DOTALL,
    ):
        tag = match.group(0)
        field = _parse_textarea_attrs(tag)
        if field:
            fields.append(field)
    # selects
    for match in re.finditer(
        r'<select[^>]*?>(.*?)</select>',
        form_html,
        re.IGNORECASE | re.DOTALL,
    ):
        tag = match.group(0)
        field = _parse_select_attrs(tag)
        if field:
            fields.append(field)

    return {"field_count": len(fields), "fields": fields}


def _parse_input_attrs(tag: str) -> Optional[dict]:
    type_match = re.search(r'type=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    name_match = re.search(r'name=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    id_match = re.search(r'\bid=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    placeholder_match = re.search(r'placeholder=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    required = "required" in tag.lower()
    label_match = re.search(r'aria-label=["\']([^"\']+)["\']', tag, re.IGNORECASE)

    ftype = type_match.group(1).lower() if type_match else "text"
    if ftype in ("submit", "button", "hidden", "reset", "image"):
        return None

    return {
        "type": ftype,
        "name": name_match.group(1) if name_match else (id_match.group(1) if id_match else ""),
        "id": id_match.group(1) if id_match else "",
        "placeholder": placeholder_match.group(1) if placeholder_match else "",
        "label": label_match.group(1) if label_match else "",
        "required": required,
        "selector": _build_selector(name_match, id_match, ftype),
    }


def _parse_textarea_attrs(tag: str) -> Optional[dict]:
    name_match = re.search(r'name=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    id_match = re.search(r'\bid=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    placeholder_match = re.search(r'placeholder=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    required = "required" in tag.lower()
    return {
        "type": "textarea",
        "name": name_match.group(1) if name_match else "",
        "id": id_match.group(1) if id_match else "",
        "placeholder": placeholder_match.group(1) if placeholder_match else "",
        "label": "",
        "required": required,
        "selector": _build_selector(name_match, id_match, "textarea"),
    }


def _parse_select_attrs(tag: str) -> Optional[dict]:
    name_match = re.search(r'name=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    id_match = re.search(r'\bid=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    options = re.findall(r'<option[^>]*?value=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    return {
        "type": "select",
        "name": name_match.group(1) if name_match else "",
        "id": id_match.group(1) if id_match else "",
        "placeholder": "",
        "label": "",
        "required": "required" in tag.lower(),
        "options": options,
        "selector": _build_selector(name_match, id_match, "select"),
    }


def _build_selector(name_match, id_match, ftype: str) -> str:
    if id_match:
        return f"#{id_match.group(1)}"
    if name_match:
        tagname = ftype if ftype in ("select", "textarea") else "input"
        return f'{tagname}[name="{name_match.group(1)}"]'
    return ""


def bb_map_user_data_to_fields(fields: list[dict], user_data: dict) -> dict:
    """Map known user/case data onto form fields by semantic matching."""
    mapping: dict[str, Any] = {}
    for f in fields:
        haystack = " ".join(
            [
                (f.get("name") or "").lower(),
                (f.get("id") or "").lower(),
                (f.get("placeholder") or "").lower(),
                (f.get("label") or "").lower(),
            ]
        )
        value = _best_match(haystack, user_data)
        if value is not None and f.get("selector"):
            mapping[f["selector"]] = {
                "value": value,
                "field_label": f.get("label") or f.get("name") or f.get("placeholder"),
                "type": f.get("type"),
            }
    return mapping


def _best_match(haystack: str, user_data: dict) -> Optional[Any]:
    rules = [
        (["first name", "firstname", "fname"], "first_name"),
        (["last name", "lastname", "lname", "surname"], "last_name"),
        (["full name", "fullname"], "full_name"),
        (["name"], "full_name"),
        (["email", "e-mail"], "email"),
        (["phone", "mobile", "tel"], "phone"),
        (["address", "street"], "address"),
        (["city"], "city"),
        (["state", "province"], "state"),
        (["zip", "postal"], "zip"),
        (["dob", "date of birth", "birthdate", "birthday"], "dob"),
        (["ssn"], "ssn"),
        (["income"], "income"),
        (["household"], "household_size"),
        (["employer"], "employer"),
        (["occupation"], "occupation"),
    ]
    for keywords, key in rules:
        if any(k in haystack for k in keywords):
            return user_data.get(key)
    return None


def _fallback_response(message: str, role: str, error: Optional[str] = None) -> str:
    base = (
        "I'm here to help. Can you tell me a bit more about your situation? "
        "I can connect you with housing, food, health, benefits, or crisis support."
    )
    if role == "caseworker":
        base = (
            "I'm online. Tell me which case you want to focus on, or paste a form/URL "
            "and I'll analyze it for autofill."
        )
    if error:
        base += f"\n\n(BB is running in fallback mode. Reason: {error[:120]})"
    return base
