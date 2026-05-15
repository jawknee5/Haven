import type { CivicContext } from "../../engines/civic-context/src/types";

export interface BBMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type BBActionType =
  | "RUN_QUALIFYCORE"
  | "RUN_NEXUS_MATCH"
  | "RUN_CIVIC_FLOW"
  | "RUN_CASCADE_PIPELINE"
  | "RUN_FIRSTRESPONSE_ROUTER";

export interface BBAction {
  type: BBActionType;
  payload?: Record<string, unknown>;
}

export interface BBResponse {
  message: string;
  actions: BBAction[];
  updatedContext: CivicContext;
}
