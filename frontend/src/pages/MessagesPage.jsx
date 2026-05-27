import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/cases").then((r) => {
      setCases(r.data || []);
      if (r.data?.length) setActiveCase(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (activeCase) loadMessages(activeCase.id);
  }, [activeCase]);

  async function loadMessages(cid) {
    try {
      const r = await api.get(`/messages?case_id=${cid}`);
      setMessages(r.data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  async function send() {
    if (!text.trim() || !activeCase) return;
    setSending(true);
    try {
      await api.post("/messages", { case_id: activeCase.id, content: text });
      setText("");
      loadMessages(activeCase.id);
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send");
    } finally { setSending(false); }
  }

  return (
    <AppLayout title="Secure Messages" subtitle="Encrypted conversations between you and your caseworker.">
      <div className="grid grid-cols-12 gap-5 h-[calc(100vh-220px)]">
        <div className="col-span-12 md:col-span-4 haven-card p-4 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Your cases</p>
          <ul className="mt-3 space-y-1">
            {cases.map((c) => (
              <li key={c.id}>
                <button data-testid={`msg-case-${c.id}`} onClick={() => setActiveCase(c)} className={`w-full text-left px-3 py-2 rounded-lg border haven-btn ${activeCase?.id === c.id ? "bg-[#d4af37]/10 border-[#d4af37]/40 text-[#f1d36b]" : "border-[#1d2c4f] hover:bg-[#142244]/50"}`}>
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-[11px] text-[#aab5cf]">Caseworker: {c.caseworker_name || "Not assigned"}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 md:col-span-8 haven-card flex flex-col">
          {activeCase ? (
            <>
              <div className="p-4 border-b border-[var(--haven-border)]">
                <p className="font-display font-semibold">{activeCase.title}</p>
                <p className="text-xs text-[#aab5cf]">Case · {activeCase.status}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-sm text-zinc-500 text-center py-12">No messages yet — start the conversation.</p>}
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} data-testid={`msg-${m.id}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${mine ? "bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f1d36b] rounded-tr-sm" : "bg-[#142244]/60 border border-[#1d2c4f] text-zinc-100 rounded-tl-sm"}`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className="text-[10px] mt-1 opacity-60">{m.sender_name} · {new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-[var(--haven-border)] flex items-end gap-2">
                <textarea data-testid="msg-input" rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Write a message…" className="flex-1 resize-none bg-[#0a142b]/70 border border-[#1d2c4f] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60" />
                <button data-testid="msg-send" disabled={sending || !text.trim()} onClick={send} className="haven-btn h-10 px-4 rounded-xl btn-gold text-sm disabled:opacity-40 inline-flex items-center gap-1"><Send size={14} /> Send</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <MessageSquare size={28} className="mx-auto text-[#aab5cf] mb-2" />
                Pick a case to start messaging
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
