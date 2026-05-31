// Transportation Service - Real-time Transit Data
// Location: backend/src/services/TransportationService.ts

import { prisma } from '../lib/prisma';

export enum TransportationType {
  GROUND = 'ground',
  AIR = 'air',
  WATER = 'water',
}

export enum TransitMode {
  BUS = 'bus',
  TRAIN = 'train',
  LIGHT_RAIL = 'light-rail',
  SUBWAY = 'subway',
  STREETCAR = 'streetcar',
  RIDESHARE = 'rideshare',
  PLANE = 'plane',
  HELICOPTER = 'helicopter',
  FERRY = 'ferry',
  BOAT = 'boat',
  WATER_TAXI = 'water-taxi',
}

export interface TransitRoute {
  id: string;
  name: string;
  number?: string;
  type: TransitMode;
  transportationType: TransportationType;
  color: string;
  textColor: string;
  description?: string;
  operatingHours?: {
    start: string;
    end: string;
  };
}

export interface TransitStop {
  id: string;
  routeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  sequence: number;
  arrivalTime?: Date;
  departureTime?: Date;
}

export interface TransitVehicle {
  id: string;
  routeId: string;
  vehicleNumber: string;
  currentLatitude: number;
  currentLongitude: number;
  currentStop?: string;
  nextStop?: string;
  status: 'in-transit' | 'stopped' | 'delayed' | 'out-of-service';
  occupancy?: number;
  lastUpdate: Date;
  heading?: number;
  speed?: number;
}

export class TransportationService {
  /**
   * Get all transit routes
   */
  static async getTransitRoutes(
    type?: TransportationType,
    mode?: TransitMode
  ): Promise<TransitRoute[]> {
    // This would integrate with real transit APIs
    // GTFS, MTA, VTA, Caltrain, Bay Area transit systems
    const routes = await prisma.transitRoute.findMany({
      where: {
        ...(type && { transportationType: type }),
        ...(mode && { transitMode: mode }),
        isActive: true,
      },
      orderBy: [{ transportationType: 'asc' }, { routeNumber: 'asc' }],
    });

    return routes.map((r: any) => ({
      id: r.id,
      name: r.routeName,
      number: r.routeNumber,
      type: r.transitMode,
      transportationType: r.transportationType,
      color: r.routeColor,
      textColor: r.textColor,
      description: r.description,
      operatingHours: r.operatingHours,
    }));
  }

  /**
   * Get stops for a specific route
   */
  static async getRouteStops(routeId: string): Promise<TransitStop[]> {
    const stops = await prisma.transitStop.findMany({
      where: { routeId },
      orderBy: { sequence: 'asc' },
    });

    return stops.map((s: any) => ({
      id: s.id,
      routeId: s.routeId,
      name: s.stopName,
      latitude: s.latitude,
      longitude: s.longitude,
      address: s.address,
      sequence: s.sequence,
      arrivalTime: s.arrivalTime,
      departureTime: s.departureTime,
    }));
  }

  /**
   * Get real-time vehicle locations
   */
  static async getVehicleLocations(routeId: string): Promise<TransitVehicle[]> {
    // This integrates with real-time GTFS-RT feeds
    const vehicles = await prisma.transitVehicle.findMany({
      where: { routeId, isActive: true },
      orderBy: { lastUpdate: 'desc' },
    });

    return vehicles.map((v: any) => ({
      id: v.id,
      routeId: v.routeId,
      vehicleNumber: v.vehicleNumber,
      currentLatitude: v.currentLatitude,
      currentLongitude: v.currentLongitude,
      currentStop: v.currentStopId,
      nextStop: v.nextStopId,
      status: v.status,
      occupancy: v.occupancy,
      lastUpdate: v.lastUpdate,
      heading: v.heading,
      speed: v.speed,
    }));
  }

