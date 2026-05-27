import React, { useMemo, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Locate, Loader2, ExternalLink, Tent, DollarSign } from "lucide-react";
import { CAMPING_RESOURCES } from "@/data/camping";

const userIcon = L.divIcon({
  className: "user-loc-icon-wrapper",
  html: '<div class="user-loc-marker"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function campIcon(kind) {
  // Gold (paid) vs teal (free) tent markers
  const isPaid = kind === "paid";
  return L.divIcon({
    className: "res-icon-wrapper",
    html: `<div class="res-marker" style="background:${
      isPaid ? "#d4af37" : "#10b981"
    };border-color:${isPaid ? "#9c7a25" : "#047857"};color:#0a142b;">⛺</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapHandle({ register }) {
  const map = useMap();
  React.useEffect(() => {
    register(map);
  }, [map, register]);
  return null;
}

export default function CampingPage() {
  const [filter, setFilter] = useState("all"); // 'all' | 'paid' | 'free'
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  const filtered = useMemo(
    () => CAMPING_RESOURCES.filter((r) => (filter === "all" ? true : r.kind === filter)),
    [filter]
  );

  function snapToLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not available in this browser");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 11, { animate: true });
        }
        setLocating(false);
      },
      (e) => {
        setError(e.message || "Could not get location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const paidCount = CAMPING_RESOURCES.filter((r) => r.kind === "paid").length;
  const freeCount = CAMPING_RESOURCES.filter((r) => r.kind === "free").length;

  return (
    <AppLayout
      title="Camping"
      subtitle="Free and paid camping sites within ~100 miles — map and details."
      actions={
        <button
          data-testid="camping-snap-btn"
          onClick={snapToLocation}
          className="haven-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#d4af37]/10 text-[#f1d36b] border border-[#d4af37]/35 hover:bg-[#d4af37]/20"
        >
          {locating ? <Loader2 size={13} className="animate-spin" /> : <Locate size={13} />}
          {locating ? "Locating…" : "Snap to my location"}
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: "all", label: `All sites (${CAMPING_RESOURCES.length})` },
          { key: "free", label: `Free (${freeCount})` },
          { key: "paid", label: `Paid (${paidCount})` },
        ].map((f) => (
          <button
            key={f.key}
            data-testid={`camping-filter-${f.key}`}
            onClick={() => setFilter(f.key)}
            className={`haven-btn rounded-full px-3 py-1.5 text-xs font-medium border transition ${
              filter === f.key
                ? "bg-[#d4af37]/15 text-[#f1d36b] border-[#d4af37]/45"
                : "bg-[#0a142b]/60 text-[#aab5cf] border-[#1d2c4f] hover:border-[#d4af37]/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Map */}
        <div className="haven-card overflow-hidden" data-testid="camping-map">
          <div className="px-4 py-3 border-b border-[var(--haven-border)] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#6d7a9a]">
                Camping map
              </p>
              <p className="text-sm font-medium text-zinc-100">
                {filtered.length} sites shown
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#aab5cf]">
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: "#d4af37" }}
                />{" "}
                Paid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Free
              </span>
            </div>
          </div>
          <div style={{ height: 540 }} className="w-full">
            <MapContainer
              center={[37.4, -121.95]}
              zoom={9}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapHandle register={(m) => (mapRef.current = m)} />

              {filtered.map((r) => (
                <Marker
                  key={r.id}
                  position={[r.lat, r.lng]}
                  icon={campIcon(r.kind)}
                  eventHandlers={{ click: () => setSelected(r) }}
                >
                  <Popup>
                    <div className="text-zinc-100 text-sm space-y-1 min-w-[220px]">
                      <p className="font-medium">{r.name}</p>
                      <p
                        className={`text-[11px] uppercase tracking-wider ${
                          r.kind === "paid" ? "text-[#d4af37]" : "text-emerald-300"
                        }`}
                      >
                        {r.kind === "paid" ? "Paid" : "Free"}
                        {r.price ? ` · ${r.price}` : ""}
                      </p>
                      {r.address && <p className="text-xs text-zinc-300">{r.address}</p>}
                      {r.phone && <p className="text-xs text-zinc-400">📞 {r.phone}</p>}
                      {r.services?.length > 0 && (
                        <p className="text-xs text-zinc-500">{r.services.join(" · ")}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {userPos && (
                <Marker position={userPos} icon={userIcon}>
                  <Popup>
                    <div className="text-zinc-100 text-xs">
                      <p className="font-medium text-emerald-300">You are here</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          {error && (
            <div className="px-4 py-2 text-[11px] text-rose-300 bg-rose-500/10 border-t border-rose-500/20">
              {error}
            </div>
          )}
        </div>

        {/* List */}
        <aside
          className="space-y-3 max-h-[600px] overflow-y-auto pr-1"
          data-testid="camping-list"
        >
          {filtered.map((r) => (
            <button
              key={r.id}
              data-testid={`camping-card-${r.id}`}
              onClick={() => {
                setSelected(r);
                if (mapRef.current) {
                  mapRef.current.setView([r.lat, r.lng], 12, { animate: true });
                }
              }}
              className={`w-full text-left haven-card p-4 transition haven-btn ${
                selected?.id === r.id ? "ring-1 ring-[#d4af37]/45" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                  <Tent
                    size={14}
                    className={r.kind === "paid" ? "text-[#d4af37]" : "text-emerald-400"}
                  />
                  {r.name}
                </p>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    r.kind === "paid"
                      ? "border-[#d4af37]/45 text-[#f1d36b]"
                      : "border-emerald-500/45 text-emerald-300"
                  }`}
                >
                  {r.kind}
                </span>
              </div>
              {r.price && (
                <p className="text-xs text-zinc-300 flex items-center gap-1">
                  <DollarSign size={11} className="text-[#d4af37]" />
                  {r.price}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-1">{r.address}</p>
              {r.phone && <p className="text-xs text-zinc-500 mt-0.5">📞 {r.phone}</p>}
              {r.services?.length > 0 && (
                <p className="text-[11px] text-[#aab5cf] mt-1.5">{r.services.join(" · ")}</p>
              )}
              {r.website && (
                <a
                  href={`https://${r.website}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#f1d36b] hover:underline"
                >
                  {r.website} <ExternalLink size={10} />
                </a>
              )}
            </button>
          ))}
        </aside>
      </div>
    </AppLayout>
  );
}
