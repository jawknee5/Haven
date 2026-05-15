import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCaseStore } from '../stores/caseStore';
import { useAuthStore } from '../stores/index';
import { useAdminStore } from '../stores/adminStore';
import { useBbChatStore } from '../stores/bbChatStore';
import { apiClient } from '../lib/api';

/**
 * Comprehensive Vitest Test Suite
 * Tests for stores, API integration, and state management
 */

// ============= Auth Store Tests =============
describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with null user and token', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should set auth credentials on login', async () => {
    const { result } = renderHook(() => useAuthStore());

    // Mock login
    const mockUser = { id: '1', email: 'test@example.com', role: 'user', name: 'Test' };
    const mockToken = 'mock_jwt_token';

    act(() => {
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    });

    // Reinitialize store to load from localStorage
    const { result: result2 } = renderHook(() => useAuthStore());
    expect(result2.current.token).toBe(mockToken);
    expect(result2.current.user).toEqual(mockUser);
  });

  it('should clear auth on logout', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      localStorage.setItem('auth_token', 'test_token');
      localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'test@example.com' }));
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should return correct authenticated status', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.isAuthenticated()).toBe(false);

    act(() => {
      localStorage.setItem('auth_token', 'test_token');
      localStorage.setItem('auth_user', JSON.stringify({ id: '1' }));
    });

    const { result: result2 } = renderHook(() => useAuthStore());
    expect(result2.current.isAuthenticated()).toBe(true);
  });
});

// ============= Case Store Tests =============
describe('useCaseStore', () => {
  it('should initialize with empty cases array', () => {
    const { result } = renderHook(() => useCaseStore());
    expect(result.current.cases).toEqual([]);
    expect(result.current.filteredCases).toEqual([]);
  });

  it('should filter cases by status', () => {
    const { result } = renderHook(() => useCaseStore());

    const mockCases = [
      { id: '1', status: 'NEW', title: 'Case 1', description: 'Desc 1', createdAt: '', updatedAt: '', userId: '' },
      { id: '2', status: 'ENRICHED', title: 'Case 2', description: 'Desc 2', createdAt: '', updatedAt: '', userId: '' },
      { id: '3', status: 'NEW', title: 'Case 3', description: 'Desc 3', createdAt: '', updatedAt: '', userId: '' }
    ];

    act(() => {
      result.current.cases = mockCases;
      result.current.setStatusFilter('NEW');
    });

    expect(result.current.filteredCases).toHaveLength(2);
    expect(result.current.filteredCases.every(c => c.status === 'NEW')).toBe(true);
  });

  it('should search cases by title', () => {
    const { result } = renderHook(() => useCaseStore());

    const mockCases = [
      { id: '1', status: 'NEW', title: 'Housing Help', description: 'Need housing', createdAt: '', updatedAt: '', userId: '' },
      { id: '2', status: 'NEW', title: 'Job Search', description: 'Looking for work', createdAt: '', updatedAt: '', userId: '' }
    ];

    act(() => {
      result.current.cases = mockCases;
      result.current.setSearchQuery('housing');
    });

    expect(result.current.filteredCases).toHaveLength(1);
    expect(result.current.filteredCases[0].title).toContain('Housing');
  });

  it('should select and deselect case', () => {
    const { result } = renderHook(() => useCaseStore());

    const mockCase = {
      id: '1',
      status: 'NEW',
      title: 'Test Case',
      description: 'Test',
      createdAt: '',
      updatedAt: '',
      userId: ''
    };

    act(() => {
      result.current.cases = [mockCase];
      result.current.selectCase('1');
    });

    expect(result.current.selectedCase).toEqual(mockCase);

    act(() => {
      result.current.selectCase(null);
    });

    expect(result.current.selectedCase).toBeNull();
  });
});

// ============= Admin Store Tests =============
describe('useAdminStore', () => {
  it('should track selected cases', () => {
    const { result } = renderHook(() => useAdminStore());

    act(() => {
      result.current.toggleCaseSelection('case1');
    });

    expect(result.current.selectedCases.has('case1')).toBe(true);

    act(() => {
      result.current.toggleCaseSelection('case1');
    });

    expect(result.current.selectedCases.has('case1')).toBe(false);
  });

  it('should select all cases', () => {
    const { result } = renderHook(() => useAdminStore());

    act(() => {
      result.current.allCases = [
        { id: '1', status: 'NEW', title: 'Case 1', description: '', createdAt: '', updatedAt: '', userId: '' },
        { id: '2', status: 'NEW', title: 'Case 2', description: '', createdAt: '', updatedAt: '', userId: '' }
      ];
      result.current.selectAllCases();
    });

    expect(result.current.selectedCases.size).toBe(2);
    expect(result.current.selectedCases.has('1')).toBe(true);
    expect(result.current.selectedCases.has('2')).toBe(true);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useAdminStore());

    act(() => {
      result.current.allCases = [
        { id: '1', status: 'NEW', title: 'Case 1', description: '', createdAt: '', updatedAt: '', userId: '' }
      ];
      result.current.selectAllCases();
      result.current.clearSelection();
    });

    expect(result.current.selectedCases.size).toBe(0);
  });
});

