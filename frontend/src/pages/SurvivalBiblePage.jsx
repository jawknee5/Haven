import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { SURVIVAL_GUIDE } from "@/data/survivalGuide";
import { ENHANCED_SURVIVAL_GUIDE } from "@/data/enhancedSurvivalGuide";
import { Search, BookOpen, Sparkles } from "lucide-react";
import BBChat from "@/components/BBChat";
import { useAuth } from "@/lib/auth-context";

/**
 * The Survival Bible — comprehensive offline-safe survival knowledge
 * (water, food, shelter, fire, first aid, navigation, weather, tools,
 * psychology, wilderness knots, bow-drill fire, advanced shelters, etc.)
 *
 * Residents can browse sections OR ask BB (the dove) any question — BB has the
 * full guide loaded as context on the backend so she can give step-by-step
 * how-tos.
 */
export default function SurvivalBiblePage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialAsk = params.get("ask") || "";
  const askBBOnLoad = params.get("askbb") === "1" || Boolean(initialAsk);
  const allSections = useMemo(
    () => [...SURVIVAL_GUIDE.sections, ...ENHANCED_SURVIVAL_GUIDE.sections],
    []
  );

  const [activeId, setActiveId] = useState(allSections[0]?.id);
  const [query, setQuery] = useState("");
  const [askBB, setAskBB] = useState(askBBOnLoad);

  const filtered = useMemo(() => {
    if (!query.trim()) return allSections;
    const q = query.toLowerCase();
    return allSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.content || "").toLowerCase().includes(q) ||
        (s.knots || []).some((k) => k.name.toLowerCase().includes(q)) ||
        (s.designs || []).some((d) => d.name?.toLowerCase().includes(q))
    );
  }, [allSections, query]);

  const active = allSections.find((s) => s.id === activeId) || filtered[0];

  return (
    <AppLayout
      title="The Survival Bible"
      subtitle="Comprehensive survival knowledge — water, food, shelter, fire, first aid, knots, and more."
      actions={
        <button
          data-testid="ask-bb-survival-btn"
          onClick={() => setAskBB((v) => !v)}
          className="haven-btn btn-gold rounded-full px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
        >
          <Sparkles size={14} /> {askBB ? "Hide BB" : "Ask BB"}
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar — section list + search */}
        <aside className="haven-card p-4 h-fit lg:sticky lg:top-24">
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
            <input
              data-testid="survival-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the guide…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg focus:outline-none focus:border-[#d4af37]/60"
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#6d7a9a] mb-2">
            {filtered.length} chapter{filtered.length === 1 ? "" : "s"}
          </p>
          <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((s) => (
              <button
                key={s.id}
                data-testid={`survival-tab-${s.id}`}
                onClick={() => setActiveId(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition haven-btn ${
                  active?.id === s.id
                    ? "bg-[#d4af37]/12 text-[#f1d36b] border border-[#d4af37]/30"
                    : "text-[#aab5cf] hover:bg-[#142244]/60 border border-transparent"
                }`}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main — section content */}
        <div className="space-y-6">
          {askBB && user && (
            <div className="haven-card overflow-hidden">
              <div className="px-4 py-2 border-b border-[var(--haven-border)] bg-[#142244]/30 text-[11px] uppercase tracking-[0.22em] text-[#d4af37] flex items-center gap-2">
                <Sparkles size={12} /> Ask BB about any survival topic — she has the full guide loaded
              </div>
              <div className="h-[420px]">
                <BBChat
                  sessionId={`survival-bible-${user.id}`}
                  contextLabel="Survival Bible"
                  defaultMessages={[]}
                  initialInput={initialAsk}
                />
              </div>
            </div>
          )}

          {active ? (
            <article className="haven-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen size={18} className="text-[#d4af37]" />
                <h2
                  className="font-display text-2xl sm:text-3xl font-semibold"
                  data-testid="survival-section-title"
                >
                  {active.title}
                </h2>
              </div>

              {active.content && (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-200">
                  {active.content}
                </pre>
              )}

              {/* Subsections (simple guide) */}
              {active.subsections?.length > 0 && (
                <div className="mt-6 space-y-3">
                  {active.subsections.map((sub, i) => (
                    <div
                      key={`${active.id}-sub-${sub.title || i}`}
                      className="rounded-lg border border-[var(--haven-border)] bg-[#0a142b]/60 p-4"
                    >
                      <p className="text-sm font-medium text-[#f1d36b] mb-1">{sub.title}</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{sub.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Knots */}
              {active.knots?.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.knots.map((k) => (
                    <KnotCard key={k.id} knot={k} />
                  ))}
                </div>
              )}

              {/* Shelter designs */}
              {active.designs?.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.designs.map((d, i) => (
                    <DesignCard key={`${active.id}-design-${d.name || d.title || i}`} design={d} />
                  ))}
                </div>
              )}

              {/* Bow-drill style step list */}
              {active.steps?.length > 0 && (
                <ol className="mt-6 list-decimal pl-6 space-y-2 text-sm text-zinc-200">
                  {active.steps.map((step, i) => (
                    <li key={`${active.id}-step-${i}`}>
                      {typeof step === "string" ? step : step.text || step.description}
                    </li>
                  ))}
                </ol>
              )}
            </article>
          ) : (
            <div className="haven-card p-8 text-center text-zinc-400">
              No chapter matches “{query}”. Try a different keyword or{" "}
              <button
                onClick={() => setAskBB(true)}
                className="text-[#f1d36b] underline underline-offset-2"
              >
                ask BB
              </button>
              .
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function KnotCard({ knot }) {
  return (
    <div
      className="rounded-lg border border-[var(--haven-border)] bg-[#0a142b]/60 p-4"
      data-testid={`knot-${knot.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-[#f1d36b]">
          {knot.icon} {knot.name}
        </p>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#1d2c4f] text-[#aab5cf]">
          {knot.difficulty}
        </span>
      </div>
      <p className="text-xs text-zinc-300 mb-2">{knot.uses}</p>
      {knot.steps?.length > 0 && (
        <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-200 leading-relaxed">
          {knot.steps.map((s, i) => (
            <li key={`${knot.id}-step-${i}`}>{s}</li>
          ))}
        </ol>
      )}
      {knot.memory && (
        <p className="mt-2 text-[11px] italic text-[#aab5cf]">Memory trick: {knot.memory}</p>
      )}
      {knot.warnings && (
        <p className="mt-1 text-[11px] text-rose-300">⚠ {knot.warnings}</p>
      )}
    </div>
  );
}

function DesignCard({ design }) {
  return (
    <div className="rounded-lg border border-[var(--haven-border)] bg-[#0a142b]/60 p-4">
      <p className="text-sm font-medium text-[#f1d36b] mb-1">{design.name || design.title}</p>
      {design.description && (
        <p className="text-xs text-zinc-300 mb-2">{design.description}</p>
      )}
      {design.steps?.length > 0 && (
        <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-200 leading-relaxed">
          {design.steps.map((s, i) => (
            <li key={`design-step-${design.name || ""}-${i}`}>{typeof s === "string" ? s : s.text || s.description}</li>
          ))}
        </ol>
      )}
      {design.materials?.length > 0 && (
        <p className="mt-2 text-[11px] text-[#aab5cf]">Materials: {design.materials.join(", ")}</p>
      )}
    </div>
  );
}
