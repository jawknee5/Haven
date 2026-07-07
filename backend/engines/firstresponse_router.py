"""FirstResponse Router — decides crisis level from the shape of needs.

Ported from `engines/firstresponse-router/src/index.ts`.

Rules (identical to TS reference):
- housing AND food             -> high
- >= 2 needs                   -> medium
- exactly 1 need               -> low
- 0 needs                      -> unchanged (default: none)
"""
from __future__ import annotations
from .civic_context import CivicContext, CrisisLevel


async def run_firstresponse_router(ctx: CivicContext) -> CivicContext:
    crisis_level: CrisisLevel = ctx.crisisLevel
    needs = ctx.needs
    if "housing" in needs and "food" in needs:
        crisis_level = "high"
    elif len(needs) >= 2:
        crisis_level = "medium"
    elif len(needs) == 1:
        crisis_level = "low"

    updated = ctx.with_event("CRISIS_SIGNAL", {"crisisLevel": crisis_level})
    updated.crisisLevel = crisis_level
    return updated
