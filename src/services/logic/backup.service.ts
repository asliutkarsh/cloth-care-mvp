// src/services/logic/backup.service.ts
import { StorageService } from '../setup/storage.service';
import { CategoryService } from '../crud/category.service';
import { ClothService } from '../crud/cloth.service';
import { OutfitService } from '../crud/outfit.service';
import { ActivityLogService } from '../crud/activity.service';
import { TripService } from '../crud/trip.service';
import { PreferenceService } from '../crud/preference.service';
// NEW IMPORTS
import { EssentialsService } from '../crud/essentials.service';
import { WashHistoryService } from '../crud/wash-history.service';

import { Category } from '../model/category.model';
import { Cloth } from '../model/cloth.model';
import { Outfit } from '../model/outfit.model';
import { ActivityLog } from '../model/activity.model';
import { Trip } from '../model/trip.model';
import type { UserPreferences } from '../model/preferences.model';
// NEW MODEL IMPORTS
import type { EssentialItem } from '../model/essential.model';
import type { WashHistoryEvent } from '../crud/wash-history.service'; 


export interface BackupData {
  exportDate: string;
  [StorageService.KEYS.CATEGORIES]: Category[];
  [StorageService.KEYS.CLOTHES]: Cloth[];
  [StorageService.KEYS.OUTFITS]: Outfit[];
  [StorageService.KEYS.ACTIVITY_LOGS]: ActivityLog[];
  [StorageService.KEYS.TRIPS]?: Trip[];
  [StorageService.KEYS.PREFERENCES]?: UserPreferences[];
  // ADDED KEYS
  [StorageService.KEYS.ESSENTIALS]?: EssentialItem[]; 
  [StorageService.KEYS.WARDROBE_WASH_HISTORY]?: WashHistoryEvent[];
}

interface ImportResult {
  success: boolean;
  message: string;
}

