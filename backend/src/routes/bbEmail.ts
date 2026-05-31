// Email API Routes
// Location: backend/src/routes/bbEmail.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import BBEmailService from '../services/BBEmailService';

const router = Router();
router.use(authenticate);

/**
 * Get available email services
 * GET /api/bb/email/services
 */
router.get('/services', async (req, res) => {
  try {
    const services = await BBEmailService.detectEmailServices();
    
    res.json({
      success: true,
      services,
      guide: services.map(svc => ({
        service: svc,
        guide: BBEmailService.getConfigurationGuide(svc),
      })),
    });
  } catch (error) {
    console.error('Error detecting email services:', error);
    res.status(500).json({ error: 'Failed to detect email services' });
  }
});

/**
 * Get email configuration guide
 * GET /api/bb/email/guide/:service
 */
router.get('/guide/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const guide = BBEmailService.getConfigurationGuide(service);

    res.json({
      success: true,
      service,
      guide,
    });
  } catch (error) {
    console.error('Error getting guide:', error);
    res.status(500).json({ error: 'Failed to get configuration guide' });
  }
});

/**
 * Generate email draft using BB
 * POST /api/bb/email/draft/generate
 */
router.post('/draft/generate', async (req, res) => {
  try {
    const { recipient, purpose, tone = 'friendly', details } = req.body;

    if (!recipient || !purpose) {
      return res.status(400).json({ error: 'recipient and purpose required' });
    }

    const draft = await BBEmailService.generateDraft(req.user.id, {
      recipient,
      purpose,
      tone,
      details,
    });

    res.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error('Error generating draft:', error);
    res.status(500).json({ error: 'Failed to generate email draft' });
  }
});

/**
 * Create email draft
 * POST /api/bb/email/draft
 */
router.post('/draft', async (req, res) => {
  try {
    const { to, cc, bcc, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'to, subject, and body required' });
    }

    const service = new BBEmailService();
    const draft = await service.createDraft(req.user.id, {
      to,
      cc,
      bcc,
      subject,
      body,
      status: 'draft',
    });

    res.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: 'Failed to create email draft' });
  }
});

/**
 * Get email drafts
 * GET /api/bb/email/drafts
 */
router.get('/drafts', async (req, res) => {
  try {
    const service = new BBEmailService();
    const drafts = await service.getDrafts(req.user.id);

    res.json({
      success: true,
      drafts,
      count: drafts.length,
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to get email drafts' });
  }
});

/**
 * Configure email service
 * POST /api/bb/email/configure
 */
router.post('/configure', async (req, res) => {
  try {
    const { service, config } = req.body;

    if (!service || !config) {
      return res.status(400).json({ error: 'service and config required' });
    }

    // Test configuration
    const emailService = new BBEmailService();
    await emailService.initializeTransport(req.user.id, {
      service,
      ...config,
    });

    // Store config (encrypted in production)
    // For now, just verify it works
    res.json({
      success: true,
      message: `Email service configured successfully for ${service}`,
    });
  } catch (error) {
    console.error('Error configuring email:', error);
    res.status(400).json({ error: `Configuration failed: ${error}` });
  }
});

/**
 * Send authorized emails
 * POST /api/bb/email/send
 */
router.post('/send', async (req, res) => {
  try {
    const { draftIds, config } = req.body;

    if (!draftIds || !Array.isArray(draftIds) || !config) {
      return res.status(400).json({ error: 'draftIds array and config required' });
    }

    const service = new BBEmailService();
    const result = await service.sendAuthorizedEmails(req.user.id, draftIds, config);

    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      message: `Sent ${result.sent.length} emails, ${result.failed.length} failed`,
    });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

export default router;
