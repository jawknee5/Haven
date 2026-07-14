"""Agency adapter pattern — simulated by default, real OAuth 2.0 + PKCE when env credentials present.

Adapter hierarchy:
    AgencyAdapter (abstract)
    ├── SimulatedAdapter          — default, deterministic mock IDs
    └── OAuth2Adapter             — generic RFC 6749 + optional PKCE + optional OIDC
        ├── LoginGovAdapter       — OIDC + PKCE mandatory (family='logingov')
        ├── VaAdapter             — VA Lighthouse API (family='va')
        └── SsaAdapter            — SSA developer sandbox (family='ssa')

Adapter selection (get_adapter):
  1. Env var <CODE>_ADAPTER forces family ('logingov'|'va'|'ssa'|'oauth2').
  2. Prefix rules: HUD_*/USDA_*/WIC_*/IRS_*/DOL_*/DMV_*/HHS_*/CMS_* → LoginGov,
                   VA_* → VA, SSA_* → SSA.
  3. If has_live_config(code) is False → SimulatedAdapter.
"""
from __future__ import annotations

import base64
import hashlib
import os
import random
import secrets
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

# ── Sandbox defaults (used when OAUTH_ENV=sandbox + <CODE>_OAUTH_CLIENT_ID set) ──
SANDBOX_DEFAULTS: dict[str, dict] = {
    "logingov": {
        "authorize_url": "https://idp.int.identitysandbox.gov/openid_connect/authorize",
        "token_url":     "https://idp.int.identitysandbox.gov/api/openid_connect/token",
        "scope":         "openid email profile",
    },
    "va": {
        "authorize_url": "https://sandbox-api.va.gov/oauth2/authorization",
        "token_url":     "https://sandbox-api.va.gov/oauth2/token",
        "scope":         "claim.read claim.write",
    },
    "ssa": {
        "authorize_url": "https://developer.ssa.gov/oauth/authorize",
        "token_url":     "https://developer.ssa.gov/oauth/token",
        "scope":         "ssi.read ssi.write",
    },
}

OAUTH_STATE_TTL_SECONDS = int(os.environ.get("OAUTH_STATE_TTL_SECONDS", "900"))  # 15 min


# ── PKCE helpers ──────────────────────────────────────────────────────────────
def generate_pkce_pair() -> tuple[str, str]:
    """Return (verifier, S256_challenge). verifier ~86 chars, challenge ~43 chars."""
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge


# ── Abstract base ─────────────────────────────────────────────────────────────
class AgencyAdapter(ABC):
    def __init__(self, integration: dict, tokens: Optional[dict] = None):
        self.integration = integration
        self.code = integration["code"]
        self.tokens = tokens or {}

    @property
    def mode(self) -> str:
        return "simulated"

    @property
    def adapter_family(self) -> str:
        return "generic"

    @abstractmethod
    async def submit(self, payload: dict, case: dict) -> dict: ...

    @abstractmethod
    async def sync_status(self, confirmation_id: str) -> dict: ...

    @abstractmethod
    async def get_authorize_url(
        self, redirect_uri: str, state: str,
        pkce_challenge: Optional[str] = None,
        nonce: Optional[str] = None,
    ) -> Optional[str]: ...

    @abstractmethod
    async def exchange_code(
        self, code: str, redirect_uri: str,
        pkce_verifier: Optional[str] = None,
    ) -> dict: ...


