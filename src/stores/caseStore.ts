/**
 * Case Store — aligned to FastAPI cases_router.py.
 * Status values are lowercase (new|enriched|routed|active|resolved|closed).
 * urgency_score is 0-100.
 */

import { create } from 'zustand';
import { Case } from '../lib/api';
import { caseService } from '../lib/services/caseService';

type StatusFilter = 'all' | 'new' | 'enriched' | 'routed' | 'active' | 'resolved' | 'closed';

interface CaseState {
  cases: Case[];
  filteredCases: Case[];
  selectedCase: Case | null;
  loading: boolean;
  error: string | null;
  statusFilter: StatusFilter;
  searchQuery: string;

  fetchCases: () => Promise<void>;
  createCase: (data: { title: string; description: string; category?: string }) => Promise<Case>;
  updateCase: (caseId: string, data: Partial<Case>) => Promise<void>;
  claimCase: (caseId: string) => Promise<void>;
  selectCase: (caseId: string | null) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

function applyFilters(cases: Case[], statusFilter: StatusFilter, searchQuery: string): Case[] {
  let out = cases;
  if (statusFilter !== 'all') {
    out = out.filter((c) => c.status === statusFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    out = out.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.category ?? '').toLowerCase().includes(q)
    );
  }
  // Sort by urgency_score descending
  return [...out].sort((a, b) => (b.urgency_score ?? 0) - (a.urgency_score ?? 0));
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  filteredCases: [],
  selectedCase: null,
  loading: false,
  error: null,
  statusFilter: 'all',
  searchQuery: '',

  fetchCases: async () => {
    set({ loading: true, error: null });
    try {
      const cases = await caseService.getCases();
      const { statusFilter, searchQuery } = get();
      set({
        cases,
        filteredCases: applyFilters(cases, statusFilter, searchQuery),
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch cases',
        loading: false,
      });
    }
  },

  createCase: async (data) => {
    set({ loading: true, error: null });
    try {
      const newCase = await caseService.createCase(data);
      const cases = [...get().cases, newCase];
      const { statusFilter, searchQuery } = get();
      set({ cases, filteredCases: applyFilters(cases, statusFilter, searchQuery), loading: false });
      return newCase;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create case',
        loading: false,
      });
      throw err;
    }
  },

  updateCase: async (caseId, data) => {
    try {
      const updated = await caseService.updateCase(caseId, data);
      const cases = get().cases.map((c) => (c.id === caseId ? updated : c));
      const { statusFilter, searchQuery } = get();
      set({ cases, filteredCases: applyFilters(cases, statusFilter, searchQuery) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update case' });
    }
  },

  claimCase: async (caseId) => {
    try {
      const updated = await caseService.claimCase(caseId);
      const cases = get().cases.map((c) => (c.id === caseId ? updated : c));
      const { statusFilter, searchQuery } = get();
      set({ cases, filteredCases: applyFilters(cases, statusFilter, searchQuery) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to claim case' });
    }
  },

  selectCase: (caseId) => {
    set({ selectedCase: caseId ? (get().cases.find((c) => c.id === caseId) ?? null) : null });
  },

  setStatusFilter: (statusFilter) => {
    const { cases, searchQuery } = get();
    set({ statusFilter, filteredCases: applyFilters(cases, statusFilter, searchQuery) });
  },

  setSearchQuery: (searchQuery) => {
    const { cases, statusFilter } = get();
    set({ searchQuery, filteredCases: applyFilters(cases, statusFilter, searchQuery) });
  },

  clearError: () => set({ error: null }),
}));
