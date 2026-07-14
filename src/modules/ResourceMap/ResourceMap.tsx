import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ResourceMap.css';

interface Resource {
  id: number;
  name: string;
  type: 'food' | 'health' | 'housing' | 'jobs' | 'legal' | 'camping';
  variant?: 'paid' | 'free';
  lat: number;
  lng: number;
  hours: string;
  phone: string;
  address: string;
  services: string[];
  distance: number;
}

const SEARCH_RADIUS_MILES = 50;

// San Jose & Bay Area Resources
const RESOURCES: Resource[] = [
  { id: 1, name: 'San Jose Food Bank', type: 'food', lat: 37.3382, lng: -121.8863, hours: '8am-5pm Mon-Fri', phone: '(408) 918-1345', address: '45 S Autumn St, San Jose, CA 95110', services: ['Fresh produce', 'Pantry items', 'Nutrition info'], distance: 0 },
  { id: 2, name: 'Valley Medical Center', type: 'health', lat: 37.3510, lng: -121.8772, hours: '24/7', phone: '(408) 885-5000', address: '9500 N. Windy Hill Dr, San Jose, CA 95123', services: ['Emergency care', 'Primary care', 'Mental health'], distance: 2.1 },
  { id: 3, name: 'First Step Communities', type: 'housing', lat: 37.3298, lng: -121.8945, hours: '24/7', phone: '(408) 288-4777', address: '2020 Story Rd, San Jose, CA 95122', services: ['Emergency shelter', 'Transitional housing', 'Case mgmt'], distance: 1.2 },
  { id: 4, name: 'Tech Career Academy', type: 'jobs', lat: 37.3397, lng: -121.8802, hours: '9am-6pm', phone: '(408) 294-8324', address: '350 W San Carlos St, San Jose, CA 95110', services: ['Job training', 'Resume help', 'Job placement'], distance: 0.5 },
  { id: 5, name: 'Santa Clara Legal Aid', type: 'legal', lat: 37.3541, lng: -121.9552, hours: '9am-5pm', phone: '(408) 288-6840', address: '2440 Technology Dr, Santa Clara, CA 95051', services: ['Immigration help', 'Family law', 'Housing disputes'], distance: 5.2 },
  { id: 6, name: 'Santa Clara Health Center', type: 'health', lat: 37.3480, lng: -121.9602, hours: '8am-8pm', phone: '(408) 615-6200', address: '2635 N. First St, Santa Clara, CA 95050', services: ['Primary care', 'Dental', 'Mental health'], distance: 5.8 },
  { id: 7, name: 'Big Basin Redwoods Camping', type: 'camping', variant: 'paid', lat: 37.1761, lng: -122.2313, hours: '24/7', phone: '(831) 338-6132', address: 'Big Basin Redwoods State Park, Boulder Creek, CA 95006', services: ['RV sites', 'Tent camping', 'Day use'], distance: 38.5 },
  { id: 8, name: 'Sunnyvale RV Park', type: 'camping', variant: 'paid', lat: 37.3729, lng: -122.0323, hours: '24/7', phone: '(408) 739-0363', address: '750 E Evelyn Ave, Sunnyvale, CA 94086', services: ['Full hookups', 'Cable/WiFi', 'Laundry'], distance: 8.2 },
  { id: 9, name: 'Ohlone Regional Wilderness', type: 'camping', variant: 'free', lat: 37.4208, lng: -121.6514, hours: '24/7', phone: '(888) 327-2757', address: 'Sunol, CA 94586', services: ['Backcountry camping', 'Day use', 'Hiking trails'], distance: 22.3 },
  { id: 10, name: 'Del Valle Regional Park', type: 'camping', variant: 'free', lat: 37.3871, lng: -121.6639, hours: '24/7', phone: '(510) 635-0135', address: 'Livermore, CA 94550', services: ['Group sites', 'Day use', 'Water access'], distance: 25.1 },
  { id: 11, name: 'San Jose Rescue Mission', type: 'housing', lat: 37.3208, lng: -121.8735, hours: '24/7', phone: '(408) 535-6700', address: '200 E Santa Clara St, San Jose, CA 95113', services: ['Emergency beds', 'Meals', 'Showers'], distance: 1.5 },
  { id: 12, name: 'Kaiser Permanente San Jose', type: 'health', lat: 37.3382, lng: -121.8910, hours: '8am-6pm', phone: '(408) 567-6000', address: '250 Hospital Pkwy, San Jose, CA 95119', services: ['Medical clinic', 'Mental health', 'Urgent care'], distance: 3.2 },
  { id: 13, name: 'Milpitas Community Center Food Pantry', type: 'food', lat: 37.4272, lng: -121.8939, hours: '10am-4pm Tue/Thu', phone: '(408) 586-3220', address: '645 E Calaveras Blvd, Milpitas, CA 95035', services: ['Emergency food', 'Weekly groceries', 'Kids programs'], distance: 7.1 },
  { id: 14, name: 'Mountain View Community Services', type: 'housing', lat: 37.3860, lng: -122.0808, hours: '9am-5pm', phone: '(650) 903-6395', address: '750 California St, Mountain View, CA 94041', services: ['Homeless services', 'Job training', 'Mental health'], distance: 9.3 },
];

