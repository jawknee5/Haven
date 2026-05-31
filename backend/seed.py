"""Seed demo data for HAVEN: users, resources, sample cases, tasks, forms."""
from __future__ import annotations

import logging
from typing import Any

from auth import hash_password
from database import (
    cases_col,
    forms_col,
    messages_col,
    resources_col,
    tasks_col,
    users_col,
    utcnow,
)
from models import new_id

logger = logging.getLogger("haven.seed")


DEMO_USERS = [
    {
        "email": "caseworker@haven.demo",
        "password": "Demo2026!",
        "name": "Alex Rivera",
        "role": "caseworker",
        "phone": "+1 408 555 0101",
    },
    {
        "email": "resident@haven.demo",
        "password": "Demo2026!",
        "name": "Maria Hernandez",
        "role": "resident",
        "phone": "+1 408 555 0202",
    },
    {
        "email": "admin@haven.demo",
        "password": "Demo2026!",
        "name": "Jordan Lee",
        "role": "admin",
        "phone": "+1 408 555 0303",
    },
    {
        "email": "james@haven.demo",
        "password": "Demo2026!",
        "name": "James Brown",
        "role": "resident",
        "phone": "+1 408 555 0404",
    },
    {
        "email": "sarah@haven.demo",
        "password": "Demo2026!",
        "name": "Sarah Kim",
        "role": "resident",
        "phone": "+1 408 555 0505",
    },
]


# Real-world style locations around San José, CA
DEMO_RESOURCES = [
    {
        "name": "Boccardo Reception Center",
        "type": "shelter",
        "lat": 37.3712,
        "lng": -121.9136,
        "address": "2011 Little Orchard St, San Jose, CA",
        "phone": "(408) 539-2100",
        "hours": "24/7",
        "capacity": 250,
        "capacity_available": 18,
        "description": "Emergency shelter and case management for single adults.",
        "eligibility": "Adults 18+, walk-ins accepted",
    },
    {
        "name": "Sacred Heart Community Service",
        "type": "food",
        "lat": 37.3211,
        "lng": -121.8748,
        "address": "1381 South 1st St, San Jose, CA",
        "phone": "(408) 278-2160",
        "hours": "M–F 8a–4p",
        "capacity": None,
        "capacity_available": None,
        "description": "Food pantry, clothing closet, and family resources.",
        "eligibility": "Open to Santa Clara County residents",
    },
    {
        "name": "Valley Homeless Healthcare Program",
        "type": "health",
        "lat": 37.3382,
        "lng": -121.8863,
        "address": "278 N 2nd St, San Jose, CA",
        "phone": "(408) 977-1840",
        "hours": "M–F 8a–5p",
        "description": "Free medical, dental, and mental health services for people experiencing homelessness.",
        "eligibility": "No insurance required",
    },
    {
        "name": "Santa Clara County Crisis Line",
        "type": "crisis",
        "lat": 37.3491,
        "lng": -121.9332,
        "address": "Phone-based service, Santa Clara County",
        "phone": "(855) 278-4204",
        "hours": "24/7",
        "description": "24-hour mental health crisis support, suicide prevention, and mobile response.",
        "eligibility": "Anyone in crisis",
    },
    {
        "name": "Bill Wilson Center — Drop-in",
        "type": "shelter",
        "lat": 37.3548,
        "lng": -121.9529,
        "address": "3490 The Alameda, Santa Clara, CA",
        "phone": "(408) 850-6125",
        "hours": "M–F 12p–7p",
        "capacity": 35,
        "capacity_available": 7,
        "description": "Drop-in center for transitional age youth (16–25): meals, showers, case management.",
        "eligibility": "Ages 16–25",
    },
    {
        "name": "Law Foundation of Silicon Valley",
        "type": "legal",
        "lat": 37.3372,
        "lng": -121.8923,
        "address": "152 N 3rd St, San Jose, CA",
        "phone": "(408) 280-2417",
        "hours": "M–F 9a–5p",
        "description": "Free legal aid for housing, eviction defense, and immigration.",
        "eligibility": "Income-qualified residents of Santa Clara County",
    },
    {
        "name": "work2future Career Center",
        "type": "employment",
        "lat": 37.3221,
        "lng": -121.8341,
        "address": "5730 Chambertin Dr, San Jose, CA",
        "phone": "(408) 794-1100",
        "hours": "M–F 8a–5p",
        "description": "Job training, placement, and resume support.",
        "eligibility": "Open to all job-seekers",
    },
    {
        "name": "Family Supportive Housing",
        "type": "shelter",
        "lat": 37.3613,
        "lng": -121.9282,
        "address": "692 N King Rd, San Jose, CA",
        "phone": "(408) 926-8885",
        "hours": "24/7",
        "capacity": 64,
        "capacity_available": 4,
        "description": "Emergency shelter for families with children.",
        "eligibility": "Families with at least one minor child",
    },
    {
        "name": "Loaves & Fishes Family Kitchen",
        "type": "food",
        "lat": 37.3470,
        "lng": -121.8836,
        "address": "1900 Lundy Ave, San Jose, CA",
        "phone": "(408) 922-5564",
        "hours": "Daily hot meals 11:30a–12:30p",
        "description": "Hot meals 365 days a year — no questions asked.",
        "eligibility": "All welcome",
    },
]


