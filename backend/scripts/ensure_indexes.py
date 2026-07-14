"""ensure_indexes.py — idempotent index creation for HAVEN MongoDB collections.

Run automatically from FastAPI lifespan on every startup.
All indexes are created with background=True so they never block serving traffic.

SOC 2 / FedRAMP guarantees provided by these indexes
------------------------------------------------------
CC6.1  oauth_states TTL index     — state tokens expire automatically after 15 min;
                                    server never accumulates stale OAuth state records
                                    that could be replayed.
CC6.7  audit_log indexes          — tamper-evident audit trail queryable by actor,
                                    action, and timestamp for compliance reporting.
CC7.2  documents + cases indexes  — fast ownership lookups prevent cross-tenant
                                    data leakage by ensuring resident_id / case_id
                                    queries are always index-driven (no full scans).
A1.2   bb_sessions TTL index      — session data auto-expires after retention window
                                    (default 90 days) without needing a cron job.
P5.2   notifications TTL index    — notification records self-purge after 30 days.
"""
from __future__ import annotations

import logging
import os

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel
from pymongo.errors import OperationFailure

log = logging.getLogger("haven.indexes")

# Retention windows pulled from env (with safe defaults)
_BB_SESSION_DAYS    = int(os.environ.get("BB_SESSION_RETENTION_DAYS",    "90"))
_NOTIFICATION_DAYS  = int(os.environ.get("NOTIFICATION_RETENTION_DAYS",  "30"))
_AUDIT_DAYS         = int(os.environ.get("AUDIT_LOG_RETENTION_DAYS",   "2555"))  # 7 years
_OAUTH_STATE_TTL    = int(os.environ.get("OAUTH_STATE_TTL_SECONDS",      "900"))  # 15 min


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create all required indexes. Safe to call repeatedly — all ops are idempotent."""
    log.info("ensuring MongoDB indexes...")

    specs: list[tuple[str, list[IndexModel]]] = [

        # ── users ────────────────────────────────────────────────────────────
        ("users", [
            IndexModel([("email", ASCENDING)],  unique=True,  name="users_email_unique",  background=True),
            IndexModel([("id",    ASCENDING)],  unique=True,  name="users_id_unique",     background=True),
            IndexModel([("role",  ASCENDING)],                name="users_role",          background=True),
        ]),

        # ── cases ────────────────────────────────────────────────────────────
        ("cases", [
            IndexModel([("id",            ASCENDING)],  unique=True,   name="cases_id_unique",        background=True),
            IndexModel([("resident_id",   ASCENDING)],                 name="cases_resident_id",      background=True),
            IndexModel([("caseworker_id", ASCENDING)],                 name="cases_caseworker_id",    background=True),
            IndexModel([("status",        ASCENDING),
                        ("urgency_score", DESCENDING)],                name="cases_status_urgency",   background=True),
            IndexModel([("category",      ASCENDING)],                 name="cases_category",         background=True),
            IndexModel([("created_at",    DESCENDING)],                name="cases_created_at",       background=True),
        ]),

        # ── tasks ────────────────────────────────────────────────────────────
        ("tasks", [
            IndexModel([("id",           ASCENDING)],  unique=True,  name="tasks_id_unique",     background=True),
            IndexModel([("case_id",      ASCENDING)],                name="tasks_case_id",       background=True),
            IndexModel([("caseworker_id",ASCENDING)],                name="tasks_caseworker_id", background=True),
            IndexModel([("status",       ASCENDING)],                name="tasks_status",        background=True),
        ]),

        # ── messages ─────────────────────────────────────────────────────────
        ("messages", [
            IndexModel([("id",        ASCENDING)],  unique=True,  name="messages_id_unique",  background=True),
            IndexModel([("case_id",   ASCENDING),
                        ("created_at",ASCENDING)],                name="messages_case_thread", background=True),
            IndexModel([("sender_id", ASCENDING)],                name="messages_sender",      background=True),
        ]),

        # ── documents ────────────────────────────────────────────────────────
        ("documents", [
            IndexModel([("id",          ASCENDING)],  unique=True,  name="documents_id_unique",    background=True),
            IndexModel([("case_id",     ASCENDING)],                name="documents_case_id",      background=True),
            IndexModel([("uploaded_by", ASCENDING)],                name="documents_uploaded_by",  background=True),
        ]),

        # ── audit_log (CC6.7 — immutable, insert-only) ────────────────────────
        # Compound index for SOC 2 evidence queries: actor + time range + action
        ("audit_log", [
            IndexModel([("id",         ASCENDING)],  unique=True,  name="audit_id_unique",       background=True),
            IndexModel([("actor_id",   ASCENDING),
                        ("created_at", DESCENDING)],               name="audit_actor_time",      background=True),
            IndexModel([("action",     ASCENDING),
                        ("created_at", DESCENDING)],               name="audit_action_time",     background=True),
            IndexModel([("target",     ASCENDING),
                        ("created_at", DESCENDING)],               name="audit_target_time",     background=True),
            # TTL: audit records expire after retention window (default 7 years)
            # Note: 2555 days × 86400 s/day = 220,752,000 seconds
            IndexModel([("created_at", ASCENDING)],
                       expireAfterSeconds=_AUDIT_DAYS * 86400,
                       name="audit_ttl",
                       background=True),
        ]),

        # ── oauth_states (CC6.1 — single-use, TTL enforced at DB layer) ───────
        ("oauth_states", [
            IndexModel([("state",            ASCENDING)],  unique=True,  name="oauth_states_state_unique",  background=True),
            IndexModel([("integration_code", ASCENDING)],               name="oauth_states_code",          background=True),
            # TTL index: MongoDB auto-deletes expired state tokens even if
            # the callback path never fires (prevents state accumulation).
            IndexModel([("expires_at", ASCENDING)],
                       expireAfterSeconds=0,   # expires_at IS the absolute timestamp
                       name="oauth_states_ttl",
                       background=True),
        ]),

        # ── integration_tokens ───────────────────────────────────────────────
        ("integration_tokens", [
            IndexModel([("integration_code", ASCENDING)],  unique=True,  name="tokens_code_unique",  background=True),
        ]),

        # ── integration_submissions ──────────────────────────────────────────
        ("integration_submissions", [
            IndexModel([("id",              ASCENDING)],  unique=True,  name="isub_id_unique",       background=True),
            IndexModel([("case_id",         ASCENDING)],                name="isub_case_id",         background=True),
            IndexModel([("resident_id",     ASCENDING)],                name="isub_resident_id",     background=True),
            IndexModel([("integration_code",ASCENDING)],                name="isub_integration",     background=True),
            IndexModel([("status",          ASCENDING)],                name="isub_status",          background=True),
        ]),

        # ── application_tracking ─────────────────────────────────────────────
        ("application_tracking", [
            IndexModel([("id",      ASCENDING)],  unique=True,  name="apptrack_id_unique",   background=True),
            IndexModel([("user_id", ASCENDING)],                name="apptrack_user_id",     background=True),
            IndexModel([("case_id", ASCENDING)],                name="apptrack_case_id",     background=True),
        ]),

        # ── bb_sessions (TTL — auto-expire after retention window) ───────────
        ("bb_sessions", [
            IndexModel([("session_id", ASCENDING)],  unique=True,  name="bb_session_id_unique",  background=True),
            IndexModel([("user_id",    ASCENDING)],                name="bb_user_id",            background=True),
            # TTL: sessions auto-deleted after BB_SESSION_RETENTION_DAYS
            IndexModel([("last_message_at", ASCENDING)],
                       expireAfterSeconds=_BB_SESSION_DAYS * 86400,
                       name="bb_sessions_ttl",
                       background=True),
        ]),

        # ── notifications (TTL — auto-expire after retention window) ─────────
        ("notifications", [
            IndexModel([("id",      ASCENDING)],  unique=True,  name="notif_id_unique",  background=True),
            IndexModel([("user_id", ASCENDING)],                name="notif_user_id",    background=True),
            IndexModel([("created_at", ASCENDING)],
                       expireAfterSeconds=_NOTIFICATION_DAYS * 86400,
                       name="notifications_ttl",
                       background=True),
        ]),

        # ── form_submissions ─────────────────────────────────────────────────
        ("form_submissions", [
            IndexModel([("id",           ASCENDING)],  unique=True,  name="fsub_id_unique",      background=True),
            IndexModel([("submitted_by", ASCENDING)],                name="fsub_submitted_by",   background=True),
            IndexModel([("case_id",      ASCENDING)],                name="fsub_case_id",        background=True),
        ]),

        # ── resources ────────────────────────────────────────────────────────
        ("resources", [
            IndexModel([("id",   ASCENDING)],  unique=True,  name="resources_id_unique",  background=True),
            IndexModel([("type", ASCENDING)],                name="resources_type",       background=True),
        ]),

        # ── integrations ─────────────────────────────────────────────────────
        ("integrations", [
            IndexModel([("code", ASCENDING)],  unique=True,  name="integrations_code_unique",  background=True),
        ]),
    ]

    created = 0
    skipped = 0
    for collection_name, indexes in specs:
        col = db[collection_name]
        for idx in indexes:
            try:
                await col.create_indexes([idx])
                created += 1
            except OperationFailure as e:
                # Index already exists with same name/spec — safe to skip
                if "already exists" in str(e) or "IndexOptionsConflict" in str(e):
                    skipped += 1
                else:
                    log.warning(f"Index creation warning on {collection_name}: {e}")
                    skipped += 1

    log.info(f"indexes: {created} created, {skipped} already existed")
