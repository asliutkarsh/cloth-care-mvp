// services/PreferenceService.js
import { StorageService } from './storageService.js';

const PREF_TABLE = StorageService.KEYS.PREFERENCES;
const PREF_ID = 'preferences';


// Default preferences structure

const DEFAULT_PREFERENCES = {
  notifications: {
    enabled: false,
    dayOfWeek: 0,
    time: '09:00',
  },
  filterChipSettings: {
    clothes: [],
    outfits: [],
  },
  outfitTagSuggestions: [],
  outfitTagStats: {
    // '#summer': { count: 0, lastUsed: 'ISO' }
  },
  wardrobeDefaults: {
    viewMode: 'grid',
    sortBy: 'newest',
  },
  insightsModules: {
    selected: [
      'overviewCards',
      'categoryBreakdown',
      'topGoToItems',
      'sustainabilityScore',
      'financialOverview',
      'valueLeaders',
    ],
  },
};

export const PreferenceService = {
  /**
   * Retrieves the user's preferences, returning defaults if none are set.
   */
  async getPreferences() {
    const stored = await StorageService.getById(PREF_TABLE, PREF_ID);
    const { id, ...storedPrefs } = stored || {};
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
      filterChipSettings: {
        ...currentPrefs.filterChipSettings,
        ...newPrefs.filterChipSettings,
        clothes: newPrefs.filterChipSettings?.clothes ?? currentPrefs.filterChipSettings?.clothes ?? [],
        outfits: newPrefs.filterChipSettings?.outfits ?? currentPrefs.filterChipSettings?.outfits ?? [],
      },
      wardrobeDefaults: {
        ...currentPrefs.wardrobeDefaults,
        ...newPrefs.wardrobeDefaults,
      },
      insightsModules: {
        ...currentPrefs.insightsModules,
        ...newPrefs.insightsModules,
      },
      outfitTagStats: {
        ...currentPrefs.outfitTagStats,
        ...newPrefs.outfitTagStats,
      },
    };

    const dataToStore = { id: PREF_ID, ...updatedPrefs };
    let saved = await StorageService.update(PREF_TABLE, PREF_ID, dataToStore);
    if (!saved) {
      await StorageService.add(PREF_TABLE, dataToStore);
    }
    return updatedPrefs;
  },
};