DEMO_CASES = [
    {
        "title": "Family of 4 — eviction notice in 5 days",
        "description": "Single mom, 2 kids (8 and 11), husband recently incarcerated. Section 8 application stalled.",
        "category": "housing",
        "urgency_score": 92,
        "status": "active",
        "intake_data": {
            "household_size": 4,
            "income": 28500,
            "address": "478 Story Rd, San Jose, CA",
            "city": "San Jose",
            "state": "CA",
            "zip": "95122",
            "dob": "1989-04-12",
            "employer": "Part-time retail",
        },
    },
    {
        "title": "Food insecurity — diabetic senior",
        "description": "67-year-old, type-2 diabetic, $812/mo SSI, ran out of food on the 18th of the month.",
        "category": "food",
        "urgency_score": 74,
        "status": "active",
        "intake_data": {
            "household_size": 1,
            "income": 9744,
            "city": "San Jose",
            "state": "CA",
            "zip": "95116",
            "dob": "1957-09-03",
        },
    },
    {
        "title": "Mental health crisis follow-up",
        "description": "Released from county psych hold yesterday. Needs medication continuation + housing.",
        "category": "health",
        "urgency_score": 85,
        "status": "enriched",
        "intake_data": {
            "household_size": 1,
            "city": "San Jose",
            "state": "CA",
            "zip": "95110",
        },
    },
    {
        "title": "Unemployment + childcare coordination",
        "description": "Single dad, lost warehouse job 3 weeks ago, two kids in elementary school.",
        "category": "employment",
        "urgency_score": 58,
        "status": "new",
        "intake_data": {
            "household_size": 3,
            "income": 0,
            "city": "San Jose",
            "state": "CA",
            "zip": "95127",
        },
    },
    {
        "title": "Domestic violence — safety plan needed",
        "description": "Survivor with one minor child, escaped 2 nights ago. Currently with a friend.",
        "category": "crisis",
        "urgency_score": 96,
        "status": "active",
        "intake_data": {
            "household_size": 2,
            "city": "San Jose",
            "state": "CA",
        },
    },
    {
        "title": "Veteran — VA benefits not processing",
        "description": "Army vet (OIF), service-connected PTSD, claim has been stuck for 9 months.",
        "category": "benefits",
        "urgency_score": 62,
        "status": "active",
        "intake_data": {
            "household_size": 1,
            "city": "San Jose",
            "state": "CA",
            "zip": "95113",
        },
    },
]


DEMO_FORMS = [
    {
        "name": "HAVEN Universal Intake",
        "description": "First-touch intake for new residents seeking help.",
        "category": "intake",
        "fields": [
            {"id": new_id(), "label": "Full name", "type": "text", "name": "full_name", "required": True, "placeholder": "First Last", "map_to": "resident.name", "options": [], "helper_text": ""},
            {"id": new_id(), "label": "Phone", "type": "phone", "name": "phone", "required": True, "placeholder": "(408) 555-0000", "map_to": "resident.phone", "options": [], "helper_text": ""},
            {"id": new_id(), "label": "Email", "type": "email", "name": "email", "required": False, "placeholder": "you@example.com", "map_to": "resident.email", "options": [], "helper_text": ""},
            {"id": new_id(), "label": "What kind of help do you need?", "type": "select", "name": "category", "required": True, "options": ["housing", "food", "health", "benefits", "employment", "legal", "crisis", "other"], "placeholder": "", "helper_text": "We'll route you to the right team.", "map_to": "case.category"},
            {"id": new_id(), "label": "Tell us briefly what's going on", "type": "textarea", "name": "description", "required": True, "placeholder": "", "options": [], "helper_text": "Anything you share stays private.", "map_to": "case.description"},
            {"id": new_id(), "label": "Household size", "type": "number", "name": "household_size", "required": False, "placeholder": "", "options": [], "helper_text": "", "map_to": "intake.household_size"},
            {"id": new_id(), "label": "Is anyone in immediate danger right now?", "type": "radio", "name": "danger", "required": True, "options": ["No", "Yes"], "placeholder": "", "helper_text": "If yes, we'll connect you to a crisis line immediately.", "map_to": ""},
        ],
    }
]


