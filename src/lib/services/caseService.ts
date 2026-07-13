/**
 * Case Service — endpoints match FastAPI cases_router.py exactly.
 * Backend field names are snake_case; status values are lowercase.
 */
import { apiClient, Case } from '../api';

export const caseService = {
  async getCases(params?: { status?: string; category?: string; assigned_to_me?: boolean }): Promise<Case[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    if (params?.assigned_to_me) qs.set('assigned_to_me', 'true');
    const query = qs.toString() ? `?${qs}` : '';
    return apiClient.get<Case[]>(`/api/cases${query}`);
  },

  async getCaseById(caseId: string): Promise<{
    case: Case;
    tasks: unknown[];
    messages: unknown[];
    documents: unknown[];
  }> {
    return apiClient.get(`/api/cases/${caseId}`);
  },

  async createCase(data: { title: string; description: string; category?: string }): Promise<Case> {
    return apiClient.post<Case>('/api/cases', {
      title: data.title,
      description: data.description,
      category: data.category ?? 'general',
      urgency_score: 50,
    });
  },

  async updateCase(caseId: string, data: Partial<Case>): Promise<Case> {
    return apiClient.patch<Case>(`/api/cases/${caseId}`, data);
  },

  async claimCase(caseId: string): Promise<Case> {
    return apiClient.post<Case>(`/api/cases/${caseId}/claim`, {});
  },
};
