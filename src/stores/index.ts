import { create } from 'zustand';
import { User } from '../lib/api';
import { authService } from '../lib/services/authService';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth_token'),
  user: localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')!) : null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ token, user, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        loading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return get().token !== null && get().user !== null;
  },

  clearError: () => set({ error: null }),
}));

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  transparencySection: string | null;
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }>;

  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  openTransparency: (section: string) => void;
  closeTransparency: () => void;
  addNotification: (message: string, type?: 'info' | 'success' | 'error' | 'warning', duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  darkMode: true,
  transparencySection: null,
  notifications: [],

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebar: (open: boolean) => set({ sidebarOpen: open }),
  setDarkMode: (dark: boolean) => set({ darkMode: dark }),
  openTransparency: (section: string) => set({ transparencySection: section }),
  closeTransparency: () => set({ transparencySection: null }),

  addNotification: (message: string, type = 'info', duration = 5000) => {
    const id = `notif_${Date.now()}`;
    set({
      notifications: [...get().notifications, { id, message, type }],
    });

    if (duration > 0) {
      setTimeout(() => get().removeNotification(id), duration);
    }
  },

  removeNotification: (id: string) => {
    set({
      notifications: get().notifications.filter((n) => n.id !== id),
    });
  },
}));
