import { create } from 'zustand';
import { PreferenceService } from '../services/crud';
import { SetupService } from '../services/setup';
import { useAppStore } from './useAppStore';
import { useWardrobeStore } from './useWardrobeStore';
import { useLaundryStore } from './useLaundryStore';
import { useCalendarStore } from './useCalendarStore';

export const useSettingsStore = create((set, get) => ({
  // =================================================================
  // STATE
  // =================================================================
  preferences: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  filterChipSettings: { clothes: [], outfits: [] },
  outfitTagSuggestions: [],

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Fetches the user's preferences from the service.
   */
  fetchPreferences: async ({ trackStatus = true } = {}) => {
    const { startLoading, finishLoading, setDomainError } = useAppStore.getState();
    if (trackStatus) {
      startLoading('settings');
      set({ isLoading: true, error: null });
    }

    try {
      const prefs = await PreferenceService.getPreferences();
      set({
        preferences: prefs,
        isInitialized: true,
        isLoading: false,
        error: null,
        filterChipSettings: prefs.filterChipSettings || { clothes: [], outfits: [] },
        outfitTagSuggestions: prefs.outfitTagSuggestions || [],
      });

      if (trackStatus) {
        finishLoading('settings');
      }
      return prefs;
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      set({ isLoading: false, error });
      if (trackStatus) {
        setDomainError('settings', error);
      }
      throw error;
    }
  },

  /**
   * Updates a specific preference and saves it.
   */
  updatePreference: async (key, value) => {
    const { setDomainError } = useAppStore.getState();
    try {
      const newPrefs = { [key]: value };
      await PreferenceService.updatePreferences(newPrefs);
      // After updating, re-fetch to ensure the state is in sync
      await get().fetchPreferences({ trackStatus: false });
    } catch (error) {
      console.error('Failed to update preference:', error);
      set({ error });
      setDomainError('settings', error);
      throw error;
    }
  },

  /**
   * Updates filter chip settings for clothes and outfits.
   * @param {{clothes: string[], outfits: string[]}} settings
   */
  updateFilterChipSettings: async (settings) => {
    const { setDomainError } = useAppStore.getState();
    try {
      await PreferenceService.updatePreferences({ filterChipSettings: settings });
      await get().fetchPreferences({ trackStatus: false });
    } catch (error) {
      console.error('Failed to update filter chip settings:', error);
      set({ error });
      setDomainError('settings', error);
      throw error;
    }
  },

  /**
   * Updates the last backup timestamp in preferences
   */
  updateLastBackupDate: async () => {
    const timestamp = new Date().toISOString();
    await get().updatePreference('lastBackupDate', timestamp);
    return timestamp;
  },

  /**
   * Exports all user data to a downloadable JSON file and updates the last backup timestamp
   */
  exportData: async () => {
    const { startLoading, finishLoading } = useAppStore.getState();
    startLoading('settings');
    set({ isLoading: true, error: null });

    try {
      // Get all data from different stores
      const wardrobeData = useWardrobeStore.getState();
      const laundryData = useLaundryStore.getState();
      const calendarData = useCalendarStore.getState();
      const settingsData = get().preferences;

      // Create a clean data object with only the necessary data
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        wardrobe: {
          clothes: wardrobeData.clothes || [],
          categories: wardrobeData.categories || []
        },
        laundry: laundryData.laundry || [],
        calendar: calendarData.events || [],
        settings: settingsData || {}
      };

      // Create and trigger download
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloth-care-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup date
      await get().updateLastBackupDate();

      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, message: 'Export failed: ' + (error.message || 'Unknown error') };
    } finally {
      finishLoading('settings');
      set({ isLoading: false });
    }
  },

  /**
   * Gets the last backup date from preferences
   */
  getLastBackupDate: () => {
    const { preferences } = get();
    return preferences?.lastBackupDate ? new Date(preferences.lastBackupDate) : null;
  },

  /**
   * Checks if backup reminder should be shown
   * @returns {boolean} True if reminder should be shown
   */
  shouldShowBackupReminder: () => {
    const { preferences } = get();
    const lastBackupDate = preferences?.lastBackupDate ? new Date(preferences.lastBackupDate) : null;
    
    // If never backed up, show reminder
    if (!lastBackupDate) return true;
    
    // Check if last backup was more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return lastBackupDate < thirtyDaysAgo;
  },
  
  /**
   * Dismisses the backup reminder by updating the last backup date to now
   */
  dismissBackupReminder: async () => {
    await get().updateLastBackupDate();
  },

  /**
   * Imports data from a JSON file
   */
  importData: async () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve({ success: false, message: 'No file selected' });
          return;
        }

        try {
          const reader = new FileReader();
          
          reader.onload = async (event) => {
            try {
              const data = JSON.parse(event.target.result);
              const result = await BackupService.importData(data);
              
              if (result.success) {
                // Refresh preferences after import
                await get().fetchPreferences();
                resolve({ success: true, message: 'Data imported successfully! The app will now reload.' });
                window.location.reload();
              } else {
                throw new Error(result.message);
              }
            } catch (error) {
              console.error('Import error:', error);
              resolve({ 
                success: false, 
                message: `Failed to import data: ${error.message}` 
              });
            }
          };
          
          reader.onerror = () => {
            resolve({ 
              success: false, 
              message: 'Error reading the file. Please try again.' 
            });
          };
          
          reader.readAsText(file);
          
        } catch (error) {
          console.error('Import error:', error);
          resolve({ 
            success: false, 
            message: `An error occurred: ${error.message}` 
          });
        }
      };
      
      // Handle cancel button
      input.oncancel = () => {
        resolve({ success: false, message: 'Import cancelled' });
      };
      
      // Trigger file selection
      input.click();
    });
  },

  /**
   * Resets all application data.
   */
  resetApp: async () => {
      await SetupService.resetApp();
  },

  initialize: async () => {
    await SetupService.initialize()
  },

}));