// BB Memory API Routes
// Location: backend/src/routes/bbMemory.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import BBSessionMemoryService from '../services/BBSessionMemory';
import BBPersistentMemoryService from '../services/BBPersistentMemory';
import BBContextSystem from '../services/BBContextSystem';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ========== SESSION MEMORY ROUTES ==========

/**
 * Initialize new session or get active session
 * GET /api/bb/session
 */
router.get('/session', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Try to get active session
    let session = await BBSessionMemoryService.getActiveSession(userId);
    
    // If no active session, create new one
    if (!session) {
      session = await BBSessionMemoryService.initializeSession(userId);
    }
    
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        userId: session.userId,
        startTime: session.sessionStart,
        isActive: session.isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * Add message to conversation
 * POST /api/bb/session/message
 */
router.post('/session/message', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { role, content, contextTags, topics, entities } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const message = await BBSessionMemoryService.addMessage(
      sessionId as string,
      { role, content, contextTags, topics, entities }
    );

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

/**
 * Get conversation history
 * GET /api/bb/session/history
 */
router.get('/session/history', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const messages = await BBSessionMemoryService.getConversationHistory(
      sessionId as string,
      limit
    );

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
});

/**
 * End session
 * POST /api/bb/session/end
 */
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const session = await BBSessionMemoryService.endSession(sessionId);

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// ========== PERSISTENT MEMORY ROUTES ==========

/**
 * Get user's persistent memory
 * GET /api/bb/memory
 */
router.get('/memory', async (req, res) => {
  try {
    const userId = req.user.id;
    const memory = await BBPersistentMemoryService.getUserMemory(userId);

    res.json({
      success: true,
      memory: {
        id: memory.id,
        profile: memory.userProfile,
        preferences: memory.preferences,
        recentConversations: memory.allConversations?.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Error fetching memory:', error);
    res.status(500).json({ error: 'Failed to get memory' });
  }
});

/**
 * Get user's memory summary
 * GET /api/bb/memory/summary
 */
router.get('/memory/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await BBPersistentMemoryService.getUserSummary(userId);

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to get memory summary' });
  }
});

/**
 * Add conversation entry to persistent memory
 * POST /api/bb/memory/conversation
 */
router.post('/memory/conversation', async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, content, contextTags, topics, sentiment, actionTaken } = req.body;

    const entry = await BBPersistentMemoryService.addConversationEntry(userId, {
      role,
      content,
      contextTags,
      topics,
      sentiment,
      actionTaken,
    });

    res.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error('Error adding conversation:', error);
    res.status(500).json({ error: 'Failed to add conversation entry' });
  }
});

/**
 * Record resource interaction
 * POST /api/bb/memory/resource-interaction
 */
router.post('/memory/resource-interaction', async (req, res) => {
  try {
    const userId = req.user.id;
    const { resourceId, resourceName, resourceCategory, interactionType, notes, outcome } = req.body;

    const interaction = await BBPersistentMemoryService.recordResourceInteraction(userId, {
      resourceId,
      resourceName,
      resourceCategory,
      interactionType,
      notes,
      outcome,
    });

    res.json({
      success: true,
      interaction,
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

/**
 * Get user's resource interactions
 * GET /api/bb/memory/interactions
 */
router.get('/memory/interactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const interactions = await BBPersistentMemoryService.getResourceInteractions(userId, limit);

    res.json({
      success: true,
      interactions,
      count: interactions.length,
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to get interactions' });
  }
});

/**
 * Record submitted form
 * POST /api/bb/memory/form
 */
router.post('/memory/form', async (req, res) => {
  try {
    const userId = req.user.id;
    const { formName, formUrl, formData, status, autoFilledFields } = req.body;

    const form = await BBPersistentMemoryService.recordSubmittedForm(userId, {
      formName,
      formUrl,
      formData,
      status,
      autoFilledFields,
    });

    res.json({
      success: true,
      form,
    });
  } catch (error) {
    console.error('Error recording form:', error);
    res.status(500).json({ error: 'Failed to record form' });
  }
});

/**
 * Get submitted forms
 * GET /api/bb/memory/forms
 */
router.get('/memory/forms', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const forms = await BBPersistentMemoryService.getSubmittedForms(userId, limit);

    res.json({
      success: true,
      forms,
      count: forms.length,
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

// ========== CONTEXT SYSTEM ROUTES ==========

/**
 * Get system prompt for BB
 * GET /api/bb/context/prompt
 */
router.get('/context/prompt', async (req, res) => {
  try {
    const userId = req.user.id;
    const memory = await BBPersistentMemoryService.getUserMemory(userId);
    
    const userContext = {
      userStage: memory.userProfile?.currentSituation,
      urgentIssues: memory.userProfile?.interests,
      resourcesViewed: [],
      servicesAccessed: [],
    };

    const prompt = BBContextSystem.getSystemPrompt(userContext);

    res.json({
      success: true,
      prompt,
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
});

/**
 * Get guidance by user stage
 * GET /api/bb/context/guidance
 */
router.get('/context/guidance', async (req, res) => {
  try {
    const { stage } = req.query;

    if (!stage) {
      return res.status(400).json({ error: 'stage parameter required' });
    }

    const guidance = BBContextSystem.getGuidanceByStage(stage as string);

    res.json({
      success: true,
      guidance,
    });
  } catch (error) {
    console.error('Error fetching guidance:', error);
    res.status(500).json({ error: 'Failed to get guidance' });
  }
});

/**
 * Get resources by category
 * GET /api/bb/context/resources
 */
router.get('/context/resources', async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ error: 'category parameter required' });
    }

    const resources = BBContextSystem.getResourcesByCategory(category as string);

    res.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

export default router;
