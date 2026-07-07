"""NexusMatch — matches each user need to a concrete local resource.

Ported from `engines/nexus-match/src/index.ts`. Enriched to pull from the
seeded resource collection so BB recommends REAL agencies (HomeFirst,
Sacred Heart, Second Harvest…) instead of `${need}_local_resource` stubs.
"""
from __future__ import annotations
from .civic_context import CivicContext

# Mapping from a resource `type` value in Mongo -> the CivicNeed it satisfies.
TYPE_TO_NEED = {
    "shelter": "housing",
    "food": "food",
    "health": "health",
    "legal": "legal",
    "employment": "income",
    "crisis": "housing",  # crisis often correlates with unstable housing
}


async def run_nexus_match(ctx: CivicContext, db=None) -> CivicContext:
    """If a DB handle is passed in we hit the live resources collection;
    otherwise fall back to the legacy stub behaviour so unit tests still work."""
    matches = []
    if db is not None:
        for need in ctx.needs:
            wanted_types = [t for t, n in TYPE_TO_NEED.items() if n == need]
            if not wanted_types:
                continue
            cursor = db.resources.find({"type": {"$in": wanted_types}}).limit(5)
            async for doc in cursor:
                matches.append({
                    "need": need,
                    "resource_id": doc.get("id") or str(doc.get("_id")),
                    "resource_name": doc.get("name"),
                    "type": doc.get("type"),
                    "confidence": 0.92,
                })
    else:
        matches = [
            {"need": n, "resource": f"{n}_local_resource", "confidence": 0.92}
            for n in ctx.needs
        ]

    return ctx.with_event("RESOURCE_MATCH", {"matches": matches})
