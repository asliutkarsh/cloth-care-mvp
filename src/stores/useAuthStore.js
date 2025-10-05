// src/stores/useAuthStore.js
import { create } from 'zustand';
import { AuthService } from '../services/logic';
import { SetupService } from '../services/setup';
import { UserService } from '../services/crud';
import { useAppStore } from './useAppStore';
import { useWardrobeStore } from './useWardrobeStore';
import { useCalendarStore } from './useCalendarStore';
import { useSettingsStore } from './useSettingsStore';

const bootstrapSessionData = async () => {
  try {
    if (typeof AuthService.initializeUserSession === 'function') {
      await AuthService.initializeUserSession();
    }
  } catch (error) {
    console.error('Failed to initialize user session data seed', error);
  }

  try {
    await Promise.allSettled([
      useWardrobeStore.getState().fetchAll(),
      useCalendarStore.getState().fetchAll(),
      useSettingsStore.getState().fetchPreferences(),
    ]);
  } catch (error) {
    console.error('Failed to hydrate stores after auth', error);
  }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthInitialized: false,

  isLoading: false,
  error: null,

  checkAuth: async () => {
    const { startLoading, finishLoading, setDomainError } = useAppStore.getState();
    startLoading('auth');
    set({ isLoading: true, error: null });
    try {
      const currentUser = await AuthService.getCurrentUser();
      set({ user: currentUser, isAuthInitialized: true, isLoading: false, error: null });
      finishLoading('auth');
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ user: null, isAuthInitialized: true, isLoading: false, error });
      setDomainError('auth', error);
    }
  },

  signup: async (name, email, password) => {
    const { startLoading, finishLoading, setDomainError } = useAppStore.getState();
    startLoading('auth');
    try {
      const newUser = await AuthService.signup({ name, email, password });
      set({ user: newUser, isAuthInitialized: true, error: null, isLoading: false });
      finishLoading('auth');
      await bootstrapSessionData();
      return newUser;
    } catch (error) {
      console.error("Signup failed:", error);
      set({ error, isLoading: false });
      setDomainError('auth', error);
      throw error;
    }
  },

  login: async (email, password) => {
    const { startLoading, finishLoading, setDomainError } = useAppStore.getState();
    startLoading('auth');
    try {
      const loggedInUser = await AuthService.login({ email, password });
      set({ user: loggedInUser, isAuthInitialized: true, error: null, isLoading: false });
      finishLoading('auth');
      await bootstrapSessionData();
      return loggedInUser;
    } catch (error) {
      console.error("Login failed:", error);
      set({ error, isLoading: false });
      setDomainError('auth', error);
      throw error;
    }
  },

  /**
   * Demo login functionality - calls AuthService.demoLogin() with predefined credentials
   */
  demoLogin: async () => {
    const { startLoading, finishLoading, setDomainError } = useAppStore.getState();
    startLoading('auth');
    try {
      const loggedInUser = await AuthService.demoLogin();
      set({ user: loggedInUser, isAuthInitialized: true, error: null, isLoading: false });
      finishLoading('auth');
      await bootstrapSessionData();
      return loggedInUser;
    } catch (error) {
      console.error("Demo login failed:", error);
      set({ error, isLoading: false });
      setDomainError('auth', error);
      throw error;
    }
  },

  logout: async ({ preserveData = true } = {}) => {
    await AuthService.logout();
    if (!preserveData) {
      await SetupService.resetApp(true);
    }
    set({ user: null, isAuthInitialized: true });
  },
}));