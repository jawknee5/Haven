import type { CivicContext } from "../../civic-context/src/types";

export async function runCivicFlow(ctx: CivicContext): Promise<CivicContext> {
  const nextAction = ctx.needs.length
    ? `Start workflow for ${ctx.needs[0]}`
    : "Ask user about their needs";

  const updated = {
    ...ctx,
    history: [
      ...ctx.history,
      {
        id: crypto.randomUUID(),
        type: "WORKFLOW_STEP",
        timestamp: new Date().toISOString(),
        payload: { nextAction }
      }
    ]
  };

  return updated;
}