export default function ResourceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [userLocation, setUserLocation] = useState({ lat: 37.3382, lng: -121.8863 });
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(RESOURCES);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (map.current) return;

    // Initialize map with touch/drag support
    map.current = L.map(mapContainer.current!, {
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      tap: true,
      tapTolerance: 15,
    }).setView([userLocation.lat, userLocation.lng], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add user location marker
    const userIcon = L.divIcon({
      html: `<div style="
        width: 20px;
        height: 20px;
        background: #d4af37;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
      "></div>`,
      iconSize: [20, 20],
      className: 'custom-user-marker',
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup('Your Location')
      .addTo(map.current);

    // Add search radius circle
    circleRef.current = L.circle([userLocation.lat, userLocation.lng], {
      radius: SEARCH_RADIUS_MILES * 1609.34,
      color: '#1F6F78',
      weight: 2,
      opacity: 0.4,
      fill: true,
      fillColor: '#1F6F78',
      fillOpacity: 0.1,
    }).addTo(map.current);

    addMarkers();

    // 8-axis touch/drag support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Leaflet handles this natively with dragging enabled
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchStartRef.current = null;
    };

    mapContainer.current?.addEventListener('touchstart', handleTouchStart);
    mapContainer.current?.addEventListener('touchmove', handleTouchMove);
    mapContainer.current?.addEventListener('touchend', handleTouchEnd);

    return () => {
      mapContainer.current?.removeEventListener('touchstart', handleTouchStart);
      mapContainer.current?.removeEventListener('touchmove', handleTouchMove);
      mapContainer.current?.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const addMarkers = () => {
    if (!map.current) return;

    markersRef.current.forEach(marker => map.current!.removeLayer(marker));
    markersRef.current = [];

    filteredResources.forEach(resource => {
      const icon = getResourceIcon(resource.type, resource.variant);
      const color = getColorForType(resource.type);

      const customIcon = L.divIcon({
        html: `<div style="
          width: 40px;
          height: 40px;
          background: ${color};
          border: 2px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">${icon}</div>`,
        iconSize: [40, 40],
        className: 'custom-marker',
      });

      const marker = L.marker([resource.lat, resource.lng], { icon: customIcon })
        .bindPopup(`<strong>${resource.name}</strong><br/>${resource.address}`)
        .on('click', () => {
          setSelectedResource(resource);
          setShowModal(true);
        })
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  };

  const getResourceIcon = (type: string, variant?: string): string => {
    const icons: { [key: string]: string } = {
      food: '🥫',
      health: '⚕️',
      housing: '🏠',
      jobs: '💼',
      legal: '⚖️',
    };
    if (type === 'camping') return variant === 'paid' ? '🏨' : '⛺';
    return icons[type] || '📍';
  };

  const getColorForType = (type: string): string => {
    const colors: { [key: string]: string } = {
      food: '#10B981',
      health: '#EF4444',
      housing: '#3B82F6',
      jobs: '#F59E0B',
      legal: '#8B5CF6',
      camping: '#EC4899',
    };
    return colors[type] || '#3B82F6';
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  const handleFilterChange = (type: string) => {
    setSelectedFilter(type);
    const maxDist = 50;
    const filtered = RESOURCES.filter(r => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, r.lat, r.lng);
      return (type === 'all' ? true : r.type === type) && dist <= maxDist;
    });
    setFilteredResources(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const maxDist = 50;
    const filtered = RESOURCES.filter(r => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, r.lat, r.lng);
      return r.name.toLowerCase().includes(query.toLowerCase()) && dist <= maxDist;
    });
    setFilteredResources(filtered);
  };

  const getRouteInfo = (vehicle: string | null, distance: number): string => {
    if (!vehicle) return `Distance: ${distance} miles`;
    switch (vehicle) {
      case 'none':
        return `🚶 Walking: ~${(distance / 3).toFixed(1)} hours (${distance} mi)`;
      case 'bike':
        return `🚴 Biking: ~${(distance / 12).toFixed(1)} hours (${distance} mi)`;
      case 'transit':
        return `🚌 Transit: ~${(distance / 20).toFixed(1)} hours (${distance} mi)`;
      case 'car':
        return `🚗 Driving: ~${(distance / 35).toFixed(1)} hours (${distance} mi)`;
      default:
        return `Distance: ${distance} miles`;
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  useEffect(() => {
    addMarkers();
  }, [filteredResources]);

  return (
    <div className="resource-map">
      <div className="hero">
        <h1>HAVEN</h1>
      </div>

      <div className="vehicle-selector">
        <button className={`vehicle-btn ${selectedVehicle === 'none' ? 'active' : ''}`} onClick={() => setSelectedVehicle('none')}>🚶 Walking</button>
        <button className={`vehicle-btn ${selectedVehicle === 'bike' ? 'active' : ''}`} onClick={() => setSelectedVehicle('bike')}>🚴 Biking</button>
        <button className={`vehicle-btn ${selectedVehicle === 'transit' ? 'active' : ''}`} onClick={() => setSelectedVehicle('transit')}>🚌 Transit</button>
        <button className={`vehicle-btn ${selectedVehicle === 'car' ? 'active' : ''}`} onClick={() => setSelectedVehicle('car')}>🚗 Car</button>
      </div>

      <div className="section-subtitle">San Jose & Surrounding Areas • 50 Mile Search Radius • Drag to pan in any direction (8-axis)</div>

      <div className="map-wrapper">
        <div className="map-container">
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>

        <div className="map-sidebar">
          <div className="search-box">
            <input type="text" placeholder="Search resources..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          </div>

          <div className="filter-buttons">
            <button className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>All Resources</button>
            <button className={`filter-btn ${selectedFilter === 'food' ? 'active' : ''}`} onClick={() => handleFilterChange('food')}>🥫 Food</button>
            <button className={`filter-btn ${selectedFilter === 'health' ? 'active' : ''}`} onClick={() => handleFilterChange('health')}>⚕️ Health</button>
            <button className={`filter-btn ${selectedFilter === 'housing' ? 'active' : ''}`} onClick={() => handleFilterChange('housing')}>🏠 Housing</button>
            <button className={`filter-btn ${selectedFilter === 'jobs' ? 'active' : ''}`} onClick={() => handleFilterChange('jobs')}>💼 Jobs</button>
            <button className={`filter-btn ${selectedFilter === 'camping' ? 'active' : ''}`} onClick={() => handleFilterChange('camping')}>⛺ Camping</button>
          </div>

          <div className="resources-list">
            {filteredResources.length === 0 ? (
              <div className="loading">No resources within 50 miles</div>
            ) : (
              filteredResources.map(resource => {
                const distance = calculateDistance(userLocation.lat, userLocation.lng, resource.lat, resource.lng);
                return (
                  <div key={resource.id} className={`resource-item ${selectedResource?.id === resource.id ? 'active' : ''}`} onClick={() => { setSelectedResource(resource); setShowModal(true); }}>
                    <div className="resource-name">{getResourceIcon(resource.type, resource.variant)} {resource.name}</div>
                    <div className="resource-type">{resource.type}{resource.variant ? ' - ' + resource.variant : ''}</div>
                    <div className="resource-distance">{distance} miles</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModal && selectedResource && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <div className="resource-detail-header">
              <div className="resource-detail-icon">{getResourceIcon(selectedResource.type, selectedResource.variant)}</div>
              <div className="resource-detail-info">
                <h2>{selectedResource.name}</h2>
                <p>{selectedResource.address}</p>
              </div>
            </div>

            {selectedResource.type === 'camping' && (
              <div className="camping-type">{selectedResource.variant === 'paid' ? '💵 Paid Camping' : '✨ Free Camping'}</div>
            )}

            <div className="detail-section">
              <h3>Contact</h3>
              <p><strong>Phone:</strong> {selectedResource.phone}</p>
              <p><strong>Hours:</strong> {selectedResource.hours}</p>
              <p><strong>Distance:</strong> {calculateDistance(userLocation.lat, userLocation.lng, selectedResource.lat, selectedResource.lng)} miles away</p>
              {selectedVehicle && (
                <div className="route-info">
                  {getRouteInfo(selectedVehicle, calculateDistance(userLocation.lat, userLocation.lng, selectedResource.lat, selectedResource.lng))}
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Services</h3>
              <ul>
                {selectedResource.services.map((service, idx) => (
                  <li key={idx}>{service}</li>
                ))}
              </ul>
            </div>

            <div className="detail-actions">
              <button className="detail-btn detail-btn-primary" onClick={() => handleCall(selectedResource.phone)}>Call Now</button>
              <button className="detail-btn detail-btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
