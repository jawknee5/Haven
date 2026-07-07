import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Locate, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { CAMPING_AS_MAP_RESOURCES } from "@/data/camping";

// Distinct user marker (animated pulse "You are here")
const userIcon = L.divIcon({
  className: "user-loc-icon-wrapper",
  html: '<div class="user-loc-marker"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const TYPE_GLYPH = {
  shelter: "🏠",
  food: "🥪",
  health: "✚",
  crisis: "!",
  legal: "§",
  employment: "💼",
  childcare: "★",
  camping: "⛺",
};

function resourceIcon(type) {
  const glyph = TYPE_GLYPH[type] || "•";
  return L.divIcon({
    className: "res-icon-wrapper",
    html: `<div class="res-marker res-${type}">${glyph}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapHandle({ register, doubleTapEnabled }) {
  const map = useMap();
  useEffect(() => {
    register(map);
    if (doubleTapEnabled) {
      // Mobile-friendly double-tap to zoom 10%
      let lastTap = 0;
      const handler = (e) => {
        const now = Date.now();
        if (now - lastTap < 350) {
          const target = map.mouseEventToLatLng(e.originalEvent.touches?.[0] || e.originalEvent);
          map.setView(target || map.getCenter(), map.getZoom() + 1, { animate: true });
        }
        lastTap = now;
      };
      map.on("dblclick", (e) => {
        // increment in roughly 10% steps; Leaflet zoom is discrete so +1 is friendly
        map.setView(e.latlng, map.getZoom() + 1, { animate: true });
      });
      map.getContainer().addEventListener("touchend", handler, { passive: true });
      return () => {
        map.off("dblclick");
        map.getContainer().removeEventListener("touchend", handler);
      };
    }
    return () => {};
  }, [map, register, doubleTapEnabled]);
  return null;
}

export default function ResourceMapWidget({ height = 320, compact = true, defaultCenter = [37.3382, -121.8863], onResourceClick }) {
  const [resources, setResources] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  useEffect(() => {
    api
      .get("/resources")
      .then((r) => {
        const live = Array.isArray(r.data) ? r.data : [];
        // Surface the camping resources alongside the live API resources so
        // they appear on the main map as well as the dedicated Camping page.
        setResources([...live, ...CAMPING_AS_MAP_RESOURCES]);
      })
      .catch(() => setResources([...CAMPING_AS_MAP_RESOURCES]));
  }, []);

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
          mapRef.current.setView([latitude, longitude], 15, { animate: true });
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

  return (
    <div className="relative haven-card overflow-hidden" data-testid="resource-map-widget">
      <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--haven-border)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#6d7a9a]">
            Live resource map
          </p>
          <p className="text-sm font-medium text-zinc-100">
            {resources.length} nearby resources
          </p>
        </div>
        <button
          data-testid="snap-to-location-btn"
          onClick={snapToLocation}
          className="haven-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#d4af37]/10 text-[#f1d36b] border border-[#d4af37]/35 hover:bg-[#d4af37]/20"
        >
          {locating ? <Loader2 size={13} className="animate-spin" /> : <Locate size={13} />}
          {locating ? "Locating…" : "Snap to my location"}
        </button>
      </div>

      <div style={{ height }} className="w-full">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom
          doubleClickZoom={false}
          touchZoom
          zoomControl={!compact}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapHandle register={(m) => (mapRef.current = m)} doubleTapEnabled />

          {resources.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lng]} icon={resourceIcon(r.type)} eventHandlers={onResourceClick ? { click: () => onResourceClick(r) } : undefined}>
              <Popup>
                <div className="text-zinc-100 text-sm space-y-1 min-w-[220px]">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400">{r.type}</p>
                  {r.address && <p className="text-xs text-zinc-300">{r.address}</p>}
                  {r.phone && <p className="text-xs text-zinc-400">📞 {r.phone}</p>}
                  {r.hours && <p className="text-xs text-zinc-500">🕒 {r.hours}</p>}
                  {typeof r.capacity_available === "number" && (
                    <p className="text-xs">
                      <span className={r.capacity_available > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {r.capacity_available} of {r.capacity}
                      </span>{" "}
                      <span className="text-zinc-500">open spots</span>
                    </p>
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
                  <p className="font-mono text-[10px] text-zinc-500 mt-1">
                    {userPos[0].toFixed(5)}, {userPos[1].toFixed(5)}
                  </p>
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
      <div className="px-4 py-2 border-t border-[var(--haven-border)] flex flex-wrap gap-3 text-[10px] text-[#aab5cf]">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'#d4af37'}} /> You</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Shelter</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Food</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Health</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-600" /> Crisis</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> Legal</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Employment</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Camping</span>
      </div>
    </div>
  );
}
