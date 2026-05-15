/**
 * Authentication Service
 * Handles login and token management
 */

import { apiClient, LoginResponse, User } from './api';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/login', { email, password });
  },

  async logout(): Promise<void> {
    // Clear local storage is handled in store
    return Promise.resolve();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return apiClient.get<User>('/api/auth/me');
    } catch {
      return null;
    }
  },
};
