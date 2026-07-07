import React from "react";
import { X, Phone, MapPin, Clock, Globe, Mail, Send, CalendarClock, Users, ShieldCheck, ArrowUpRight } from "lucide-react";

/**
 * ResourceDetailModal — click-to-expand panel for a single civic resource.
 *
 * Every resource card in Find Resources (and every pin on the map) opens this
 * modal so the resident/caseworker can Call, Email, visit the Website, get
 * Directions, Apply to the program, or Reserve a spot in one click.
 */
export default function ResourceDetailModal({ resource, onClose }) {
  if (!resource) return null;
  const r = resource;

  const dirUrl = r.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}`
    : (r.lat && r.lng ? `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}` : null);

  const emailFromWebsite = r.email || null;

  const actions = [
    r.phone && { key: "call",     label: "Call",       icon: Phone,        href: `tel:${r.phone.replace(/[^0-9+]/g, "")}` },
    emailFromWebsite && { key: "email",    label: "Email",      icon: Mail,         href: `mailto:${emailFromWebsite}` },
    r.website && { key: "website",  label: "Website",    icon: Globe,        href: r.website.startsWith("http") ? r.website : `https://${r.website}` },
    dirUrl && { key: "directions", label: "Directions", icon: MapPin,      href: dirUrl },
    r.apply_url && { key: "apply",   label: "Apply",      icon: Send,        href: r.apply_url },
    r.reserve_url && { key: "reserve", label: "Reserve",   icon: CalendarClock, href: r.reserve_url },
  ].filter(Boolean);

  const availabilityBadge = typeof r.capacity_available === "number" ? (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
      r.capacity_available > 0
        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
    }`}>
      {r.capacity_available > 0 ? `${r.capacity_available} of ${r.capacity ?? "—"} open` : "Currently full"}
    </span>
  ) : (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 inline-flex items-center gap-1">
      <ShieldCheck size={10} /> live sync pending integration
    </span>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 sm:p-8 animate-fade-in"
      onClick={onClose}
      data-testid="resource-detail-modal"
    >
      <div
        className="w-full max-w-2xl haven-card overflow-hidden animate-fade-in-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-3 border-b border-[var(--haven-border)] bg-gradient-to-r from-[#101a35] to-[#0a142b]">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">{r.type}</p>
            <h3 className="font-display text-xl sm:text-2xl font-semibold mt-1 leading-tight">{r.name}</h3>
            <div className="mt-2">{availabilityBadge}</div>
          </div>
          <button
            data-testid="resource-modal-close"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg haven-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {r.description && (
            <p className="text-sm text-zinc-200 leading-relaxed">{r.description}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {r.address && (
              <InfoRow icon={MapPin} label="Address" value={r.address} />
            )}
            {r.phone && (
              <InfoRow icon={Phone} label="Phone" value={r.phone} />
            )}
            {r.hours && (
              <InfoRow icon={Clock} label="Hours" value={r.hours} />
            )}
            {r.eligibility && (
              <InfoRow icon={Users} label="Eligibility" value={r.eligibility} />
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap gap-2">
            {actions.map((a) => (
              <a
                key={a.key}
                data-testid={`resource-action-${a.key}`}
                href={a.href}
                target={["call", "email"].includes(a.key) ? undefined : "_blank"}
                rel="noreferrer"
                className={`haven-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium border transition ${
                  a.key === "apply" || a.key === "reserve"
                    ? "bg-[#d4af37]/15 text-[#f1d36b] border-[#d4af37]/45 hover:bg-[#d4af37]/25"
                    : "bg-[#101a35]/60 text-zinc-100 border-[#1d2c4f] hover:border-[#d4af37]/40"
                }`}
              >
                <a.icon size={12} />
                {a.label}
                <ArrowUpRight size={10} className="opacity-60" />
              </a>
            ))}
          </div>

          <p className="text-[11px] text-[#6d7a9a] pt-4 border-t border-[var(--haven-border)]">
            <ShieldCheck size={10} className="inline -mt-0.5 mr-1 text-[#d4af37]" />
            Live capacity and application-status feeds activate the moment this agency signs the HAVEN Data-Processing Agreement.
            Until then, information reflects the agency's most recent published data.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-[var(--haven-border)] bg-[#0a142b]/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-[#6d7a9a] flex items-center gap-1 mb-1">
        <Icon size={10} /> {label}
      </p>
      <p className="text-xs text-zinc-100 leading-snug">{value}</p>
    </div>
  );
}
