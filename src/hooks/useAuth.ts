import { useAuthStore } from '../stores';

export const useAuth = () => {
  const { token, user, setAuth, logout, isAuthenticated } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setAuth(data.token, data.user);
      return { success: true, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const logoutUser = async () => {
    logout();
  };

  return {
    token,
    user,
    login,
    logout: logoutUser,
    isAuthenticated: isAuthenticated(),
  };
};
