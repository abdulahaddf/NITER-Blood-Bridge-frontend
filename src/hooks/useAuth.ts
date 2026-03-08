import { useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, RegisterData, UserRole } from '@/types';
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api';

const AUTH_USER_KEY = 'niter_auth_user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Bootstrap auth state from localStorage on mount
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        clearTokens();
        localStorage.removeItem(AUTH_USER_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        const data = await api.post<LoginResponse>('/api/auth/login', {
          email: credentials.email,
          password: credentials.password,
        });

        setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        setState({ user: data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Login failed',
        };
      }
    },
    []
  );

  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
      if (data.password !== data.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      try {
        await api.post('/api/auth/register', {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Registration failed',
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(AUTH_USER_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...updates };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  }, []);

  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await api.post('/api/auth/forgot-password', { email });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Request failed',
        };
      }
    },
    []
  );

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    resetPassword,
  };
}

export type AuthContextType = ReturnType<typeof useAuth>;
