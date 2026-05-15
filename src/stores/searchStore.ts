import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Advanced Search & Filter Store
 * Handles multi-field filtering, date ranges, and persistence
 */

export interface SearchFilters {
  title?: string;
  status?: string;
  category?: string;
  urgency?: [number, number]; // [min, max]
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string;
  tags?: string[];
}

interface SearchStore {
  filters: SearchFilters;
  savedFilters: Record<string, SearchFilters>;
  setFilter: (key: keyof SearchFilters, value: any) => void;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (name: string) => void;
  deleteFilter: (name: string) => void;
  exportFilters: () => string;
  importFilters: (json: string) => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      filters: {},
      savedFilters: {},

      setFilter: (key, value) => {
        set(state => ({
          filters: {
            ...state.filters,
            [key]: value
          }
        }));
      },

      setFilters: (filters) => {
        set({ filters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      saveFilter: (name) => {
        const { filters, savedFilters } = get();
        set({
          savedFilters: {
            ...savedFilters,
            [name]: { ...filters }
          }
        });
        localStorage.setItem(`filter_${name}`, JSON.stringify(filters));
      },

      loadFilter: (name) => {
        const { savedFilters } = get();
        const filters = savedFilters[name];
        if (filters) {
          set({ filters });
        }
      },

      deleteFilter: (name) => {
        const { savedFilters } = get();
        const newFilters = { ...savedFilters };
        delete newFilters[name];
        set({ savedFilters: newFilters });
        localStorage.removeItem(`filter_${name}`);
      },

      exportFilters: () => {
        const { filters } = get();
        return JSON.stringify(filters, null, 2);
      },

      importFilters: (json) => {
        try {
          const filters = JSON.parse(json);
          set({ filters });
        } catch (err) {
          console.error('Failed to import filters:', err);
        }
      }
    }),
    {
      name: 'search-filters'
    }
  )
);

/**
 * Filter results based on search criteria
 */
export function applyFilters<T extends Record<string, any>>(
  items: T[],
  filters: SearchFilters
): T[] {
  return items.filter(item => {
    // Title filter
    if (filters.title && !item.title?.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // Urgency range filter
    if (filters.urgency) {
      const [min, max] = filters.urgency;
      const urgency = item.urgency || 0;
      if (urgency < min || urgency > max) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const itemDate = new Date(item.createdAt);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (itemDate < startDate || itemDate > endDate) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!item.tags || !filters.tags.some(tag => item.tags.includes(tag))) {
        return false;
      }
    }

    // Assigned to filter
    if (filters.assignedTo && item.assignedTo !== filters.assignedTo) {
      return false;
    }

    return true;
  });
}
