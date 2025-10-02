export interface UserPreferences {
  id: string;
  notifications: {
    laundry: {
      enabled: boolean;
      dayOfWeek: number;
      time: string;
    };
    trips: {
      packingReminderEnabled: boolean;
      unpackingReminderEnabled: boolean;
    };
  };
  filterChipSettings: {
    clothes: string[];
    outfits: string[];
  };
  outfitTagSuggestions: string[];
  outfitTagStats: { [key: string]: { count: number; lastUsed: string } };
  wardrobeDefaults: {
    viewMode: 'grid' | 'list';
    sortBy: 'newest' | 'name' | 'mostWorn';
  };
  insightsModules: {
    selected: string[];
  };
  currency: string;
  lastBackupDate?: string;
}