# ── Simulated adapter ─────────────────────────────────────────────────────────
class SimulatedAdapter(AgencyAdapter):
    PROGRESSION = {
        "submitted":    [("under_review", "Application moved to under review", 0.6),
                         ("needs_action", "Agency requested additional documentation", 0.25),
                         ("submitted",    "No change since last sync", 0.15)],
        "under_review": [("under_review", "Still under review", 0.4),
                         ("approved",     "Application approved", 0.35),
                         ("needs_action", "Caseworker requested clarification", 0.15),
                         ("denied",       "Application denied", 0.10)],
        "needs_action": [("needs_action", "Still awaiting requested documentation", 0.7),
                         ("under_review", "Resumed review after documents received", 0.3)],
        "approved":     [("approved", "Status unchanged", 1.0)],
        "denied":       [("denied",   "Status unchanged", 1.0)],
    }

    @property
    def mode(self) -> str:
        return "simulated"

    @property
    def adapter_family(self) -> str:
        return "simulated"

    async def submit(self, payload: dict, case: dict) -> dict:
        seed = f"{self.code}-{case.get('id')}-{datetime.now(timezone.utc).isoformat()}"
        digest = hashlib.sha256(seed.encode()).hexdigest()[:8].upper()
        prefix = self.code.split("_")[0]
        confirmation_id = f"{prefix}-{digest}"
        required = set(self.integration.get("required_fields", []))
        provided = {k for k, v in (payload or {}).items() if v not in (None, "")}
        missing = sorted(required - provided)
        sla = self.integration.get("sla_days", 30)
        status = "needs_action" if missing else "submitted"
        message = (
            f"Submitted to {self.integration['agency']}, but {len(missing)} required field(s) missing."
            if missing else
            f"Successfully submitted to {self.integration['agency']}. Estimated response: {sla} days."
        )
        return {
            "confirmation_id": confirmation_id,
            "status": status,
            "message": message,
            "missing_fields": missing,
            "expected_response_by": (datetime.now(timezone.utc) + timedelta(days=sla)).isoformat(),
            "raw_response": {"simulated": True, "adapter": "SimulatedAdapter"},
            "mode": self.mode,
            "adapter_family": self.adapter_family,
        }

    async def sync_status(self, confirmation_id: str) -> dict:
        return {"raw_response": {"simulated": True}, "_progression": self.PROGRESSION}

    async def get_authorize_url(self, redirect_uri: str, state: str,
                                pkce_challenge: Optional[str] = None,
                                nonce: Optional[str] = None) -> Optional[str]:
        return None

    async def exchange_code(self, code: str, redirect_uri: str,
                            pkce_verifier: Optional[str] = None) -> dict:
        return {
            "access_token": f"sim-token-{uuid.uuid4().hex[:16]}",
            "token_type": "bearer",
            "expires_in": 3600,
            "mode": "simulated",
            "adapter_family": self.adapter_family,
        }


# ── Generic OAuth 2.0 adapter ─────────────────────────────────────────────────
class OAuth2Adapter(RefreshCapableMixin, AgencyAdapter):
    @property
    def mode(self) -> str:
        return "live"

    @property
    def adapter_family(self) -> str:
        return "oauth2"

    @property
    def _prefix(self) -> str:
        return self.code.upper()

    def _env(self, suffix: str, fallback: str = "") -> str:
        return os.environ.get(f"{self._prefix}_{suffix}", fallback)

    @property
    def authorize_url(self) -> str:
        return self._env("OAUTH_AUTHORIZE_URL")

    @property
    def token_url(self) -> str:
        return self._env("OAUTH_TOKEN_URL")

    @property
    def client_id(self) -> str:
        return self._env("OAUTH_CLIENT_ID")

    @property
    def client_secret(self) -> str:
        return self._env("OAUTH_CLIENT_SECRET")

    @property
    def scope(self) -> str:
        return self._env("OAUTH_SCOPE", "applications:write")

    @property
    def api_base(self) -> str:
        return self._env("API_BASE", self.integration.get("endpoint", ""))

    async def get_authorize_url(self, redirect_uri: str, state: str,
                                pkce_challenge: Optional[str] = None,
                                nonce: Optional[str] = None) -> Optional[str]:
        if not self.authorize_url or not self.client_id:
            return None
        params = (
            f"response_type=code&client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}&scope={self.scope}&state={state}"
        )
        if pkce_challenge:
            params += f"&code_challenge={pkce_challenge}&code_challenge_method=S256"
        if nonce:
            params += f"&nonce={nonce}"
        sep = "&" if "?" in self.authorize_url else "?"
        return f"{self.authorize_url}{sep}{params}"

    async def exchange_code(self, code: str, redirect_uri: str,
                            pkce_verifier: Optional[str] = None) -> dict:
        if not self.token_url:
            raise RuntimeError(f"{self.code}: token URL not configured")
        data: dict = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        if pkce_verifier:
            data["code_verifier"] = pkce_verifier
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(self.token_url, data=data,
                                  headers={"Accept": "application/json"})
            r.raise_for_status()
            result = r.json()
        result["mode"] = "live"
        result["adapter_family"] = self.adapter_family
        return result

    async def submit(self, payload: dict, case: dict) -> dict:
        access_token = self.tokens.get("access_token")
        if not access_token:
            raise RuntimeError(f"{self.code}: not authorized — connect via OAuth first")
        url = f"{self.api_base.rstrip('/')}/applications"
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                url,
                json={"case_id": case.get("id"), "applicant": payload,
                      "submitted_at": datetime.now(timezone.utc).isoformat()},
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            data = r.json() if "application/json" in r.headers.get("content-type", "") else {"text": r.text}
        sla = self.integration.get("sla_days", 30)
        confirmation_id = data.get("confirmation_id") or data.get("id") or f"{self.code}-{uuid.uuid4().hex[:8].upper()}"
        return {
            "confirmation_id": confirmation_id,
            "status": data.get("status", "submitted"),
            "message": data.get("message", f"Live submission to {self.integration['agency']} accepted."),
            "missing_fields": data.get("missing_fields", []),
            "expected_response_by": (datetime.now(timezone.utc) + timedelta(days=sla)).isoformat(),
            "raw_response": data,
            "mode": self.mode,
            "adapter_family": self.adapter_family,
        }

    async def sync_status(self, confirmation_id: str) -> dict:
        access_token = self.tokens.get("access_token")
        if not access_token:
            raise RuntimeError(f"{self.code}: not authorized")
        url = f"{self.api_base.rstrip('/')}/applications/{confirmation_id}"
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(url, headers={"Authorization": f"Bearer {access_token}"})
            data = r.json() if "application/json" in r.headers.get("content-type", "") else {}
        return {"status": data.get("status", "under_review"),
                "message": data.get("message", "Status fetched from agency"),
                "raw_response": data}


