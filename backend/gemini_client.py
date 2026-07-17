"""Gemini free-tier fallback client for BB and document scanning.

Primary inference remains local Ollama. This module is only used when
OLLAMA_URL is unreachable and GEMINI_API_KEY is set (free tier is sufficient
for HAVEN's civic-support workloads).
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Optional

import httpx

logger = logging.getLogger("haven.gemini")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash-latest")
GEMINI_TIMEOUT = float(os.environ.get("GEMINI_TIMEOUT", "60"))


def _gemini_url(action: str = "generateContent") -> str:
    return (
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}"
        f":{action}?key={GEMINI_API_KEY}"
    )


def _build_request_body(
    system_prompt: str,
    user_prompt: str,
    json_mode: bool = False,
    image_base64: Optional[str] = None,
) -> dict[str, Any]:
    parts = [{"text": user_prompt}]
    if image_base64:
        parts.insert(
            0,
            {
                "inline_data": {
                    "mime_type": "image/png",
                    "data": image_base64,
                }
            },
        )

    body: dict[str, Any] = {
        "contents": [
            {"role": "user", "parts": [{"text": system_prompt}]},
            {"role": "user", "parts": parts},
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
        },
    }
    if json_mode:
        body["generationConfig"]["responseMimeType"] = "application/json"
    return body


async def gemini_chat(
    system_prompt: str,
    user_prompt: str,
    json_mode: bool = False,
    image_base64: Optional[str] = None,
) -> str:
    """Send a request to Gemini and return the text response."""
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not configured")

    body = _build_request_body(system_prompt, user_prompt, json_mode, image_base64)

    async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT) as client:
        r = await client.post(_gemini_url(), json=body)
        r.raise_for_status()
        data = r.json()

    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError("Gemini returned no candidates")

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        raise RuntimeError("Gemini returned empty content parts")

    return parts[0].get("text", "").strip()


async def gemini_chat_history(messages: list[dict[str, str]]) -> str:
    """Send a multi-turn chat history to Gemini (last message is the prompt)."""
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not configured")

    contents = []
    for m in messages:
        role = m.get("role", "user")
        if role == "system":
            role = "user"
        contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

    body = {
        "contents": contents,
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024},
    }

    async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT) as client:
        r = await client.post(_gemini_url(), json=body)
        r.raise_for_status()
        data = r.json()

    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError("Gemini returned no candidates")

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        raise RuntimeError("Gemini returned empty content parts")

    return parts[0].get("text", "").strip()
