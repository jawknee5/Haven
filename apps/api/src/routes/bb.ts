import type { Request, Response } from "express";
import { bbCaseworker } from "../../../packages/bb-brain/src";
import { dispatchEngineAction } from "../core/engines/dispatcher";
import { loadContextForUser, saveContextForUser } from "../core/context/store";

export async function bbHandler(req: Request, res: Response) {
  const userId = req.user?.id ?? "anonymous";
  const { message, history = [] } = req.body;

  // Load context
  let ctx = await loadContextForUser(userId);

  // First BB pass (raw user input)
  const firstPass = await bbCaseworker(ctx, history, message);

  // Run all engine actions
  for (const action of firstPass.actions) {
    ctx = await dispatchEngineAction(action, ctx);
  }

  // Save updated context
  await saveContextForUser(userId, ctx);

  // Second BB pass (with updated context)
  const secondPass = await bbCaseworker(ctx, [...history, { role: "user", content: message }], "continue");

  res.json({
    message: secondPass.message,
    actions: firstPass.actions,
    context: ctx
  });
}
