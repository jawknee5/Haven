import type { CivicContext } from "../../civic-context/src/types";

export async function runNexusMatch(ctx: CivicContext): Promise<CivicContext> {
  const matches = ctx.needs.map(n => ({
    need: n,
    resource: `${n}_local_resource`,
    confidence: 0.92
  }));

  const updated = {
    ...ctx,
    history: [
      ...ctx.history,
      {
        id: crypto.randomUUID(),
        type: "RESOURCE_MATCH",
        timestamp: new Date().toISOString(),
        payload: { matches }
      }
    ]
  };

  return updated;
}
