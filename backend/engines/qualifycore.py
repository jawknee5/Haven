"""QualifyCore — benefit-eligibility heuristics.

Ported from `engines/qualifycore/src/index.ts`. Expanded with San Jose /
California-specific programs so BB gives residents concrete benefit matches
instead of just "housing_assistance" placeholders.
"""
from __future__ import annotations
from .civic_context import CivicContext


# Benefit registry — id -> triggers + human-readable name + agency
ELIGIBILITY_RULES: list[dict] = [
    # Housing
    {"benefit_id": "hud_vash",       "name": "HUD-VASH (Veteran housing voucher)",   "agency": "VA + HUD",                   "needs": ["housing"], "extra_check": lambda ctx: any(e.payload.get("veteran") for e in ctx.history)},
    {"benefit_id": "here4you",       "name": "Here4You (Santa Clara County)",        "agency": "Santa Clara County OSH",     "needs": ["housing"]},
    {"benefit_id": "homekey",        "name": "Project Homekey interim housing",      "agency": "CA HCD + County",            "needs": ["housing"]},
    {"benefit_id": "prevention",     "name": "Homeless Prevention (rent & deposit)", "agency": "Sacred Heart / Bill Wilson", "needs": ["housing"]},
    {"benefit_id": "emergency_shelter", "name": "Emergency shelter bed placement",   "agency": "HomeFirst",                  "needs": ["housing"]},
    # Food
    {"benefit_id": "calfresh",       "name": "CalFresh (SNAP) monthly benefits",     "agency": "CA Social Services",         "needs": ["food"]},
    {"benefit_id": "wic",            "name": "WIC (women, infants, children)",       "agency": "CA Dept of Public Health",   "needs": ["food"]},
    {"benefit_id": "food_bank",      "name": "Second Harvest Food Bank",             "agency": "Second Harvest of Silicon Valley", "needs": ["food"]},
    # Health
    {"benefit_id": "medi_cal",       "name": "Medi-Cal (California Medicaid)",       "agency": "CA DHCS",                    "needs": ["health"]},
    {"benefit_id": "valley_health",  "name": "Valley Homeless Healthcare Program",   "agency": "Santa Clara Valley Med",     "needs": ["health"]},
    {"benefit_id": "medicare",       "name": "Medicare enrollment",                  "agency": "SSA",                        "needs": ["health"]},
    # Income
    {"benefit_id": "calworks",       "name": "CalWORKs (TANF / family cash aid)",    "agency": "CA Social Services",         "needs": ["income"]},
    {"benefit_id": "ga",             "name": "General Assistance (adult cash aid)",  "agency": "Santa Clara County SSA",     "needs": ["income"]},
    {"benefit_id": "ssi",            "name": "SSI (disability income)",              "agency": "SSA",                        "needs": ["income"]},
    {"benefit_id": "unemployment",   "name": "California Unemployment Insurance",    "agency": "CA EDD",                     "needs": ["income"]},
    # Employment
    {"benefit_id": "work2future",    "name": "work2future job training + placement", "agency": "Silicon Valley Career Center","needs": ["income"]},
    {"benefit_id": "reentry",        "name": "Reentry Resource Center (job + ID)",   "agency": "Santa Clara County OSH",     "needs": ["income"]},
    # Legal
    {"benefit_id": "legal_aid",      "name": "Legal Aid (eviction defense)",         "agency": "Law Foundation Silicon Valley","needs": ["legal"]},
    {"benefit_id": "record_clear",   "name": "Record clearance / expungement",       "agency": "Public Defender",             "needs": ["legal"]},
    # Transportation
    {"benefit_id": "vta_lifeline",   "name": "VTA Lifeline reduced-fare transit",    "agency": "VTA",                        "needs": ["transportation"]},
]


async def run_qualifycore(ctx: CivicContext) -> CivicContext:
    results = []
    for rule in ELIGIBILITY_RULES:
        # Any overlap between rule.needs and ctx.needs?
        if any(n in ctx.needs for n in rule["needs"]):
            extra = rule.get("extra_check")
            eligible = True if not extra else bool(extra(ctx))
            results.append({
                "benefitId": rule["benefit_id"],
                "name": rule["name"],
                "agency": rule["agency"],
                "eligible": eligible,
                "reasons": [f"User reported {n} need" for n in rule["needs"] if n in ctx.needs],
            })

    return ctx.with_event("BENEFIT_CHECK", {"results": results})
