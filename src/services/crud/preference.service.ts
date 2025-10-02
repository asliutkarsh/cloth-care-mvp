import { StorageService } from '../setup/storage.service';
import { UserPreferences } from '../model/preferences.model';

const PREF_TABLE = StorageService.KEYS.PREFERENCES;
const PREF_ID = 'preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  id: PREF_ID,
  notifications: {
    laundry: {
      enabled: false,
      dayOfWeek: 0,
      time: '09:00',
    },
    trips: {
      packingReminderEnabled: false,
      unpackingReminderEnabled: false,
    },
  },
  filterChipSettings: {
    clothes: [],
    outfits: [],
  },
  outfitTagSuggestions: [],
  outfitTagStats: {},
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
  currency: 'USD',
};

interface PreferenceUpdates {
  notifications?: Partial<UserPreferences['notifications']>;
  filterChipSettings?: Partial<UserPreferences['filterChipSettings']>;
  wardrobeDefaults?: Partial<UserPreferences['wardrobeDefaults']>;
  insightsModules?: Partial<UserPreferences['insightsModules']>;
  outfitTagSuggestions?: UserPreferences['outfitTagSuggestions'];
  outfitTagStats?: UserPreferences['outfitTagStats'];
  currency?: string;
  lastBackupDate?: string;
}

export const PreferenceService = {
  /**
   * Retrieves the user's preferences, returning defaults if none are set.
   */
  async getPreferences(): Promise<UserPreferences> {
    const stored = await StorageService.getById<UserPreferences>(PREF_TABLE, PREF_ID);
    if (!stored) {
      return DEFAULT_PREFERENCES;  // Return default preferences if nothing is found
    }

    const { id, ...storedPrefs } = stored;
    return { ...DEFAULT_PREFERENCES, ...storedPrefs };
  },

  /**
   * Updates the user's preferences by merging the new settings.
   */
  async updatePreferences(newPrefs: PreferenceUpdates): Promise<UserPreferences> {
    const currentPrefs = await this.getPreferences();
    const updatedPrefs: UserPreferences = {
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

    const dataToStore = { ...updatedPrefs };
    let saved = await StorageService.update(PREF_TABLE, PREF_ID, dataToStore);
    if (!saved) {
      await StorageService.add(PREF_TABLE, dataToStore);
    }
    return updatedPrefs;
  },
};
