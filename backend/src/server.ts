import express from 'express';
import advancedResourcesRouter from './routes/advancedResources';
import cors from 'cors';
import { login, getCases, getResources, routeCase, enrichCase } from './controllers/api';
import { getAnalytics, getCaseMetrics, getCaseworkerMetrics } from './controllers/analytics';
import {
  bbChat,
  bbIntroduction,
  bbAnalyzeForm,
  bbAutoFillForm,
  bbTrackApplication,
  bbCheckApplicationStatus,
  bbApplicationsSummary,
  bbAnalyzeScreen,
  bbExecuteBrowserAction,
} from './controllers/bbController';
import { requireAuth } from './middleware/auth';
import { metricsMiddleware, getMetrics } from './middleware/metrics';
import transportationRouter from './routes/transportation';
import omegisRouter from './routes/omegis';
import resourcesRouter from './routes/resources';
import { reliabilityEngine } from './services/ReliabilityEngine';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(metricsMiddleware);

const reliabilityResetLimiter = new Map<string, { count: number; windowStart: number }>();

const RELIABILITY_RESET_WINDOW_MS = 60_000;
const RELIABILITY_RESET_MAX_REQUESTS = 10;

function getActorIdentity(req: express.Request): { actorId: string; role: string } {
  const user = req.user || {};
  const actorId = String((user as any).userId || (user as any).id || 'unknown');
  const role = String((user as any).role || 'UNKNOWN');
  return { actorId, role };
}

function enforceReliabilityResetRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { actorId } = getActorIdentity(req);
  const ip = req.ip || 'unknown-ip';
  const key = `${actorId}:${ip}`;
  const now = Date.now();
  const current = reliabilityResetLimiter.get(key);

  if (!current || now - current.windowStart > RELIABILITY_RESET_WINDOW_MS) {
    reliabilityResetLimiter.set(key, { count: 1, windowStart: now });
    return next();
  }

  if (current.count >= RELIABILITY_RESET_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many reliability reset requests',
      retryAfterMs: RELIABILITY_RESET_WINDOW_MS - (now - current.windowStart),
    });
  }

  current.count += 1;
  reliabilityResetLimiter.set(key, current);
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { role } = getActorIdentity(req);
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HAVEN Backend Operational',
    version: '4.0',
    bb: 'BB Assistant Ready',
    timestamp: new Date().toISOString(),
  });
});

// Prometheus metrics
app.get('/api/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(getMetrics());
});

// Reliability engine telemetry
app.get('/api/reliability', (req, res) => {
  res.json({
    status: 'ok',
    generatedAt: new Date().toISOString(),
    telemetry: reliabilityEngine.getTelemetry(),
  });
});

// Admin reliability control: reset one or all circuit states.
app.post('/api/reliability/reset', requireAuth, requireAdmin, enforceReliabilityResetRateLimit, (req, res) => {
  const { actorId, role } = getActorIdentity(req);
  const { scope, operation, reason, clearMetrics } = req.body || {};

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({ error: 'reason is required (minimum 5 characters)' });
  }

  let resetCount = 0;
  let operationsReset: string[] = [];

  if (scope === 'all') {
    const reset = reliabilityEngine.resetAll(Boolean(clearMetrics));
    resetCount = reset.resetCount;
    operationsReset = reset.operations;
  } else {
    if (!operation || typeof operation !== 'string') {
      return res.status(400).json({ error: 'operation is required when scope is not "all"' });
    }

    const ok = reliabilityEngine.resetOperation(operation, Boolean(clearMetrics));
    if (!ok) {
      return res.status(404).json({
        error: 'operation not found',
        operation,
        knownOperations: reliabilityEngine.getOperationNames(),
      });
    }

    resetCount = 1;
    operationsReset = [operation];
  }

  console.info(
    JSON.stringify({
      event: 'RELIABILITY_RESET_AUDIT',
      timestamp: new Date().toISOString(),
      actorId,
      role,
      sourceIp: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
      scope: scope === 'all' ? 'all' : 'single',
      operation: operation || null,
      resetCount,
      operationsReset,
      clearMetrics: Boolean(clearMetrics),
      reason: String(reason),
    })
  );

  res.json({
    success: true,
    resetCount,
    operationsReset,
    timestamp: new Date().toISOString(),
  });
});

// Analytics endpoints
app.get('/api/analytics', getAnalytics);
app.get('/api/analytics/cases', getCaseMetrics);
app.get('/api/analytics/caseworkers', getCaseworkerMetrics);

// Authentication
app.post('/api/auth/login', login);

// Protected Case Management (v1 API)
app.get('/api/cases', requireAuth, getCases);
app.get('/api/resources', requireAuth, getResources);
app.put('/api/cases/:id/route', requireAuth, routeCase);
app.post('/api/cases/:id/enrich', requireAuth, enrichCase);

// BB Chat & Intelligence
app.post('/api/bb/chat', bbChat);
app.get('/api/bb/intro/:userId', bbIntroduction);

// BB Form Automation
app.post('/api/bb/forms/analyze', bbAnalyzeForm);
app.post('/api/bb/forms/autofill', requireAuth, bbAutoFillForm);

// BB Application Tracking
app.post('/api/bb/applications/track', requireAuth, bbTrackApplication);
app.get('/api/bb/applications/status/:trackingId', bbCheckApplicationStatus);
app.get('/api/bb/applications/summary/:userId', requireAuth, bbApplicationsSummary);

// BB Live Screen Viewing
app.post('/api/bb/screen/analyze', requireAuth, bbAnalyzeScreen);
app.post('/api/bb/browser/action', requireAuth, bbExecuteBrowserAction);

// Transportation Routes
app.use('/api/transportation', transportationRouter);

// Omegis Protocol Routes
app.use('/api/omegis', omegisRouter);

// Enhanced Resources Routes (with map integration)
// Advanced Resources Routes (Interactions, Crisis, Veterinary, Operations)
app.use('/api/resources/advanced', advancedResourcesRouter);
app.use('/api/operations', advancedResourcesRouter);
app.use('/api/resources', resourcesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 HAVEN Backend Operational on port ${PORT}`);
  console.log(`   BB Assistant Ready`);
  console.log(`   All engines loaded and running`);
  console.log(`   Health check: GET /api/health`);
  console.log(`   Metrics: GET /api/metrics`);
  console.log(`   Analytics: GET /api/analytics`);
});
