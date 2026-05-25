"""MongoDB connection + serialization helpers for HAVEN."""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def utcnow_iso() -> str:
    return utcnow().isoformat()


def serialize_doc(doc: Optional[dict]) -> Optional[dict]:
    """Strip Mongo _id and ensure datetimes are ISO strings."""
    if doc is None:
        return None
    if "_id" in doc:
        doc.pop("_id")
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


def serialize_list(docs: list[dict]) -> list[dict]:
    return [serialize_doc(d) for d in docs]


# Collection accessors
users_col = db["users"]
cases_col = db["cases"]
tasks_col = db["tasks"]
messages_col = db["messages"]
documents_col = db["documents"]
forms_col = db["forms"]
form_submissions_col = db["form_submissions"]
resources_col = db["resources"]
bb_sessions_col = db["bb_sessions"]
bb_browser_sessions_col = db["bb_browser_sessions"]
application_tracking_col = db["application_tracking"]
audit_log_col = db["audit_log"]
