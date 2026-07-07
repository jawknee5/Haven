"""HAVEN CivicContext — the shared data shape all six engines operate on.

Ported from the TypeScript reference implementation at
`engines/civic-context/src/*` on the `main` branch of the Haven repository.
The Python translation preserves the semantics 1:1 so a resident session that
flows: intake → firstresponse_router → qualifycore → nexus_match → civic_flow
→ cascade_pipeline yields the exact same `history` payloads as the TS version.

All engines are pure async functions of `CivicContext -> CivicContext` — no
hidden globals, no side effects. Dispatch is centralised in `dispatcher.py`.
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Literal
import uuid


CivicNeed = Literal["housing", "food", "transportation", "legal", "health", "income"]
CrisisLevel = Literal["none", "low", "medium", "high"]
CivicEventType = Literal[
    "INTAKE",
    "CRISIS_SIGNAL",
    "BENEFIT_CHECK",
    "RESOURCE_MATCH",
    "WORKFLOW_STEP",
    "BB_MESSAGE",
]


@dataclass
class CivicUser:
    id: str
    name: str | None = None
    locale: str | None = None


@dataclass
class CivicEvent:
    id: str
    type: CivicEventType
    timestamp: str
    payload: dict[str, Any]


@dataclass
class CivicLocation:
    city: str | None = None
    state: str | None = None
    zip: str | None = None


@dataclass
class CivicContext:
    user: CivicUser
    needs: list[CivicNeed] = field(default_factory=list)
    crisisLevel: CrisisLevel = "none"
    location: CivicLocation = field(default_factory=CivicLocation)
    history: list[CivicEvent] = field(default_factory=list)

    # Helpers ---------------------------------------------------------------
    def with_event(self, event_type: CivicEventType, payload: dict[str, Any]) -> "CivicContext":
        """Return a NEW context with the given event appended (immutable ish)."""
        return CivicContext(
            user=self.user,
            needs=list(self.needs),
            crisisLevel=self.crisisLevel,
            location=self.location,
            history=[
                *self.history,
                CivicEvent(
                    id=str(uuid.uuid4()),
                    type=event_type,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    payload=payload,
                ),
            ],
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def default_context(user_id: str, name: str | None = None) -> CivicContext:
    return CivicContext(user=CivicUser(id=user_id, name=name))