async def ensure_seed() -> None:
    """Idempotent seed. Safe to call on every startup."""
    if await users_col.count_documents({}) >= len(DEMO_USERS):
        logger.info("HAVEN seed already present")
        # still ensure caseworker_id mapping on cases
        return

    logger.info("Seeding HAVEN demo data")
    user_id_by_email: dict[str, dict[str, str]] = {}
    for u in DEMO_USERS:
        existing = await users_col.find_one({"email": u["email"]})
        if existing:
            user_id_by_email[u["email"]] = {"id": existing["id"], "name": existing["name"]}
            continue
        doc = {
            "id": new_id(),
            "email": u["email"],
            "name": u["name"],
            "role": u["role"],
            "phone": u.get("phone", ""),
            "password_hash": hash_password(u["password"]),
            "created_at": utcnow().isoformat(),
            "avatar_url": "",
        }
        await users_col.insert_one(doc)
        user_id_by_email[u["email"]] = {"id": doc["id"], "name": doc["name"]}

    # resources
    if await resources_col.count_documents({}) == 0:
        for r in DEMO_RESOURCES:
            r = {**r, "id": new_id()}
            await resources_col.insert_one(r)

    # cases
    cw = user_id_by_email["caseworker@haven.demo"]
    resident_pool = [
        user_id_by_email["resident@haven.demo"],
        user_id_by_email["james@haven.demo"],
        user_id_by_email["sarah@haven.demo"],
    ]
    if await cases_col.count_documents({}) == 0:
        for i, c in enumerate(DEMO_CASES):
            resident = resident_pool[i % len(resident_pool)]
            case_doc = {
                "id": new_id(),
                "title": c["title"],
                "description": c["description"],
                "resident_id": resident["id"],
                "resident_name": resident["name"],
                "caseworker_id": cw["id"] if i != 3 else None,
                "caseworker_name": cw["name"] if i != 3 else None,
                "status": c["status"],
                "urgency_score": c["urgency_score"],
                "category": c["category"],
                "intake_data": c["intake_data"],
                "created_at": utcnow().isoformat(),
                "updated_at": utcnow().isoformat(),
            }
            await cases_col.insert_one(case_doc)
            # add a couple of tasks to each case
            await tasks_col.insert_many([
                {
                    "id": new_id(),
                    "case_id": case_doc["id"],
                    "caseworker_id": cw["id"],
                    "title": "Confirm contact information",
                    "description": "Call/email the resident to confirm phone, address, and best time to reach.",
                    "priority": "medium",
                    "status": "open",
                    "due_date": None,
                    "created_at": utcnow().isoformat(),
                },
                {
                    "id": new_id(),
                    "case_id": case_doc["id"],
                    "caseworker_id": cw["id"],
                    "title": "Verify required documents",
                    "description": "ID, proof of income, lease/notice.",
                    "priority": "high",
                    "status": "open",
                    "due_date": None,
                    "created_at": utcnow().isoformat(),
                },
            ])
            # seed a message exchange
            await messages_col.insert_many([
                {
                    "id": new_id(),
                    "case_id": case_doc["id"],
                    "sender_id": cw["id"],
                    "sender_name": cw["name"],
                    "sender_role": "caseworker",
                    "recipient_id": resident["id"],
                    "content": "Hi — I'm Alex from HAVEN. I'll be your caseworker. Can we talk for 10 minutes today?",
                    "read": True,
                    "created_at": utcnow().isoformat(),
                },
                {
                    "id": new_id(),
                    "case_id": case_doc["id"],
                    "sender_id": resident["id"],
                    "sender_name": resident["name"],
                    "sender_role": "resident",
                    "recipient_id": cw["id"],
                    "content": "Yes, anytime after 2pm works. Thank you so much.",
                    "read": False,
                    "created_at": utcnow().isoformat(),
                },
            ])

    # forms
    if await forms_col.count_documents({}) == 0:
        for f in DEMO_FORMS:
            doc = {
                "id": new_id(),
                "name": f["name"],
                "description": f["description"],
                "fields": f["fields"],
                "category": f["category"],
                "created_by": cw["id"],
                "published": True,
                "created_at": utcnow().isoformat(),
            }
            await forms_col.insert_one(doc)

    logger.info("HAVEN seed complete")
