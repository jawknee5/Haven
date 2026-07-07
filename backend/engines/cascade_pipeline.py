"""CascadePipeline — sequences ordered steps across the user's needs.

Ported from `engines/cascade-pipeline/src/index.ts`.
"""
from __future__ import annotations
from .civic_context import CivicContext


async def run_cascade_pipeline(ctx: CivicContext) -> CivicContext:
    steps = [
        {"step": i + 1, "need": n, "description": f"Process {n} need"}
        for i, n in enumerate(ctx.needs)
    ]
    return ctx.with_event("WORKFLOW_STEP", {"steps": steps})
