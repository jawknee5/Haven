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

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(metricsMiddleware);

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
