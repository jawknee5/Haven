import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage, useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { Globe, User, Check } from "lucide-react";

export default function SettingsPage() {
  const t = useT();
  const { lang, setLang, languages } = useLanguage();
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.patch("/auth/me", { name, phone });
      toast.success(t("settings.profile.saved"));
      if (refresh) await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  function pickLang(code) {
    setLang(code);
    toast.success(t("settings.language.saved"));
  }

  return (
    <AppLayout title={t("settings.title")} subtitle={t("settings.subtitle")}>
      <div className="grid grid-cols-12 gap-6">
        {/* Language */}
        <section className="col-span-12 lg:col-span-7 haven-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} className="text-[#d4af37]" />
            <h2 className="font-display text-lg font-semibold">{t("settings.language")}</h2>
          </div>
          <p className="text-sm text-[#aab5cf] mb-5">{t("settings.language.desc")}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {languages.map((l) => {
              const active = lang === l.code;
              return (
                <li key={l.code}>
                  <button
                    data-testid={`settings-lang-${l.code}`}
                    onClick={() => pickLang(l.code)}
                    className={`w-full text-left px-4 py-3 rounded-xl border haven-btn transition flex items-center gap-3 ${
                      active
                        ? "bg-[#d4af37]/12 border-[#d4af37]/40 text-[#f1d36b]"
                        : "border-[var(--haven-border)] text-zinc-200 hover:bg-[#142244]/40"
                    }`}
                    aria-pressed={active}
                  >
                    <span className="text-xl" aria-hidden="true">{l.flag}</span>
                    <span className="flex-1">
                      <span className="font-medium block">{l.label}{l.code === "en" && <span className="ml-2 text-[10px] uppercase tracking-wider text-[#d4af37]/80">Default</span>}</span>
                      <span className="text-[11px] text-[#aab5cf]">{l.native}</span>
                    </span>
                    {active && <Check size={14} className="text-[#d4af37]" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Profile */}
        <section className="col-span-12 lg:col-span-5 haven-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-[#d4af37]" />
            <h2 className="font-display text-lg font-semibold">{t("settings.profile")}</h2>
          </div>
          <p className="text-sm text-[#aab5cf] mb-4">{user?.email}</p>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#aab5cf]">{t("settings.profile.name")}</label>
              <input
                data-testid="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#aab5cf]">{t("settings.profile.phone")}</label>
              <input
                data-testid="settings-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <button
              data-testid="settings-profile-save"
              onClick={saveProfile}
              disabled={savingProfile}
              className="haven-btn btn-gold rounded-full px-5 py-2 text-sm disabled:opacity-50"
            >
              {savingProfile ? t("common.loading") + "…" : t("settings.profile.save")}
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
