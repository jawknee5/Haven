import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { ScrollText, Search } from "lucide-react";

function badge(action) {
  if (action?.startsWith("integration")) return "bg-violet-500/15 text-violet-300 border-violet-500/30";
  if (action?.startsWith("agency")) return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  if (action?.startsWith("user")) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState("");

  async function load() {
    const r = await api.get("/admin/audit", { params: { action: q || undefined } });
    setLogs(r.data || []);
    const s = await api.get("/admin/audit/stats");
    setStats(s.data);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <AppLayout title="Audit Log" subtitle="Every privileged action recorded — searchable and exportable.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="haven-card p-4"><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">Total events</p><p className="font-display text-2xl mt-1">{stats?.total ?? "—"}</p></div>
        {(stats?.by_action || []).slice(0, 3).map((b) => (
          <div key={b.action} className="haven-card p-4"><p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">{b.action}</p><p className="font-display text-2xl mt-1">{b.count}</p></div>
        ))}
      </div>
      <div className="flex items-end gap-3 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[#6d7a9a]" />
          <input data-testid="audit-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter action (e.g. integration, user, agency)…" className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-[#d4af37]/60 w-72" />
        </div>
        <button data-testid="audit-apply" onClick={load} className="haven-btn text-sm px-4 py-1.5 rounded-full btn-outline-navy">Apply</button>
      </div>
      <div className="haven-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0a142b]/70 text-[10px] uppercase tracking-wider text-[#aab5cf]">
            <tr>
              <th className="px-4 py-3 text-left">When</th>
              <th className="px-4 py-3 text-left">Actor</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Target</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-[var(--haven-border)] hover:bg-[#0d1a36]/40">
                <td className="px-4 py-3 text-[#aab5cf] font-mono text-xs">{new Date(l.created_at).toLocaleString()}</td>
                <td className="px-4 py-3"><div className="font-medium">{l.actor_name}</div><div className="text-[10px] uppercase text-[#aab5cf]">{l.actor_role}</div></td>
                <td className="px-4 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge(l.action)}`}>{l.action}</span></td>
                <td className="px-4 py-3 hidden md:table-cell text-[#aab5cf] font-mono text-xs">{l.target || "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-[#aab5cf] font-mono text-xs">{l.meta && Object.keys(l.meta).length ? JSON.stringify(l.meta) : "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-[#aab5cf]">No events yet — privileged actions will appear here.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
