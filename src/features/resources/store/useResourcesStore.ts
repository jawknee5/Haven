import { create } from 'zustand';
import { Resource } from '../types';
import { resourcesApi } from '../api/resourcesApi';

interface ResourcesState {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  load: (params?: { category?: string; q?: string }) => Promise<void>;
  getById: (id: string) => Resource | undefined;
}

export const useResourcesStore = create<ResourcesState>((set, get) => ({
  resources: [],
  loading: false,
  error: null,
  async load(params) {
    set({ loading: true, error: null });
    try {
      const resources = await resourcesApi.list(params);
      set({ resources, loading: false });
    } catch (e: any) {
      set({ error: e.message ?? 'Failed to load resources', loading: false });
    }
  },
  getById(id) {
    return get().resources.find((r) => r.id === id);
  },
}));
