import { callOllama } from "./ollamaClient";
import type { BBMessage, BBResponse, BBAction } from "./types";
import type { CivicContext } from "../../engines/civic-context/src/types";

const ACTION_PREFIX = "[[ACTION:";
const ACTION_SUFFIX = "]]";

function extractActions(text: string): { cleaned: string; actions: BBAction[] } {
  const actions: BBAction[] = [];
  let cleaned = text;

  while (true) {
    const start = cleaned.indexOf(ACTION_PREFIX);
    if (start === -1) break;

    const end = cleaned.indexOf(ACTION_SUFFIX, start);
    if (end === -1) break;

    const raw = cleaned.substring(start + ACTION_PREFIX.length, end).trim();
    cleaned = cleaned.substring(0, start) + cleaned.substring(end + ACTION_SUFFIX.length);

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.type) actions.push(parsed as BBAction);
    } catch {}
  }

  return { cleaned: cleaned.trim(), actions };
}

export async function bbCaseworker(
  ctx: CivicContext,
  history: BBMessage[],
  userInput: string
): Promise<BBResponse> {
  const system: BBMessage = {
    role: "system",
    content:
      "You are BB, Pathway's AI caseworker. You coordinate with internal civic engines. " +
      "When you want an engine to run, output an action block like: " +
      '[[ACTION: {"type":"RUN_QUALIFYCORE"}]] ' +
      "Do NOT explain the action. Keep your message natural.",
  };

  const messages: BBMessage[] = [
    system,
    ...history,
    { role: "user", content: userInput }
  ];

  const raw = await callOllama(messages);

  const { cleaned, actions } = extractActions(raw);

  return {
    message: cleaned,
    actions,
    updatedContext: ctx
  };
}
