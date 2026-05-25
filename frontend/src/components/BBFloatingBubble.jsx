import React, { useState } from "react";
import { MessageCircleHeart, X } from "lucide-react";
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
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-2xl bb-pulse bb-bob flex items-center justify-center font-display font-bold text-[#0a142b] text-lg shadow-2xl"
        style={{ background: "linear-gradient(135deg, #f1d36b 0%, #d4af37 60%, #9c7a25 100%)" }}
      >
        {open ? <X size={20} /> : <MessageCircleHeart size={22} />}
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
