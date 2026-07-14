"use client";

import { useState } from "react";

export default function BBPage() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  async function sendMessage() {
    const res = await fetch("http://localhost:3001/bb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history })
    });

    const data = await res.json();

    setHistory([...history, { role: "user", content: input }]);
    setHistory(h => [...h, { role: "assistant", content: data.message }]);
    setResponse(data.message);
    setInput("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>BB — HAVEN Caseworker</h1>

      <div style={{ marginBottom: 20 }}>
        {history.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ width: "80%", padding: 10 }}
      />
      <button onClick={sendMessage} style={{ padding: 10, marginLeft: 10 }}>
        Send
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>BB:</strong> {response}
      </div>
    </div>
  );
}
