import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import AdvancedResourceService from '../services/AdvancedResourceService';
import EnhancedOperationsService from '../services/EnhancedOperationsService';

const router = Router();

router.post('/interactions', authenticate, async (req, res) => {
  const { resourceId, interactionType } = req.body;
  await AdvancedResourceService.trackInteraction(req.user?.userId || '', resourceId, interactionType);
  res.json({ success: true });
});

router.post('/crisis-assessment', authenticate, async (req, res) => {
  const assessment = AdvancedResourceService.calculateCrisisLevel(req.body);
  res.json({ success: true, assessment });
});

router.get('/veterinary', async (req, res) => {
  const resources = await AdvancedResourceService.getVeterinaryResources();
  res.json({ success: true, resources });
});

router.post('/:id/bookmark', authenticate, async (req, res) => {
  await AdvancedResourceService.bookmarkResource(req.user?.userId || '', String(req.params.id || ''));
  res.json({ success: true });
});

router.post('/:id/rate', authenticate, async (req, res) => {
  const { rating } = req.body;
  await AdvancedResourceService.rateResource(req.user?.userId || '', String(req.params.id || ''), rating);
  res.json({ success: true });
});

router.get('/health', async (req, res) => {
  const health = await EnhancedOperationsService.performHealthCheck();
  res.json({ success: true, ...health });
});

export default router;
