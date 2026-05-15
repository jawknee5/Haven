import { runQualifyCore } from "../../../../engines/qualifycore/src";
import { runNexusMatch } from "../../../../engines/nexus-match/src";
import { runCivicFlow } from "../../../../engines/civic-flow/src";
import { runCascadePipeline } from "../../../../engines/cascade-pipeline/src";
import { runFirstResponseRouter } from "../../../../engines/firstresponse-router/src";

import type { CivicContext } from "../../../../engines/civic-context/src/types";
import type { BBAction } from "../../../../packages/bb-brain/src/types";

export async function dispatchEngineAction(
  action: BBAction,
  ctx: CivicContext
): Promise<CivicContext> {
  switch (action.type) {
    case "RUN_QUALIFYCORE":
      return await runQualifyCore(ctx);

    case "RUN_NEXUS_MATCH":
      return await runNexusMatch(ctx);

    case "RUN_CIVIC_FLOW":
      return await runCivicFlow(ctx);

    case "RUN_CASCADE_PIPELINE":
      return await runCascadePipeline(ctx);

    case "RUN_FIRSTRESPONSE_ROUTER":
      return await runFirstResponseRouter(ctx);

    default:
      return ctx;
  }
}
