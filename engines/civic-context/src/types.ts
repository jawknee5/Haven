export type CivicUser = {
  id: string;
  name?: string;
  locale?: string;
};

export type CivicNeed =
  | "housing"
  | "food"
  | "transportation"
  | "legal"
  | "health"
  | "income";

export interface CivicContext {
  user: CivicUser;
  needs: CivicNeed[];
  crisisLevel: "none" | "low" | "medium" | "high";
  location?: { city?: string; state?: string; zip?: string };
  history: CivicEvent[];
}

export type CivicEventType =
  | "INTAKE"
  | "CRISIS_SIGNAL"
  | "BENEFIT_CHECK"
  | "RESOURCE_MATCH"
  | "WORKFLOW_STEP"
  | "BB_MESSAGE";

export interface CivicEvent {
  id: string;
  type: CivicEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}
