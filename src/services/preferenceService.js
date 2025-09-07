// services/PreferenceService.js
import { StorageService } from './storageService.js';

// Use a unique key for user preferences in storage
const KEY = StorageService.KEYS.PREFERENCES;

// Default preferences structure

const DEFAULT_PREFERENCES = {
  notifications: {
    enabled: false,
    dayOfWeek: 0,
    time: '09:00',
  },
};

export const PreferenceService = {
  /**
   * Retrieves the user's preferences, returning defaults if none are set.
   */
  async getPreferences() {
    const storedPrefs = await StorageService.get(KEY);
    // Merge stored preferences with defaults to ensure all keys are present
    return { ...DEFAULT_PREFERENCES, ...storedPrefs };
  },

  /**
   * Updates the user's preferences by merging the new settings.
   * @param {object} newPrefs - An object containing the preferences to update.
   */
  async updatePreferences(newPrefs) {
    const currentPrefs = await this.getPreferences();
    // Deep merge for nested objects like 'notifications'
    const updatedPrefs = {
      ...currentPrefs,
      ...newPrefs,
      notifications: {
        ...currentPrefs.notifications,
        ...newPrefs.notifications,
      },
    };
    await StorageService.set(KEY, updatedPrefs);
    return updatedPrefs;
  },
};