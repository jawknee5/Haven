import { Resource } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const resourcesApi = {
  list: (params?: { category?: string; q?: string }): Promise<Resource[]> => {
    const url = new URL(`${API_BASE}/resources`, window.location.origin);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.q) url.searchParams.set('q', params.q);
    return fetch(url.toString(), { credentials: 'include' }).then((r) => r.json());
  },

  get: (id: string): Promise<Resource> =>
    fetch(`${API_BASE}/resources/${id}`, { credentials: 'include' }).then((r) => r.json()),
};
