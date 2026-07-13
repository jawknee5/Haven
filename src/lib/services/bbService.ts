/**
 * BB Service — endpoints match FastAPI bb_router.py exactly.
 */
import { apiClient, BbChatMessage, FormAnalysisResult, ApplicationTrackingRecord, RiskAssessment } from '../api';

export interface ChatRequest {
  session_id: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  intent: RiskAssessment;
  session_id: string;
  timestamp: string;
}

export const bbService = {
  /** POST /api/bb/chat — requires auth, uses logged-in user's role automatically */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/api/bb/chat', request);
  },

  /** GET /api/bb/intro — returns role-aware greeting for the logged-in user */
  async getIntro(): Promise<{ reply: string; role: string }> {
    return apiClient.get('/api/bb/intro');
  },

  /** GET /api/bb/sessions/:session_id/history */
  async getHistory(sessionId: string): Promise<{ session_id: string; messages: unknown[] }> {
    return apiClient.get(`/api/bb/sessions/${sessionId}/history`);
  },

  /** POST /api/bb/forms/analyze */
  async analyzeForm(form_html: string): Promise<FormAnalysisResult> {
    return apiClient.post<FormAnalysisResult>('/api/bb/forms/analyze', { form_html });
  },

  /** POST /api/bb/forms/autofill */
  async autofillForm(form_html: string, user_id?: string, case_id?: string) {
    return apiClient.post('/api/bb/forms/autofill', { form_html, user_id, case_id });
  },

  /** POST /api/bb/applications/track */
  async trackApplication(payload: {
    case_id: string;
    agency_name: string;
    application_id?: string;
    application_url?: string;
    required_documents?: string[];
    notes?: string;
  }): Promise<ApplicationTrackingRecord> {
    return apiClient.post<ApplicationTrackingRecord>('/api/bb/applications/track', payload);
  },

  /** GET /api/bb/applications/status/:tracking_id */
  async getApplicationStatus(trackingId: string): Promise<ApplicationTrackingRecord> {
    return apiClient.get<ApplicationTrackingRecord>(`/api/bb/applications/status/${trackingId}`);
  },

  /** GET /api/bb/applications/summary */
  async getApplicationsSummary(): Promise<{ count: number; applications: ApplicationTrackingRecord[] }> {
    return apiClient.get('/api/bb/applications/summary');
  },

  /** POST /api/bb/browser/start */
  async browserStart(url?: string) {
    return apiClient.post('/api/bb/browser/start', { url });
  },

  /** POST /api/bb/browser/action */
  async browserAction(session_id: string, action: string, payload: Record<string, unknown>) {
    return apiClient.post('/api/bb/browser/action', { session_id, action, payload });
  },
};
