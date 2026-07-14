"""token_refresh_job.py — Background task for proactive OAuth token rotation.

FedRAMP AC-2 / IA-5 compliance:
  - Access tokens are proactively refreshed TOKEN_REFRESH_BUFFER_SECONDS before
    expiry (default 300s / 5 min), not reactively after a 401.
  - Each rotation is single-use: old refresh_token is invalidated server-side
    the moment the new token set is issued.
  - New tokens are vault-encrypted before persistence — plaintext never touches
    disk.
  - Every rotation emits an immutable audit record.
  - Failed refreshes are audit-logged and the integration is flagged
    `token_status: refresh_failed` so admins know re-authorization is needed
    without exposing the reason to unprivileged callers.

Loop design:
  - Polls every REFRESH_POLL_INTERVAL_SECONDS (default 120s).
  - Reads all integration_tokens, decrypts, computes remaining TTL from
    expires_in + authorized_at / last_refreshed_at, and refreshes those within
    the buffer window.
  - Fully async — never blocks the FastAPI event loop.
"""
from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

log = logging.getLogger("haven.token_refresh")

_BUFFER_SECONDS = int(os.environ.get("TOKEN_REFRESH_BUFFER_SECONDS", "300"))   # 5 min
_POLL_INTERVAL  = int(os.environ.get("REFRESH_POLL_INTERVAL_SECONDS", "120"))  # 2 min


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _token_expires_at(token_doc: dict) -> Optional[datetime]:
    """Compute the absolute expiry datetime from stored token metadata.
    Returns None if expiry cannot be determined (treat as already expired).
    """
    expires_in = token_doc.get("expires_in")          # seconds from issuance
    if not expires_in:
        return None
    # Prefer last_refreshed_at, fall back to authorized_at
    issued_str = token_doc.get("last_refreshed_at") or token_doc.get("authorized_at")
    if not issued_str:
        return None
    try:
        issued_at = datetime.fromisoformat(issued_str)
        if issued_at.tzinfo is None:
            issued_at = issued_at.replace(tzinfo=timezone.utc)
        return issued_at + timedelta(seconds=int(expires_in))
    except (ValueError, TypeError):
        return None


class TokenRefreshJob:
    """Manages a long-running asyncio task that proactively rotates OAuth tokens."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._db = db
        self._task: Optional[asyncio.Task] = None
        self.is_running = False

    async def start(self) -> None:
        if self._task and not self._task.done():
            return
        self._task = asyncio.create_task(self._loop(), name="haven-token-refresh")
        self.is_running = True
        log.info(f"token refresh job started (poll={_POLL_INTERVAL}s, buffer={_BUFFER_SECONDS}s)")

    async def stop(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self.is_running = False
        log.info("token refresh job stopped")

    async def _loop(self) -> None:
        """Main polling loop. Runs indefinitely until cancelled."""
        while True:
            try:
                await self._refresh_due_tokens()
            except asyncio.CancelledError:
                raise
            except Exception as e:
                log.error(f"token refresh loop error: {e}")
            await asyncio.sleep(_POLL_INTERVAL)

    async def _refresh_due_tokens(self) -> None:
        """Check all stored integration tokens and refresh those nearing expiry."""
        # Import here to avoid circular imports at module load time
        from agency_adapters import get_adapter, has_live_config
        from routers.integrations_router import (
            integration_tokens_col,
            integrations_col,
        )
        from routers.integrations_router import _decrypt_token_doc, _encrypt_token_doc
        from database import audit_log_col
        from models import new_id
        from agency_adapters import TokenRefreshError

        now = _utcnow()
        refresh_before = now + timedelta(seconds=_BUFFER_SECONDS)

        raw_token_docs = await integration_tokens_col.find({}, {"_id": 0}).to_list(500)

        for raw_doc in raw_token_docs:
            code = raw_doc.get("integration_code")
            if not code:
                continue

            decrypted = _decrypt_token_doc(raw_doc)
            if not decrypted:
                continue

            expires_at = _token_expires_at(decrypted)

            # Skip if expiry unknown (simulated tokens have no expires_in)
            if expires_at is None:
                continue

            # Skip if token still has plenty of life left
            if expires_at > refresh_before:
                continue

            # Token is due for rotation
            refresh_token = decrypted.get("refresh_token")
            if not refresh_token:
                log.warning(f"{code}: no refresh_token — skipping (re-authorize required)")
                await integration_tokens_col.update_one(
                    {"integration_code": code},
                    {"$set": {"token_status": "no_refresh_token"}},
                )
                continue

            integ = await integrations_col.find_one({"code": code}, {"_id": 0})
            if not integ:
                log.warning(f"{code}: integration record not found — skipping")
                continue

            adapter = get_adapter(integ, tokens=decrypted)
            if not hasattr(adapter, "refresh_tokens"):
                continue

            try:
                new_tokens = await adapter.refresh_tokens(refresh_token)
            except TokenRefreshError as e:
                log.warning(f"{code}: refresh failed — {e}")
                await integration_tokens_col.update_one(
                    {"integration_code": code},
                    {"$set": {"token_status": "refresh_failed", "refresh_error": str(e)}},
                )
                await audit_log_col.insert_one({
                    "id": new_id(),
                    "actor_id": "system:token_refresh_job",
                    "actor_name": "Token Refresh Job",
                    "actor_role": "system",
                    "action": "integration.oauth_refresh_failed",
                    "target": code,
                    "meta": {"error": str(e)},
                    "created_at": _utcnow().isoformat(),
                })
                continue
            except Exception as e:
                log.error(f"{code}: unexpected refresh error — {e}")
                continue

            # Vault-encrypt and persist the new token set
            encrypted = _encrypt_token_doc({
                "integration_code": code,
                "access_token":  new_tokens.get("access_token"),
                "refresh_token": new_tokens.get("refresh_token"),
                "id_token":      new_tokens.get("id_token"),
                "expires_in":    new_tokens.get("expires_in"),
                "token_type":    new_tokens.get("token_type", "bearer"),
                "adapter_family": adapter.adapter_family,
                "raw": "[redacted]",
                "authorized_at":      raw_doc.get("authorized_at"),
                "last_refreshed_at":  _utcnow().isoformat(),
                "token_status":       "active",
            })
            await integration_tokens_col.update_one(
                {"integration_code": code},
                {"$set": encrypted},
                upsert=True,
            )

            # Immutable audit record — no token values logged
            await audit_log_col.insert_one({
                "id": new_id(),
                "actor_id":   "system:token_refresh_job",
                "actor_name": "Token Refresh Job",
                "actor_role": "system",
                "action":     "integration.oauth_refresh",
                "target":     code,
                "meta": {
                    "adapter_family": adapter.adapter_family,
                    "refreshed_at":   _utcnow().isoformat(),
                    "prev_expires_at": expires_at.isoformat(),
                },
                "created_at": _utcnow().isoformat(),
            })
            log.info(f"{code}: token rotated successfully (adapter={adapter.adapter_family})")
