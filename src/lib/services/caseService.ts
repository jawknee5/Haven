/**
 * Case Service
 * Handles all case management API calls
 */

import { apiClient, Case, RiskAssessment } from '../api';

export const caseService = {
  async getCases(): Promise<Case[]> {
    return apiClient.get<Case[]>('/api/cases');
  },

  async getCaseById(caseId: string): Promise<Case> {
    return apiClient.get<Case>(`/api/cases/${caseId}`);
  },

  async createCase(data: { title: string; description: string; category?: string }): Promise<Case> {
    return apiClient.post<Case>('/api/cases', data);
  },

  async updateCase(caseId: string, data: Partial<Case>): Promise<Case> {
    return apiClient.put<Case>(`/api/cases/${caseId}`, data);
  },

  async enrichCase(caseId: string): Promise<RiskAssessment> {
    return apiClient.post<RiskAssessment>(`/api/cases/${caseId}/enrich`, {});
  },

  async routeCase(caseId: string, resourceId: string): Promise<Case> {
    return apiClient.put<Case>(`/api/cases/${caseId}/route`, { resourceId });
  },

  async bulkEnrich(caseIds: string[]): Promise<RiskAssessment[]> {
    return apiClient.post<RiskAssessment[]>('/api/cases/bulk/enrich', { caseIds });
  },

  async bulkRoute(routingPlan: Array<{ caseId: string; resourceId: string }>): Promise<Case[]> {
    return apiClient.post<Case[]>('/api/cases/bulk/route', { routingPlan });
  },
};
