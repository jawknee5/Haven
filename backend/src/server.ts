import express from 'express';
import cors from 'cors';
import { login, getCases, getResources, routeCase, enrichCase } from './controllers/api';
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

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Pathway Backend Operational',
    version: '4.0',
    bb: 'BB Assistant Ready',
    timestamp: new Date().toISOString(),
  });
});

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Pathway Backend Operational on port ${PORT}`);
  console.log(`   BB Assistant Ready`);
  console.log(`   All engines loaded and running`);
  console.log(`   Health check: GET /api/health`);
});
