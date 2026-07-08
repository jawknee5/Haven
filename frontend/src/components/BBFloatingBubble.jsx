import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import BBChat from "@/components/BBChat";

function useBBNudge(user, open) {
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const key = `bb_seen_sig_${user.id}`;

    async function check() {
      try {
        const [c, t] = await Promise.all([api.get("/cases"), api.get("/tasks").catch(() => ({ data: [] }))]);
        const sig = JSON.stringify([
          (c.data || []).map((x) => [x.id, x.status]),
          (t.data || []).map((x) => [x.id, x.status]),
        ]);
        if (cancelled) return;
        const seen = localStorage.getItem(key);
        if (seen === null) {
          localStorage.setItem(key, sig);
        } else if (seen !== sig) {
          localStorage.setItem(`${key}_pending`, sig);
          setNudge(true);
        }
      } catch (e) {
        console.debug("BB nudge check failed:", e);
      }
    }

    check();
    const iv = setInterval(check, 60000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [user]);

  useEffect(() => {
    if (open && nudge && user) {
      const key = `bb_seen_sig_${user.id}`;
      const pending = localStorage.getItem(`${key}_pending`);
      if (pending) localStorage.setItem(key, pending);
      setNudge(false);
    }
  }, [open, nudge, user]);

  return nudge;
}

export default function BBFloatingBubble() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const nudge = useBBNudge(user, open);
  if (!user) return null;

  return (
    <>
      {nudge && !open && (
        <div data-testid="bb-nudge-label" className="fixed bottom-8 right-24 z-40 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0a142b]/95 border border-[#d4af37]/50 text-[#f1d36b] shadow-xl animate-fade-in-up">
          BB has an update
        </div>
      )}
      <button
        data-testid="bb-floating-bubble"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open BB"
        className="fixed bottom-5 right-5 z-40 w-16 h-16 rounded-full bb-pulse bb-bob flex items-center justify-center shadow-2xl overflow-visible"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(241,211,107,0.65), rgba(212,175,55,0.20) 60%, rgba(10,20,43,0.85) 90%)",
          border: "1px solid rgba(212,175,55,0.55)",
        }}
      >
        {open ? (
          <X size={22} className="text-[#f1d36b]" />
        ) : (
          <img
            src="/haven-bird-sm.png"
            alt="BB the dove"
            style={{ width: 46, height: 46, objectFit: "contain" }}
            draggable={false}
          />
        )}
        {nudge && !open && (
          <span data-testid="bb-nudge-dot" className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#d4af37] border-2 border-[#0a142b] shadow" />
        )}
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[380px] max-w-[calc(100vw-2rem)] haven-card-glass shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up">
          <BBChat
            sessionId={`bb-bubble-${user.id}`}
            contextLabel="Floating BB"
            compact
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
