// services/activityLogService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storageService.js';
import { ClothService } from './clothService.js';
import { OutfitService } from './outfitService.js';

const KEY = StorageService.KEYS.ACTIVITY_LOGS;

const getClothIdsForActivity = async (activity) => {
  if (!activity) return [];

  if (activity.type === 'outfit' && activity.outfitId) {
    const outfit = await OutfitService.getById(activity.outfitId);
    if (outfit?.clothIds?.length) {
      return outfit.clothIds;
    }
  }

  if (activity.type === 'individual' && Array.isArray(activity.clothIds)) {
    return activity.clothIds;
  }

  return [];
};

const applyWearCountsForActivity = async (activity) => {
  const clothIds = await getClothIdsForActivity(activity);
  for (const clothId of clothIds) {
    await ClothService.incrementWearCount(clothId);
  }
};

export const ActivityLogService = {
  async getAll() {
    return StorageService.getAll(KEY);
  },

  async getById(id) {
    const log = await StorageService.getById(KEY, id);
    return log || null;
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
    const status = activityData?.status || 'worn';
    const now = new Date();
    const newLog = {
      id: uuidv4(),
      // Default to today's date in YYYY-MM-DD format
      date: new Date().toISOString().split('T')[0],
      notes: '',
      ...activityData, // User-provided data overrides defaults
      time:
        activityData?.time ||
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      status,
      appliedWearCounts: status === 'worn',
      createdAt: now.toISOString(),
    };

    await StorageService.add(KEY, newLog);

    if (newLog.status === 'worn') {
      await applyWearCountsForActivity(newLog);
    }

    return newLog;
  },

  async update(id, updates) {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const nextLog = { ...existing, ...updates };
    if (typeof nextLog.appliedWearCounts === 'undefined') {
      nextLog.appliedWearCounts = existing.appliedWearCounts ?? existing.status === 'worn';
    }

    const previousStatus = existing.status || 'worn';
    const currentStatus = nextLog.status || previousStatus;
    const needsWearIncrement =
      previousStatus !== 'worn' && currentStatus === 'worn' && !nextLog.appliedWearCounts;

    if (needsWearIncrement) {
      await applyWearCountsForActivity(nextLog);
      nextLog.appliedWearCounts = true;
    }

    await StorageService.update(KEY, id, nextLog);
    return nextLog;
  },

  async remove(id) {
    // Note: Removing an activity does NOT reverse the wear count increment.
    // This is a design choice for simplicity.
    await StorageService.remove(KEY, id);
    return true;
  },
};