// Real-time Transportation Updates via WebSocket
// Location: backend/src/services/TransitRealtimeService.ts

import { WebSocketServer, WebSocket } from 'ws';
import TransportationService, { TransitVehicle } from './TransportationService';

export class TransitRealtimeService {
  private wss: WebSocketServer;
  private updateInterval: NodeJS.Timeout | null = null;
  private routeSubscriptions: Map<string, Set<WebSocket>> = new Map();
  private stopSubscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.initializeUpdates();
  }

  /**
   * Initialize real-time updates (every 15 seconds)
   */
  private initializeUpdates() {
    this.updateInterval = setInterval(async () => {
      try {
        await this.broadcastTransitUpdates();
      } catch (error) {
        console.error('Error broadcasting transit updates:', error);
      }
    }, 15000); // 15 second interval
  }

  /**
   * Broadcast updates to all subscribers
   */
  private async broadcastTransitUpdates() {
    // Get all subscribed routes
    const routes = Array.from(this.routeSubscriptions.keys());

    for (const routeId of routes) {
      try {
        // Get vehicle locations
        const vehicles = await TransportationService.getVehicleLocations(routeId);
        
        // Get stop information
        const stops = await TransportationService.getRouteStops(routeId);

        const update = {
          type: 'transit-update',
          routeId,
          timestamp: Date.now(),
          vehicles,
          stops,
        };

        // Send to all subscribers of this route
        const subscribers = this.routeSubscriptions.get(routeId);
        if (subscribers) {
          const message = JSON.stringify(update);
          subscribers.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
      } catch (error) {
        console.error(`Error updating route ${routeId}:`, error);
      }
    }

    // Update arrivals for subscribed stops
    const stops = Array.from(this.stopSubscriptions.keys());
    for (const stopId of stops) {
      try {
        const arrivals = await TransportationService.getArrivals(stopId);

        const update = {
          type: 'arrivals-update',
          stopId,
          timestamp: Date.now(),
          arrivals,
        };

        const subscribers = this.stopSubscriptions.get(stopId);
        if (subscribers) {
          const message = JSON.stringify(update);
          subscribers.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
      } catch (error) {
        console.error(`Error updating stop ${stopId}:`, error);
      }
    }
  }

  /**
   * Subscribe client to route updates
   */
  subscribeToRoute(ws: WebSocket, routeId: string) {
    if (!this.routeSubscriptions.has(routeId)) {
      this.routeSubscriptions.set(routeId, new Set());
    }
    this.routeSubscriptions.get(routeId)!.add(ws);

    // Send initial data
    this.sendInitialRouteData(ws, routeId);
  }

  /**
   * Subscribe client to stop arrivals
   */
  subscribeToStop(ws: WebSocket, stopId: string) {
    if (!this.stopSubscriptions.has(stopId)) {
      this.stopSubscriptions.set(stopId, new Set());
    }
    this.stopSubscriptions.get(stopId)!.add(ws);

    // Send initial data
    this.sendInitialStopData(ws, stopId);
  }

  /**
   * Unsubscribe client from route
   */
  unsubscribeFromRoute(ws: WebSocket, routeId: string) {
    this.routeSubscriptions.get(routeId)?.delete(ws);
  }

  /**
   * Unsubscribe client from stop
   */
  unsubscribeFromStop(ws: WebSocket, stopId: string) {
    this.stopSubscriptions.get(stopId)?.delete(ws);
  }

  /**
   * Send initial route data
   */
  private async sendInitialRouteData(ws: WebSocket, routeId: string) {
    try {
      const vehicles = await TransportationService.getVehicleLocations(routeId);
      const stops = await TransportationService.getRouteStops(routeId);

      const message = JSON.stringify({
        type: 'initial-route-data',
        routeId,
        vehicles,
        stops,
      });

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('Error sending initial route data:', error);
    }
  }

  /**
   * Send initial stop data
   */
  private async sendInitialStopData(ws: WebSocket, stopId: string) {
    try {
      const arrivals = await TransportationService.getArrivals(stopId);

      const message = JSON.stringify({
        type: 'initial-stop-data',
        stopId,
        arrivals,
      });

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('Error sending initial stop data:', error);
    }
  }

  /**
   * Clean up on client disconnect
   */
  cleanupClient(ws: WebSocket) {
    // Remove from all route subscriptions
    this.routeSubscriptions.forEach((subscribers) => {
      subscribers.delete(ws);
    });

    // Remove from all stop subscriptions
    this.stopSubscriptions.forEach((subscribers) => {
      subscribers.delete(ws);
    });
  }

  /**
   * Cleanup service
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.routeSubscriptions.clear();
    this.stopSubscriptions.clear();
  }
}

export default TransitRealtimeService;
