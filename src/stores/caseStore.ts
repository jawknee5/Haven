/**
 * Case Store
 * Manages all case-related state
 */

import { create } from 'zustand';
import { Case, RiskAssessment } from '../lib/api';
import { caseService } from '../lib/services/caseService';

interface CaseState {
  // Data
  cases: Case[];
  selectedCase: Case | null;
  filteredCases: Case[];
  assessments: Map<string, RiskAssessment>;

  // Loading states
  loading: boolean;
  error: string | null;

  // Filters
  statusFilter: 'ALL' | 'NEW' | 'ENRICHED' | 'ROUTED' | 'COMPLETED';
  searchQuery: string;

  // Actions
  fetchCases: () => Promise<void>;
  createCase: (data: { title: string; description: string; category?: string }) => Promise<Case>;
  selectCase: (caseId: string | null) => void;
  enrichCase: (caseId: string) => Promise<void>;
  routeCase: (caseId: string, resourceId: string) => Promise<void>;
  updateCase: (caseId: string, data: Partial<Case>) => Promise<void>;
  setStatusFilter: (status: typeof caseState.statusFilter) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

const caseState: CaseState = {
  cases: [],
  selectedCase: null,
  filteredCases: [],
  assessments: new Map(),
  loading: false,
  error: null,
  statusFilter: 'ALL',
  searchQuery: '',

  fetchCases: async () => {},
  createCase: async () => ({ id: '', userId: '', title: '', description: '', status: 'NEW', createdAt: '', updatedAt: '' }),
  selectCase: () => {},
  enrichCase: async () => {},
  routeCase: async () => {},
  updateCase: async () => {},
  setStatusFilter: () => {},
  setSearchQuery: () => {},
  clearError: () => {},
};

export const useCaseStore = create<CaseState>((set, get) => ({
  ...caseState,

  fetchCases: async () => {
    set({ loading: true, error: null });
    try {
      const cases = await caseService.getCases();
      set({ cases, loading: false });
      get().setSearchQuery(get().searchQuery); // Trigger filter
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cases',
        loading: false,
      });
    }
  },

  createCase: async (data) => {
    set({ loading: true, error: null });
    try {
      const newCase = await caseService.createCase(data);
      set({
        cases: [...get().cases, newCase],
        loading: false,
      });
      return newCase;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create case',
        loading: false,
      });
      throw error;
    }
  },

  selectCase: (caseId) => {
    const selectedCase = caseId ? get().cases.find((c) => c.id === caseId) || null : null;
    set({ selectedCase });
  },

  enrichCase: async (caseId) => {
    set({ loading: true, error: null });
    try {
      const assessment = await caseService.enrichCase(caseId);
      const updatedCases = get().cases.map((c) =>
        c.id === caseId ? { ...c, status: 'ENRICHED' as const, urgency: assessment.urgencyScore } : c
      );
      set({
        cases: updatedCases,
        assessments: new Map(get().assessments).set(caseId, assessment),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to enrich case',
        loading: false,
      });
    }
  },

  routeCase: async (caseId, resourceId) => {
    set({ loading: true, error: null });
    try {
      const updatedCase = await caseService.routeCase(caseId, resourceId);
      set({
        cases: get().cases.map((c) => (c.id === caseId ? updatedCase : c)),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to route case',
        loading: false,
      });
    }
  },

  updateCase: async (caseId, data) => {
    try {
      const updatedCase = await caseService.updateCase(caseId, data);
      set({
        cases: get().cases.map((c) => (c.id === caseId ? updatedCase : c)),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update case',
      });
    }
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().setSearchQuery(get().searchQuery); // Trigger filter
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });

    const { cases, statusFilter } = get();
    let filtered = cases;

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (query) {
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    set({ filteredCases: filtered });
  },

  clearError: () => set({ error: null }),
}));
