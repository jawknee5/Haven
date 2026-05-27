"""Agency adapter pattern: simulated by default, real OAuth 2.0 when env credentials are present.

Usage in a router:
    adapter = get_adapter(integration_doc)
    result = await adapter.submit(payload, case)

To go live for HUD Section 8 (example):
    export HUD_SEC8_OAUTH_AUTHORIZE_URL="https://auth.hud.gov/oauth2/authorize"
    export HUD_SEC8_OAUTH_TOKEN_URL="https://auth.hud.gov/oauth2/token"
    export HUD_SEC8_OAUTH_CLIENT_ID="..."
    export HUD_SEC8_OAUTH_CLIENT_SECRET="..."
    export HUD_SEC8_OAUTH_SCOPE="applications:write"
    export HUD_SEC8_API_BASE="https://api.hud.gov/section8/v1"
"""
from __future__ import annotations

import hashlib
import os
import random
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx


class AgencyAdapter(ABC):
    """Common interface every agency adapter implements."""

    def __init__(self, integration: dict):
        self.integration = integration
        self.code = integration["code"]

    @property
    def mode(self) -> str:
        return "simulated"

    @abstractmethod
    async def submit(self, payload: dict, case: dict) -> dict:
        """Return {confirmation_id, status, raw_response, expected_response_by, message}."""

    @abstractmethod
    async def sync_status(self, confirmation_id: str) -> dict:
        """Return {status, message, raw_response}."""

    @abstractmethod
    async def get_authorize_url(self, redirect_uri: str, state: str) -> Optional[str]:
        """Return None if simulated, else the agency's OAuth authorize URL."""

    @abstractmethod
    async def exchange_code(self, code: str, redirect_uri: str) -> dict:
        """Exchange an auth code for tokens. Simulated mode returns a synthetic token."""


