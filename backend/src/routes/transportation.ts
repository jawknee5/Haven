// Transportation API Routes
// Location: backend/src/routes/transportation.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import TransportationService from '../services/TransportationService';

const router = Router();

/**
 * Get all transit routes
 * GET /api/transportation/routes
 */
router.get('/routes', async (req, res) => {
  try {
    const { type, mode } = req.query;
    const routes = await TransportationService.getTransitRoutes(
      type as any,
      mode as any
    );
    res.json({ success: true, routes });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

/**
 * Get route details with vehicles and stops
 * GET /api/transportation/routes/:routeId
 */
router.get('/routes/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const details = await TransportationService.getRouteDetails(routeId);
    res.json({ success: true, route: details });
  } catch (error) {
    console.error('Error fetching route details:', error);
    res.status(500).json({ error: 'Failed to fetch route details' });
  }
});

/**
 * Get stops for a route
 * GET /api/transportation/routes/:routeId/stops
 */
router.get('/routes/:routeId/stops', async (req, res) => {
  try {
    const { routeId } = req.params;
    const stops = await TransportationService.getRouteStops(routeId);
    res.json({ success: true, stops });
  } catch (error) {
    console.error('Error fetching stops:', error);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

/**
 * Get vehicle locations for a route
 * GET /api/transportation/routes/:routeId/vehicles
 */
router.get('/routes/:routeId/vehicles', async (req, res) => {
  try {
    const { routeId } = req.params;
    const vehicles = await TransportationService.getVehicleLocations(routeId);
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

/**
 * Get next arrivals for a stop
 * GET /api/transportation/stops/:stopId/arrivals
 */
router.get('/stops/:stopId/arrivals', async (req, res) => {
  try {
    const { stopId } = req.params;
    const { limit } = req.query;
    const arrivals = await TransportationService.getArrivals(
      stopId,
      limit ? parseInt(limit as string) : 5
    );
    res.json({ success: true, arrivals });
  } catch (error) {
    console.error('Error fetching arrivals:', error);
    res.status(500).json({ error: 'Failed to fetch arrivals' });
  }
});

/**
 * Get nearby transit stops
 * GET /api/transportation/stops/nearby
 */
router.get('/stops/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude required' });
    }

    const stops = await TransportationService.getNearbyStops(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      radius ? parseFloat(radius as string) : 2
    );
    
    res.json({ success: true, stops });
  } catch (error) {
    console.error('Error fetching nearby stops:', error);
    res.status(500).json({ error: 'Failed to fetch nearby stops' });
  }
});

/**
 * Search routes
 * GET /api/transportation/search
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'query required' });
    }

    const routes = await TransportationService.searchRoutes(q as string);
    res.json({ success: true, routes });
  } catch (error) {
    console.error('Error searching routes:', error);
    res.status(500).json({ error: 'Failed to search routes' });
  }
});

export default router;
