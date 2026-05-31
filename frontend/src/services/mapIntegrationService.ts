// Enhanced Map Integration - Transportation + Resources
// Location: frontend/src/services/mapIntegrationService.ts

import axios from 'axios';

export interface TransitRoute {
  id: string;
  name: string;
  number?: string;
  type: string;
  transportationType: string;
  color: string;
  textColor: string;
}

export interface TransitStop {
  id: string;
  routeId: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
}

export interface TransitVehicle {
  id: string;
  routeId: string;
  currentLatitude: number;
  currentLongitude: number;
  status: 'in-transit' | 'stopped' | 'delayed' | 'out-of-service';
  occupancy?: number;
  heading?: number;
}

export interface MapResource {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  icon: string;
}

class MapIntegrationService {
  private apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  private wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';
  private transitSubscriptions = new Map<string, WebSocket>();

  /**
   * Get all transit routes
   */
  async getTransitRoutes(): Promise<TransitRoute[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/transportation/routes`);
      return response.data.routes || [];
    } catch (error) {
      console.error('Error fetching transit routes:', error);
      return [];
    }
  }

  /**
   * Get route details with stops and vehicles
   */
  async getRouteDetails(routeId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/transportation/routes/${routeId}`);
      return response.data.route;
    } catch (error) {
      console.error('Error fetching route details:', error);
      return null;
    }
  }

  /**
   * Get stops for a route
   */
  async getRouteStops(routeId: string): Promise<TransitStop[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/transportation/routes/${routeId}/stops`);
      return response.data.stops || [];
    } catch (error) {
      console.error('Error fetching route stops:', error);
      return [];
    }
  }

  /**
   * Get live vehicles for a route
   */
  async getVehicleLocations(routeId: string): Promise<TransitVehicle[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/transportation/routes/${routeId}/vehicles`);
      return response.data.vehicles || [];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time transit updates
   */
  subscribeToRoute(routeId: string, onUpdate: (data: any) => void): WebSocket | null {
    try {
      if (this.transitSubscriptions.has(routeId)) {
        return this.transitSubscriptions.get(routeId) || null;
      }

      const ws = new WebSocket(`${this.wsUrl}/ws/transportation?routeId=${routeId}`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.transitSubscriptions.delete(routeId);
      };

      ws.onclose = () => {
        this.transitSubscriptions.delete(routeId);
      };

      this.transitSubscriptions.set(routeId, ws);
      return ws;
    } catch (error) {
      console.error('Error subscribing to route:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from route updates
   */
  unsubscribeFromRoute(routeId: string): void {
    const ws = this.transitSubscriptions.get(routeId);
    if (ws) {
      ws.close();
      this.transitSubscriptions.delete(routeId);
    }
  }

  /**
   * Get nearby stops
   */
  async getNearbyStops(latitude: number, longitude: number, radiusKm = 2): Promise<TransitStop[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/transportation/stops/nearby`, {
        params: { latitude, longitude, radius: radiusKm },
      });
      return response.data.stops || [];
    } catch (error) {
      console.error('Error fetching nearby stops:', error);
      return [];
    }
  }

  /**
   * Get arrivals for a stop
   */
  async getStopArrivals(stopId: string, limit = 5): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/transportation/stops/${stopId}/arrivals`, {
        params: { limit },
      });
      return response.data.arrivals || [];
    } catch (error) {
      console.error('Error fetching arrivals:', error);
      return [];
    }
  }

  /**
   * Get nearby resources
   */
  async getNearbyResources(latitude: number, longitude: number, radiusKm = 5): Promise<MapResource[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/resources/nearby`, {
        params: { latitude, longitude, radius: radiusKm },
      });
      return response.data.resources || [];
    } catch (error) {
      console.error('Error fetching nearby resources:', error);
      return [];
    }
  }

  /**
   * Search resources by category
   */
  async getResourcesByCategory(category: string): Promise<MapResource[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/resources/category/${category}`);
      return response.data.resources || [];
    } catch (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
  }

  /**
   * Get all resource categories
   */
  async getResourceCategories(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/resources/categories`);
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Convert phone number to tel: link
   */
  createPhoneLink(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return `tel:+1${cleaned}`;
  }

  /**
   * Create mailto: link
   */
  createEmailLink(email: string): string {
    return `mailto:${email}`;
  }

  /**
   * Create http: link
   */
  createWebsiteLink(url: string): string {
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  }

  /**
   * Calculate distance between two points (Haversine)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get route color for map display
   */
  getRouteColor(route: TransitRoute): string {
    return route.color || '#3b82f6';
  }

  /**
   * Get vehicle status color
   */
  getVehicleStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'in-transit': '#22c55e',
      stopped: '#f59e0b',
      delayed: '#ef4444',
      'out-of-service': '#6b7280',
    };
    return colors[status] || '#3b82f6';
  }
}

export default new MapIntegrationService();
