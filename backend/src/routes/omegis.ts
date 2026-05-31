// Omegis Integration Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import OmegisProtocol from '../services/OmegisProtocol';
import OmegisKnowledgeBase from '../services/OmegisKnowledgeBase';
import BBPersonalitySync from '../services/BBPersonalitySync';

const router = Router();

router.post('/classify', authenticate, async (req, res) => {
  try {
    const { toolName, parameters, context } = req.body;
    if (!toolName) return res.status(400).json({ error: 'toolName required' });
    const result = await OmegisProtocol.classify({ toolName, parameters: parameters || {}, requesterUserId: req.user.id, context });
    await OmegisProtocol.logClassification(req.user.id, { toolName, parameters: parameters || {}, requesterUserId: req.user.id, context }, result);
    res.json({ success: true, classification: result });
  } catch (error) {
    res.status(500).json({ error: 'Classification failed' });
  }
});

router.post('/sudo-request', authenticate, async (req, res) => {
  try {
    const { allowedTools, ttlMinutes } = req.body;
    if (!allowedTools || !Array.isArray(allowedTools)) return res.status(400).json({ error: 'allowedTools array required' });
    const sudoToken = await OmegisProtocol.mintSudoToken(req.user.id, allowedTools, ttlMinutes || 15);
    res.json({ success: true, sudoToken, expiresIn: `${ttlMinutes || 15} minutes` });
  } catch (error) {
    res.status(500).json({ error: 'SUDO token creation failed' });
  }
});

router.post('/sudo-verify', authenticate, async (req, res) => {
  try {
    const { sudoToken, toolName } = req.body;
    if (!sudoToken || !toolName) return res.status(400).json({ error: 'sudoToken and toolName required' });
    const isAuthorized = await OmegisProtocol.checkSudoAuthorization(sudoToken, toolName);
    res.json({ success: true, authorized: isAuthorized, tool: toolName });
  } catch (error) {
    res.status(401).json({ error: 'SUDO token invalid or expired' });
  }
});

router.get('/knowledge/categories', (req, res) => {
  try {
    const categories = OmegisKnowledgeBase.getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

router.get('/knowledge/category/:category', (req, res) => {
  try {
    const knowledge = OmegisKnowledgeBase.getByCategory(req.params.category);
    if (knowledge.length === 0) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, category: req.params.category, topics: knowledge });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve knowledge' });
  }
});

router.get('/knowledge/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'search query required' });
    const results = OmegisKnowledgeBase.search(q);
    res.json({ success: true, query: q, results });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/bb-sync/export', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    const genesisState = await BBPersonalitySync.exportBBGenesisState(sessionId, req.user.id);
    res.json({ success: true, genesisState });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export BB personality' });
  }
});

router.get('/bb-sync/status', async (req, res) => {
  try {
    const status = await BBPersonalitySync.getBBStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve status' });
  }
});

export default router;
