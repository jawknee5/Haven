/**
 * Resource Service
 * Handles resource management API calls
 */

import { apiClient, Resource } from '../api';

export const resourceService = {
  async getResources(filters?: { category?: string; available?: boolean }): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available) params.append('available', 'true');

    const query = params.toString();
    return apiClient.get<Resource[]>(`/api/resources${query ? `?${query}` : ''}`);
  },

  async getResourceById(resourceId: string): Promise<Resource> {
    return apiClient.get<Resource>(`/api/resources/${resourceId}`);
  },

  async createResource(data: Partial<Resource>): Promise<Resource> {
    return apiClient.post<Resource>('/api/resources', data);
  },

  async updateResource(resourceId: string, data: Partial<Resource>): Promise<Resource> {
    return apiClient.put<Resource>(`/api/resources/${resourceId}`, data);
  },

  async updateCapacity(resourceId: string, newCapacity: number): Promise<Resource> {
    return apiClient.patch<Resource>(`/api/resources/${resourceId}`, { capacity: newCapacity });
  },

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return apiClient.get<Resource[]>(`/api/resources?category=${category}`);
  },

  async getAvailableResources(): Promise<Resource[]> {
    return apiClient.get<Resource[]>('/api/resources?available=true');
  },
};