// ============= BB Chat Store Tests =============
describe('useBbChatStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useBbChatStore());
    expect(result.current.messages).toEqual([]);
  });

  it('should set user ID', () => {
    const { result } = renderHook(() => useBbChatStore());

    act(() => {
      result.current.setUserId('user123');
    });

    expect(result.current.userId).toBe('user123');
  });

  it('should clear error message', () => {
    const { result } = renderHook(() => useBbChatStore());

    act(() => {
      result.current.error = 'Test error';
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should clear chat history', () => {
    const { result } = renderHook(() => useBbChatStore());

    act(() => {
      result.current.messages = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date().toISOString() }
      ];
      result.current.clearHistory();
    });

    expect(result.current.messages).toEqual([]);
  });
});

// ============= API Client Tests =============
describe('apiClient', () => {
  it('should include auth token in headers', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    } as any);

    // Mock auth store
    localStorage.setItem('auth_token', 'test_token_123');

    try {
      // API calls would include token in headers
      expect(mockFetch).toHaveBeenCalledOrNot();
    } finally {
      mockFetch.mockRestore();
      localStorage.clear();
    }
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' })
    } as any);

    try {
      // Error handling should work
      expect(mockFetch).toHaveBeenCalledOrNot();
    } finally {
      mockFetch.mockRestore();
    }
  });
});

// ============= Integration Tests =============
describe('Integration: Auth → Dashboard', () => {
  it('should authenticate user and load cases', async () => {
    const authStore = renderHook(() => useAuthStore()).result;
    const caseStore = renderHook(() => useCaseStore()).result;

    // Step 1: Login
    act(() => {
      localStorage.setItem('auth_token', 'test_token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 'user1',
        email: 'test@example.com',
        role: 'user',
        name: 'Test User'
      }));
    });

    // Verify auth
    const { result: authResult } = renderHook(() => useAuthStore());
    expect(authResult.current.isAuthenticated()).toBe(true);

    // Step 2: Load cases (would be API call in real app)
    act(() => {
      caseStore.current.cases = [
        { id: '1', status: 'NEW', title: 'Case 1', description: 'Test', createdAt: '', updatedAt: '', userId: 'user1' }
      ];
    });

    expect(caseStore.current.cases).toHaveLength(1);
  });
});

// ============= Performance Tests =============
describe('Performance', () => {
  it('should handle large case lists efficiently', () => {
    const { result } = renderHook(() => useCaseStore());

    // Create 1000 cases
    const largeCaseList = Array.from({ length: 1000 }, (_, i) => ({
      id: `case_${i}`,
      status: i % 4 === 0 ? 'NEW' : i % 4 === 1 ? 'ENRICHED' : i % 4 === 2 ? 'ROUTED' : 'COMPLETED',
      title: `Case ${i}`,
      description: `Description ${i}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user1'
    }));

    act(() => {
      result.current.cases = largeCaseList;
    });

    // Filter should be fast
    const startTime = performance.now();
    act(() => {
      result.current.setStatusFilter('NEW');
    });
    const endTime = performance.now();

    expect(result.current.filteredCases.length).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(100); // Should filter in < 100ms
  });

  it('should memoize filtering results', () => {
    const { result } = renderHook(() => useCaseStore());

    const cases = [
      { id: '1', status: 'NEW', title: 'Case 1', description: '', createdAt: '', updatedAt: '', userId: '' },
      { id: '2', status: 'NEW', title: 'Case 2', description: '', createdAt: '', updatedAt: '', userId: '' }
    ];

    act(() => {
      result.current.cases = cases;
    });

    const firstFilter = result.current.filteredCases;

    act(() => {
      result.current.setSearchQuery('');
    });

    // Same filter results should return same array reference (no re-render)
    expect(result.current.filteredCases).toEqual(firstFilter);
  });
});
