import React, { useState } from "react";
import { X, Send, Loader2, Building2, User, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * IntegrationRequestForm — modal used from the Architect dashboard to
 * generate a pre-filled MOU/DPA document tailored to a specific agency and
 * its top chain of command. Submits to `POST /api/integration-requests`,
 * receives back the document URL + mailto link so The Architect can send it
 * in one click.
 */
export default function IntegrationRequestForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    agency_name: "",
    agency_type: "county",
    program: "",
    scope: "",
    urgency: "normal",
    notes: "",
  });
  const [contacts, setContacts] = useState([
    { name: "", title: "", email: "" },
    { name: "", title: "", email: "" },
    { name: "", title: "", email: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateContact(i, field, value) {
    setContacts((c) => c.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));
  }

  async function submit(e) {
    e.preventDefault();
    const validContacts = contacts.filter((c) => c.email && c.name);
    if (!validContacts.length) {
      toast.error("Add at least one contact");
      return;
    }
    setSubmitting(true);
    try {
      const r = await api.post("/integration-requests", {
        ...form,
        contacts: validContacts,
      });
      toast.success("Integration request drafted");
      onCreated?.(r.data);
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8"
      onClick={onClose}
      data-testid="integration-request-modal"
    >
      <div
        className="w-full max-w-3xl haven-card overflow-hidden shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--haven-border)] bg-gradient-to-r from-[#101a35] to-[#0a142b]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Architect · outreach</p>
            <h3 className="font-display text-xl sm:text-2xl font-semibold mt-1">Request agency integration</h3>
            <p className="text-xs text-[#aab5cf] mt-1">HAVEN generates a pre-filled MOU/DPA + mailto to the top 3 chain-of-command. When signed and returned, BB auto-provisions the credentials.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 haven-btn rounded-lg" data-testid="integration-modal-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Agency name" required>
              <input
                data-testid="ir-agency-name"
                required
                value={form.agency_name}
                onChange={(e) => update("agency_name", e.target.value)}
                placeholder="e.g. Santa Clara County Office of Supportive Housing"
                className={inputCls}
              />
            </Field>
            <Field label="Type">
              <select
                data-testid="ir-agency-type"
                value={form.agency_type}
                onChange={(e) => update("agency_type", e.target.value)}
                className={inputCls}
              >
                <option value="county">County</option>
                <option value="state">State</option>
                <option value="federal">Federal</option>
                <option value="city">City</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="healthcare">Healthcare / HIE</option>
              </select>
            </Field>
          </div>
          <Field label="Program / service" required>
            <input
              data-testid="ir-program"
              required
              value={form.program}
              onChange={(e) => update("program", e.target.value)}
              placeholder="e.g. HUD-VASH voucher status API"
              className={inputCls}
            />
          </Field>
          <Field label="Scope of integration" required>
            <textarea
              data-testid="ir-scope"
              required
              value={form.scope}
              onChange={(e) => update("scope", e.target.value)}
              rows={3}
              placeholder="Describe what data flows both ways. e.g. Read: waitlist position, voucher issuance date. Write: pre-qualified referral packet with resident-signed DPA."
              className={inputCls}
            />
          </Field>

          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37] mb-2">
              <Building2 size={11} className="inline -mt-0.5 mr-1" />
              Chain of command (top 3)
            </p>
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <div key={`contact-${i}`} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    data-testid={`ir-contact-name-${i}`}
                    value={c.name}
                    onChange={(e) => updateContact(i, "name", e.target.value)}
                    placeholder={`Contact ${i + 1} — name`}
                    className={inputCls}
                  />
                  <input
                    data-testid={`ir-contact-title-${i}`}
                    value={c.title}
                    onChange={(e) => updateContact(i, "title", e.target.value)}
                    placeholder="Title (e.g. Director)"
                    className={inputCls}
                  />
                  <input
                    data-testid={`ir-contact-email-${i}`}
                    type="email"
                    value={c.email}
                    onChange={(e) => updateContact(i, "email", e.target.value)}
                    placeholder="email@agency.gov"
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Urgency">
              <select data-testid="ir-urgency" value={form.urgency} onChange={(e) => update("urgency", e.target.value)} className={inputCls}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
            <Field label="Internal notes (optional)">
              <input value={form.notes} onChange={(e) => update("notes", e.target.value)} className={inputCls} placeholder="Not sent to agency" data-testid="ir-notes" />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--haven-border)]">
            <p className="text-[10px] text-[#6d7a9a] flex items-center gap-1">
              <ShieldCheck size={11} className="text-[#d4af37]" /> Any credentials returned by the agency will be encrypted via the Apex Vault before storage.
            </p>
            <button
              type="submit"
              disabled={submitting}
              data-testid="ir-submit"
              className="haven-btn btn-gold text-sm font-medium px-4 py-2 rounded-full inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Draft request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <p className="text-[10px] uppercase tracking-wider text-[#aab5cf] mb-1">
        {label} {required && <span className="text-rose-400">*</span>}
      </p>
      {children}
    </label>
  );
}
