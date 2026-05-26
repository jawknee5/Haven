import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Home, ShieldCheck, Utensils, HeartPulse, Award, FileText, Briefcase, Users,
  Shield, Scale, Baby, Link as LinkIcon, Activity, Clock, CheckCircle2, AlertTriangle,
  Search, Filter, Globe, Plug, PlugZap, Zap,
} from "lucide-react";

const ICONS = {
  home: Home,
  "shield-check": ShieldCheck,
  utensils: Utensils,
  "heart-pulse": HeartPulse,
  award: Award,
  "file-text": FileText,
  briefcase: Briefcase,
  users: Users,
  shield: Shield,
  scale: Scale,
  baby: Baby,
  "id-card": ShieldCheck,
};

const CATEGORY_TONE = {
  housing: "bg-blue-500/12 text-blue-300 border-blue-500/30",
  benefits: "bg-emerald-500/12 text-emerald-300 border-emerald-500/30",
  food: "bg-amber-500/12 text-amber-300 border-amber-500/30",
  health: "bg-rose-500/12 text-rose-300 border-rose-500/30",
  identity: "bg-violet-500/12 text-violet-300 border-violet-500/30",
  employment: "bg-cyan-500/12 text-cyan-300 border-cyan-500/30",
  family: "bg-pink-500/12 text-pink-300 border-pink-500/30",
  legal: "bg-purple-500/12 text-purple-300 border-purple-500/30",
};

