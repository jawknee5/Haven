import type { CivicContext } from "./types";

export function defaultContext(userId: string): CivicContext {
  return {
    user: { id: userId },
    needs: [],
    crisisLevel: "none",
    location: {},
    history: []
  };
}
