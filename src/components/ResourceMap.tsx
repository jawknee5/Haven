import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Home, Utensils, Tent, HeartPulse, Briefcase, Calendar } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

const CENTER: [number, number] = [37.3382, -121.8863];

const createIcon = (iconElement: React.ReactElement, colorClass: string) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg ${colorClass}`}>
      {iconElement}
    </div>
  );
  return L.divIcon({
    html: iconMarkup,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const ICONS = {
  HOUSING: createIcon(<Home className="text-white h-5 w-5" />, 'bg-blue-600'),
  FOOD: createIcon(<Utensils className="text-white h-5 w-5" />, 'bg-green-600'),
  CAMPING: createIcon(<Tent className="text-white h-5 w-5" />, 'bg-amber-600'),
  HEALTH: createIcon(<HeartPulse className="text-white h-5 w-5" />, 'bg-red-600'),
  JOBS: createIcon(<Briefcase className="text-white h-5 w-5" />, 'bg-purple-600'),
  EVENTS: createIcon(<Calendar className="text-white h-5 w-5" />, 'bg-pink-600'),
};

const MOCK_RESOURCES = [
  { id: 1, name: 'Downtown Emergency Shelter', category: 'HOUSING', lat: 37.3340, lng: -121.8900 },
  { id: 2, name: 'Community Food Bank', category: 'FOOD', lat: 37.3400, lng: -121.8800 },
  { id: 3, name: 'Free Clinic San Jose', category: 'HEALTH', lat: 37.3300, lng: -121.8850 },
  { id: 4, name: 'Urban Camping Safe Zone', category: 'CAMPING', lat: 37.3200, lng: -121.8700 },
  { id: 5, name: 'Civic Job Fair', category: 'JOBS', lat: 37.3450, lng: -121.8950 },
];

export default function ResourceMap() {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
      <MapContainer center={CENTER} zoom={13} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {MOCK_RESOURCES.map(res => (
          <Marker 
            key={res.id} 
            position={[res.lat, res.lng]} 
            icon={ICONS[res.category as keyof typeof ICONS]}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-slate-900">
                <h3 className="font-bold text-lg">{res.name}</h3>
                <p className="text-sm font-semibold text-blue-600">{res.category}</p>
                <button className="mt-2 w-full bg-slate-900 text-white text-xs py-2 rounded font-bold hover:bg-slate-800">
                  Navigate Here
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
