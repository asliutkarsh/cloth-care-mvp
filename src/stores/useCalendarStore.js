// src/stores/useCalendarStore.js
import { create } from 'zustand';
import { ActivityLogService, OutfitService, ClothService } from '../services';

const normalizeDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatDate = (value) => {
  const date = normalizeDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normaliseActivity = (activity) => {
  const status = typeof activity.status === 'string' ? activity.status : 'worn';
  const appliedWearCounts =
    typeof activity.appliedWearCounts === 'boolean' ? activity.appliedWearCounts : status === 'worn';
  return {
    status,
    appliedWearCounts,
    ...activity,
  };
};

const getClothIdsForActivity = async (activity) => {
  if (!activity) return [];

  if (activity.type === 'outfit' && activity.outfitId) {
    const outfit = await OutfitService.getById(activity.outfitId);
    return outfit?.clothIds || [];
  }

  if (activity.type === 'individual' && Array.isArray(activity.clothIds)) {
    return activity.clothIds;
  }

  return [];
};

export const useCalendarStore = create((set, get) => ({
  activities: {},
  outfits: [],
  clothes: [],
  cleanClothes: [],
  isCalendarInitialized: false,

  fetchAll: async () => {
    const [allActivities, allOutfits, allClothes] = await Promise.all([
      ActivityLogService.getAll(),
      OutfitService.getAll(),
      ClothService.getAll(),
    ]);

    const groupedActivities = allActivities.reduce((acc, activity) => {
      const key = formatDate(activity.date || activity.createdAt);
      if (!acc[key]) acc[key] = [];
      acc[key].push({ ...normaliseActivity(activity), date: key });
      return acc;
    }, {});

    const cleanClothes = allClothes.filter(
      (cloth) => cloth.status === ClothService.STATUSES.CLEAN
    );

    set({
      activities: groupedActivities,
      outfits: allOutfits,
      clothes: allClothes,
      cleanClothes,
      isCalendarInitialized: true,
    });
  },

  addActivity: async (activityData) => {
    const dateKey = formatDate(activityData?.date);
    await ActivityLogService.logActivity({
      ...activityData,
      date: dateKey,
    });
    await get().fetchAll();
  },

  updateActivityStatus: async (activityId, status, extraUpdates = {}) => {
    await ActivityLogService.update(activityId, { status, ...extraUpdates });
    await get().fetchAll();
  },

  deleteActivity: async (activityId) => {
    const { activities } = get();
    let activityToDelete = null;

    Object.values(activities).some((list) => {
      const match = list.find((entry) => entry.id === activityId);
      if (match) {
        activityToDelete = match;
        return true;
      }
      return false;
    });

    if (!activityToDelete) {
      console.error('Activity not found for deletion');
      return;
    }

    if (activityToDelete.appliedWearCounts) {
      const clothIds = await getClothIdsForActivity(activityToDelete);
      for (const clothId of clothIds) {
        await ClothService.decrementWearCount(clothId);
      }
    }

    await ActivityLogService.remove(activityId);
    await get().fetchAll();
  },

  getActivityDetails: (activity) => {
    const { outfits, clothes } = get();

    if (activity.type === 'outfit') {
      const outfit = outfits.find((o) => o.id === activity.outfitId);
      const outfitClothes = (outfit?.clothIds || [])
        .map((clothId) => clothes.find((c) => c.id === clothId))
        .filter(Boolean);
      return {
        type: 'outfit',
        title: outfit?.name || 'Deleted Outfit',
        subtitle: outfitClothes.length
          ? `${outfitClothes.length} item${outfitClothes.length === 1 ? '' : 's'}`
          : 'No items',
        items: outfitClothes,
      };
    }

    if (activity.type === 'individual') {
      const involvedClothes = (activity.clothIds || [])
        .map((clothId) => clothes.find((c) => c.id === clothId))
        .filter(Boolean);
      return {
        type: 'individual',
        title: involvedClothes.length
          ? `${involvedClothes.length} item${involvedClothes.length === 1 ? '' : 's'} worn`
          : 'No items',
        subtitle: involvedClothes.map((c) => c.name).join(', ') || 'Select items removed',
        items: involvedClothes,
      };
    }

    return {
      type: activity.type,
      title: 'Unknown activity',
      subtitle: 'This entry references missing data',
      items: [],
    };
  },

  getPlannedActivitiesForDate: (date) => {
    const key = formatDate(date);
    const { activities } = get();
    return (activities[key] || []).filter((activity) => activity.status === 'planned');
  },

}));