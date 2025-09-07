// src/stores/useThemeStore.js
import { create } from 'zustand';

const THEME_KEY = 'theme';

export const useThemeStore = create((set, get) => ({
  // State can be 'light', 'dark', or 'system'
  theme: 'system',

  /**
   * This action should be called once when the app loads.
   * It checks localStorage, detects the system preference, and applies the correct theme.
   */
  initializeTheme: () => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    
    // Function to apply the theme class to the <html> element
    const applyTheme = (theme) => {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Set initial theme based on storage or system preference
    const initialTheme = storedTheme || 'system';
    set({ theme: initialTheme });
    applyTheme(initialTheme);
    
    // Add a listener to react to system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (get().theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
  },

  /**
   * This action is called by the UI to change the theme.
   */
  setTheme: (newTheme) => {
    // Save preference to localStorage unless it's 'system'
    if (newTheme === 'system') {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, newTheme);
    }

    // Apply the new theme to the document
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (newTheme === 'dark' || (newTheme === 'system' && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update the state in the store
    set({ theme: newTheme });
  },
}));