# =============== SIMULATED ADAPTER ===============
class SimulatedAdapter(AgencyAdapter):
    """Default adapter — produces realistic confirmation IDs + simulated status flow."""

    PROGRESSION = {
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

    @property
    def mode(self) -> str:
        return "simulated"

    async def submit(self, payload: dict, case: dict) -> dict:
        seed = f"{self.code}-{case.get('id')}-{datetime.now(timezone.utc).isoformat()}"
        digest = hashlib.sha256(seed.encode()).hexdigest()[:8].upper()
        prefix = self.code.split("_")[0]
        confirmation_id = f"{prefix}-{digest}"

        required = set(self.integration.get("required_fields", []))
        provided = set(k for k, v in (payload or {}).items() if v not in (None, ""))
        missing = sorted(required - provided)
        sla = self.integration.get("sla_days", 30)

        if missing:
            status = "needs_action"
            message = f"Submitted to {self.integration['agency']}, but {len(missing)} required field(s) are missing."
        else:
            status = "submitted"
            message = f"Successfully submitted to {self.integration['agency']}. Estimated response: {sla} days."

        return {
            "confirmation_id": confirmation_id,
            "status": status,
            "message": message,
            "missing_fields": missing,
            "expected_response_by": (datetime.now(timezone.utc) + timedelta(days=sla)).isoformat(),
            "raw_response": {"simulated": True, "adapter": "SimulatedAdapter"},
            "mode": self.mode,
        }

    async def sync_status(self, confirmation_id: str) -> dict:
        # Caller passes the previous status; we just randomly progress
        return {"raw_response": {"simulated": True}, "_progression": self.PROGRESSION}

    async def get_authorize_url(self, redirect_uri: str, state: str) -> Optional[str]:
        return None  # simulated — no real OAuth

    async def exchange_code(self, code: str, redirect_uri: str) -> dict:
        return {
            "access_token": f"sim-token-{uuid.uuid4().hex[:16]}",
            "token_type": "bearer",
            "expires_in": 3600,
            "mode": "simulated",
        }


# =============== REAL OAUTH 2.0 ADAPTER ===============
class OAuth2Adapter(AgencyAdapter):
    """Real OAuth 2.0 + REST agency adapter. Auto-engaged when env credentials are set.

    Required env vars (per agency code, e.g. HUD_SEC8):
      - <CODE>_OAUTH_AUTHORIZE_URL
      - <CODE>_OAUTH_TOKEN_URL
      - <CODE>_OAUTH_CLIENT_ID
      - <CODE>_OAUTH_CLIENT_SECRET
      - <CODE>_OAUTH_SCOPE  (optional, default: 'applications:write')
      - <CODE>_API_BASE     (REST endpoint root)
    """

    def __init__(self, integration: dict, tokens: Optional[dict] = None):
        super().__init__(integration)
        self.tokens = tokens or {}

    @property
    def mode(self) -> str:
        return "live"

    @property
    def env_prefix(self) -> str:
        return self.code.upper()

    @property
    def authorize_url(self) -> str:
        return os.environ.get(f"{self.env_prefix}_OAUTH_AUTHORIZE_URL", "")

    @property
    def token_url(self) -> str:
        return os.environ.get(f"{self.env_prefix}_OAUTH_TOKEN_URL", "")

    @property
    def client_id(self) -> str:
        return os.environ.get(f"{self.env_prefix}_OAUTH_CLIENT_ID", "")

    @property
    def client_secret(self) -> str:
        return os.environ.get(f"{self.env_prefix}_OAUTH_CLIENT_SECRET", "")

    @property
    def scope(self) -> str:
        return os.environ.get(f"{self.env_prefix}_OAUTH_SCOPE", "applications:write")

    @property
    def api_base(self) -> str:
        return os.environ.get(f"{self.env_prefix}_API_BASE", self.integration.get("endpoint", ""))

    async def get_authorize_url(self, redirect_uri: str, state: str) -> Optional[str]:
        if not self.authorize_url or not self.client_id:
            return None
        params = (
            f"response_type=code&client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}&scope={self.scope}&state={state}"
        )
        sep = "&" if "?" in self.authorize_url else "?"
        return f"{self.authorize_url}{sep}{params}"

    async def exchange_code(self, code: str, redirect_uri: str) -> dict:
        if not self.token_url:
            raise RuntimeError(f"{self.code}: token URL not configured")
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                self.token_url,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Accept": "application/json"},
            )
            r.raise_for_status()
            data = r.json()
            data["mode"] = "live"
            return data

    async def submit(self, payload: dict, case: dict) -> dict:
        access_token = self.tokens.get("access_token")
        if not access_token:
            raise RuntimeError(f"{self.code}: not authorized — connect via OAuth first")
        url = f"{self.api_base.rstrip('/')}/applications"
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                url,
                json={
                    "case_id": case.get("id"),
                    "applicant": payload,
                    "submitted_at": datetime.now(timezone.utc).isoformat(),
                },
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"text": r.text}
        sla = self.integration.get("sla_days", 30)
        confirmation_id = data.get("confirmation_id") or data.get("id") or f"{self.code}-{uuid.uuid4().hex[:8].upper()}"
        status = data.get("status", "submitted")
        return {
            "confirmation_id": confirmation_id,
            "status": status,
            "message": data.get("message", f"Live submission to {self.integration['agency']} accepted."),
            "missing_fields": data.get("missing_fields", []),
            "expected_response_by": (datetime.now(timezone.utc) + timedelta(days=sla)).isoformat(),
            "raw_response": data,
            "mode": self.mode,
        }

    async def sync_status(self, confirmation_id: str) -> dict:
        access_token = self.tokens.get("access_token")
        if not access_token:
            raise RuntimeError(f"{self.code}: not authorized")
        url = f"{self.api_base.rstrip('/')}/applications/{confirmation_id}"
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(url, headers={"Authorization": f"Bearer {access_token}"})
            data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
        return {
            "status": data.get("status", "under_review"),
            "message": data.get("message", "Status fetched from agency"),
            "raw_response": data,
        }


# =============== Factory ===============
def has_live_config(code: str) -> bool:
    prefix = code.upper()
    return bool(
        os.environ.get(f"{prefix}_OAUTH_AUTHORIZE_URL")
        and os.environ.get(f"{prefix}_OAUTH_TOKEN_URL")
        and os.environ.get(f"{prefix}_OAUTH_CLIENT_ID")
        and os.environ.get(f"{prefix}_OAUTH_CLIENT_SECRET")
    )


def get_adapter(integration: dict, tokens: Optional[dict] = None) -> AgencyAdapter:
    code = integration["code"]
    if has_live_config(code):
        return OAuth2Adapter(integration, tokens=tokens)
    return SimulatedAdapter(integration)
