import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../setup/storage.service';
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

  async getHistoryForCloth(clothId: string): Promise<ActivityLog[]> {
    if (!clothId) {
      return [];
    }

    const logs = await this.getAll();
    const matching: ActivityLog[] = [];

    for (const log of logs) {
      if (log.status !== 'worn') {
        continue;
      }

      const clothIds = await getClothIdsForActivity(log);
      if (clothIds.includes(clothId)) {
        matching.push(log);
      }
    }

    return matching.sort((a, b) => {
      const aTime = new Date(a.createdAt || `${a.date}T${a.time || '00:00'}`).getTime();
      const bTime = new Date(b.createdAt || `${b.date}T${b.time || '00:00'}`).getTime();
      return bTime - aTime;
    });
  },

  async getHistoryForOutfit(outfitId: string): Promise<ActivityLog[]> {
    if (!outfitId) {
      return [];
    }

    const logs = await this.getAll();
    return logs
      .filter(log => log.type === 'outfit' && log.outfitId === outfitId && log.status === 'worn')
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || `${a.date}T${a.time || '00:00'}`).getTime();
        const bTime = new Date(b.createdAt || `${b.date}T${b.time || '00:00'}`).getTime();
        return bTime - aTime;
      });
  },

  /**
   * Logs a user activity (wearing an outfit or individual clothes)
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
      // Let the store handle wear counts
      appliedWearCounts: false,
      createdAt: now.toISOString(),
      type: activityData.type,
      outfitId: activityData.outfitId,
      clothIds: activityData.clothIds,
    };

    await StorageService.add(StorageService.KEYS.ACTIVITY_LOGS, newLog);
    return newLog;
  },

  async update(id: string, updates: Partial<ActivityLog>): Promise<ActivityLog | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const nextLog = { ...existing, ...updates };
    
    // The store will handle any wear count updates
    if (typeof nextLog.appliedWearCounts === 'undefined') {
      nextLog.appliedWearCounts = false;
    }

    const updated = await StorageService.put(StorageService.KEYS.ACTIVITY_LOGS, nextLog);
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    await StorageService.remove(StorageService.KEYS.ACTIVITY_LOGS, id);
    return true;
  },
};
