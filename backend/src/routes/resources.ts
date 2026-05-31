// Resource Routes - Map Integration
// Location: backend/src/routes/resources.ts

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * Get all resources
 * GET /api/resources
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

/**
 * Get resources by category
 * GET /api/resources/category/:category
 */
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const resources = await prisma.resource.findMany({
      where: { category, isActive: true },
      orderBy: { name: 'asc' },
    });

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No resources found in this category',
      });
    }

    res.json({ success: true, category, resources });
  } catch (error) {
    console.error('Error fetching resources by category:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

/**
 * Get nearby resources
 * GET /api/resources/nearby
 */
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'latitude and longitude required',
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = radius ? parseFloat(radius as string) : 5;

    // Simple distance calculation (not perfect for Earth but works locally)
    const resources = await prisma.resource.findMany({
      where: { isActive: true, latitude: { not: null }, longitude: { not: null } },
    });

    // Filter by distance
    const nearby = resources
      .filter((r) => {
        if (!r.latitude || !r.longitude) return false;

        const latDiff = r.latitude - lat;
        const lngDiff = r.longitude - lng;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

        // Rough conversion: 1 degree ≈ 111 km
        return distance * 111 <= radiusKm;
      })
      .sort((a, b) => {
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
        const distA = Math.sqrt(
          Math.pow(a.latitude - lat, 2) + Math.pow(a.longitude - lng, 2)
        );
        const distB = Math.sqrt(
          Math.pow(b.latitude - lat, 2) + Math.pow(b.longitude - lng, 2)
        );
        return distA - distB;
      });

    res.json({ success: true, nearby, count: nearby.length });
  } catch (error) {
    console.error('Error fetching nearby resources:', error);
    res.status(500).json({ error: 'Failed to fetch nearby resources' });
  }
});

/**
 * Get all resource categories
 * GET /api/resources/categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = resources.map((r) => r.category).filter(Boolean);
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * Get resource by ID
 * GET /api/resources/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ success: true, resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

export default router;
