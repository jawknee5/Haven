import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/jawknee-rodriquez";

export default function BookPage() {
  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--haven-border)]">
        <Link to="/home" className="flex items-center gap-2 text-[#aab5cf] hover:text-[#f1d36b] text-sm">
          <ArrowLeft size={14} /> Home
        </Link>
        <Link to="/home" className="flex items-center gap-2">
          <img src="/haven-bird.png" alt="HAVEN" className="h-8 w-auto" />
          <span className="font-serif-haven font-semibold tracking-[0.18em] text-gold">HAVEN</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Book a session</p>
        <h1 className="font-serif-haven text-4xl font-semibold tracking-tight mt-3">Pick a time that works for you.</h1>
        <p className="text-[#aab5cf] mt-3 max-w-2xl leading-relaxed">
          Every booking — resident welcome, caseworker training, agency onboarding, or community roundtable — happens through this one calendar. No back-and-forth. No confusion.
        </p>

        <div className="mt-8 haven-card overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--haven-border)] flex items-center justify-between bg-[#06101e]">
            <div className="flex items-center gap-2 text-[#cfd8e8] text-sm">
              <Calendar size={14} className="text-[#d4af37]" /> Powered by Calendly
            </div>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              data-testid="open-calendly-btn"
              className="text-xs text-[#d4af37] hover:text-[#f1d36b] inline-flex items-center gap-1"
            >
              Open in new tab <ExternalLink size={11} />
            </a>
          </div>
          <iframe
            data-testid="calendly-iframe"
            title="Calendly"
            src={CALENDLY_URL}
            className="w-full bg-white"
            style={{ height: "min(82vh, 920px)" }}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { t: "Resident sessions", d: "30 min · welcome, intake, navigation help." },
            { t: "Caseworker training", d: "45 min · onboarding, BB tools, form builder." },
            { t: "Agency partners", d: "60 min · integration, data sharing, MOUs." },
          ].map((b) => (
            <div key={b.t} className="haven-card p-5">
              <p className="font-display font-medium">{b.t}</p>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
