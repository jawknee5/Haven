import type { CivicContext } from "../../../../engines/civic-context/src/types";
import { defaultContext } from "../../../../engines/civic-context/src/default";

const memoryStore = new Map<string, CivicContext>();

export async function loadContextForUser(userId: string): Promise<CivicContext> {
  return memoryStore.get(userId) ?? defaultContext(userId);
}

export async function saveContextForUser(
  userId: string,
  ctx: CivicContext
): Promise<void> {
  memoryStore.set(userId, ctx);
}
