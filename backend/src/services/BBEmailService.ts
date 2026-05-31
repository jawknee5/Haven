// Email Service - BB Email Drafting & Authorization
// Location: backend/src/services/BBEmailService.ts

import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';

export interface EmailDraft {
  id?: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  status: 'draft' | 'pending_auth' | 'authorized' | 'sent' | 'failed';
  createdAt?: Date;
  authorizedAt?: Date;
  sentAt?: Date;
}

export interface EmailConfig {
  service?: string; // 'gmail', 'outlook', 'smtp', etc.
  email?: string;
  password?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export class BBEmailService {
  private transporters: Map<string, nodemailer.Transporter> = new Map();

  /**
   * Initialize email transporter from user config
   */
  async initializeTransport(userId: string, config: EmailConfig): Promise<nodemailer.Transporter> {
    const cacheKey = `${userId}_email`;
    
    if (this.transporters.has(cacheKey)) {
      return this.transporters.get(cacheKey)!;
    }

    let transporter: nodemailer.Transporter;

    if (config.service === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email,
          pass: config.password,
        },
      });
    } else if (config.host) {
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.secure || false,
        auth: {
          user: config.auth?.user || config.email,
          pass: config.auth?.pass || config.password,
        },
      });
    } else {
      throw new Error('Invalid email configuration');
    }

    // Verify connection
    try {
      await transporter.verify();
    } catch (error) {
      throw new Error(`Email configuration failed: ${error}`);
    }

    this.transporters.set(cacheKey, transporter);
    return transporter;
  }

  /**
   * Generate email draft using BB
   */
  static async generateDraft(
    userId: string,
    context: {
      recipient: string;
      purpose: string;
      tone?: 'formal' | 'friendly' | 'urgent';
      details?: string;
    }
  ): Promise<EmailDraft> {
    // This would integrate with your LLM/BB
    // For now, returning structure for implementation
    const draft: EmailDraft = {
      to: context.recipient,
      subject: `[Generated Subject for ${context.purpose}]`,
      body: `[Generated email body for ${context.purpose}]\n\n${context.details || ''}`,
      status: 'draft',
      createdAt: new Date(),
    };

    return draft;
  }

  /**
   * Create email draft in database
   */
  async createDraft(userId: string, draft: EmailDraft): Promise<any> {
    const memory = await prisma.bBPersistentMemory.findUnique({
      where: { userId },
    });

    if (!memory) {
      throw new Error('User memory not found');
    }

    // Store draft in submitted forms (as email draft)
    const stored = await prisma.submittedForm.create({
      data: {
        memory: {
          connect: { id: memory.id },
        },
        formName: `Email Draft - ${draft.subject}`,
        formUrl: 'email-draft',
        formData: JSON.stringify({
          to: draft.to,
          cc: draft.cc || [],
          bcc: draft.bcc || [],
          subject: draft.subject,
          body: draft.body,
        }),
        status: draft.status as any,
      },
    });

    return stored;
  }

  /**
   * Get user's email drafts
   */
  async getDrafts(userId: string): Promise<any[]> {
    const memory = await prisma.bBPersistentMemory.findUnique({
      where: { userId },
    });

    if (!memory) {
      return [];
    }

    const drafts = await prisma.submittedForm.findMany({
      where: {
        memoryId: memory.id,
        formUrl: 'email-draft',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return drafts;
  }

  /**
   * Authorize and send email drafts
   */
  async sendAuthorizedEmails(
    userId: string,
    draftIds: string[],
    config: EmailConfig
  ): Promise<{ sent: string[]; failed: string[] }> {
    const transporter = await this.initializeTransport(userId, config);
    const sent: string[] = [];
    const failed: string[] = [];

    for (const draftId of draftIds) {
      try {
        const draft = await prisma.submittedForm.findUnique({
          where: { id: draftId },
        });

        if (!draft) {
          failed.push(draftId);
          continue;
        }

        const emailData = JSON.parse(draft.formData);

        // Send email
        await transporter.sendMail({
          from: config.email,
          to: emailData.to,
          cc: emailData.cc?.join(', '),
          bcc: emailData.bcc?.join(', '),
          subject: emailData.subject,
          html: emailData.body,
        });

        // Update draft status
        await prisma.submittedForm.update({
          where: { id: draftId },
          data: {
            status: 'submitted',
            submittedAt: new Date(),
          },
        });

        sent.push(draftId);
      } catch (error) {
        console.error(`Failed to send email draft ${draftId}:`, error);
        failed.push(draftId);
      }
    }

    return { sent, failed };
  }

  /**
   * Detect available email services on user's system
   */
  static async detectEmailServices(): Promise<string[]> {
    const available = [];

    // Check for Gmail
    if (process.env.GOOGLE_CLIENT_ID) {
      available.push('gmail');
    }

    // Check for Outlook
    if (process.env.MICROSOFT_CLIENT_ID) {
      available.push('outlook');
    }

    // Check for SendGrid
    if (process.env.SENDGRID_API_KEY) {
      available.push('sendgrid');
    }

    // Check for custom SMTP
    if (process.env.SMTP_HOST) {
      available.push('custom-smtp');
    }

    return available;
  }

  /**
   * Configure email service with user guidance
   */
  static getConfigurationGuide(service: string): string {
    const guides: Record<string, string> = {
      gmail: `Gmail Configuration:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: myaccount.google.com/apppasswords
3. Provide your email and App Password (not your regular password)
4. Authorization will be secure and app-specific`,

      outlook: `Outlook Configuration:
1. Use your Outlook.com email address
2. Generate an app password from account settings
3. Or use your regular password (less secure - not recommended)
4. Haven will only use it to send emails on your behalf`,

      'custom-smtp': `Custom SMTP Configuration:
1. Obtain SMTP details from your email provider
2. Typically: Host (smtp.provider.com), Port (587 or 465)
3. Provide your email and password
4. Use TLS for security`,
    };

    return guides[service] || 'Unknown email service';
  }
}

export default BBEmailService;
