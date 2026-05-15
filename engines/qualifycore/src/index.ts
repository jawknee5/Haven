import type { CivicContext } from "../../civic-context/src/types";

export async function runQualifyCore(ctx: CivicContext): Promise<CivicContext> {
  const results = [];

  if (ctx.needs.includes("housing")) {
    results.push({
      benefitId: "housing_assistance",
      eligible: true,
      reasons: ["User reported housing need"]
    });
  }

  if (ctx.needs.includes("food")) {
    results.push({
      benefitId: "snap",
      eligible: true,
      reasons: ["User reported food insecurity"]
    });
  }

  const updated = {
    ...ctx,
    history: [
      ...ctx.history,
      {
        id: crypto.randomUUID(),
        type: "BENEFIT_CHECK",
        timestamp: new Date().toISOString(),
        payload: { results }
      }
    ]
  };

  return updated;
}
