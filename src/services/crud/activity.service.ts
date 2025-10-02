import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../setup/storage.service';
import { ClothService } from './cloth.service';
import { OutfitService } from './outfit.service';
import { ActivityLog } from '../model/activity.model';

interface ActivityData {
  date?: string;
  time?: string;
  type: 'outfit' | 'individual';
  outfitId?: string;
  clothIds?: string[];
  status?: 'worn' | 'planned';
  notes?: string;
}

const getClothIdsForActivity = async (activity: ActivityLog): Promise<string[]> => {
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

const applyWearCountsForActivity = async (activity: ActivityLog): Promise<void> => {
  const clothIds = await getClothIdsForActivity(activity);
  for (const clothId of clothIds) {
    await ClothService.incrementWearCount(clothId);
  }
};

export const ActivityLogService = {
  async getAll(): Promise<ActivityLog[]> {
    return StorageService.getAll(StorageService.KEYS.ACTIVITY_LOGS);
  },

  async getById(id: string): Promise<ActivityLog | null> {
    const log = await StorageService.getById<ActivityLog>(StorageService.KEYS.ACTIVITY_LOGS, id);
    return log || null;
  },

  async getByDate(date: string): Promise<ActivityLog[]> {
    const logs = await this.getAll();
    return logs.filter(log => log.date === date);
  },

  /**
   * Logs a user activity (wearing an outfit or individual clothes)
   * and updates the wear count for each item.
   */
  async logActivity(activityData: ActivityData): Promise<ActivityLog> {
    const status = activityData?.status || 'worn';
    const now = new Date();
    const newLog: ActivityLog = {
      id: uuidv4(),
      date: activityData.date || new Date().toISOString().split('T')[0],
      notes: activityData.notes || '',
      time: activityData?.time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      status,
      appliedWearCounts: status === 'worn',
      createdAt: now.toISOString(),
      type: activityData.type,
      outfitId: activityData.outfitId,
      clothIds: activityData.clothIds,
    };

    await StorageService.add(StorageService.KEYS.ACTIVITY_LOGS, newLog);

    if (newLog.status === 'worn') {
      await applyWearCountsForActivity(newLog);
    }

    return newLog;
  },

  async update(id: string, updates: Partial<ActivityLog>): Promise<ActivityLog | null> {
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

    const updated = await StorageService.put(StorageService.KEYS.ACTIVITY_LOGS, nextLog);
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    await StorageService.remove(StorageService.KEYS.ACTIVITY_LOGS, id);
    return true;
  },
};
