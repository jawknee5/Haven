/**
 * Resource Store
 * Manages all resource-related state
 */

import { create } from 'zustand';
import { Resource } from '../lib/api';
import { resourceService } from '../lib/services/resourceService';

interface ResourceState {
  // Data
  resources: Resource[];
  selectedResource: Resource | null;
  filteredResources: Resource[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Filters
  categoryFilter: string | null;
  availableOnly: boolean;
  searchQuery: string;

  // Actions
  fetchResources: () => Promise<void>;
  filterByCategory: (category: string | null) => void;
  toggleAvailableOnly: () => void;
  setSearchQuery: (query: string) => void;
  selectResource: (resourceId: string | null) => void;
  updateCapacity: (resourceId: string, newCapacity: number) => Promise<void>;
  clearError: () => void;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  selectedResource: null,
  filteredResources: [],
  loading: false,
  error: null,
  categoryFilter: null,
  availableOnly: false,
  searchQuery: '',

  fetchResources: async () => {
    set({ loading: true, error: null });
    try {
      const resources = await resourceService.getResources();
      set({ resources, loading: false });
      get().setSearchQuery(get().searchQuery); // Trigger filter
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch resources',
        loading: false,
      });
    }
  },

  filterByCategory: (category) => {
    set({ categoryFilter: category });
    get().setSearchQuery(get().searchQuery); // Trigger filter
  },

  toggleAvailableOnly: () => {
    set({ availableOnly: !get().availableOnly });
    get().setSearchQuery(get().searchQuery); // Trigger filter
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });

    const { resources, categoryFilter, availableOnly } = get();
    let filtered = resources;

    if (categoryFilter) {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    if (availableOnly) {
      filtered = filtered.filter((r) => r.availableCapacity > 0);
    }

    if (query) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    set({ filteredResources: filtered });
  },

  selectResource: (resourceId) => {
    const selectedResource = resourceId ? get().resources.find((r) => r.id === resourceId) || null : null;
    set({ selectedResource });
  },

  updateCapacity: async (resourceId, newCapacity) => {
    try {
      const updated = await resourceService.updateCapacity(resourceId, newCapacity);
      set({
        resources: get().resources.map((r) => (r.id === resourceId ? updated : r)),
      });
      get().setSearchQuery(get().searchQuery); // Trigger filter
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update capacity',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
