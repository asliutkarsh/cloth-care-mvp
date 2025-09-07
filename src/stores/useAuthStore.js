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
   * --- THIS IS THE FIX ---
   * The demoLogin action is now much simpler. It just calls the main login
   * action with the demo credentials.
   */
  demoLogin: async () => {
    // The `login` action will automatically create the demo user if it doesn't exist.
    return get().login('demo@cloth.com', 'demo123');
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null });
  },
}));