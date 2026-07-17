import React, { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Layers, Send, Loader2, ChevronDown, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Submit-to-Agency panel for use on Case Detail page.
 * Shows connected integrations relevant to the case category, supports submission.
 */
export default function AgencySubmitPanel({ caseData }) {
  const [integrations, setIntegrations] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [payload, setPayload] = useState({});

  const refreshSubs = useCallback(async () => {
    if (!caseData?.id) return;
    const r = await api.get(`/integrations/submissions?case_id=${caseData.id}`);
    setSubmissions(r.data || []);
  }, [caseData?.id]);

  useEffect(() => {
    api.get("/integrations").then((r) => setIntegrations((r.data || []).filter((i) => i.connected)));
    refreshSubs();
  }, [caseData?.id, refreshSubs]);

  function autoFillFromCase(integ) {
    const intake = caseData?.intake_data || {};
    const filled = {};
    integ.required_fields.forEach((f) => {
      if (f === "full_name") filled[f] = caseData?.resident_name || "";
      else if (intake[f] != null) filled[f] = String(intake[f]);
      else filled[f] = "";
    });
    setPayload(filled);
  }

  function selectIntegration(integ) {
    setOpen(integ.code === open?.code ? null : integ);
    if (integ.code !== open?.code) autoFillFromCase(integ);
  }

  async function submit() {
    if (!open) return;
    setBusy(true);
    try {
      const r = await api.post("/integrations/submit", {
        integration_code: open.code,
        case_id: caseData.id,
        payload,
        notes: `Submitted from case ${caseData.title}`,
      });
      toast.success(`Submitted to ${open.name} (${r.data.confirmation_id})`);
      setOpen(null);
      setPayload({});
      refreshSubs();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  const category = caseData?.category;
  const grouped = integrations.reduce((acc, i) => {
    const key = i.category === category ? "recommended" : "others";
    (acc[key] = acc[key] || []).push(i);
    return acc;
  }, {});

  return (
    <div className="haven-card p-5" data-testid="agency-submit-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-medium flex items-center gap-2"><Layers size={16} className="text-violet-300" /> Submit to Agencies</h3>
        <span className="text-xs text-zinc-500">{integrations.length} live</span>
      </div>
      <p className="text-xs text-[#aab5cf] mb-3">Send this case to legacy systems via the HAVEN bridge.</p>
      {["recommended", "others"].map((group) => grouped[group] && (
        <div key={group} className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-[#aab5cf] mb-2">{group}</p>
          <div className="space-y-2">
            {grouped[group].map((i) => (
              <div key={i.code} className="border border-[var(--haven-border)] rounded-lg overflow-hidden">
                <button data-testid={`pick-${i.code}`} onClick={() => selectIntegration(i)} className="w-full px-3 py-2 text-left text-sm hover:bg-[#142244]/40 flex items-center justify-between gap-2">
                  <span className="flex-1 truncate"><span className="font-medium">{i.name}</span> <span className="text-[10px] text-[#aab5cf]">· {i.agency}</span></span>
                  <ChevronDown size={14} className={`text-[#aab5cf] transition ${open?.code === i.code ? "rotate-180" : ""}`} />
                </button>
                {open?.code === i.code && (
                  <div className="p-3 bg-[#0a142b]/60 border-t border-[var(--haven-border)] space-y-2">
                    <p className="text-[11px] text-[#aab5cf]">Required fields (auto-mapped from case where possible):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {i.required_fields.map((f) => (
                        <div key={f}>
                          <label className="text-[10px] uppercase tracking-wider text-[#aab5cf]">{f.replace(/_/g, " ")}</label>
                          <input data-testid={`field-${f}`} value={payload[f] || ""} onChange={(e) => setPayload({ ...payload, [f]: e.target.value })} className="w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#d4af37]/60" />
                        </div>
                      ))}
                    </div>
                    <button data-testid={`submit-${i.code}`} disabled={busy} onClick={submit} className="haven-btn inline-flex items-center gap-1 text-xs px-4 py-1.5 rounded-full btn-gold disabled:opacity-50">
                      {busy ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                      Submit to {i.agency.split(" ")[0]}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {submissions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--haven-border)]">
          <p className="text-[10px] uppercase tracking-wider text-[#aab5cf] mb-2">Recent submissions</p>
          <ul className="space-y-2">
            {submissions.slice(0, 5).map((s) => (
              <li key={s.id} className="text-xs flex items-center gap-2 px-2 py-1.5 rounded border border-[var(--haven-border)] bg-[#0a142b]/40">
                {s.status === "approved" ? <CheckCircle2 size={11} className="text-emerald-300" /> : s.status === "needs_action" ? <AlertTriangle size={11} className="text-amber-300" /> : <Send size={11} className="text-blue-300" />}
                <span className="flex-1 truncate text-zinc-200">{s.integration_name}</span>
                <span className="font-mono text-[10px] text-[#aab5cf]">{s.confirmation_id}</span>
                <span className="text-[10px] uppercase text-[#aab5cf]">{s.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
