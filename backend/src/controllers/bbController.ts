// backend/src/controllers/bbController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prismaVault';
import {
  generateBBResponse,
  detectUserIntent,
  generateContextualSuggestion,
  generateIntroductionMessage,
} from '../services/bbChatEngine';
import {
  createApplicationTracking,
  pollApplicationStatus,
  generateApplicationSummary,
  suggestProcessOptimizations,
} from '../services/bbApplicationTracking';
import {
  analyzeFormHTML,
  mapUserDataToForm,
  verifyFormAccuracy,
  storeFormSubmission,
} from '../services/bbFormAutomation';
import {
  processScreenFrame,
  generateScreenContextMessage,
  generateBrowserActionMessage,
} from '../services/bbLiveScreenViewing';

/**
 * POST /api/bb/chat
 * Send message to BB and get response
 */
export async function bbChat(req: Request, res: Response) {
  try {
    const { userId, sessionId, message, context } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    // Detect intent
    const intent = detectUserIntent(message);
    console.log(`[BB] User intent: ${intent}`);

    // Generate BB response
    const conversation = {
      sessionId: sessionId || `session_${Date.now()}`,
      userId,
      messages: [],
      context: context || {},
    };

    const bbResponse = await generateBBResponse(message, conversation, context);

    // Generate contextual suggestion
    const suggestion = await generateContextualSuggestion(intent, context);

    res.json({
      response: bbResponse,
      intent,
      suggestion,
      sessionId: conversation.sessionId,
    });
  } catch (error: any) {
    console.error('[BB Chat] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/bb/intro/:userId
 * Get BB introduction message for new user
 */
export async function bbIntroduction(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const message = generateIntroductionMessage(user?.name);

    res.json({
      message,
      sessionId: `session_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[BB Intro] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/bb/forms/analyze
 * Analyze form HTML and extract fields
 */
export async function bbAnalyzeForm(req: Request, res: Response) {
  try {
    const { formHTML } = req.body;

    if (!formHTML) {
      return res.status(400).json({ error: 'Missing formHTML' });
    }

    const analysis = await analyzeFormHTML(formHTML);

    res.json({
      formName: analysis.formName,
      fieldCount: analysis.fields.length,
      fields: analysis.fields,
      autoFillRecommended: analysis.fields.length > 0,
    });
  } catch (error: any) {
    console.error('[BB Form Analyzer] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/bb/forms/autofill
 * Prepare auto-fill data for form
 */
export async function bbAutoFillForm(req: Request, res: Response) {
  try {
    const { userId, formHTML } = req.body;

    if (!userId || !formHTML) {
      return res.status(400).json({ error: 'Missing userId or formHTML' });
    }

    // Analyze form
    const analysis = await analyzeFormHTML(formHTML);

    // Map user data to form fields
    const mappedData = await mapUserDataToForm(userId, analysis.fields, prisma);

    // Verify accuracy
    const verification = await verifyFormAccuracy(mappedData, analysis.fields);

    res.json({
      status: verification.hasErrors ? 'NEEDS_REVIEW' : 'READY',
      mappedData,
      errors: verification.errors,
      missingDocuments: verification.missingDocs,
    });
  } catch (error: any) {
    console.error('[BB Auto-Fill] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/bb/applications/track
 * Create application tracking record
 */
export async function bbTrackApplication(req: Request, res: Response) {
  try {
    const { caseId, userId, agencyName, applicationId, applicationURL, requiredDocuments } = req.body;

    if (!caseId || !userId || !agencyName || !applicationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tracking = await createApplicationTracking(
      caseId,
      userId,
      agencyName,
      applicationId,
      applicationURL,
      requiredDocuments || [],
      prisma
    );

    res.json({
      trackingId: tracking.id,
      status: tracking.status,
      message: `✅ Application to ${agencyName} is now being tracked. I'll monitor it and keep you updated.`,
    });
  } catch (error: any) {
    console.error('[BB Application Tracking] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/bb/applications/status/:trackingId
 * Poll application status
 */
export async function bbCheckApplicationStatus(req: Request, res: Response) {
  try {
    const trackingId = String(req.params.trackingId || '');

    const tracking = await prisma.applicationTracking.findUnique({
      where: { id: trackingId },
    });

    if (!tracking) {
      return res.status(404).json({ error: 'Application tracking not found' });
    }

    const status = await pollApplicationStatus(tracking.agencyName, tracking.applicationId, trackingId, prisma);

    res.json({
      ...status,
      nextStep: status?.nextStep || 'No update available',
    });
  } catch (error: any) {
    console.error('[BB Status Check] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/bb/applications/summary/:userId
 * Get summary of all user applications
 */
export async function bbApplicationsSummary(req: Request, res: Response) {
  try {
    const userId = String(req.params.userId || '');

    const summary = await generateApplicationSummary(userId, prisma);
    const suggestions = await suggestProcessOptimizations('', userId, prisma);

    res.json({
      summary,
      suggestions,
    });
  } catch (error: any) {
    console.error('[BB Summary] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/bb/screen/analyze
 * Process screen frame from browser extension
 */
export async function bbAnalyzeScreen(req: Request, res: Response) {
  try {
    const { sessionId, frameData } = req.body;

    if (!sessionId || !frameData) {
      return res.status(400).json({ error: 'Missing sessionId or frameData' });
    }

    const analysis = await processScreenFrame(sessionId, frameData, prisma);
    const contextMessage = await generateScreenContextMessage(analysis.detectedElements);

    res.json({
      detectedElements: analysis.detectedElements,
      suggestions: analysis.suggestions,
      contextMessage,
    });
  } catch (error: any) {
    console.error('[BB Screen Analyzer] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/bb/browser/action
 * Execute browser action (fill field, click, etc.)
 */
export async function bbExecuteBrowserAction(req: Request, res: Response) {
  try {
    const { sessionId, action, payload } = req.body;

    if (!action || !payload) {
      return res.status(400).json({ error: 'Missing action or payload' });
    }

    const actionMessage = await generateBrowserActionMessage(action, payload);

    res.json({
      status: 'QUEUED',
      action: actionMessage,
      message: `I've prepared to ${action.toLowerCase()} on your form. Check your browser to confirm the action.`,
    });
  } catch (error: any) {
    console.error('[BB Browser Action] Error:', error);
    res.status(500).json({ error: error.message });
  }
}
