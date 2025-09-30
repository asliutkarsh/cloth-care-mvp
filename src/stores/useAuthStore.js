// src/stores/useAuthStore.js
import { create } from 'zustand';
import { AuthService, SetupService } from '../services';
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

  checkAuth: async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      set({ user: currentUser, isAuthInitialized: true });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ user: null, isAuthInitialized: true });
    }
  },

  signup: async (name, email, password) => {
    try {
      const newUser = await AuthService.signup({ name, email, password });
      set({ user: newUser, isAuthInitialized: true });
      await bootstrapSessionData();
      return newUser;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const loggedInUser = await AuthService.login({ email, password });
      set({ user: loggedInUser, isAuthInitialized: true });
      await bootstrapSessionData();
      return loggedInUser;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  /**
   * Demo login functionality - calls AuthService.demoLogin() with predefined credentials
   */
  demoLogin: async () => {
    try {
      const loggedInUser = await AuthService.demoLogin();
      set({ user: loggedInUser, isAuthInitialized: true });
      await bootstrapSessionData();
      return loggedInUser;
    } catch (error) {
      console.error("Demo login failed:", error);
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