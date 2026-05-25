import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Globe,
  Loader2,
  CheckCircle2,
  Play,
  RotateCcw,
  ArrowRight,
  ScanLine,
  Wand2,
  Pause,
} from "lucide-react";

/**
 * BB Live Demo — Public, no-login page.
 *
 * A precisely-choreographed 60-second simulation of BB:
 *  1. Opening an agency website (Section 8 Housing)
 *  2. Analyzing the live DOM
 *  3. Mapping resident profile → form fields
 *  4. Filling each field with realistic typing
 *  5. Submitting + confirmation
 *
 * Implemented as a client-side cinematic so any visitor sees it run
 * instantly — without spinning up real Playwright sessions per viewer.
 * The flow MIRRORS what /caseworker/bb-browser does live with Playwright.
 */

const DEMO_RESIDENT = {
  first_name: "Maria",
  last_name: "Hernandez",
  email: "maria.h@example.com",
  phone: "(408) 555-0287",
  dob: "1989-04-12",
  address: "478 Story Rd",
  city: "San Jose",
  state: "CA",
  zip: "95122",
  household_size: "4",
  income: "28500",
  reason: "Eviction notice received 5 days ago. Family of four. Seeking emergency placement.",
};

const FIELDS = [
  { key: "first_name", label: "First name", value: DEMO_RESIDENT.first_name, w: "col-span-1" },
  { key: "last_name", label: "Last name", value: DEMO_RESIDENT.last_name, w: "col-span-1" },
  { key: "email", label: "Email", value: DEMO_RESIDENT.email, w: "col-span-2" },
  { key: "phone", label: "Phone", value: DEMO_RESIDENT.phone, w: "col-span-1" },
  { key: "dob", label: "Date of birth", value: DEMO_RESIDENT.dob, w: "col-span-1" },
  { key: "address", label: "Current address", value: DEMO_RESIDENT.address, w: "col-span-2" },
  { key: "city", label: "City", value: DEMO_RESIDENT.city, w: "col-span-1" },
  { key: "state", label: "State", value: DEMO_RESIDENT.state, w: "col-span-1" },
  { key: "zip", label: "ZIP", value: DEMO_RESIDENT.zip, w: "col-span-1" },
  { key: "household_size", label: "Household size", value: DEMO_RESIDENT.household_size, w: "col-span-1" },
  { key: "income", label: "Annual income ($)", value: DEMO_RESIDENT.income, w: "col-span-2" },
  { key: "reason", label: "Reason for applying", value: DEMO_RESIDENT.reason, w: "col-span-2", textarea: true },
];

/** Timing (ms) per phase from start. Total ≈ 60s. */
const PHASES = {
  TITLE: 0,         // 0–2.5s: title card
  CONNECTING: 2500, // 2.5–6s: "Opening agency portal…"
  LOADED: 6000,     // 6–9s: page loaded, BB greets
  ANALYZING: 9000,  // 9–13s: scan animation, fields detected
  MAPPING: 13000,   // 13–17s: BB matches profile → fields
  FILLING_START: 17000, // 17–50s: per-field fill
  SUBMITTING: 50000,    // 50–54s: BB clicks submit
  CONFIRMED: 54000,     // 54–58s: confirmation
  CTA: 58000,           // 58–60s: CTA fade in
  TOTAL: 60000,
};

const FILL_WINDOW = PHASES.SUBMITTING - PHASES.FILLING_START; // 33s
const FILL_PER_FIELD = FILL_WINDOW / FIELDS.length; // ~2.75s per field

function BBAvatar({ size = 28 }) {
  return (
    <div
      className="rounded-lg flex items-center justify-center font-display font-bold text-[#0a142b] shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #f1d36b 0%, #d4af37 60%, #9c7a25 100%)",
        boxShadow: "0 4px 14px rgba(212, 175, 55, 0.4)",
      }}
    >
      BB
    </div>
  );
}

