import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher({ compact = false, align = "right" }) {
  const { lang, setLang, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid="lang-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        className="haven-btn inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[var(--haven-border)] text-[#aab5cf] hover:text-[#f1d36b] hover:border-[#d4af37]/40 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={13} />
        {!compact && <span className="font-mono uppercase tracking-wider">{current.label}</span>}
        <span className="sm:hidden">{current.flag}</span>
      </button>
      {open && (
        <div
          className={`absolute mt-2 z-50 ${align === "right" ? "right-0" : "left-0"} w-56 rounded-xl border border-[var(--haven-border)] bg-[#070f1d]/95 backdrop-blur-xl shadow-2xl overflow-hidden`}
          data-testid="lang-switcher-menu"
          role="listbox"
        >
          <ul>
            {languages.map((l) => (
              <li key={l.code}>
                <button
                  data-testid={`lang-${l.code}`}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-[#142244]/60 transition haven-btn ${lang === l.code ? "text-[#f1d36b]" : "text-zinc-200"}`}
                  role="option"
                  aria-selected={lang === l.code}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1">
                    <span className="font-medium">{l.label}</span>
                    {l.label !== l.native && (
                      <span className="text-[10px] text-zinc-500 ml-1">· {l.native}</span>
                    )}
                  </span>
                  {lang === l.code && <Check size={13} className="text-[#d4af37]" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="px-3 py-2 border-t border-[var(--haven-border)] text-[10px] text-zinc-500">
            Default: English. Saved on this device.
          </div>
        </div>
      )}
    </div>
  );
}