function IntegrationCard({ integ, onToggle, canToggle, oauthMeta, onConnect, onDisconnect }) {
  const Icon = ICONS[integ.icon] || LinkIcon;
  const tone = CATEGORY_TONE[integ.category] || "bg-slate-500/12 text-slate-300 border-slate-500/30";
  const meta = oauthMeta || {};
  return (
    <div data-testid={`integration-${integ.code}`} className="haven-card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-11 h-11 rounded-lg border inline-flex items-center justify-center ${tone}`}>
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${tone}`}>{integ.category}</span>
          {integ.connected ? (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1"><PlugZap size={10} /> Connected</span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-400 border border-zinc-500/30 inline-flex items-center gap-1"><Plug size={10} /> Offline</span>
          )}
          {meta.mode === "live" ? (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 inline-flex items-center gap-1" title="Live OAuth env configured"><Zap size={10} /> Live</span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-500/12 text-slate-300 border border-slate-500/30 inline-flex items-center gap-1" title="Using simulated adapter">Sim</span>
          )}
          {meta.authorized && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">OAuth ✓</span>}
        </div>
      </div>
      <h3 className="font-display text-base font-semibold mt-3">{integ.name}</h3>
      <p className="text-xs text-[#aab5cf] mt-0.5">{integ.agency}</p>
      <p className="text-sm text-zinc-300 mt-3 leading-relaxed flex-1">{integ.description}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">SLA</p><p className="text-sm font-mono">{integ.sla_days}d</p></div>
        <div><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">Uptime</p><p className="text-sm font-mono">{integ.uptime}%</p></div>
        <div><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">Submits</p><p className="text-sm font-mono">{integ.submissions_count}</p></div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--haven-border)] text-[10px] text-[#aab5cf] flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1"><Globe size={10} />{integ.jurisdiction}</span>
        <span className="font-mono truncate">{integ.contact}</span>
      </div>
      {canToggle && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            data-testid={`toggle-${integ.code}`}
            onClick={() => onToggle(integ)}
            className={`haven-btn text-xs px-3 py-2 rounded-full flex-1 ${integ.connected ? "btn-outline-navy" : "btn-gold"}`}
          >
            {integ.connected ? "Disconnect" : "Connect"}
          </button>
          {meta.mode === "live" && !meta.authorized && (
            <button data-testid={`oauth-${integ.code}`} onClick={() => onConnect(integ)} className="haven-btn text-xs px-3 py-2 rounded-full btn-gold inline-flex items-center gap-1"><Zap size={11} /> OAuth Connect</button>
          )}
          {meta.authorized && (
            <button data-testid={`oauth-revoke-${integ.code}`} onClick={() => onDisconnect(integ)} className="haven-btn text-xs px-3 py-2 rounded-full btn-outline-navy">Revoke OAuth</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage({ adminMode = false }) {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [oauthMetas, setOauthMetas] = useState({});
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([api.get("/integrations"), api.get("/integrations/_/stats")]);
      setList(r.data || []);
      setStats(s.data);
      // Fetch OAuth meta for each integration (small parallel batch)
      const metas = await Promise.all(
        (r.data || []).map((i) => api.get(`/integrations/${i.code}/oauth/meta`).then((x) => [i.code, x.data]).catch(() => [i.code, null]))
      );
      setOauthMetas(Object.fromEntries(metas.filter(([_, v]) => v)));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function toggle(integ) {
    try {
      await api.patch(`/integrations/${integ.code}/toggle`, { connected: !integ.connected });
      toast.success(`${integ.code} — ${!integ.connected ? "connected" : "disconnected"}`);
      load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  }

  async function startOAuth(integ) {
    try {
      const r = await api.get(`/integrations/${integ.code}/oauth/start`);
      toast.success(`Redirecting to ${integ.agency}…`);
      window.location.href = r.data.authorize_url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || "OAuth start failed");
    }
  }

  async function disconnectOAuth(integ) {
    try {
      await api.post(`/integrations/${integ.code}/oauth/disconnect`);
      toast.success(`OAuth revoked for ${integ.code}`);
      load();
    } catch (e) { toast.error("Revoke failed"); }
  }

  const filtered = useMemo(() => list.filter((i) =>
    (!cat || i.category === cat) &&
    (!q || i.name.toLowerCase().includes(q.toLowerCase()) || (i.agency || "").toLowerCase().includes(q.toLowerCase()))
  ), [list, q, cat]);

  const categories = useMemo(() => Array.from(new Set(list.map((i) => i.category))), [list]);

  return (
    <AppLayout
      title={adminMode ? "Agency Integrations" : "Agency Bridge"}
      subtitle="Legacy bridge to federal, state, and county systems — multi-agency in one console."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-[#aab5cf]"><LinkIcon size={14} /><p className="text-[10px] uppercase tracking-wider">Total</p></div><p className="font-display text-2xl mt-1">{stats?.total_integrations ?? "—"}</p></div>
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-emerald-300"><PlugZap size={14} /><p className="text-[10px] uppercase tracking-wider">Connected</p></div><p className="font-display text-2xl mt-1">{stats?.connected ?? "—"}</p></div>
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-blue-300"><Activity size={14} /><p className="text-[10px] uppercase tracking-wider">Submissions</p></div><p className="font-display text-2xl mt-1">{stats?.submissions_total ?? "—"}</p></div>
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-amber-300"><Clock size={14} /><p className="text-[10px] uppercase tracking-wider">Pending</p></div><p className="font-display text-2xl mt-1">{stats?.submissions_pending ?? "—"}</p></div>
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-violet-300"><Zap size={14} /><p className="text-[10px] uppercase tracking-wider">Live cfg</p></div><p className="font-display text-2xl mt-1">{stats?.live_configured ?? 0}</p><p className="text-[10px] text-zinc-500">OAuth env set</p></div>
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-emerald-300"><PlugZap size={14} /><p className="text-[10px] uppercase tracking-wider">Authorized</p></div><p className="font-display text-2xl mt-1">{stats?.live_authorized ?? 0}</p><p className="text-[10px] text-zinc-500">tokens stored</p></div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[#6d7a9a]" />
          <input data-testid="integ-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agency…" className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-[#d4af37]/60 w-56" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button data-testid="cat-all" onClick={() => setCat("")} className={`text-xs px-3 py-1 rounded-full border haven-btn ${cat === "" ? "bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f1d36b]" : "border-[#1d2c4f] text-[#aab5cf]"}`}>All</button>
          {categories.map((c) => (
            <button key={c} data-testid={`cat-${c}`} onClick={() => setCat(c)} className={`text-xs px-3 py-1 rounded-full border haven-btn capitalize ${cat === c ? "bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f1d36b]" : "border-[#1d2c4f] text-[#aab5cf]"}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-xl shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((i) => <IntegrationCard key={i.code} integ={i} onToggle={toggle} canToggle={adminMode} oauthMeta={oauthMetas[i.code]} onConnect={startOAuth} onDisconnect={disconnectOAuth} />)}
        </div>
      )}
      {filtered.length === 0 && !loading && (
        <p className="text-sm text-zinc-500 text-center py-12">No integrations match your filter.</p>
      )}
    </AppLayout>
  );
}
