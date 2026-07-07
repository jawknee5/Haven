"""CivicFlow — decides the next best workflow action.

Ported from `engines/civic-flow/src/index.ts`.
"""
from __future__ import annotations
from .civic_context import CivicContext


NEED_TO_FIRST_STEP = {
    "housing": "Start the Coordinated Entry (Here4You) intake for housing placement.",
    "food": "Enroll the resident in CalFresh and connect to Second Harvest.",
    "health": "Open a Medi-Cal application and schedule Valley Homeless Healthcare intake.",
    "income": "Open a CalWORKs or GA application depending on family status.",
    "legal": "Route to Law Foundation SV for eviction defense triage.",
    "transportation": "Provision a VTA Lifeline pass and add bus routes to the case plan.",
}


async def run_civic_flow(ctx: CivicContext) -> CivicContext:
    if ctx.needs:
        top = ctx.needs[0]
        next_action = NEED_TO_FIRST_STEP.get(top, f"Start workflow for {top}")
    else:
        next_action = "Ask user about their needs"

    return ctx.with_event("WORKFLOW_STEP", {"nextAction": next_action})
