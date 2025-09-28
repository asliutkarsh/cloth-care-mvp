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
  // Settings-backed quick filters for Wardrobe
  filterChipSettings: {
    // Clothes: default to empty; can be populated with category IDs or special keys like 'status-clean'
    clothes: [],
    // Outfits: user-defined tag strings like '#summer'
    outfits: [],
  },
  // Suggestions built from previously used outfit tags
  outfitTagSuggestions: [],
  // Usage stats for outfit tags for ranking suggestions
  outfitTagStats: {
    // '#summer': { count: 0, lastUsed: 'ISO' }
  },
  // Wardrobe defaults persisted
  wardrobeDefaults: {
    viewMode: 'grid',
    sortBy: 'newest',
  },
  insightsModules: {
    selected: [
      'overviewCards',
      'categoryBreakdown',
      'colorPalette',
      'brandDistribution',
      'topGoToItems',
      'forgottenFavorites',
      'valueLeaders',
      'sustainabilityScore',
      'financialOverview',
      'closetGhosts',
    ],
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

    await StorageService.set(KEY, updatedPrefs);
    return updatedPrefs;
  },
};