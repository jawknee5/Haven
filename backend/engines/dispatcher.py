"""HAVEN Engine Dispatcher — routes BB actions through the six engines.

Ported from `apps/api/src/engines/dispatcher.ts`. Adds a convenience
`run_all_engines(ctx)` that runs the full pipeline in the canonical order
BB uses for resident intake:

    intake  ->  firstresponse_router  (set crisis level)
            ->  qualifycore           (find eligible benefits)
            ->  nexus_match           (match real local resources — pulls from DB)
            ->  civic_flow            (compute next action)
            ->  cascade_pipeline      (order the steps)
"""
from __future__ import annotations
from typing import Any
from .civic_context import CivicContext, CivicUser, default_context
from .firstresponse_router import run_firstresponse_router
from .qualifycore import run_qualifycore
from .nexus_match import run_nexus_match
from .civic_flow import run_civic_flow
from .cascade_pipeline import run_cascade_pipeline


async def dispatch_engine_action(action: dict, ctx: CivicContext, db=None) -> CivicContext:
    """Match the TS `dispatchEngineAction(action, ctx)` signature 1:1."""
    t = action.get("type")
    if t == "RUN_QUALIFYCORE":
        return await run_qualifycore(ctx)
    if t == "RUN_NEXUS_MATCH":
        return await run_nexus_match(ctx, db=db)
    if t == "RUN_CIVIC_FLOW":
        return await run_civic_flow(ctx)
    if t == "RUN_CASCADE_PIPELINE":
        return await run_cascade_pipeline(ctx)
    if t == "RUN_FIRSTRESPONSE_ROUTER":
        return await run_firstresponse_router(ctx)
    return ctx


async def run_all_engines(ctx: CivicContext, db=None) -> CivicContext:
    """Canonical pipeline BB executes on every new intake / conversation turn."""
    ctx = await run_firstresponse_router(ctx)
    ctx = await run_qualifycore(ctx)
    ctx = await run_nexus_match(ctx, db=db)
    ctx = await run_civic_flow(ctx)
    ctx = await run_cascade_pipeline(ctx)
    return ctx


def summarize_context_for_bb(ctx: CivicContext) -> dict[str, Any]:
    """Extract a compact JSON summary BB includes in her system prompt so she
    grounds her recommendations in the engine output instead of hallucinating."""
    last_events = {e.type: e.payload for e in ctx.history[-8:]}
    eligible = []
    matches = []
    next_action = None
    for e in ctx.history:
        if e.type == "BENEFIT_CHECK":
            eligible = [r for r in e.payload.get("results", []) if r.get("eligible")]
        elif e.type == "RESOURCE_MATCH":
            matches = e.payload.get("matches", [])
        elif e.type == "WORKFLOW_STEP" and "nextAction" in e.payload:
            next_action = e.payload["nextAction"]
    return {
        "crisisLevel": ctx.crisisLevel,
        "needs": list(ctx.needs),
        "eligibleBenefits": eligible[:10],
        "matchedResources": matches[:10],
        "nextAction": next_action,
        "lastEvents": last_events,
    }


__all__ = [
    "CivicContext",
    "CivicUser",
    "default_context",
    "dispatch_engine_action",
    "run_all_engines",
    "summarize_context_for_bb",
]
