import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";

const HOTLINES = [
  { name: "988 Suicide & Crisis Lifeline", action: "Call or text 988", href: "tel:988" },
  { name: "Domestic Violence Hotline", action: "1-800-799-7233", href: "tel:18007997233" },
  { name: "Santa Clara County Crisis Line", action: "1-855-278-4204", href: "tel:18552784204" },
  { name: "Crisis Text Line", action: "Text HOME to 741741", href: "sms:741741?&body=HOME" },
  { name: "Trevor Project (LGBTQ youth)", action: "1-866-488-7386", href: "tel:18664887386" },
];

export default function CrisisPage() {
  function exit() {
    // Replace history then redirect to neutral site
    window.location.replace("https://www.google.com");
  }

  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") exit();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--haven-border)]">
        <Link to="/home" className="flex items-center gap-2 text-[#aab5cf] hover:text-[#f1d36b] text-sm">
          <ArrowLeft size={14} /> Home
        </Link>
        <button
          data-testid="quick-exit-btn"
          onClick={exit}
          className="haven-btn inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-medium"
        >
          <LogOut size={14} /> Leave this page
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-rose-300">Crisis support</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight mt-3">You're not alone.</h1>
        <p className="text-zinc-300 mt-3 leading-relaxed">
          If you're in danger or need immediate help, reach a hotline below. You can leave this page instantly by pressing
          {" "}<kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[11px]">ESC</kbd>{" "}
          or the red button above.
        </p>

        <div className="mt-8 space-y-3" data-testid="crisis-hotlines">
          {HOTLINES.map((h) => (
            <a
              key={h.name}
              href={h.href}
              className="haven-card flex items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-900/60 transition haven-btn"
            >
              <div>
                <p className="font-medium text-zinc-100">{h.name}</p>
                <p className="text-sm text-zinc-400">{h.action}</p>
              </div>
              <span className="text-blue-300 text-sm font-medium">Reach out →</span>
            </a>
          ))}
        </div>

        <p className="text-xs text-zinc-500 mt-8 leading-relaxed">
          Your activity on HAVEN is private. We do not sell or share your information. If you need to leave quickly, use the red button or press ESC — we'll route you away from this page.
        </p>
      </main>
    </div>
  );
}
