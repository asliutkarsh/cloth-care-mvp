// services/activityLogService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from "./storageService.js";
import { ClothService } from './clothService.js';
import { OutfitService } from './outfitService.js';

const KEY = StorageService.KEYS.ACTIVITY_LOGS;

export const ActivityLogService = {
  async getAll() {
    return (await StorageService.get(KEY)) || [];
  },

  async getById(id) {
    const logs = await this.getAll();
    return logs.find(log => log.id === id) || null;
  },

  async getByDate(date) {
    const logs = await this.getAll();
    // Assumes date is in 'YYYY-MM-DD' format
    return logs.filter(log => log.date === date);
  },

  /**
   * Logs a user activity (wearing an outfit or individual clothes)
   * and updates the wear count for each item.
   * @param {object} activityData - The activity details.
   * @returns {object} The new log entry.
   */
  async logActivity(activityData) {
    const logs = await this.getAll();
    const newLog = {
      id: uuidv4(),
      // Default to today's date in YYYY-MM-DD format
      date: new Date().toISOString().split('T')[0],
      notes: '',
      ...activityData, // User-provided data overrides defaults
      createdAt: new Date().toISOString(),
    };

    logs.push(newLog);
    await StorageService.set(KEY, logs);

    // --- CRITICAL: Update wear counts for the clothes ---
    let clothIdsToUpdate = [];
    if (newLog.type === 'outfit' && newLog.outfitId) {
      const outfit = await OutfitService.getById(newLog.outfitId);
      if (outfit) {
        clothIdsToUpdate = outfit.clothIds;
      }
    } else if (newLog.type === 'individual' && newLog.clothIds) {
      clothIdsToUpdate = newLog.clothIds;
    }

    // Increment wear count for each cloth involved
    for (const clothId of clothIdsToUpdate) {
      await ClothService.incrementWearCount(clothId);
    }

    return newLog;
  },

  async update(id, updates) {
    let logs = await this.getAll();
    let updatedLog = null;
    const newLogs = logs.map(log => {
      if (log.id === id) {
        updatedLog = { ...log, ...updates };
        return updatedLog;
      }
      return log;
    });
    await StorageService.set(KEY, newLogs);
    return updatedLog;
  },

  async remove(id) {
    // Note: Removing an activity does NOT reverse the wear count increment.
    // This is a design choice for simplicity.
    const logs = await this.getAll();
    const newLogs = logs.filter(log => log.id !== id);
    await StorageService.set(KEY, newLogs);
    return true;
  },
};