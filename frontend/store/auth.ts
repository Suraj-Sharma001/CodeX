import { create } from 'zustand';
import { User, AuthResponse } from '@/types';
import { authService } from '@/services/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrating: boolean;
  error: string | null;
  isAuthenticated: boolean;
  lastHydrationTime: number;
  isInitialized: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  /** Validates session via cookie (and legacy token header). */
  hydrateAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrating: true,
  error: null,
  isAuthenticated: false,
  lastHydrationTime: 0,
  isInitialized: false,

  setUser: (user: User) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token: string) =>
    set({ token }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({
        user: response.user,
        token: null, // Token stored in httpOnly cookie by server
        isAuthenticated: true,
        isLoading: false,
        isHydrating: false,
        lastHydrationTime: Date.now(),
      });
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      set({
        user: response.user,
        token: null, // Token stored in httpOnly cookie by server
        isAuthenticated: true,
        isLoading: false,
        isHydrating: false,
        lastHydrationTime: Date.now(),
      });
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Logout from API failed, but still clear local data
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      lastHydrationTime: 0,
    });
    localStorage.removeItem('user');
  },

  hydrateAuth: async () => {
    if (typeof window === 'undefined') return;
    
    const state = get();

    // Only hydrate once on app initialization
    if (state.isInitialized) {
      return;
    }

    // Prevent concurrent hydration requests
    if (state.isHydrating) {
      return;
    }

    set({ isHydrating: true, isInitialized: true });
    try {
      const user = await authService.getMe();
      set({
        user,
        token: null, // Token is in httpOnly cookie
        isAuthenticated: true,
        isHydrating: false,
        lastHydrationTime: Date.now(),
      });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isHydrating: false,
        lastHydrationTime: Date.now(),
      });
      localStorage.removeItem('user');
    }
  },

  clearError: () =>
    set({ error: null }),
}));
