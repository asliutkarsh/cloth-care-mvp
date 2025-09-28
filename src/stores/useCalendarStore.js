// src/stores/useCalendarStore.js
import { create } from 'zustand';
import { ActivityLogService, OutfitService, ClothService } from '../services';

const formatDate = (date) => date.toISOString().split('T')[0];

export const useCalendarStore = create((set, get) => ({
  // =================================================================
  // STATE
  // =================================================================
  activities: {}, // Activities grouped by date for fast lookups
  outfits: [],
  clothes: [],
  cleanClothes: [],
  isCalendarInitialized: false,

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Fetches all necessary data for the calendar page.
   */
  fetchAll: async () => {
    // Fetch data in parallel
    const [allActivities, allOutfits, allClothes] = await Promise.all([
      ActivityLogService.getAll(),
      OutfitService.getAll(),
      ClothService.getAll(),
    ]);

    // Group activities by date
    const groupedActivities = allActivities.reduce((acc, activity) => {
      const date = activity.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    }, {});

    const cleanClothes = allClothes.filter(cloth => cloth.status === ClothService.STATUSES.CLEAN);

    set({
      activities: groupedActivities,
      outfits: allOutfits,
      clothes: allClothes,
      cleanClothes,
      isCalendarInitialized: true,
    });
  },

  /**
   * Adds a new activity and refreshes the data.
   */
  addActivity: async (activityData, date) => {
    await ActivityLogService.logActivity({
      ...activityData,
      date: formatDate(date),
    });
    // After adding, refresh all calendar data to stay in sync
    await get().fetchAll();
  },

  // =================================================================
  // SELECTORS (Computed data)
  // =================================================================

  /**
   * A helper function to get full details for a specific activity log.
   */
  getActivityDetails: (activity) => {
    const { outfits, clothes } = get(); // Get outfits and clothes from the store's state
    if (activity.type === 'outfit') {
      const outfit = outfits.find(o => o.id === activity.outfitId);
      const outfitClothes = (outfit?.clothIds || [])
        .map(clothId => clothes.find(c => c.id === clothId))
        .filter(Boolean);
      return {
        type: 'outfit',
        title: outfit?.name || 'Deleted Outfit',
        subtitle: outfitClothes.length ? `${outfitClothes.length} item${outfitClothes.length === 1 ? '' : 's'}` : 'No items',
        items: outfitClothes,
      };
    } else if (activity.type === 'individual') {
      const involvedClothes = (activity.clothIds || [])
        .map(clothId => clothes.find(c => c.id === clothId))
        .filter(Boolean);
      return {
        type: 'individual',
        title: involvedClothes.length ? `${involvedClothes.length} item${involvedClothes.length === 1 ? '' : 's'} worn` : 'No items',
        subtitle: involvedClothes.map(c => c.name).join(', ') || 'Select items removed',
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

    deleteActivity: async (activityId) => {
    const { activities } = get();
    let activityToDelete = null;

    // Find the activity in our grouped state
    for (const date in activities) {
      const found = activities[date].find(act => act.id === activityId);
      if (found) {
        activityToDelete = found;
        break;
      }
    }

    if (!activityToDelete) {
      console.error("Activity not found for deletion");
      return;
    }

    // Determine which clothes were part of the activity
    let clothIdsToUpdate = [];
    if (activityToDelete.type === 'outfit') {
      const outfit = await OutfitService.getById(activityToDelete.outfitId);
      if (outfit) clothIdsToUpdate = outfit.clothIds;
    } else {
      clothIdsToUpdate = activityToDelete.clothIds;
    }

    // Decrement the wear count for each cloth
    for (const clothId of clothIdsToUpdate) {
      await ClothService.decrementWearCount(clothId);
    }

    // Finally, remove the activity log itself
    await ActivityLogService.remove(activityId);

    // Refresh all data to ensure UI is in sync
    await get().fetchAll();
  },

}));