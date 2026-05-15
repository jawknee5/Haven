/**
 * BB Chat Service
 * Handles BB assistant API calls
 */

import { apiClient, BbChatMessage, FormAnalysisResult, ApplicationTrackingRecord } from '../api';

export interface ChatRequest {
  userId: string;
  sessionId?: string;
  message: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  sessionId: string;
  message: BbChatMessage;
  suggestions?: string[];
  actions?: Array<{ type: string; label: string; data: any }>;
}

export const bbService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/api/bb/chat', request);
  },

  async getIntroduction(userId: string): Promise<BbChatMessage> {
    return apiClient.get<BbChatMessage>(`/api/bb/intro/${userId}`);
  },

  async analyzeForm(formHtml: string): Promise<FormAnalysisResult> {
    return apiClient.post<FormAnalysisResult>('/api/bb/forms/analyze', { formHtml });
  },

  async autoFillForm(formId: string, data: Record<string, any>): Promise<FormAnalysisResult> {
    return apiClient.post<FormAnalysisResult>('/api/bb/forms/autofill', { formId, data });
  },

  async trackApplication(
    agencyName: string,
    applicationData: Record<string, any>
  ): Promise<ApplicationTrackingRecord> {
    return apiClient.post<ApplicationTrackingRecord>('/api/bb/applications/track', {
      agencyName,
      applicationData,
    });
  },

  async getApplicationStatus(trackingId: string): Promise<ApplicationTrackingRecord> {
    return apiClient.get<ApplicationTrackingRecord>(`/api/bb/applications/status/${trackingId}`);
  },

  async getApplicationsSummary(userId: string): Promise<ApplicationTrackingRecord[]> {
    return apiClient.get<ApplicationTrackingRecord[]>(`/api/bb/applications/summary/${userId}`);
  },

  async analyzeScreen(screenshot: string, context?: string): Promise<any> {
    return apiClient.post('/api/bb/screen/analyze', { screenshot, context });
  },

  async executeBrowserAction(action: string, target: string, data?: any): Promise<any> {
    return apiClient.post('/api/bb/browser/action', { action, target, data });
  },
};
