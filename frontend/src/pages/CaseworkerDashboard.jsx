import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ResourceMapWidget from "@/components/ResourceMapWidget";
import BBChat from "@/components/BBChat";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Briefcase,
  ListTodo,
  ShieldAlert,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Globe,
  CalendarClock,
  Sparkles,
} from "lucide-react";

const STATUSES = ["all", "new", "enriched", "routed", "active", "resolved", "closed"];

function Metric({ icon: Icon, label, value, sub, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  };
  return (
    <div className="haven-card p-4" data-testid={`metric-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className={`w-9 h-9 rounded-lg border inline-flex items-center justify-center ${toneMap[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="font-display text-2xl font-semibold mt-3">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function CaseRow({ c }) {
  const statusClass = `status-${c.status}`;
  return (
    <Link
      to={`/caseworker/cases/${c.id}`}
      data-testid={`case-row-${c.id}`}
      className="haven-card flex items-center gap-4 p-3 hover:border-zinc-600 transition haven-btn"
    >
      <div className="w-1 h-12 rounded-full urgency-bar shrink-0" style={{ background: c.urgency_score >= 80 ? "#ef4444" : c.urgency_score >= 60 ? "#f59e0b" : "#10b981" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{c.title}</p>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${statusClass}`}>{c.status}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">
          {c.resident_name} · <span className="capitalize">{c.category}</span>
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-sm">{c.urgency_score}</p>
        <p className="text-[10px] text-zinc-500">urgency</p>
      </div>
      <ArrowRight size={14} className="text-zinc-600 shrink-0" />
    </Link>
  );
}

export default function CaseworkerDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [c, a] = await Promise.all([api.get("/cases"), api.get("/analytics/caseworker")]);
        if (mounted) {
          setCases(c.data || []);
          setAnalytics(a.data || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return cases.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        (!q ||
          c.title.toLowerCase().includes(q.toLowerCase()) ||
          (c.resident_name || "").toLowerCase().includes(q.toLowerCase()))
    );
  }, [cases, filter, q]);

  return (
    <AppLayout
      title={`Hello, ${user?.name?.split(" ")[0] || "Caseworker"}.`}
      subtitle="Your queue, your tools, and BB — all in one place."
      actions={
        <>
          <Link
            to="/caseworker/bb-browser"
            data-testid="open-bb-browser-btn"
            className="haven-btn inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white haven-glow-primary"
          >
            <Globe size={14} /> BB Browser Control
          </Link>
          <Link
            to="/book"
            data-testid="book-session-btn"
            className="haven-btn inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-zinc-700/70 hover:bg-zinc-800/60"
          >
            <CalendarClock size={14} /> Book a session
          </Link>
        </>
      }
    >
      {/* Top metric strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric icon={Briefcase} label="Total cases" value={analytics?.total_cases ?? "—"} tone="blue" />
        <Metric icon={TrendingUp} label="Active" value={analytics?.active_cases ?? "—"} tone="emerald" />
        <Metric icon={ListTodo} label="Open tasks" value={analytics?.open_tasks ?? "—"} tone="amber" />
        <Metric icon={ShieldAlert} label="High urgency" value={analytics?.high_urgency ?? "—"} tone="rose" />
      </section>

      <section className="grid grid-cols-12 gap-6">
        {/* Cases column */}
        <div className="col-span-12 xl:col-span-7 space-y-4">
          <div className="haven-card p-4">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">Case queue</p>
                <h2 className="font-display text-xl font-semibold mt-1">Active caseload</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
                  <input
                    data-testid="case-search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search…"
                    className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-500/60 w-44"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  data-testid={`case-filter-${s}`}
                  onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1 rounded-full border haven-btn capitalize ${
                    filter === s
                      ? "bg-blue-500/15 border-blue-500/40 text-blue-200"
                      : "border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-lg shimmer" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filtered.map((c) => (
                  <CaseRow key={c.id} c={c} />
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-zinc-500 px-2 py-6 text-center">No cases match.</p>
                )}
              </div>
            )}
          </div>

          {/* Quick tools */}
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              to="/caseworker/bb-browser"
              data-testid="quick-bb-browser"
              className="haven-card p-4 hover:border-blue-500/50 transition haven-btn block"
            >
              <Globe size={16} className="text-blue-300" />
              <p className="font-medium mt-3 text-sm">BB Browser Control</p>
              <p className="text-xs text-zinc-500 mt-1">Drive a real headless browser and let BB fill agency forms for you.</p>
            </Link>
            <Link
              to="/caseworker/forms"
              data-testid="quick-form-builder"
              className="haven-card p-4 hover:border-blue-500/50 transition haven-btn block"
            >
              <Sparkles size={16} className="text-blue-300" />
              <p className="font-medium mt-3 text-sm">Form Builder</p>
              <p className="text-xs text-zinc-500 mt-1">Recreate any agency form with logic, validation, and auto-mapping.</p>
            </Link>
            <Link
              to="/resources"
              data-testid="quick-resources"
              className="haven-card p-4 hover:border-blue-500/50 transition haven-btn block"
            >
              <Filter size={16} className="text-blue-300" />
              <p className="font-medium mt-3 text-sm">Resource Directory</p>
              <p className="text-xs text-zinc-500 mt-1">Live availability for shelter, food, health, legal, and crisis.</p>
            </Link>
          </div>
        </div>

        {/* Right column: map + BB chat */}
        <div className="col-span-12 xl:col-span-5 space-y-4">
          <ResourceMapWidget height={300} />
          <BBChat sessionId={`bb-cw-${user?.id}`} contextLabel="Caseworker" compact />
        </div>
      </section>
    </AppLayout>
  );
}
