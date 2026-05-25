import React, { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Send, Sparkles, Loader2, X } from "lucide-react";

function bbAvatar(size = 32) {
  return (
    <div
      className="rounded-lg flex items-center justify-center font-display font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
        boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
      }}
    >
      BB
    </div>
  );
}

export default function BBChat({ sessionId, contextLabel, defaultMessages, onClose, compact = false }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(defaultMessages || []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [intro, setIntro] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (intro || !user) return;
    api
      .get("/bb/intro")
      .then((r) => setIntro(r.data.reply))
      .catch(() => setIntro("Hi, I'm BB. How can I help?"));
  }, [user, intro]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, intro]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content, ts: new Date().toISOString() }]);
    setBusy(true);
    try {
      const r = await api.post("/bb/chat", {
        message: content,
        session_id: sessionId || `bb-${user?.id || "anon"}`,
        context: { area: contextLabel || "general" },
      });
      setMessages((m) => [...m, { role: "assistant", content: r.data.reply, intent: r.data.intent, ts: new Date().toISOString() }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "BB had trouble reaching the network just now. Try again in a moment.",
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const suggestions = (user?.role === "caseworker")
    ? ["Summarize my highest-urgency cases", "Draft a follow-up message to a resident", "Help me fill an agency form"]
    : (user?.role === "admin")
    ? ["System health snapshot", "Capacity alerts", "Onboard a new caseworker"]
    : ["I need emergency housing", "Help me find food today", "What benefits do I qualify for?"];

  return (
    <div className={`flex flex-col haven-card ${compact ? "h-[420px]" : "h-full"}`} data-testid="bb-chat">
      <div className="px-4 py-3 border-b border-[var(--haven-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {bbAvatar(28)}
          <div>
            <p className="text-sm font-medium">BB</p>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Sparkles size={10} /> Claude Sonnet 4.5 · {contextLabel || "Civic Support"}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200" data-testid="bb-close-btn">
            <X size={16} />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {intro && messages.length === 0 && (
          <div className="flex gap-3 animate-fade-in-up">
            {bbAvatar(28)}
            <div className="text-sm text-zinc-200 bg-zinc-800/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] border border-zinc-700/50">
              {intro}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""} animate-fade-in-up`}>
            {m.role === "assistant" ? (
              bbAvatar(28)
            ) : (
              <div className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-medium shrink-0">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
            )}
            <div
              className={`text-sm whitespace-pre-wrap leading-relaxed rounded-2xl px-4 py-3 max-w-[85%] ${
                m.role === "user"
                  ? "bg-blue-500/15 text-blue-50 border border-blue-500/30 rounded-tr-sm"
                  : "bg-zinc-800/50 text-zinc-100 border border-zinc-700/50 rounded-tl-sm"
              }`}
            >
              {m.content}
              {m.intent?.crisis_level && m.intent.crisis_level !== "none" && m.role === "assistant" && (
                <div className="mt-2 text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Crisis level: {m.intent.crisis_level}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex gap-3">
            {bbAvatar(28)}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl px-4 py-3 inline-flex items-center gap-2 text-zinc-400 text-sm">
              <Loader2 size={13} className="animate-spin" /> BB is thinking…
            </div>
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              data-testid={`bb-suggestion-${s.slice(0, 12).replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => send(s)}
              className="text-[11px] px-3 py-1.5 rounded-full border border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/60 transition haven-btn"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-[var(--haven-border)] flex items-end gap-2">
        <textarea
          data-testid="bb-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask BB anything…"
          rows={1}
          className="flex-1 resize-none bg-zinc-900/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          data-testid="bb-send-btn"
          onClick={() => send()}
          disabled={busy || !input.trim()}
          className="haven-btn h-10 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  );
}
