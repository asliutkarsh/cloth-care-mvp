// src/stores/useAuthStore.js
import { create } from 'zustand';
import { AuthService } from '../services';

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
      set({ user: newUser });
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const loggedInUser = await AuthService.login({ email, password });
      set({ user: loggedInUser });
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
      set({ user: loggedInUser });
      return loggedInUser;
    } catch (error) {
      console.error("Demo login failed:", error);
      throw error;
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null });
  },
}));