import React, { useState } from "react";
import { KeyRound, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * CaseNumberWidget — lets residents AND caseworkers attach an existing agency
 * case number to their profile. Value is encrypted client-side-agnostic (via
 * the Apex Vault on the backend) so BB can later use it to autofill portals.
 */
export default function CaseNumberWidget({ currentValue, currentAgency }) {
  const [caseNo, setCaseNo] = useState(currentValue || "");
  const [agency, setAgency] = useState(currentAgency || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(currentValue));

  async function save(e) {
    e?.preventDefault();
    if (!caseNo.trim()) return;
    setSaving(true);
    try {
      await api.patch("/users/me/case-number", {
        case_number: caseNo.trim(),
        agency: agency.trim() || null,
      });
      setSaved(true);
      toast.success("Case number stored in Apex Vault. BB can now autofill this agency.");
    } catch (err) {
      console.error("Failed to save case number:", err);
      toast.error("Failed to save case number");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="haven-card p-4"
      data-testid="case-number-widget"
    >
      <div className="flex items-center gap-2 mb-2">
        <KeyRound size={14} className="text-[#d4af37]" />
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">
          Existing case number
        </p>
        {saved && <CheckCircle2 size={13} className="text-emerald-400" />}
      </div>
      <p className="text-xs text-[#aab5cf] mb-3 leading-relaxed">
        If an agency already has a case for you (HUD-VASH, CalFresh, GA, Section 8, etc.), enter it here so BB can autofill and pull your existing info.
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          data-testid="case-number-input"
          value={caseNo}
          onChange={(e) => setCaseNo(e.target.value)}
          placeholder="e.g. HUD-98241"
          className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60"
        />
        <input
          data-testid="case-agency-input"
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
          placeholder="Agency (e.g. HUD, County SSA)"
          className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] text-[#6d7a9a] flex items-center gap-1">
          <ShieldCheck size={10} className="text-[#d4af37]" /> Encrypted at rest via Apex Vault (AES-256-GCM)
        </p>
        <button
          type="submit"
          disabled={saving || !caseNo.trim()}
          data-testid="case-number-save"
          className="haven-btn btn-gold text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : null}
          {saving ? "Saving…" : saved ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
