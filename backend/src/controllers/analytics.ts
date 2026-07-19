import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { reliabilityEngine } from '../services/ReliabilityEngine';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAnalytics(_req: Request, res: Response) {
  try {
    const today = startOfDay(new Date());

    const [totalCases, openCases, routedCases, activeResources] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: { in: ['NEW', 'ENRICHED'] as any } } }),
      prisma.case.count({ where: { status: 'ROUTED' as any } }),
      prisma.resource.count({ where: { isActive: true } }),
    ]);

    res.json({
      generatedAt: new Date().toISOString(),
      totals: { totalCases, openCases, routedCases, activeResources },
      reliability: reliabilityEngine.getTelemetry(),
      since: today.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load analytics' });
  }
}

export async function getCaseMetrics(_req: Request, res: Response) {
  try {
    const [byStatus, latest] = await Promise.all([
      prisma.case.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.case.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, createdAt: true, assignedResourceId: true },
      }),
    ]);

    res.json({ byStatus, latest });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load case metrics' });
  }
}

export async function getCaseworkerMetrics(_req: Request, res: Response) {
  try {
    const assignments = await prisma.case.groupBy({
      by: ['assignedResourceId'],
      _count: { _all: true },
      where: { assignedResourceId: { not: null } },
    });

    res.json({ assignments });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load caseworker metrics' });
  }
}
