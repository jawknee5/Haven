/**
 * Auth Service — endpoints match FastAPI auth_router.py.
 */
import { apiClient, User } from '../api';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/login', { email, password });
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return apiClient.get<User>('/api/auth/me');
    } catch {
      return null;
    }
  },

  async updateMe(data: { name?: string; phone?: string }): Promise<User> {
    return apiClient.patch<User>('/api/users/me', data);
  },
};
