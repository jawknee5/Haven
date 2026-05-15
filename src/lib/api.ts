import { withRetry } from './retryUtils';

/**
 * Enhanced API Client with Retry Logic
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Case {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'ENRICHED' | 'ROUTED' | 'COMPLETED';
  category?: string;
  urgency?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  description?: string;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Make an API request with retry logic
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { retries?: number } = {}
): Promise<T> {
  const { retries = 3, ...fetchOptions } = options;
  
  return withRetry(
    async () => {
      const token = getAuthToken();
      const url = `${API_BASE_URL}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return response.json() as Promise<T>;
    },
    { 
      maxRetries: retries,
      delay: 1000,
      backoff: 2
    }
  );
}

/**
 * Case API endpoints
 */
export const caseApi = {
  getCases: () =>
    apiRequest<{ cases: Case[] }>('/api/cases'),

  createCase: (data: Partial<Case>) =>
    apiRequest<Case>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  enrichCase: (id: string) =>
    apiRequest<Case>(`/api/cases/${id}/enrich`, {
      method: 'POST',
    }),

  routeCase: (id: string, resourceId: string) =>
    apiRequest<Case>(`/api/cases/${id}/route`, {
      method: 'PUT',
      body: JSON.stringify({ resourceId }),
    }),

  bulkEnrich: (caseIds: string[]) =>
    apiRequest<{ success: boolean }>('/api/cases/bulk/enrich', {
      method: 'POST',
      body: JSON.stringify({ caseIds }),
    }),

  bulkRoute: (routing: Record<string, string>) =>
    apiRequest<{ success: boolean }>('/api/cases/bulk/route', {
      method: 'POST',
      body: JSON.stringify({ routing }),
    }),
};

/**
 * Resource API endpoints
 */
export const resourceApi = {
  getResources: () =>
    apiRequest<{ resources: Resource[] }>('/api/resources'),

  routeToResource: (caseId: string, resourceId: string) =>
    apiRequest<{ success: boolean }>(`/api/resources/${resourceId}/route`, {
      method: 'POST',
      body: JSON.stringify({ caseId }),
    }),
};

/**
 * BB Chat API endpoints
 */
export const bbApi = {
  sendMessage: (message: string) =>
    apiRequest<{ response: string; id: string }>('/api/bb/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  analyzeForm: (htmlContent: string) =>
    apiRequest<{ fields: any[] }>('/api/bb/forms/analyze', {
      method: 'POST',
      body: JSON.stringify({ htmlContent }),
    }),

  autoFillForm: (fields: Record<string, string>) =>
    apiRequest<{ success: boolean }>('/api/bb/forms/autofill', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    }),

  getApplicationStatus: (applicationId: string) =>
    apiRequest<{ status: string; progress: number }>(`/api/bb/applications/status/${applicationId}`),
};

/**
 * Auth API endpoints
 */
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiRequest<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),
};

/**
 * Health check endpoint
 */
export const healthApi = {
  check: () =>
    apiRequest<{ status: string }>('/api/health').catch(() => ({ status: 'offline' })),
};
