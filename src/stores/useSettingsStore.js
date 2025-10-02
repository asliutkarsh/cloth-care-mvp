import { create } from 'zustand';
import { PreferenceService } from '../services/crud';
import { BackupService } from '../services/logic';
import { SetupService } from '../services/setup';

export const useSettingsStore = create((set, get) => ({
  // =================================================================
  // STATE
  // =================================================================
  preferences: null,
  isInitialized: false,
  filterChipSettings: { clothes: [], outfits: [] },
  outfitTagSuggestions: [],

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Fetches the user's preferences from the service.
   */
  fetchPreferences: async () => {
    const prefs = await PreferenceService.getPreferences();
    set({
      preferences: prefs,
      isInitialized: true,
      filterChipSettings: prefs.filterChipSettings || { clothes: [], outfits: [] },
      outfitTagSuggestions: prefs.outfitTagSuggestions || [],
    });
  },

  /**
   * Updates a specific preference and saves it.
   */
  updatePreference: async (key, value) => {
    const newPrefs = { [key]: value };
    await PreferenceService.updatePreferences(newPrefs);
    // After updating, re-fetch to ensure the state is in sync
    await get().fetchPreferences();
  },

  /**
   * Updates filter chip settings for clothes and outfits.
   * @param {{clothes: string[], outfits: string[]}} settings
   */
  updateFilterChipSettings: async (settings) => {
    await PreferenceService.updatePreferences({ filterChipSettings: settings });
    await get().fetchPreferences();
  },

  /**
   * Exports all user data to a downloadable JSON file.
   */
  exportData: async () => {
    const data = await BackupService.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloth-care-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Imports data from a JSON file.
   */
  importData: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            const result = await BackupService.importData(data);
            if (result.success) {
              alert('Data imported successfully! The app will now reload.');
              window.location.reload();
            } else {
              throw new Error(result.message);
            }
          } catch (error) {
            alert(`Failed to import data: ${error.message}`);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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