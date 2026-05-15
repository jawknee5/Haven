import type { CivicContext } from "../../civic-context/src/types";

export async function runFirstResponseRouter(ctx: CivicContext): Promise<CivicContext> {
  let crisisLevel = ctx.crisisLevel;

  if (ctx.needs.includes("housing") && ctx.needs.includes("food")) {
    crisisLevel = "high";
  } else if (ctx.needs.length >= 2) {
    crisisLevel = "medium";
  } else if (ctx.needs.length === 1) {
    crisisLevel = "low";
  }

  const updated = {
    ...ctx,
    crisisLevel,
    history: [
      ...ctx.history,
      {
        id: crypto.randomUUID(),
        type: "CRISIS_SIGNAL",
        timestamp: new Date().toISOString(),
        payload: { crisisLevel }
      }
    ]
  };

  return updated;
}