export const BackupService = {
  /**
   * Gathers all application data into a single object for export.
   */
  async exportData(): Promise<BackupData> {
    // Get all data in parallel for better performance
    const [
      categories,
      clothes,
      outfits,
      activities,
      trips,
      preferences,
      // ADDED FETCHES
      essentials,
      washHistoryResult 
    ] = await Promise.all([
      CategoryService.getAll(),
      ClothService.getAll(),
      OutfitService.getAll(),
      ActivityLogService.getAll(),
      TripService.getAll(),
      PreferenceService.getPreferences(),
      // ADDED SERVICE CALLS
      EssentialsService.getAll(),
      // Fetch all history items. We pass null for clothId to get all history entries.
      WashHistoryService.getHistoryForCloth(null as any, { limit: 9999999 }),
    ]);
    
    // We only need the items array from the WashHistoryQueryResult
    const washHistory = washHistoryResult.items;

    const data: BackupData = {
      exportDate: new Date().toISOString(),
      [StorageService.KEYS.CATEGORIES]: categories,
      [StorageService.KEYS.CLOTHES]: clothes,
      [StorageService.KEYS.OUTFITS]: outfits,
      [StorageService.KEYS.ACTIVITY_LOGS]: activities,
      [StorageService.KEYS.TRIPS]: trips,
      [StorageService.KEYS.PREFERENCES]: preferences ? [preferences] : [],
      // ADDED DATA TO EXPORT OBJECT
      [StorageService.KEYS.ESSENTIALS]: essentials,
      [StorageService.KEYS.WARDROBE_WASH_HISTORY]: washHistory,
    };

    return data;
  },

  /**
   * Imports data from a backup object, replacing existing data.
   */
  async importData(data: Partial<BackupData>): Promise<ImportResult> {
    try {
      // Basic validation to ensure it's a plausible backup file
      if (!data || !data.exportDate) {
        throw new Error('Invalid or missing backup data format.');
      }


      // Clear existing data first
      await StorageService.clearAll();

      // Import data for each key found in the backup
      const importPromises = [];
      
      if (data[StorageService.KEYS.CATEGORIES]) {
        importPromises.push(
          StorageService.bulkUpdate(StorageService.KEYS.CATEGORIES, data[StorageService.KEYS.CATEGORIES] as Category[])
        );
      }
      
      if (data[StorageService.KEYS.CLOTHES]) {
        importPromises.push(
          StorageService.bulkUpdate(StorageService.KEYS.CLOTHES, data[StorageService.KEYS.CLOTHES] as Cloth[])
        );
      }
      
      if (data[StorageService.KEYS.OUTFITS]) {
        importPromises.push(
          StorageService.bulkUpdate(StorageService.KEYS.OUTFITS, data[StorageService.KEYS.OUTFITS] as Outfit[])
        );
      }
      
      if (data[StorageService.KEYS.ACTIVITY_LOGS]) {
        importPromises.push(
          StorageService.bulkUpdate(StorageService.KEYS.ACTIVITY_LOGS, data[StorageService.KEYS.ACTIVITY_LOGS] as ActivityLog[])
        );
      }
      
      if (data[StorageService.KEYS.TRIPS]) {
        importPromises.push(
          StorageService.bulkUpdate(StorageService.KEYS.TRIPS, data[StorageService.KEYS.TRIPS] as Trip[])
        );
      }
      
      // ADDED IMPORTS
      if (data[StorageService.KEYS.ESSENTIALS]) {
        importPromises.push(
          StorageService.bulkUpdate(StorageService.KEYS.ESSENTIALS, data[StorageService.KEYS.ESSENTIALS] as EssentialItem[])
        );
      }
      
      if (data[StorageService.KEYS.WARDROBE_WASH_HISTORY]) {
        importPromises.push(
          StorageService.bulkUpdate(StorageService.KEYS.WARDROBE_WASH_HISTORY, data[StorageService.KEYS.WARDROBE_WASH_HISTORY] as WashHistoryEvent[])
        );
      }
      // END ADDED IMPORTS
      
      const preferencesData = data[StorageService.KEYS.PREFERENCES]?.[0];
      if (preferencesData) {
        try {
          // Create a new object with type-safe defaults
          const preferencesToImport: UserPreferences = {
            id: 'preferences',
            // Spread known safe properties
            ...(preferencesData.notifications && { 
              notifications: {
                laundry: {
                  enabled: preferencesData.notifications.laundry?.enabled ?? false,
                  dayOfWeek: preferencesData.notifications.laundry?.dayOfWeek ?? 0,
                  time: preferencesData.notifications.laundry?.time || '18:00'
                },
                trips: {
                  packingReminderEnabled: preferencesData.notifications.trips?.packingReminderEnabled ?? true,
                  unpackingReminderEnabled: preferencesData.notifications.trips?.unpackingReminderEnabled ?? true
                }
              }
            }),
            filterChipSettings: {
              clothes: Array.isArray(preferencesData.filterChipSettings?.clothes) 
                ? preferencesData.filterChipSettings.clothes 
                : [],
              outfits: Array.isArray(preferencesData.filterChipSettings?.outfits)
                ? preferencesData.filterChipSettings.outfits
                : []
            },
            outfitTagSuggestions: Array.isArray(preferencesData.outfitTagSuggestions)
              ? preferencesData.outfitTagSuggestions
              : [],
            outfitTagStats: typeof preferencesData.outfitTagStats === 'object' && preferencesData.outfitTagStats !== null
              ? preferencesData.outfitTagStats
              : {},
            wardrobeDefaults: {
              viewMode: preferencesData.wardrobeDefaults?.viewMode === 'list' ? 'list' : 'grid',
              sortBy: preferencesData.wardrobeDefaults?.sortBy || 'newest'
            },
            insightsModules: {
              selected: Array.isArray(preferencesData.insightsModules?.selected)
                ? preferencesData.insightsModules.selected
                : []
            },
            currency: typeof preferencesData.currency === 'string' 
              ? preferencesData.currency 
              : 'USD',
            // Explicitly exclude lastBackupDate from imported preferences
            ...(preferencesData.lastBackupDate && { lastBackupDate: undefined })
          };

          importPromises.push(
            StorageService.put(StorageService.KEYS.PREFERENCES, preferencesToImport)
          );
        } catch (error) {
          console.warn('Failed to import preferences:', error);
          // Continue with other imports even if preferences fail
        }
      }
      
      // Execute all imports in parallel
      await Promise.all(importPromises);

      return { success: true, message: 'Data imported successfully!' };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, message: 'Error importing data: ' + (error as Error).message };
    }
  },
};