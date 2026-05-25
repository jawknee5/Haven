import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import ResourceMapWidget from "@/components/ResourceMapWidget";
import { ArrowLeft, Phone, MapPin, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const TYPES = ["all", "shelter", "food", "health", "crisis", "legal", "employment", "childcare"];

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/resources").then((r) => setResources(r.data || [])).catch(() => {});
  }, []);

  const filtered = resources.filter(
    (r) =>
      (filter === "all" || r.type === filter) &&
      (!q || r.name.toLowerCase().includes(q.toLowerCase()) || (r.description || "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--haven-border)]">
        <Link to={user ? `/${user.role}` : "/"} className="flex items-center gap-2 text-zinc-300 hover:text-white text-sm">
          <ArrowLeft size={14} /> {user ? "Dashboard" : "Home"}
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center font-display font-bold text-white">H</div>
          <span className="font-display font-semibold tracking-tight">HAVEN</span>
        </Link>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">Resource directory</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight mt-2">Find help nearby.</h1>
          <p className="text-zinc-400 mt-1 text-sm">Tap any pin on the map or pick from the list.</p>

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
                {t}
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

          <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1" data-testid="resource-list">
            {filtered.map((r) => (
              <div key={r.id} className="haven-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-100">{r.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-blue-400 mt-0.5">{r.type}</p>
                  </div>
                  {typeof r.capacity_available === "number" && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${r.capacity_available > 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                      {r.capacity_available > 0 ? `${r.capacity_available} open` : "Full"}
                    </span>
                  )}
                </div>
                {r.description && <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{r.description}</p>}
                <div className="text-xs text-zinc-400 mt-3 flex flex-wrap gap-4">
                  {r.address && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {r.address}</span>}
                  {r.phone && <span className="inline-flex items-center gap-1"><Phone size={11} /> {r.phone}</span>}
                  {r.hours && <span className="inline-flex items-center gap-1"><Clock size={11} /> {r.hours}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="lg:col-span-5 lg:sticky lg:top-6 self-start">
          <ResourceMapWidget height={520} compact={false} />
        </aside>
      </main>
    </div>
  );
}
