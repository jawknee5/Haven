// Enhanced ResourceMap - Transit Integration
// Location: frontend/src/components/EnhancedResourceMap.tsx

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Phone, Mail, Globe } from 'lucide-react';
import { useEnhancedMapStore, MapPin as MapPinType } from '../store/enhancedMapStore';
import mapIntegrationService from '../services/mapIntegrationService';
import '../styles/ResourceMap.css';

const EnhancedResourceMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    pins,
    userLocation,
    zoom,
    setUserLocation,
    setZoom,
    setPanOffset,
    panOffset,
    selectedPin,
    setSelectedPin,
    focusedRoute,
    transitVehicles,
    visibleCategories,
    fetchNearbyData,
    fetchTransitRoutes,
    subscribeToTransit,
    unsubscribeFromTransit,
  } = useEnhancedMapStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation(pos.coords.latitude, pos.coords.longitude);
      });
    }

    fetchTransitRoutes();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyData(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  useEffect(() => {
    if (focusedRoute) {
      subscribeToTransit(focusedRoute);
      return () => {
        unsubscribeFromTransit(focusedRoute);
      };
    }
  }, [focusedRoute]);

  useEffect(() => {
    drawMap();
  }, [pins, userLocation, zoom, panOffset, selectedPin, focusedRoute, transitVehicles]);

  const drawMap = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!userLocation) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pixelsPerMeter = (40 - zoom) * 0.5;

    // Draw pins
    pins.forEach((pin) => {
      // Skip if category not visible
      if (pin.type === 'resource' && !visibleCategories.has(pin.data?.category)) {
        return;
      }

      const dx = (pin.longitude - userLocation.lng) * 111000 * pixelsPerMeter;
      const dy = (pin.latitude - userLocation.lat) * 111000 * pixelsPerMeter;

      const x = centerX + dx + panOffset.x;
      const y = centerY - dy + panOffset.y;

      if (x > -40 && x < canvas.width + 40 && y > -40 && y < canvas.height + 40) {
        drawPin(ctx, x, y, pin);
      }
    });

    // Draw transit vehicles if route is focused
    if (focusedRoute) {
      const vehicles = transitVehicles.get(focusedRoute) || [];
      vehicles.forEach((vehicle) => {
        const dx = (vehicle.data.currentLongitude - userLocation.lng) * 111000 * pixelsPerMeter;
        const dy = (vehicle.data.currentLatitude - userLocation.lat) * 111000 * pixelsPerMeter;

        const x = centerX + dx + panOffset.x;
        const y = centerY - dy + panOffset.y;

        if (x > -40 && x < canvas.width + 40 && y > -40 && y < canvas.height + 40) {
          drawVehicle(ctx, x, y, vehicle, vehicle.data);
        }
      });
    }

    // Draw user location
    drawUserLocation(ctx, centerX + panOffset.x, centerY + panOffset.y);
  };

  const drawPin = (ctx: CanvasRenderingContext2D, x: number, y: number, pin: MapPinType) => {
    const isSelected = selectedPin?.id === pin.id;
    const radius = isSelected ? 12 : 8;

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y + 2, radius + 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw pin circle
    ctx.fillStyle = isSelected ? '#007AFF' : pin.color || '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw icon
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${radius}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pin.icon, x, y);

    // Draw label
    if (isSelected) {
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.fillText(pin.name.substring(0, 15), x, y + radius + 15);
    }
  };

  const drawVehicle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    vehicle: any,
    vehicleData: any
  ) => {
    const size = 12;

    // Vehicle icon with heading direction
    if (vehicleData.heading) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((vehicleData.heading * Math.PI) / 180);

      ctx.fillStyle = vehicle.color || '#22c55e';
      ctx.fillRect(-size / 2, -size, size, size * 2);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-size / 2, -size, size, size * 2);

      ctx.restore();
    } else {
      ctx.fillStyle = vehicle.color || '#22c55e';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Occupancy indicator
    if (vehicleData.occupancy !== undefined) {
      const occupancyPercent = vehicleData.occupancy / 100;
      ctx.fillStyle = occupancyPercent > 0.8 ? '#ef4444' : occupancyPercent > 0.5 ? '#f59e0b' : '#22c55e';
      ctx.fillRect(x - size - 2, y - 2, 4, 4);
    }
  };

  const drawUserLocation = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !userLocation) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pixelsPerMeter = (40 - zoom) * 0.5;

    // Check if clicked on a pin
    for (const pin of pins) {
      const dx = (pin.longitude - userLocation.lng) * 111000 * pixelsPerMeter;
      const dy = (pin.latitude - userLocation.lat) * 111000 * pixelsPerMeter;

      const x = centerX + dx + panOffset.x;
      const y = centerY - dy + panOffset.y;

      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (distance < 12) {
        setSelectedPin(pin);
        return;
      }
    }

    setSelectedPin(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setPanOffset({
      x: panOffset.x + dx,
      y: panOffset.y + dy,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = e.deltaY > 0 ? Math.max(1, zoom - 1) : Math.min(20, zoom + 1);
    setZoom(newZoom);
  };

  const handleSnapToLocation = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="resource-map-widget">
      <div className="map-header">
        <h3>Resources & Transit</h3>
      </div>

      <div
        ref={containerRef}
        className="map-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      >
        <canvas ref={canvasRef} className="map-canvas" />
      </div>

      <div className="map-controls">
        <button className="control-button snap-button" onClick={handleSnapToLocation} title="Snap to location">
          <Navigation size={18} />
        </button>
        <button className="control-button zoom-button" onClick={() => setZoom(Math.min(20, zoom + 1))} title="Zoom in">
          <ZoomIn size={18} />
        </button>
        <button className="control-button zoom-button" onClick={() => setZoom(Math.max(1, zoom - 1))} title="Zoom out">
          <ZoomOut size={18} />
        </button>
      </div>

      {selectedPin && (
        <div className="resource-info-popup">
          <h4>{selectedPin.name}</h4>
          {selectedPin.data?.address && <p>📍 {selectedPin.data.address}</p>}
          {selectedPin.data?.phone && (
            <a href={mapIntegrationService.createPhoneLink(selectedPin.data.phone)} className="link-button">
              <Phone size={14} /> {selectedPin.data.phone}
            </a>
          )}
          {selectedPin.data?.email && (
            <a href={mapIntegrationService.createEmailLink(selectedPin.data.email)} className="link-button">
              <Mail size={14} /> Email
            </a>
          )}
          {selectedPin.data?.website && (
            <a href={mapIntegrationService.createWebsiteLink(selectedPin.data.website)} target="_blank" rel="noopener noreferrer" className="link-button">
              <Globe size={14} /> Website
            </a>
          )}
          {selectedPin.data?.hours && <p>⏰ {selectedPin.data.hours}</p>}
        </div>
      )}

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-dot user"></div>
          <span>Your Location</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot resource"></div>
          <span>Resources</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot transit"></div>
          <span>Transit Stop</span>
        </div>
        {focusedRoute && (
          <div className="legend-item">
            <div className="legend-dot vehicle"></div>
            <span>Active Vehicle</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedResourceMap;
