// services/BackupService.js
import { StorageService } from './storageService.js';
import {
  CategoryService,
  ClothService,
  OutfitService,
  ActivityLogService,
} from './index.js'; // Assuming index.js is up to date

export const BackupService = {
  /**
   * Gathers all application data into a single object for export.
   */
  async exportData() {
    const data = {
      exportDate: new Date().toISOString(),
      [StorageService.KEYS.CATEGORIES]: await CategoryService.getAll(),
      [StorageService.KEYS.CLOTHES]: await ClothService.getAll(),
      [StorageService.KEYS.OUTFITS]: await OutfitService.getAll(),
      [StorageService.KEYS.ACTIVITY_LOGS]: await ActivityLogService.getAll(),
      // Add other services you want to back up here
    };
    return data;
  },

  /**
   * Imports data from a backup object, replacing existing data.
   * @param {object} data - The data object to import.
   * @returns {object} A result object with success status and a message.
   */
  async importData(data) {
    try {
      // Basic validation to ensure it's a plausible backup file
      if (!data || !data.exportDate) {
        throw new Error('Invalid or missing backup data format.');
      }

      // Clear existing data first
      await StorageService.clearAll();

      // Import data for each key found in the backup
      if (data[StorageService.KEYS.CATEGORIES]) {
        await StorageService.bulkUpdate(StorageService.KEYS.CATEGORIES, data[StorageService.KEYS.CATEGORIES]);
      }
      if (data[StorageService.KEYS.CLOTHES]) {
        await StorageService.bulkUpdate(StorageService.KEYS.CLOTHES, data[StorageService.KEYS.CLOTHES]);
      }
      if (data[StorageService.KEYS.OUTFITS]) {
        await StorageService.bulkUpdate(StorageService.KEYS.OUTFITS, data[StorageService.KEYS.OUTFITS]);
      }
      if (data[StorageService.KEYS.ACTIVITY_LOGS]) {
        await StorageService.bulkUpdate(StorageService.KEYS.ACTIVITY_LOGS, data[StorageService.KEYS.ACTIVITY_LOGS]);
      }

      return { success: true, message: 'Data imported successfully!' };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, message: 'Error importing data: ' + error.message };
    }
  },
};