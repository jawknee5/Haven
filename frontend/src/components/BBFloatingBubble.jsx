import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import BBChat from "@/components/BBChat";

export default function BBFloatingBubble() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  return (
    <>
      <button
        data-testid="bb-floating-bubble"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open BB"
        className="fixed bottom-5 right-5 z-40 w-16 h-16 rounded-full bb-pulse bb-bob flex items-center justify-center shadow-2xl overflow-hidden"
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
