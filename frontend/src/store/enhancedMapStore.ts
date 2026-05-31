// Enhanced Map Store - Transportation + Resources
// Location: frontend/src/store/enhancedMapStore.ts

import { create } from 'zustand';
import mapIntegrationService from '../services/mapIntegrationService';

export interface MapPin {
  id: string;
  type: 'resource' | 'transit-stop' | 'transit-vehicle' | 'user';
  name: string;
  latitude: number;
  longitude: number;
  color?: string;
  icon: string;
  data?: Record<string, any>;
}

interface EnhancedMapStore {
  // Location
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (lat: number, lng: number) => void;

  // Zoom & Pan
  zoom: number;
  setZoom: (zoom: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;

  // Map Pins (combined resources + transit)
  pins: MapPin[];
  setPins: (pins: MapPin[]) => void;
  addPin: (pin: MapPin) => void;
  removePin: (id: string) => void;
  updatePin: (id: string, data: Partial<MapPin>) => void;

  // Transit Focus
  focusedRoute: string | null;
  setFocusedRoute: (routeId: string | null) => void;
  focusedStop: string | null;
  setFocusedStop: (stopId: string | null) => void;

  // Selected Pins
  selectedPin: MapPin | null;
  setSelectedPin: (pin: MapPin | null) => void;

  // Transit Data
  transitRoutes: any[];
  setTransitRoutes: (routes: any[]) => void;
  transitVehicles: Map<string, any[]>;
  setTransitVehicles: (routeId: string, vehicles: any[]) => void;

  // Resources
  resources: any[];
  setResources: (resources: any[]) => void;

  // Filters
  visibleCategories: Set<string>;
  toggleCategory: (category: string) => void;

  // Data Fetching
  fetchNearbyData: (lat: number, lng: number) => Promise<void>;
  fetchTransitRoutes: () => Promise<void>;
  subscribeToTransit: (routeId: string) => void;
  unsubscribeFromTransit: (routeId: string) => void;

  // Cleanup
  cleanup: () => void;
}

export const useEnhancedMapStore = create<EnhancedMapStore>((set, get) => {
  const subscriptions = new Map<string, WebSocket>();

  return {
    // Location
    userLocation: null,
    setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),

    // Zoom & Pan
    zoom: 13,
    setZoom: (zoom) => set({ zoom }),
    panOffset: { x: 0, y: 0 },
    setPanOffset: (offset) => set({ panOffset: offset }),

    // Pins
    pins: [],
    setPins: (pins) => set({ pins }),
    addPin: (pin) => set((state) => ({ pins: [...state.pins, pin] })),
    removePin: (id) => set((state) => ({ pins: state.pins.filter((p) => p.id !== id) })),
    updatePin: (id, data) =>
      set((state) => ({
        pins: state.pins.map((p) => (p.id === id ? { ...p, ...data } : p)),
      })),

    // Transit Focus
    focusedRoute: null,
    setFocusedRoute: (routeId) => set({ focusedRoute: routeId }),
    focusedStop: null,
    setFocusedStop: (stopId) => set({ focusedStop: stopId }),

    // Selected Pin
    selectedPin: null,
    setSelectedPin: (pin) => set({ selectedPin: pin }),

    // Transit Data
    transitRoutes: [],
    setTransitRoutes: (routes) => set({ transitRoutes: routes }),
    transitVehicles: new Map(),
    setTransitVehicles: (routeId, vehicles) =>
      set((state) => {
        const newMap = new Map(state.transitVehicles);
        newMap.set(routeId, vehicles);
        return { transitVehicles: newMap };
      }),

    // Resources
    resources: [],
    setResources: (resources) => set({ resources }),

    // Filters
    visibleCategories: new Set(['housing', 'healthcare', 'food', 'transit', 'veterinary']),
    toggleCategory: (category) =>
      set((state) => {
        const newSet = new Set(state.visibleCategories);
        if (newSet.has(category)) {
          newSet.delete(category);
        } else {
          newSet.add(category);
        }
        return { visibleCategories: newSet };
      }),

    // Data Fetching
    fetchNearbyData: async (lat, lng) => {
      try {
        const [resources, stops] = await Promise.all([
          mapIntegrationService.getNearbyResources(lat, lng, 5),
          mapIntegrationService.getNearbyStops(lat, lng, 2),
        ]);

        const pins: MapPin[] = [
          ...resources.map((r) => ({
            id: `res-${r.id}`,
            type: 'resource' as const,
            name: r.name,
            latitude: r.latitude,
            longitude: r.longitude,
            color: '#3b82f6',
            icon: '📍',
            data: r,
          })),
          ...stops.map((s) => ({
            id: `stop-${s.id}`,
            type: 'transit-stop' as const,
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
            color: '#8b5cf6',
            icon: '🚌',
            data: s,
          })),
        ];

        set({ pins });
      } catch (error) {
        console.error('Error fetching nearby data:', error);
      }
    },

    fetchTransitRoutes: async () => {
      try {
        const routes = await mapIntegrationService.getTransitRoutes();
        set({ transitRoutes: routes });
      } catch (error) {
        console.error('Error fetching transit routes:', error);
      }
    },

    subscribeToTransit: (routeId) => {
      const ws = mapIntegrationService.subscribeToRoute(routeId, (data) => {
        if (data.type === 'transit-update') {
          get().setTransitVehicles(
            routeId,
            data.vehicles.map((v: any) => ({
              id: `vehicle-${v.id}`,
              type: 'transit-vehicle',
              name: `${data.routeName} - ${v.vehicleNumber}`,
              latitude: v.currentLatitude,
              longitude: v.currentLongitude,
              color: mapIntegrationService.getVehicleStatusColor(v.status),
              icon: '🚗',
              data: v,
            }))
          );
        }
      });

      if (ws) {
        subscriptions.set(routeId, ws);
      }
    },

    unsubscribeFromTransit: (routeId) => {
      mapIntegrationService.unsubscribeFromRoute(routeId);
      subscriptions.delete(routeId);
    },

    cleanup: () => {
      subscriptions.forEach((ws) => ws.close());
      subscriptions.clear();
    },
  };
});
