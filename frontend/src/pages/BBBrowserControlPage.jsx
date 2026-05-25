import React, { useEffect, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api, { BACKEND } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Globe,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  ArrowDown,
  ScanLine,
  Wand2,
  PlayCircle,
  StopCircle,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import BBChat from "@/components/BBChat";

function bbBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
      <Sparkles size={10} /> BB
    </span>
  );
}

export default function BBBrowserControlPage() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [url, setUrl] = useState("http://localhost:8001/demo/housing-form");
  const [screenshot, setScreenshot] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeUrl, setActiveUrl] = useState("");
  const [title, setTitle] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [autofill, setAutofill] = useState(null);
  const [filling, setFilling] = useState(false);
  const [log, setLog] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  useEffect(() => {
    api.get("/cases").then((r) => setCases(r.data || [])).catch(() => {});
  }, []);

  function pushLog(line, tone = "info") {
    setLog((l) => [
      { id: Date.now() + Math.random(), line, tone, ts: new Date().toLocaleTimeString() },
      ...l,
    ].slice(0, 40));
  }

  async function startSession() {
    setBusy(true);
    pushLog(`Launching headless Chromium → ${url}`, "info");
    try {
      const r = await api.post("/bb/browser/start", { url });
      setSessionId(r.data.session_id);
      setScreenshot(r.data.screenshot || "");
      setActiveUrl(r.data.url || "");
      setTitle(r.data.title || "");
      pushLog("Browser started. Awaiting analysis.", "ok");
    } catch (e) {
      pushLog(`Failed to start browser: ${e?.response?.data?.detail || e.message}`, "err");
    } finally {
      setBusy(false);
    }
  }

  async function stopSession() {
    if (!sessionId) return;
    setBusy(true);
    try {
      await api.post(`/bb/browser/stop?session_id=${encodeURIComponent(sessionId)}`);
      pushLog("Browser session closed.", "info");
      setSessionId(null);
      setScreenshot("");
      setActiveUrl("");
      setTitle("");
      setAnalysis(null);
      setAutofill(null);
    } finally {
      setBusy(false);
    }
  }

  async function doAction(action, payload = {}) {
    if (!sessionId) return;
    setBusy(true);
    try {
      const r = await api.post("/bb/browser/action", { session_id: sessionId, action, payload });
      setScreenshot(r.data.screenshot || screenshot);
      setActiveUrl(r.data.url || activeUrl);
      setTitle(r.data.title || title);
      pushLog(`${action}${payload?.url ? ` → ${payload.url}` : payload?.selector ? ` ${payload.selector}` : ""}`, r.data.result?.ok ? "ok" : "err");
      return r.data;
    } catch (e) {
      pushLog(`${action} failed: ${e?.response?.data?.detail || e.message}`, "err");
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    if (!sessionId) return;
    pushLog("BB analyzing live DOM…", "info");
    const r = await doAction("extract", {});
    if (!r) return;
    setAnalysis({ fields: r.result?.fields || [], form_html: r.result?.form_html || "" });
    pushLog(`Found ${r.result?.fields?.length || 0} form fields.`, "ok");
  }

  async function prepareAutofill() {
    if (!analysis?.form_html) {
      await analyze();
    }
    pushLog("BB mapping user/case data → form fields…", "info");
    try {
      const r = await api.post("/bb/forms/autofill", {
        form_html: analysis?.form_html || "",
        case_id: selectedCaseId || undefined,
      });
      setAutofill(r.data);
      pushLog(`Mapped ${Object.keys(r.data.mapping || {}).length} of ${r.data.field_count} fields.`, "ok");
    } catch (e) {
      pushLog(`Autofill prep failed: ${e?.response?.data?.detail || e.message}`, "err");
    }
  }

  async function executeAutofill() {
    if (!autofill?.mapping) return;
    setFilling(true);
    pushLog(`BB filling ${Object.keys(autofill.mapping).length} fields in real browser…`, "info");
    const r = await doAction("autofill_all", { mapping: autofill.mapping });
    if (r?.result?.filled) {
      pushLog(`Filled ${r.result.filled.length} fields successfully.`, "ok");
    }
    setFilling(false);
  }

  return (
    <AppLayout
      title="BB Browser Control"
      subtitle="BB drives a real headless Chromium, analyzes any web form, and fills it for you."
      actions={
        sessionId ? (
          <button
            data-testid="stop-browser-btn"
            onClick={stopSession}
            disabled={busy}
            className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
          >
            <StopCircle size={14} /> Stop session
          </button>
        ) : (
          <button
            data-testid="start-browser-btn"
            onClick={startSession}
            disabled={busy}
            className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white haven-glow-primary"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
            Start session
          </button>
        )
      }
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Live browser viewport */}
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="haven-card overflow-hidden">
            {/* address bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--haven-border)] bg-[#0d0d10]">
              <button
                data-testid="nav-back"
                disabled={!sessionId || busy}
                onClick={() => doAction("back")}
                className="haven-btn p-1.5 rounded-md border border-zinc-700/60 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                data-testid="nav-forward"
                disabled={!sessionId || busy}
                onClick={() => doAction("forward")}
                className="haven-btn p-1.5 rounded-md border border-zinc-700/60 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
              <button
                data-testid="nav-refresh"
                disabled={!sessionId || busy}
                onClick={() => doAction("navigate", { url: activeUrl || url })}
                className="haven-btn p-1.5 rounded-md border border-zinc-700/60 disabled:opacity-40"
              >
                <RefreshCw size={14} />
              </button>
              <div className="flex-1 flex items-center bg-zinc-900/60 border border-zinc-700/60 rounded-full px-3">
                <Globe size={12} className="text-zinc-500 mr-2" />
                <input
                  data-testid="browser-url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (sessionId) doAction("navigate", { url });
                      else startSession();
                    }
                  }}
                  className="flex-1 bg-transparent py-1.5 text-sm focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 font-mono">{title?.slice(0, 22)}</span>
              </div>
              <button
                data-testid="navigate-btn"
                disabled={busy}
                onClick={() => (sessionId ? doAction("navigate", { url }) : startSession())}
                className="haven-btn text-xs px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
              >
                Go
              </button>
            </div>

            {/* viewport */}
            <div className="relative bg-[#0a0a0c]" style={{ aspectRatio: "16 / 10" }}>
              {screenshot ? (
                <img
                  data-testid="browser-screenshot"
                  src={`data:image/jpeg;base64,${screenshot}`}
                  alt="BB browser view"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 text-sm gap-3">
                  <Globe size={36} className="text-zinc-700" />
                  <p>{sessionId ? "Loading…" : "Start a session to drive a real headless Chromium."}</p>
                  {!sessionId && (
                    <button
                      data-testid="start-browser-cta"
                      onClick={startSession}
                      className="haven-btn text-sm px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white haven-glow-primary"
                    >
                      Start with demo form
                    </button>
                  )}
                </div>
              )}
              {busy && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-[11px] text-blue-200 inline-flex items-center gap-1 border border-blue-500/30">
                  <Loader2 size={11} className="animate-spin" /> BB acting…
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-t border-[var(--haven-border)] bg-[#0d0d10]">
              <button
                data-testid="scroll-down-btn"
                disabled={!sessionId || busy}
                onClick={() => doAction("scroll", { dy: 400 })}
                className="haven-btn text-xs px-3 py-1.5 rounded-full border border-zinc-700/60 hover:bg-zinc-800/50 inline-flex items-center gap-1 disabled:opacity-40"
              >
                <ArrowDown size={12} /> Scroll
              </button>
              <button
                data-testid="analyze-btn"
                disabled={!sessionId || busy}
                onClick={analyze}
                className="haven-btn text-xs px-3 py-1.5 rounded-full border border-zinc-700/60 hover:bg-zinc-800/50 inline-flex items-center gap-1 disabled:opacity-40"
              >
                <ScanLine size={12} /> Analyze form
              </button>
              <button
                data-testid="prepare-autofill-btn"
                disabled={!sessionId || busy || !analysis}
                onClick={prepareAutofill}
                className="haven-btn text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 inline-flex items-center gap-1 disabled:opacity-40"
              >
                <Wand2 size={12} /> Prepare autofill
              </button>
              <button
                data-testid="execute-autofill-btn"
                disabled={!sessionId || busy || !autofill}
                onClick={executeAutofill}
                className="haven-btn text-xs px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white inline-flex items-center gap-1 haven-glow-primary disabled:opacity-40"
              >
                {filling ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                BB autofill live
              </button>
              <button
                data-testid="submit-form-btn"
                disabled={!sessionId || busy || !autofill}
                onClick={() => doAction("click", { selector: 'button[type="submit"]' })}
                className="haven-btn text-xs px-3 py-1.5 rounded-full border border-zinc-700/60 hover:bg-zinc-800/50 inline-flex items-center gap-1 disabled:opacity-40"
              >
                <CheckCircle2 size={12} /> Submit
              </button>
              <span className="ml-auto text-[10px] text-zinc-500 font-mono truncate max-w-[40%]">{activeUrl}</span>
            </div>
          </div>

          {/* Mapping table */}
          {autofill && (
            <div className="haven-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">BB's autofill plan</p>
                  <h3 className="font-display text-lg font-semibold">
                    {Object.keys(autofill.mapping || {}).length} of {autofill.field_count} fields ready
                  </h3>
                </div>
                {autofill.missing_required?.length > 0 && (
                  <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
                    {autofill.missing_required.length} need your input
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {Object.entries(autofill.mapping || {}).map(([selector, info]) => (
                  <div key={selector} className="border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-900/40">
                    <p className="text-[11px] text-zinc-500 font-mono truncate">{selector}</p>
                    <p className="text-sm text-zinc-100 truncate">
                      <span className="text-zinc-400">{info.field_label || "field"}:</span> {String(info.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="haven-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">Autofill source</p>
              {bbBadge()}
            </div>
            <h3 className="font-display text-lg font-semibold mt-1">Whose data should BB use?</h3>
            <p className="text-xs text-zinc-500 mt-1">Pick a case. BB will pull resident profile + intake data.</p>
            <select
              data-testid="case-select"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="mt-3 w-full bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">My own profile</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.resident_name} — {c.title.slice(0, 36)}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                data-testid="preset-housing"
                onClick={() => setUrl("http://localhost:8001/demo/housing-form")}
                className="haven-btn text-xs px-3 py-2 rounded-lg border border-zinc-700/60 hover:bg-zinc-800/50"
              >
                Demo housing form
              </button>
              <a
                target="_blank"
                rel="noreferrer"
                href={`${BACKEND}/demo/housing-form`}
                className="haven-btn text-xs px-3 py-2 rounded-lg border border-zinc-700/60 hover:bg-zinc-800/50 inline-flex items-center justify-center gap-1"
              >
                <ExternalLink size={11} /> Open
              </a>
            </div>
          </div>

          {/* Activity log */}
          <div className="haven-card p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">BB activity</p>
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
              {log.length === 0 && <p className="text-zinc-600">No actions yet.</p>}
              {log.map((l) => (
                <div key={l.id} className="flex items-start gap-2">
                  <span className="text-zinc-600 shrink-0">{l.ts}</span>
                  <span
                    className={
                      l.tone === "ok"
                        ? "text-emerald-300"
                        : l.tone === "err"
                        ? "text-rose-300"
                        : "text-zinc-300"
                    }
                  >
                    {l.line}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <BBChat
            sessionId={`bb-browser-chat-${user?.id}`}
            contextLabel="Browser Control"
            compact
          />
        </div>
      </div>
    </AppLayout>
  );
}
