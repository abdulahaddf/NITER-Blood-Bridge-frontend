import { useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, RegisterData, UserRole } from '@/types';
import { mockUsers, mockDonorProfiles } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'niter_blood_auth';
const USERS_STORAGE_KEY = 'niter_blood_users';
const PROFILES_STORAGE_KEY = 'niter_blood_profiles';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Initialize storage with mock data
const initializeStorage = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(PROFILES_STORAGE_KEY)) {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(mockDonorProfiles));
  }
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    initializeStorage();
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const getUsers = useCallback((): User[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveUsers = useCallback((users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    const user = users.find(u => u.email === credentials.email && u.isActive);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!user.emailVerified) {
      return { success: false, error: 'Please verify your email before logging in' };
    }

    // In a real app, we'd verify the password hash here
    // For demo, we'll accept any password for existing users
    // New users will need to register
    
    const updatedUser = { ...user, lastLoginAt: new Date() };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    saveUsers(updatedUsers);
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    setState({ user: updatedUser, isAuthenticated: true, isLoading: false });
    
    return { success: true };
  }, [getUsers, saveUsers]);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    
    if (users.some(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      emailVerified: true, // Auto-verify for demo
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    saveUsers([...users, newUser]);
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setState({ user: newUser, isAuthenticated: true, isLoading: false });
    
    return { success: true };
  }, [getUsers, saveUsers]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!state.user) return;
    
    const users = getUsers();
    const updatedUser = { ...state.user, ...updates, updatedAt: new Date() };
    const updatedUsers = users.map(u => u.id === state.user!.id ? updatedUser : u);
    
    saveUsers(updatedUsers);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
  }, [state.user, getUsers, saveUsers]);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'No account found with this email' };
    }

    // In a real app, send reset email
    return { success: true };
  }, [getUsers]);

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
