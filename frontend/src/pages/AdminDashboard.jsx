import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import ResourceMapWidget from "@/components/ResourceMapWidget";
import BBChat from "@/components/BBChat";
import {
  Users, Briefcase, CheckCircle2, MapPin, ShieldCheck, Layers, ScrollText,
  Plug, PlugZap, Activity, AlertTriangle, ArrowRight, Send,
} from "lucide-react";

function Card({ label, value, icon: Icon, tone = "blue", sub }) {
  const toneMap = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    gold: "bg-[#d4af37]/12 text-[#f1d36b] border-[#d4af37]/35",
  };
  return (
    <div className="haven-card p-4" data-testid={`admin-stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className={`w-9 h-9 rounded-lg border inline-flex items-center justify-center ${toneMap[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="font-display text-2xl font-semibold mt-3">{value}</p>
      <p className="text-xs text-[#aab5cf] mt-1">{label}</p>
      {sub && <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [integStats, setIntegStats] = useState(null);
  const [auditStats, setAuditStats] = useState(null);
  const [recentAudit, setRecentAudit] = useState([]);
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/admin"),
      api.get("/integrations/_/stats"),
      api.get("/admin/audit/stats"),
      api.get("/admin/audit?limit=6"),
      api.get("/integrations"),
    ]).then(([a, i, as, au, ig]) => {
      setStats(a.data);
      setIntegStats(i.data);
      setAuditStats(as.data);
      setRecentAudit(au.data || []);
      setIntegrations(ig.data || []);
    }).catch(() => {});
  }, []);

  const offline = integrations.filter((i) => !i.connected);
  const highCategories = integStats?.by_category ? Object.entries(integStats.by_category).sort((a,b)=>b[1]-a[1]).slice(0,5) : [];

  return (
    <AppLayout
      title="Admin Console"
      subtitle="System health, user management, integrations, and audit — all at a glance."
      actions={
        <>
          <Link to="/admin/integrations" data-testid="to-integrations" className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full btn-gold"><Layers size={13} /> Integrations</Link>
          <Link to="/admin/users" data-testid="to-users" className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full btn-outline-navy"><Users size={13} /> Users</Link>
          <Link to="/admin/audit" data-testid="to-audit" className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full btn-outline-navy"><ScrollText size={13} /> Audit</Link>
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card label="Total users" value={stats?.total_users ?? "—"} icon={Users} tone="blue" sub={`${stats?.residents ?? 0} residents · ${stats?.caseworkers ?? 0} caseworkers`} />
        <Card label="Active cases" value={stats?.active_cases ?? "—"} icon={Briefcase} tone="violet" sub={`${stats?.total_cases ?? 0} total · ${stats?.resolved_cases ?? 0} resolved`} />
        <Card label="Integrations" value={`${integStats?.connected ?? 0}/${integStats?.total_integrations ?? 0}`} icon={Layers} tone="emerald" sub="Connected" />
        <Card label="Submissions" value={integStats?.submissions_total ?? "—"} icon={Send} tone="amber" sub={`${integStats?.submissions_pending ?? 0} pending`} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Operational column */}
        <div className="col-span-12 xl:col-span-7 space-y-4">
          <div className="haven-card p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">System</p>
            <h2 className="font-display text-xl font-semibold mt-1">Operational snapshot</h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300">API</p>
                <p className="text-sm font-medium mt-1">All systems normal</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300">BB AI</p>
                <p className="text-sm font-medium mt-1">Claude Sonnet 4.5 active</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300">Browser Engine</p>
                <p className="text-sm font-medium mt-1">Playwright ready</p>
              </div>
            </div>
          </div>

          {/* Integration health */}
          <div className="haven-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Legacy Bridge</p>
                <h3 className="font-display text-lg font-semibold mt-1">Agency Integration Health</h3>
              </div>
              <Link to="/admin/integrations" data-testid="manage-integrations" className="haven-btn text-xs px-3 py-1 rounded-full btn-outline-navy inline-flex items-center gap-1">Manage <ArrowRight size={11} /></Link>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="rounded-lg border border-[var(--haven-border)] p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">Connected</p><p className="font-display text-xl mt-1 text-emerald-300">{integStats?.connected ?? 0}</p></div>
              <div className="rounded-lg border border-[var(--haven-border)] p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">Offline</p><p className="font-display text-xl mt-1 text-amber-300">{integStats?.disconnected ?? 0}</p></div>
              <div className="rounded-lg border border-[var(--haven-border)] p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">Approved</p><p className="font-display text-xl mt-1 text-emerald-300">{integStats?.submissions_approved ?? 0}</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {highCategories.map(([cat, n]) => (
                <span key={cat} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--haven-border)] text-[#aab5cf]">{cat}: {n}</span>
              ))}
            </div>
            {offline.length > 0 && (
              <div className="mt-3 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-200 text-xs">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                {offline.length} integration(s) currently offline: {offline.map(o => o.code).join(", ")}
              </div>
            )}
          </div>

          {/* Audit feed */}
          <div className="haven-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Audit</p>
                <h3 className="font-display text-lg font-semibold mt-1">Recent privileged actions</h3>
              </div>
              <Link to="/admin/audit" data-testid="to-audit-2" className="haven-btn text-xs px-3 py-1 rounded-full btn-outline-navy inline-flex items-center gap-1">View all <ArrowRight size={11} /></Link>
            </div>
            {recentAudit.length === 0 ? (
              <p className="text-xs text-zinc-500">No privileged actions yet. Actions like role changes, integration toggles, and submissions will appear here.</p>
            ) : (
              <ul className="space-y-2">
                {recentAudit.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-[10px] text-zinc-500 w-36 shrink-0">{new Date(l.created_at).toLocaleString()}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">{l.action}</span>
                    <span className="text-zinc-200 truncate">{l.actor_name}</span>
                    <span className="text-zinc-500 font-mono truncate">{l.target}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ResourceMapWidget height={300} />
        </div>

        {/* Right column: BB */}
        <div className="col-span-12 xl:col-span-5">
          <BBChat sessionId={`bb-admin-${user?.id}`} contextLabel="Admin" compact />
        </div>
      </div>
    </AppLayout>
  );
}