  /**
   * Get next arrivals for a stop
   */
  static async getArrivals(stopId: string, limit = 5): Promise<any[]> {
    const arrivals = await prisma.transitArrival.findMany({
      where: {
        stopId,
        arrivalTime: {
          gte: new Date(),
        },
      },
      orderBy: { arrivalTime: 'asc' },
      take: limit,
      include: {
        route: true,
      },
    });

    return arrivals.map((a: any) => ({
      routeId: a.route.id,
      routeName: a.route.routeName,
      routeNumber: a.route.routeNumber,
      vehicleId: a.vehicleId,
      arrivalTime: a.arrivalTime,
      minutesUntilArrival: Math.round(
        (a.arrivalTime.getTime() - Date.now()) / 60000
      ),
      status: a.status,
      occupancy: a.occupancy,
    }));
  }

  /**
   * Update vehicle locations (from real-time feed)
   */
  static async updateVehicleLocations(updates: TransitVehicle[]): Promise<void> {
    for (const vehicle of updates) {
      await prisma.transitVehicle.upsert({
        where: { id: vehicle.id },
        update: {
          currentLatitude: vehicle.currentLatitude,
          currentLongitude: vehicle.currentLongitude,
          currentStopId: vehicle.currentStop,
          nextStopId: vehicle.nextStop,
          status: vehicle.status,
          occupancy: vehicle.occupancy,
          lastUpdate: vehicle.lastUpdate,
          heading: vehicle.heading,
          speed: vehicle.speed,
        },
        create: {
          id: vehicle.id,
          routeId: vehicle.routeId,
          vehicleNumber: vehicle.vehicleNumber,
          currentLatitude: vehicle.currentLatitude,
          currentLongitude: vehicle.currentLongitude,
          currentStopId: vehicle.currentStop,
          nextStopId: vehicle.nextStop,
          status: vehicle.status,
          occupancy: vehicle.occupancy,
          lastUpdate: vehicle.lastUpdate,
          heading: vehicle.heading,
          speed: vehicle.speed,
          isActive: true,
        },
      });
    }
  }

  /**
   * Get nearby transit stops
   */
  static async getNearbyStops(
    latitude: number,
    longitude: number,
    radiusKm = 2
  ): Promise<TransitStop[]> {
    // Using PostGIS or similar for geo queries
    const stops = await prisma.$queryRaw`
      SELECT * FROM transit_stops
      WHERE ST_Distance_Sphere(
        ST_Point(longitude, latitude),
        ST_Point(${longitude}, ${latitude})
      ) / 1000 <= ${radiusKm}
      ORDER BY ST_Distance_Sphere(
        ST_Point(longitude, latitude),
        ST_Point(${longitude}, ${latitude})
      )
      LIMIT 20
    `;

    return stops as TransitStop[];
  }

  /**
   * Get route details with schedule
   */
  static async getRouteDetails(routeId: string): Promise<any> {
    const route = await prisma.transitRoute.findUnique({
      where: { id: routeId },
      include: {
        stops: {
          orderBy: { sequence: 'asc' },
        },
        vehicles: {
          where: { isActive: true },
        },
      },
    });

    if (!route) {
      throw new Error('Route not found');
    }

    return {
      id: route.id,
      name: route.routeName,
      number: route.routeNumber,
      type: route.transitMode,
      transportationType: route.transportationType,
      color: route.routeColor,
      textColor: route.textColor,
      description: route.description,
      operatingHours: route.operatingHours,
      stops: route.stops.map((s: any) => ({
        id: s.id,
        name: s.stopName,
        latitude: s.latitude,
        longitude: s.longitude,
        sequence: s.sequence,
      })),
      liveVehicles: route.vehicles.length,
      vehicles: route.vehicles.map((v: any) => ({
        id: v.id,
        currentLatitude: v.currentLatitude,
        currentLongitude: v.currentLongitude,
        status: v.status,
      })),
    };
  }

  /**
   * Search routes by name or number
   */
  static async searchRoutes(query: string): Promise<TransitRoute[]> {
    const routes = await prisma.transitRoute.findMany({
      where: {
        OR: [
          { routeName: { contains: query, mode: 'insensitive' } },
          { routeNumber: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: 10,
    });

    return routes.map((r: any) => ({
      id: r.id,
      name: r.routeName,
      number: r.routeNumber,
      type: r.transitMode,
      transportationType: r.transportationType,
      color: r.routeColor,
      textColor: r.textColor,
    }));
  }
}

export default TransportationService;