# ── Login.gov adapter (OIDC + PKCE mandatory) ─────────────────────────────────
class LoginGovAdapter(OAuth2Adapter):  # inherits RefreshCapableMixin via OAuth2Adapter
    @property
    def adapter_family(self) -> str:
        return "logingov"

    def _sandbox(self, key: str) -> str:
        return SANDBOX_DEFAULTS["logingov"].get(key, "")

    @property
    def authorize_url(self) -> str:
        return self._env("OAUTH_AUTHORIZE_URL", self._sandbox("authorize_url"))

    @property
    def token_url(self) -> str:
        return self._env("OAUTH_TOKEN_URL", self._sandbox("token_url"))

    @property
    def scope(self) -> str:
        return self._env("OAUTH_SCOPE", self._sandbox("scope"))

    async def get_authorize_url(self, redirect_uri: str, state: str,
                                pkce_challenge: Optional[str] = None,
                                nonce: Optional[str] = None) -> Optional[str]:
        # PKCE + nonce mandatory for Login.gov
        if not pkce_challenge:
            _, pkce_challenge = generate_pkce_pair()
        if not nonce:
            nonce = secrets.token_urlsafe(16)
        return await super().get_authorize_url(redirect_uri, state, pkce_challenge, nonce)


# ── VA Lighthouse adapter ─────────────────────────────────────────────────────
class VaAdapter(OAuth2Adapter):  # inherits RefreshCapableMixin via OAuth2Adapter
    @property
    def adapter_family(self) -> str:
        return "va"

    def _sandbox(self, key: str) -> str:
        return SANDBOX_DEFAULTS["va"].get(key, "")

    @property
    def authorize_url(self) -> str:
        return self._env("OAUTH_AUTHORIZE_URL", self._sandbox("authorize_url"))

    @property
    def token_url(self) -> str:
        return self._env("OAUTH_TOKEN_URL", self._sandbox("token_url"))

    @property
    def scope(self) -> str:
        return self._env("OAUTH_SCOPE", self._sandbox("scope"))

    async def submit(self, payload: dict, case: dict) -> dict:
        # VA uses a different payload shape
        access_token = self.tokens.get("access_token")
        if not access_token:
            raise RuntimeError(f"{self.code}: not authorized")
        url = f"{self._env('API_BASE', 'https://sandbox-api.va.gov/services/vba/v2').rstrip('/')}/claims"
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                url,
                json={"veteran": payload, "case_reference": case.get("id"),
                      "submitted_at": datetime.now(timezone.utc).isoformat()},
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            data = r.json() if "application/json" in r.headers.get("content-type", "") else {"text": r.text}
        sla = self.integration.get("sla_days", 125)
        return {
            "confirmation_id": data.get("id") or f"VA-{uuid.uuid4().hex[:8].upper()}",
            "status": data.get("status", "submitted"),
            "message": data.get("message", "VA claim submitted."),
            "missing_fields": [],
            "expected_response_by": (datetime.now(timezone.utc) + timedelta(days=sla)).isoformat(),
            "raw_response": data,
            "mode": self.mode,
            "adapter_family": self.adapter_family,
        }


