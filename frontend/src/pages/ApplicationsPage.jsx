import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import { Send, RefreshCw, CheckCircle2, Clock, AlertTriangle, XCircle, Building2 } from "lucide-react";

const STATUS_TONE = {
  submitted: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  under_review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  needs_action: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  denied: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};
const STATUS_ICON = {
  submitted: Send,
  under_review: Clock,
  needs_action: AlertTriangle,
  approved: CheckCircle2,
  denied: XCircle,
};

export default function ApplicationsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [syncing, setSyncing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/integrations/submissions");
      setSubmissions(r.data || []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function sync(id) {
    setSyncing(id);
    try {
      await api.post(`/integrations/submissions/${id}/sync`);
      toast.success("Synced with agency");
      load();
    } catch (e) { toast.error("Sync failed"); } finally { setSyncing(null); }
  }

  const filtered = useMemo(() => submissions.filter((s) => filter === "all" ? true : s.status === filter), [submissions, filter]);

  return (
    <AppLayout title="Applications" subtitle="Every legacy-agency submission tracked in one place.">
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "submitted", "under_review", "needs_action", "approved", "denied"].map((f) => (
          <button key={f} data-testid={`app-filter-${f}`} onClick={() => setFilter(f)} className={`text-xs px-3 py-1 rounded-full border haven-btn capitalize ${filter === f ? "bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f1d36b]" : "border-[#1d2c4f] text-[#aab5cf]"}`}>{f.replace("_", " ")}</button>
        ))}
      </div>
      {loading && <div className="grid gap-3">{[...Array(3)].map((_, i) => <div key={`sk-${i}`} className="h-28 rounded-xl shimmer" />)}</div>}
      <div className="space-y-3">
        {filtered.map((s) => {
          const Icon = STATUS_ICON[s.status] || Send;
          return (
            <div key={s.id} data-testid={`sub-${s.id}`} className="haven-card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"><Building2 size={18} className="text-blue-300" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-semibold">{s.integration_name}</p>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${STATUS_TONE[s.status] || ""}`}><Icon size={10} /> {s.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-[#aab5cf] mt-0.5">{s.agency_name}</p>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div><p className="text-[10px] uppercase text-[#aab5cf]">Confirmation</p><p className="font-mono">{s.confirmation_id}</p></div>
                    <div><p className="text-[10px] uppercase text-[#aab5cf]">Submitted</p><p className="font-mono">{new Date(s.submitted_at).toLocaleDateString()}</p></div>
                    <div><p className="text-[10px] uppercase text-[#aab5cf]">Response by</p><p className="font-mono">{s.expected_response_by ? new Date(s.expected_response_by).toLocaleDateString() : "—"}</p></div>
                    <div><p className="text-[10px] uppercase text-[#aab5cf]">Updated</p><p className="font-mono">{new Date(s.last_status_update).toLocaleString()}</p></div>
                  </div>
                  {s.missing_fields?.length > 0 && (
                    <p className="mt-2 text-xs text-amber-300 inline-flex items-center gap-1"><AlertTriangle size={11} /> Missing: {s.missing_fields.join(", ")}</p>
                  )}
                </div>
                <button data-testid={`sync-${s.id}`} disabled={syncing === s.id} onClick={() => sync(s.id)} className="haven-btn inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full btn-outline-navy disabled:opacity-50">
                  <RefreshCw size={11} className={syncing === s.id ? "animate-spin" : ""} /> Sync status
                </button>
              </div>
              {s.timeline && s.timeline.length > 1 && (
                <div className="mt-3 pt-3 border-t border-[var(--haven-border)]">
                  <p className="text-[10px] uppercase tracking-wider text-[#aab5cf] mb-2">Timeline</p>
                  <ul className="space-y-1">
                    {s.timeline.slice(-4).reverse().map((tl, idx) => (
                      <li key={`${tl.ts}-${tl.event}-${idx}`} className="text-xs text-[#aab5cf] flex items-start gap-2">
                        <span className="font-mono text-[10px] text-zinc-500 shrink-0">{new Date(tl.ts).toLocaleString()}</span>
                        <span className="capitalize text-zinc-200">{tl.event.replace("_", " ")}</span>
                        <span className="text-zinc-400">— {tl.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="haven-card p-12 text-center text-zinc-500">
            <Send size={28} className="mx-auto text-[#aab5cf] mb-2" />
            No applications yet — your caseworker can submit on your behalf to any of the 12 connected agencies.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
