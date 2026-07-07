import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import ResourceMapWidget from "@/components/ResourceMapWidget";
import ResourceDetailModal from "@/components/ResourceDetailModal";
import { ArrowLeft, Phone, MapPin, Clock, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const TYPES = [
  "all", "shelter", "food", "health", "crisis", "legal", "employment",
  "benefits", "reentry", "veterans", "youth", "childcare", "immigration",
  "domestic-violence", "mental-health", "substance-use", "transportation", "seniors", "utility", "camping",
];

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/resources").then((r) => setResources(r.data || [])).catch((err) => console.error("Failed to load resources:", err));
  }, []);

  const filtered = resources.filter(
    (r) =>
      (filter === "all" || r.type === filter) &&
      (!q || r.name.toLowerCase().includes(q.toLowerCase()) || (r.description || "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--haven-border)]">
        <Link to={user ? `/${user.role === "admin" ? "architect" : user.role}` : "/home"} className="flex items-center gap-2 text-[#aab5cf] hover:text-[#f1d36b] text-sm">
          <ArrowLeft size={14} /> Back
        </Link>
        <Link to="/home" className="flex items-center gap-2">
          <img src="/haven-bird.png" alt="HAVEN" className="h-8 w-auto" />
          <span className="font-serif-haven font-semibold tracking-[0.18em] text-gold">HAVEN</span>
        </Link>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">Resource directory</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight mt-2">Find help nearby.</h1>
          <p className="text-zinc-400 mt-1 text-sm">Click any card to see contact info, apply, or reserve a spot.</p>

          <div className="mt-5 flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t}
                data-testid={`filter-${t}`}
                onClick={() => setFilter(t)}
                className={`text-xs px-3 py-1.5 rounded-full border haven-btn capitalize ${
                  filter === t ? "bg-blue-500/15 border-blue-500/40 text-blue-200" : "border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                {t.replace("-", " ")}
              </button>
            ))}
          </div>
          <input
            data-testid="resource-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search resources…"
            className="w-full mt-4 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
          />

          <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#6d7a9a]">
            {filtered.length} of {resources.length} resources
          </p>

          <div className="mt-3 space-y-3 max-h-[60vh] overflow-y-auto pr-1" data-testid="resource-list">
            {filtered.map((r) => (
              <button
                key={r.id}
                data-testid={`resource-card-${r.id}`}
                onClick={() => setSelected(r)}
                className="w-full text-left haven-card p-4 hover:border-[#d4af37]/40 transition haven-btn"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100 truncate">{r.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-blue-400 mt-0.5 capitalize">{r.type?.replace("-", " ")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {typeof r.capacity_available === "number" && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${r.capacity_available > 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                        {r.capacity_available > 0 ? `${r.capacity_available} open` : "Full"}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-[#6d7a9a]" />
                  </div>
                </div>
                {r.description && <p className="text-sm text-zinc-300 mt-2 leading-relaxed line-clamp-2">{r.description}</p>}
                <div className="text-xs text-zinc-400 mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {r.address && <span className="inline-flex items-center gap-1"><MapPin size={11} /> <span className="truncate max-w-[240px]">{r.address}</span></span>}
                  {r.phone && <span className="inline-flex items-center gap-1"><Phone size={11} /> {r.phone}</span>}
                  {r.hours && <span className="inline-flex items-center gap-1"><Clock size={11} /> {r.hours}</span>}
                </div>
              </button>
            ))}
          </div>
        </section>
        <aside className="lg:col-span-5 lg:sticky lg:top-6 self-start">
          <ResourceMapWidget height={520} compact={false} onResourceClick={setSelected} />
        </aside>
      </main>

      {selected && (
        <ResourceDetailModal resource={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
