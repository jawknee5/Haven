"""Notifications router — derived feed for residents and caseworkers."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from auth import get_current_user
from database import application_tracking_col, cases_col, messages_col, serialize_list, tasks_col, utcnow

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: dict = Depends(get_current_user)):
    notes: list[dict] = []
    if user["role"] == "resident":
        cases = await cases_col.find({"resident_id": user["id"]}, {"_id": 0}).to_list(200)
        case_ids = [c["id"] for c in cases]

        # unread messages
        msgs = (
            await messages_col.find({"case_id": {"$in": case_ids}, "sender_role": {"$ne": "resident"}, "read": False}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(100)
        )
        for m in msgs:
            notes.append(
                {
                    "id": m["id"],
                    "kind": "message",
                    "title": f"New message from {m.get('sender_name','your caseworker')}",
                    "body": (m.get("content") or "")[:140],
                    "link": f"/resident/messages?case_id={m['case_id']}",
                    "ts": m["created_at"],
                }
            )

        # open tasks
        ot = await tasks_col.find({"case_id": {"$in": case_ids}, "status": {"$ne": "done"}}, {"_id": 0}).to_list(100)
        for t in ot:
            notes.append(
                {
                    "id": t["id"],
                    "kind": "task",
                    "title": t["title"],
                    "body": t.get("description", "")[:140],
                    "link": "/resident/tasks",
                    "ts": t["created_at"],
                }
            )

        # application updates
        apps = await application_tracking_col.find({"user_id": user["id"]}, {"_id": 0}).sort("last_checked", -1).to_list(100)
        for a in apps:
            notes.append(
                {
                    "id": a["id"],
                    "kind": "application",
                    "title": f"{a.get('agency_name')} — {a.get('status','submitted').replace('_', ' ')}",
                    "body": f"Confirmation: {a.get('application_id','')}",
                    "link": "/resident/applications",
                    "ts": a.get("last_checked") or a.get("submitted_at"),
                }
            )
    elif user["role"] == "caseworker":
        # cases assigned to me with high urgency
        cases = (
            await cases_col.find({"caseworker_id": user["id"], "urgency_score": {"$gte": 75}}, {"_id": 0})
            .sort("urgency_score", -1)
            .to_list(100)
        )
        for c in cases:
            notes.append(
                {
                    "id": c["id"],
                    "kind": "urgent_case",
                    "title": f"High urgency: {c['title']}",
                    "body": f"Resident: {c.get('resident_name','')} · Score {c.get('urgency_score')}",
                    "link": f"/caseworker/cases/{c['id']}",
                    "ts": c.get("updated_at") or c.get("created_at"),
                }
            )
        # unread messages from residents
        msgs = (
            await messages_col.find({"sender_role": "resident", "read": False}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(100)
        )
        for m in msgs:
            notes.append(
                {
                    "id": m["id"],
                    "kind": "message",
                    "title": f"Message from {m.get('sender_name','resident')}",
                    "body": (m.get("content") or "")[:140],
                    "link": f"/caseworker/cases/{m['case_id']}",
                    "ts": m["created_at"],
                }
            )

    notes.sort(key=lambda x: x.get("ts", ""), reverse=True)
    return {"unread": len(notes), "items": notes[:100]}