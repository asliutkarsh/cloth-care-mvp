import { StorageService } from '../setup/storage.service';
import { CategoryService } from '../crud/category.service';
import { ClothService } from '../crud/cloth.service';
import { OutfitService } from '../crud/outfit.service';
import { ActivityLogService } from '../crud/activity.service';
import { Category } from '../model/category.model';
import { Cloth } from '../model/cloth.model';
import { Outfit } from '../model/outfit.model';
import { ActivityLog } from '../model/activity.model';

interface BackupData {
  exportDate: string;
  [StorageService.KEYS.CATEGORIES]: Category[];
  [StorageService.KEYS.CLOTHES]: Cloth[];
  [StorageService.KEYS.OUTFITS]: Outfit[];
  [StorageService.KEYS.ACTIVITY_LOGS]: ActivityLog[];
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
    const data: BackupData = {
      exportDate: new Date().toISOString(),
      [StorageService.KEYS.CATEGORIES]: await CategoryService.getAll(),
      [StorageService.KEYS.CLOTHES]: await ClothService.getAll(),
      [StorageService.KEYS.OUTFITS]: await OutfitService.getAll(),
      [StorageService.KEYS.ACTIVITY_LOGS]: await ActivityLogService.getAll(),
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
      if (data[StorageService.KEYS.CATEGORIES]) {
        await StorageService.bulkUpdate(StorageService.KEYS.CATEGORIES, data[StorageService.KEYS.CATEGORIES] as Category[]);
      }
      if (data[StorageService.KEYS.CLOTHES]) {
        await StorageService.bulkUpdate(StorageService.KEYS.CLOTHES, data[StorageService.KEYS.CLOTHES] as Cloth[]);
      }
      if (data[StorageService.KEYS.OUTFITS]) {
        await StorageService.bulkUpdate(StorageService.KEYS.OUTFITS, data[StorageService.KEYS.OUTFITS] as Outfit[]);
      }
      if (data[StorageService.KEYS.ACTIVITY_LOGS]) {
        await StorageService.bulkUpdate(StorageService.KEYS.ACTIVITY_LOGS, data[StorageService.KEYS.ACTIVITY_LOGS] as ActivityLog[]);
      }

      return { success: true, message: 'Data imported successfully!' };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, message: 'Error importing data: ' + (error as Error).message };
    }
  },
};