export default function BBDemoPage() {
  const [t, setT] = useState(0); // elapsed ms
  const [playing, setPlaying] = useState(true);
  const [values, setValues] = useState({});
  const [log, setLog] = useState([]);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const lastLoggedField = useRef(-1);

  // RAF loop
  useEffect(() => {
    if (!playing) return;
    startRef.current = performance.now() - t;
    const loop = (now) => {
      const elapsed = now - startRef.current;
      if (elapsed >= PHASES.TOTAL) {
        setT(PHASES.TOTAL);
        return;
      }
      setT(elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Phase + value computation
  useEffect(() => {
    const newValues = {};
    if (t >= PHASES.FILLING_START) {
      const elapsedInFill = t - PHASES.FILLING_START;
      const completedFields = Math.floor(elapsedInFill / FILL_PER_FIELD);
      const intoCurrent = (elapsedInFill % FILL_PER_FIELD) / FILL_PER_FIELD;

      for (let i = 0; i < FIELDS.length; i++) {
        const f = FIELDS[i];
        if (i < completedFields) {
          newValues[f.key] = f.value;
        } else if (i === completedFields) {
          // partially type the value (ease-out)
          const ease = 1 - Math.pow(1 - intoCurrent, 2);
          const chars = Math.floor(ease * f.value.length);
          newValues[f.key] = f.value.slice(0, chars);
        }
      }

      // log when each field starts filling
      const startingField = Math.min(completedFields, FIELDS.length - 1);
      if (startingField > lastLoggedField.current && t < PHASES.SUBMITTING) {
        lastLoggedField.current = startingField;
        const f = FIELDS[startingField];
        if (f) {
          setLog((l) =>
            [{ id: Math.random(), tone: "ok", text: `fill #${f.key} → ${truncate(f.value, 40)}` }, ...l].slice(0, 18)
          );
        }
      }
    }
    setValues(newValues);
  }, [t]);

  // Phase-triggered log entries
  useEffect(() => {
    if (t >= PHASES.CONNECTING && t < PHASES.LOADED && !log.find((x) => x.id === "connecting")) {
      setLog((l) => [{ id: "connecting", tone: "info", text: "Launching headless Chromium…" }, ...l]);
    }
    if (t >= PHASES.LOADED && !log.find((x) => x.id === "loaded")) {
      setLog((l) => [
        { id: "loaded", tone: "ok", text: "Loaded: housing-authority.gov/section-8/apply" },
        ...l,
      ]);
    }
    if (t >= PHASES.ANALYZING && !log.find((x) => x.id === "analyze")) {
      setLog((l) => [{ id: "analyze", tone: "info", text: "Scanning DOM for form fields…" }, ...l]);
    }
    if (t >= PHASES.ANALYZING + 2200 && !log.find((x) => x.id === "found")) {
      setLog((l) => [{ id: "found", tone: "ok", text: `Detected ${FIELDS.length} fields.` }, ...l]);
    }
    if (t >= PHASES.MAPPING && !log.find((x) => x.id === "mapping")) {
      setLog((l) => [{ id: "mapping", tone: "info", text: "Mapping resident profile → fields…" }, ...l]);
    }
    if (t >= PHASES.MAPPING + 2000 && !log.find((x) => x.id === "mapped")) {
      setLog((l) => [{ id: "mapped", tone: "ok", text: `${FIELDS.length} of ${FIELDS.length} fields ready.` }, ...l]);
    }
    if (t >= PHASES.SUBMITTING && !log.find((x) => x.id === "submitting")) {
      setLog((l) => [{ id: "submitting", tone: "info", text: "Clicking submit button…" }, ...l]);
    }
    if (t >= PHASES.CONFIRMED && !log.find((x) => x.id === "confirmed")) {
      setLog((l) => [{ id: "confirmed", tone: "ok", text: "Application submitted · ID HCV-78214" }, ...l]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  function restart() {
    setT(0);
    setValues({});
    setLog([]);
    lastLoggedField.current = -1;
    startRef.current = performance.now();
    setPlaying(true);
  }

  const phaseLabel =
    t < PHASES.CONNECTING ? "Intro" :
    t < PHASES.LOADED ? "Connecting" :
    t < PHASES.ANALYZING ? "Loaded" :
    t < PHASES.MAPPING ? "Analyzing" :
    t < PHASES.FILLING_START ? "Mapping" :
    t < PHASES.SUBMITTING ? "Filling" :
    t < PHASES.CONFIRMED ? "Submitting" :
    "Confirmed";

  const progressPct = Math.min(100, (t / PHASES.TOTAL) * 100);

  // Cursor position — over the currently-filling field, if any
  const currentFieldIdx =
    t >= PHASES.FILLING_START && t < PHASES.SUBMITTING
      ? Math.min(Math.floor((t - PHASES.FILLING_START) / FILL_PER_FIELD), FIELDS.length - 1)
      : -1;

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--haven-border)] bg-[#070f1d]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2 text-[#aab5cf] hover:text-[#f1d36b] text-sm">
            <ArrowLeft size={14} /> Home
          </Link>
          <Link to="/home" className="flex items-center gap-2">
            <img src="/haven-bird.png" alt="HAVEN" className="h-8 w-auto" />
            <span className="font-serif-haven font-semibold tracking-[0.18em] text-gold">HAVEN</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              data-testid="demo-signin"
              className="text-sm font-medium px-4 py-2 rounded-full btn-outline-navy haven-btn"
            >
              Sign in
            </Link>
            <Link
              to="/login?mode=register"
              data-testid="demo-getstarted"
              className="text-sm font-medium px-4 py-2 rounded-full btn-gold haven-glow-gold haven-btn"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">BB Live Demo</p>
            <h1 className="font-serif-haven text-3xl md:text-4xl font-semibold tracking-tight mt-2">
              Watch BB fill a Section 8 housing application <span className="text-gold-bright italic">in 60 seconds.</span>
            </h1>
            <p className="text-sm text-[#aab5cf] mt-2 max-w-2xl">
              No login. No setup. A real demonstration of HAVEN's AI assistant analyzing an agency form, mapping resident data, and submitting on behalf of a caseworker.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="demo-restart"
              onClick={restart}
              className="haven-btn text-xs px-3 py-1.5 rounded-full border border-[#1d2c4f] hover:bg-[#142244]/60 hover:border-[#d4af37]/40 inline-flex items-center gap-1"
            >
              <RotateCcw size={12} /> Replay
            </button>
            <button
              data-testid="demo-pause"
              onClick={() => setPlaying((p) => !p)}
              className="haven-btn text-xs px-3 py-1.5 rounded-full border border-[#1d2c4f] hover:bg-[#142244]/60 inline-flex items-center gap-1"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? "Pause" : "Play"}
            </button>
          </div>
        </div>

        {/* Progress strip */}
        <div className="mt-6 haven-card p-3">
          <div className="flex items-center gap-3 mb-2">
            <BBAvatar size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#aab5cf] flex items-center gap-2">
                <Sparkles size={11} className="text-[#d4af37]" />
                BB · Claude Sonnet 4.5 · <span className="text-[#f1d36b]">{phaseLabel}</span>
              </p>
            </div>
            <p className="font-mono text-xs text-[#6d7a9a]">{(t / 1000).toFixed(1)}s / 60s</p>
          </div>
          <div className="h-1.5 bg-[#0a142b] rounded-full overflow-hidden">
            <div
              className="h-full transition-[width] duration-100 ease-linear"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #d4af37 0%, #f1d36b 100%)",
                boxShadow: "0 0 12px rgba(212, 175, 55, 0.5)",
              }}
            />
          </div>
        </div>

        {/* Demo body */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          {/* Browser viewport */}
          <div className="col-span-12 lg:col-span-8">
            <div className="haven-card overflow-hidden" data-testid="demo-browser">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--haven-border)] bg-[#06101e]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <div className="flex-1 flex items-center bg-[#0a142b]/70 border border-[#1d2c4f] rounded-full px-3 ml-3">
                  <Globe size={11} className="text-[#6d7a9a] mr-2" />
                  <span className="py-1 text-[11px] text-[#aab5cf] font-mono truncate">
                    {t < PHASES.LOADED ? "loading…" : "https://housing-authority.gov/section-8/apply"}
                  </span>
                </div>
              </div>

              {/* Viewport */}
              <div className="relative bg-white" style={{ minHeight: 540 }}>
                {/* Title card overlay (0-2.5s) */}
                {t < PHASES.CONNECTING && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a142b] animate-fade-in-up">
                    <div className="text-center">
                      <img src="/haven-bird.png" alt="" className="h-16 w-auto mx-auto mb-4" style={{ filter: "drop-shadow(0 6px 18px rgba(212,175,55,0.45))" }} />
                      <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#d4af37]">BB Live Demo</p>
                      <h2 className="font-serif-haven text-3xl font-semibold mt-2 text-zinc-100">Section 8 Housing — Auto-fill</h2>
                      <p className="text-sm text-[#aab5cf] mt-2">A real workflow. In 60 seconds.</p>
                    </div>
                  </div>
                )}

                {/* Connecting overlay (2.5-6s) */}
                {t >= PHASES.CONNECTING && t < PHASES.LOADED && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a142b]/95">
                    <div className="text-center">
                      <Loader2 size={36} className="text-[#d4af37] animate-spin mx-auto" />
                      <p className="text-sm text-[#aab5cf] mt-4 font-mono">Launching headless Chromium…</p>
                      <p className="text-xs text-[#6d7a9a] mt-1">housing-authority.gov</p>
                    </div>
                  </div>
                )}

                {/* Scan line overlay (9-13s) */}
                {t >= PHASES.ANALYZING && t < PHASES.MAPPING && (
                  <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <div
                      className="absolute left-0 right-0 h-12 opacity-80"
                      style={{
                        background: "linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.45) 50%, transparent 100%)",
                        animation: "scan-line 1.6s ease-in-out infinite",
                      }}
                    />
                  </div>
                )}

                {/* Submitted overlay (>= 54s) */}
                {t >= PHASES.CONFIRMED && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a142b]/95 animate-fade-in-up">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-500/15 border border-emerald-400/50">
                        <CheckCircle2 size={32} className="text-emerald-300" />
                      </div>
                      <h2 className="font-serif-haven text-3xl font-semibold mt-4 text-zinc-100">Application submitted.</h2>
                      <p className="text-sm text-[#aab5cf] mt-2 font-mono">Confirmation ID: HCV-78214</p>
                      <p className="text-xs text-[#6d7a9a] mt-1">Filed by BB on behalf of Maria Hernandez · {(t / 1000).toFixed(1)}s</p>
                      {t >= PHASES.CTA && (
                        <Link
                          to="/login?mode=register"
                          className="haven-btn mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-gold haven-glow-gold animate-fade-in-up"
                          data-testid="demo-cta-after"
                        >
                          Use BB on a real case <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Animated BB cursor */}
                {currentFieldIdx >= 0 && (
                  <div
                    className="absolute z-20 pointer-events-none transition-all duration-500 ease-out"
                    data-cursor-field={FIELDS[currentFieldIdx]?.key}
                    style={{
                      // We position via the field element's getBoundingClientRect using ref-less approach:
                      // simpler: use a virtual grid mapping based on index.
                      top: `${cursorTop(currentFieldIdx)}%`,
                      left: `${cursorLeft(currentFieldIdx)}%`,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        background: "radial-gradient(circle, #f1d36b 0%, #d4af37 70%)",
                        boxShadow: "0 0 0 4px rgba(212,175,55,0.25), 0 0 18px rgba(212,175,55,0.7)",
                      }}
                    />
                  </div>
                )}

                {/* Fake agency form */}
                <div className="px-8 py-7 font-[Inter,system-ui] text-[#1f2937]">
                  <div className="flex items-center justify-between border-b pb-4 mb-5 border-zinc-200">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-indigo-700">Housing Authority of Santa Clara County</p>
                      <h3 className="text-lg font-bold mt-0.5 text-zinc-900">
                        Section 8 Housing Choice Voucher · Application
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Demo
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {FIELDS.map((f, i) => {
                      const v = values[f.key] || "";
                      const filledFully = v.length === f.value.length;
                      const isCurrent = i === currentFieldIdx;
                      return (
                        <div key={f.key} className={f.w}>
                          <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                            {f.label}
                            {filledFully && (
                              <CheckCircle2 size={11} className="inline-block ml-1.5 text-emerald-600" />
                            )}
                          </label>
                          {f.textarea ? (
                            <textarea
                              readOnly
                              value={v}
                              rows={2}
                              className={`w-full px-3 py-2 text-sm rounded-md border bg-white transition ${
                                isCurrent
                                  ? "border-amber-500 ring-2 ring-amber-300/40 shadow-sm"
                                  : filledFully
                                  ? "border-emerald-300 bg-emerald-50/40"
                                  : "border-zinc-300"
                              }`}
                            />
                          ) : (
                            <input
                              readOnly
                              value={v}
                              className={`w-full px-3 py-2 text-sm rounded-md border bg-white transition ${
                                isCurrent
                                  ? "border-amber-500 ring-2 ring-amber-300/40 shadow-sm"
                                  : filledFully
                                  ? "border-emerald-300 bg-emerald-50/40"
                                  : "border-zinc-300"
                              }`}
                              placeholder=""
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-[10px] text-zinc-500">By submitting, you certify the information is accurate.</p>
                    <button
                      className={`text-sm font-semibold px-6 py-2.5 rounded-full transition ${
                        t >= PHASES.SUBMITTING
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {t >= PHASES.SUBMITTING ? (
                        <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} /> Submitted</span>
                      ) : (
                        "Submit application"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BB chat + activity log */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Chat */}
            <div className="haven-card p-4" data-testid="demo-bb-chat">
              <div className="flex items-center gap-2 mb-3">
                <BBAvatar size={26} />
                <div>
                  <p className="text-sm font-medium">BB</p>
                  <p className="text-[10px] text-[#6d7a9a]">Claude Sonnet 4.5 · Live</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {t >= PHASES.LOADED && (
                  <BBBubble delay={0}>
                    Opening the Housing Authority portal now. I'll take it from here.
                  </BBBubble>
                )}
                {t >= PHASES.ANALYZING && (
                  <BBBubble delay={300}>
                    <span className="inline-flex items-center gap-1.5"><ScanLine size={11} /> Scanning the page…</span>
                  </BBBubble>
                )}
                {t >= PHASES.ANALYZING + 2500 && (
                  <BBBubble delay={0}>
                    Found <span className="text-[#f1d36b] font-medium">{FIELDS.length} fields</span>. All required.
                  </BBBubble>
                )}
                {t >= PHASES.MAPPING && (
                  <BBBubble delay={0}>
                    <span className="inline-flex items-center gap-1.5"><Wand2 size={11} /> Mapping Maria's profile to each field…</span>
                  </BBBubble>
                )}
                {t >= PHASES.MAPPING + 2400 && (
                  <BBBubble delay={0}>
                    Mapped <span className="text-emerald-300 font-medium">{FIELDS.length} of {FIELDS.length}</span>. Starting auto-fill.
                  </BBBubble>
                )}
                {t >= PHASES.SUBMITTING && (
                  <BBBubble delay={0}>
                    Reviewing… looks good. Submitting now.
                  </BBBubble>
                )}
                {t >= PHASES.CONFIRMED && (
                  <BBBubble delay={0}>
                    Done. Confirmation ID <span className="font-mono text-[#f1d36b]">HCV-78214</span>. Logged to Maria's case. <span className="text-emerald-300">Anything else?</span>
                  </BBBubble>
                )}
              </div>
            </div>

            {/* Activity log */}
            <div className="haven-card p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">BB activity</p>
              <div className="mt-2 space-y-1.5 font-mono text-[11px] max-h-[260px] overflow-y-auto">
                {log.length === 0 && <p className="text-[#6d7a9a]">Starting…</p>}
                {log.map((l) => (
                  <div key={l.id} className="flex items-start gap-2">
                    <span className="text-[#6d7a9a] shrink-0">{((Math.random() * 0.4) + 0.1).toFixed(2)}s</span>
                    <span className={l.tone === "ok" ? "text-emerald-300" : l.tone === "err" ? "text-rose-300" : "text-[#cfd8e8]"}>
                      {l.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="haven-card p-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Want this on your caseload?</p>
              <p className="text-sm text-[#cfd8e8] mt-2">It's free for residents and frontline teams. Two clicks to try it.</p>
              <Link
                to="/login?mode=register"
                data-testid="demo-cta-aside"
                className="haven-btn mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full btn-gold haven-glow-gold"
              >
                Get started <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#6d7a9a] mt-5 text-center max-w-3xl mx-auto">
          This page is a deterministic visual simulation of HAVEN's live BB Browser Control flow. The same actions run in a real headless Chromium for authenticated caseworkers in <Link to="/login" className="underline hover:text-[#f1d36b]">the caseworker dashboard</Link>.
        </p>
      </main>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          50% { transform: translateY(540px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function BBBubble({ children }) {
  return (
    <div className="bg-[#142244]/60 border border-[#1d2c4f] rounded-2xl rounded-tl-sm px-3 py-2 text-zinc-100 animate-fade-in-up max-w-[95%] leading-relaxed">
      {children}
    </div>
  );
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/** Approximate cursor positioning relative to the form area (% of viewport). */
function cursorLeft(idx) {
  const col = idx % 2;
  // textarea fields are full-width (col-span-2): email(2), address(5), income(10), reason(11)
  if ([2, 5, 10, 11].includes(idx)) return 30;
  return col === 0 ? 18 : 60;
}
function cursorTop(idx) {
  // Approx 12 fields, the form starts around y=18% inside the iframe area; each row ~6%
  // textarea fields take same row but full width:
  const rowMap = [0, 0, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7];
  const r = rowMap[idx] ?? idx;
  return 26 + r * 8.5;
}
