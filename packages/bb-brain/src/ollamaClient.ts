import type { BBMessage } from "./types";

export async function callOllama(messages: BBMessage[]): Promise<string> {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1",
      messages
    })
  });

  const data = await res.json();
  return data?.message?.content ?? "";
}