# ── SSA adapter ───────────────────────────────────────────────────────────────
class SsaAdapter(OAuth2Adapter):  # inherits RefreshCapableMixin via OAuth2Adapter
    @property
    def adapter_family(self) -> str:
        return "ssa"

    def _sandbox(self, key: str) -> str:
        return SANDBOX_DEFAULTS["ssa"].get(key, "")

    @property
    def authorize_url(self) -> str:
        return self._env("OAUTH_AUTHORIZE_URL", self._sandbox("authorize_url"))

    @property
    def token_url(self) -> str:
        return self._env("OAUTH_TOKEN_URL", self._sandbox("token_url"))

    @property
    def scope(self) -> str:
        return self._env("OAUTH_SCOPE", self._sandbox("scope"))


# ── Refresh token rotation ───────────────────────────────────────────────────

class TokenRefreshError(Exception):
    """Raised when a refresh attempt fails — caller should re-initiate OAuth flow."""


class RefreshCapableMixin:
    """Mixin that adds single-use refresh token rotation to OAuth2Adapter subclasses.

    Guarantees (FedRAMP AC-2 / IA-5 token management):
      - refresh_token is consumed exactly once per rotation.
      - New token set is returned; old refresh_token is invalidated server-side.
      - On failure (400/401 from token endpoint) raises TokenRefreshError so
        callers know they must re-initiate the full OAuth flow.
    """

    async def refresh_tokens(self, refresh_token: str) -> dict:
        """Exchange a refresh token for a new token set.
        Returns the new token dict (access_token, refresh_token, expires_in, ...).
        Raises TokenRefreshError if the server rejects the refresh.
        """
        if not getattr(self, "token_url", None):
            raise TokenRefreshError(f"{self.code}: token URL not configured — cannot refresh")
        if not refresh_token:
            raise TokenRefreshError(f"{self.code}: no refresh token available — re-authorize")

        data: dict = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": getattr(self, "client_id", ""),
        }
        # Include client_secret only when present (PKCE flows omit it)
        secret = getattr(self, "client_secret", "")
        if secret:
            data["client_secret"] = secret

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.post(
                    self.token_url,
                    data=data,
                    headers={"Accept": "application/json"},
                )
                if r.status_code in (400, 401):
                    raise TokenRefreshError(
                        f"{self.code}: refresh rejected (HTTP {r.status_code}) — "
                        "old token invalidated, re-authorize required"
                    )
                r.raise_for_status()
                result = r.json()
        except TokenRefreshError:
            raise
        except Exception as exc:
            raise TokenRefreshError(f"{self.code}: refresh request failed: {exc}") from exc

        result["mode"] = "live"
        result["adapter_family"] = getattr(self, "adapter_family", "oauth2")
        result["refreshed_at"] = datetime.now(timezone.utc).isoformat()
        return result


# ── Factory helpers ───────────────────────────────────────────────────────────
_FAMILY_PREFIXES = {
    "logingov": {"HUD_", "USDA_", "WIC_", "IRS_", "DOL_", "DMV_", "HHS_", "CMS_"},
    "va":       {"VA_"},
    "ssa":      {"SSA_"},
}

_FAMILY_CLASS = {
    "logingov": LoginGovAdapter,
    "va":       VaAdapter,
    "ssa":      SsaAdapter,
    "oauth2":   OAuth2Adapter,
}


def _detect_family(code: str) -> str:
    """Detect adapter family from code prefix or env override."""
    explicit = os.environ.get(f"{code.upper()}_ADAPTER", "").lower()
    if explicit in _FAMILY_CLASS:
        return explicit
    for family, prefixes in _FAMILY_PREFIXES.items():
        if any(code.upper().startswith(p) for p in prefixes):
            return family
    return "oauth2"


def has_live_config(code: str) -> bool:
    """True when explicit env vars are set OR OAUTH_ENV=sandbox + CLIENT_ID known."""
    prefix = code.upper()
    explicit = (
        os.environ.get(f"{prefix}_OAUTH_AUTHORIZE_URL")
        and os.environ.get(f"{prefix}_OAUTH_TOKEN_URL")
        and os.environ.get(f"{prefix}_OAUTH_CLIENT_ID")
    )
    if explicit:
        return True
    # sandbox shortcut: family has known defaults + client_id provided
    if os.environ.get("OAUTH_ENV", "").lower() == "sandbox":
        family = _detect_family(code)
        if family in SANDBOX_DEFAULTS and os.environ.get(f"{prefix}_OAUTH_CLIENT_ID"):
            return True
    return False


def get_adapter(integration: dict, tokens: Optional[dict] = None) -> AgencyAdapter:
    code = integration["code"]
    if not has_live_config(code):
        return SimulatedAdapter(integration, tokens=tokens)
    family = _detect_family(code)
    cls = _FAMILY_CLASS.get(family, OAuth2Adapter)
    return cls(integration, tokens=tokens)
