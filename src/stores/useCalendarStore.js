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
    const [allActivities, allOutfits, cleanClothes] = await Promise.all([
      ActivityLogService.getAll(),
      OutfitService.getAll(),
      ClothService.getCleanClothes(),
    ]);

    // Group activities by date
    const groupedActivities = allActivities.reduce((acc, activity) => {
      const date = activity.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    }, {});

    set({
      activities: groupedActivities,
      outfits: allOutfits,
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
    const { outfits } = get(); // Get outfits from the store's state
    if (activity.type === 'outfit') {
      const outfit = outfits.find(o => o.id === activity.outfitId);
      // In a real app, you might want to fetch clothes details here if not already loaded
      return {
        name: outfit?.name || 'Deleted Outfit',
        items: outfit?.clothIds.length ? `${outfit.clothIds.length} items` : 'No items',
      };
    } else {
      // For individual clothes, you'd look them up similarly
      return {
        name: 'Individual Items',
        items: `${activity.clothIds.length} items`,
      };
    }
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