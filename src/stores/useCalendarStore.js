// src/stores/useCalendarStore.js
import { create } from 'zustand';
import { ActivityLogService } from '../services/crud';
import { useWardrobeStore } from './useWardrobeStore';

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
    ...activity,
    status,
    appliedWearCounts,
  };
};

const getClothIdsForActivity = (activity, wardrobeState) => {
  if (!activity) return [];
  if (activity.type === 'outfit' && activity.outfitId) {
    const outfit = wardrobeState.outfits.find(o => o.id === activity.outfitId);
    return outfit?.clothIds || [];
  }
  if (activity.type === 'individual' && Array.isArray(activity.clothIds)) {
    return activity.clothIds;
  }
  return [];
};

export const useCalendarStore = create((set, get) => ({
  activities: {},
  isCalendarInitialized: false,

  fetchAll: async () => {
    const allActivities = await ActivityLogService.getAll();

    const groupedActivities = allActivities.reduce((acc, activity) => {
      const dateKey = formatDate(activity.date || activity.createdAt);
      const normalised = { ...normaliseActivity(activity), date: dateKey };
      if (!acc[dateKey]) {
        acc[dateKey] = [normalised];
      } else {
        acc[dateKey] = [...acc[dateKey], normalised];
      }
      return acc;
    }, {});

    set({
      activities: groupedActivities,
      isCalendarInitialized: true,
    });
  },

  addActivity: async (activityData) => {
    const dateKey = formatDate(activityData?.date);
    
    // Create the activity log without applying wear counts
    const activityToLog = {
      ...activityData,
      date: dateKey,
      // Ensure we don't apply wear counts in the service
      appliedWearCounts: false,
    };
    
    // Let the service handle only the database operation
    const created = await ActivityLogService.logActivity(activityToLog);
    const normalized = { ...normaliseActivity(created), date: dateKey };

    // Get wardrobe state to handle wear counts
    const wardrobeState = useWardrobeStore.getState();
    const clothIds = getClothIdsForActivity(created, wardrobeState);

    // Update local state
    set((state) => {
      const dayActivities = state.activities[dateKey]
        ? [...state.activities[dateKey], normalized]
        : [normalized];
      
      return {
        activities: { ...state.activities, [dateKey]: dayActivities },
      };
    });

    // Handle wear counts through the wardrobe store if this is a 'worn' activity
    if (normalized.status === 'worn' && clothIds.length) {
      await wardrobeState.incrementWearCounts(clothIds);
    }

    return normalized;
  },

  updateActivityStatus: async (activityId, status, extraUpdates = {}) => {
    // Get the current activity to determine if we need to adjust wear counts
    const { activities } = get();
    let currentActivity = null;
    let currentDateKey = null;
    
    // Find the current activity and its date key
    for (const dateKey in activities) {
      const activity = activities[dateKey].find(a => a.id === activityId);
      if (activity) {
        currentActivity = activity;
        currentDateKey = dateKey;
        break;
      }
    }
    
    if (!currentActivity) {
      console.error('Activity not found for update');
      return null;
    }
    
    // Update the activity in the database
    const updated = await ActivityLogService.update(activityId, { 
      ...extraUpdates, 
      status,
      // Ensure we don't apply wear counts in the service
      appliedWearCounts: false 
    });
    
    if (!updated) return null;

    const normalized = { 
      ...normaliseActivity(updated), 
      date: formatDate(updated.date || updated.createdAt) 
    };
    
    // Get wardrobe state for wear count updates
    const wardrobeState = useWardrobeStore.getState();
    const clothIds = getClothIdsForActivity(updated, wardrobeState);
    
    // Handle wear count adjustments based on status changes
    if (currentActivity.status !== status && clothIds.length) {
      if (currentActivity.status === 'worn' && status !== 'worn') {
        // If changing from 'worn' to something else, decrement wear counts
        await wardrobeState.decrementWearCounts(clothIds);
      } else if (currentActivity.status !== 'worn' && status === 'worn') {
        // If changing to 'worn', increment wear counts
        await wardrobeState.incrementWearCounts(clothIds);
      }
    }

    // Update the local state
    set((state) => {
      const nextActivities = { ...state.activities };
      
      // Remove from old position if it exists
      if (currentDateKey && nextActivities[currentDateKey]) {
        nextActivities[currentDateKey] = nextActivities[currentDateKey].filter(
          a => a.id !== activityId
        );
        
        // Remove the date key if no activities left
        if (nextActivities[currentDateKey].length === 0) {
          delete nextActivities[currentDateKey];
        }
      }
      
      // Add to new position
      const targetKey = normalized.date;
      nextActivities[targetKey] = [
        ...(nextActivities[targetKey] || []),
        normalized
      ];
      
      return { activities: nextActivities };
    });

    return normalized;
  },

  deleteActivity: async (activityId) => {
    const { activities } = get();
    let activityToDelete = null;
    
    // Find the activity to delete
    for (const date in activities) {
      const activity = activities[date].find(entry => entry.id === activityId);
      if (activity) {
        activityToDelete = activity;
        break;
      }
    }

    if (!activityToDelete) {
      console.error('Activity not found for deletion');
      return;
    }

    // Get wardrobe state before deleting the activity
    const wardrobeState = useWardrobeStore.getState();
    const clothIds = getClothIdsForActivity(activityToDelete, wardrobeState);
    
    // Delete the activity from the database
    await ActivityLogService.remove(activityId);

    // Update the local state
    const dateKey = formatDate(activityToDelete.date || activityToDelete.createdAt);
    set((state) => {
      const existing = state.activities[dateKey] || [];
      const filtered = existing.filter((entry) => entry.id !== activityId);
      const nextActivities = { ...state.activities };
      
      if (filtered.length) {
        nextActivities[dateKey] = filtered;
      } else {
        delete nextActivities[dateKey];
      }

      return { activities: nextActivities };
    });

    // Decrement wear counts if the activity was logged as 'worn'
    if (activityToDelete.status === 'worn' && clothIds.length > 0) {
      await wardrobeState.decrementWearCounts(clothIds);
    }
  },

  getActivityDetails: (activity) => {
    const wardrobeState = useWardrobeStore.getState();
    const { outfits, clothes } = wardrobeState;

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