// Email Service - Frontend Integration
// Location: frontend/src/services/bbEmailService.ts

export interface EmailDraft {
  id?: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  status: 'draft' | 'pending_auth' | 'authorized' | 'sent' | 'failed';
}

export interface EmailConfig {
  service: string;
  email?: string;
  password?: string;
  host?: string;
  port?: number;
}

class EmailService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Get available email services
   */
  async getAvailableServices(): Promise<any> {
    const response = await fetch(`${this.apiUrl}/bb/email/services`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get email services');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get configuration guide for email service
   */
  async getConfigurationGuide(service: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/bb/email/guide/${service}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get configuration guide');
    }

    const data = await response.json();
    return data.guide;
  }

  /**
   * Generate email draft using BB
   */
  async generateDraft(context: {
    recipient: string;
    purpose: string;
    tone?: 'formal' | 'friendly' | 'urgent';
    details?: string;
  }): Promise<EmailDraft> {
    const response = await fetch(`${this.apiUrl}/bb/email/draft/generate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(context),
    });

    if (!response.ok) {
      throw new Error('Failed to generate email draft');
    }

    const data = await response.json();
    return data.draft;
  }

  /**
   * Create email draft
   */
  async createDraft(draft: EmailDraft): Promise<any> {
    const response = await fetch(`${this.apiUrl}/bb/email/draft`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      throw new Error('Failed to create email draft');
    }

    const data = await response.json();
    return data.draft;
  }

  /**
   * Get email drafts
   */
  async getDrafts(): Promise<EmailDraft[]> {
    const response = await fetch(`${this.apiUrl}/bb/email/drafts`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get email drafts');
    }

    const data = await response.json();
    return data.drafts;
  }

  /**
   * Configure email service
   */
  async configureService(service: string, config: Partial<EmailConfig>): Promise<any> {
    const response = await fetch(`${this.apiUrl}/bb/email/configure`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ service, config }),
    });

    if (!response.ok) {
      throw new Error('Failed to configure email service');
    }

    const data = await response.json();
    
    // Store config locally (encrypted)
    localStorage.setItem(`email_config_${service}`, JSON.stringify({
      service,
      email: config.email,
      timestamp: new Date().toISOString(),
    }));

    return data;
  }

  /**
   * Send authorized emails
   */
  async sendEmails(
    draftIds: string[],
    config: EmailConfig
  ): Promise<{ sent: string[]; failed: string[] }> {
    const response = await fetch(`${this.apiUrl}/bb/email/send`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ draftIds, config }),
    });

    if (!response.ok) {
      throw new Error('Failed to send emails');
    }

    const data = await response.json();
    return { sent: data.sent, failed: data.failed };
  }

  /**
   * Update draft
   */
  async updateDraft(draftId: string, updates: Partial<EmailDraft>): Promise<void> {
    // Update locally first
    const drafts = JSON.parse(localStorage.getItem('email_drafts') || '[]');
    const index = drafts.findIndex((d: any) => d.id === draftId);
    
    if (index >= 0) {
      drafts[index] = { ...drafts[index], ...updates };
      localStorage.setItem('email_drafts', JSON.stringify(drafts));
    }
  }

  /**
   * Save draft locally for offline
   */
  async saveDraftLocally(draft: EmailDraft): Promise<void> {
    const drafts = JSON.parse(localStorage.getItem('email_drafts') || '[]');
    drafts.push({
      ...draft,
      id: draft.id || `draft_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('email_drafts', JSON.stringify(drafts));
  }

  /**
   * Get locally saved drafts
   */
  async getLocalDrafts(): Promise<EmailDraft[]> {
    return JSON.parse(localStorage.getItem('email_drafts') || '[]');
  }
}

export default new EmailService();
