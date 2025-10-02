import { create } from 'zustand';
import { LaundryService } from '../services/logic';

export const useLaundryStore = create((set, get) => ({
  // STATE
  dirtyClothes: [],
  needsPressing: [],
  isInitialized: false,

  // ACTIONS
  /**
   * Fetches the current status of all laundry items.
   */
  fetchStatus: async () => {
    const status = await LaundryService.getLaundryStatus();
    set({
      dirtyClothes: status.dirty,
      needsPressing: status.needsPressing,
      isInitialized: true,
    });
  },

  /**
   * Washes a selection of clothes.
   */
  washSelected: async (clothIds) => {
    await LaundryService.washClothes(clothIds);
    await get().fetchStatus(); // Refresh the lists after washing
  },

  /**
   * Presses a selection of clothes.
   */
  pressSelected: async (clothIds) => {
    await LaundryService.pressClothes(clothIds);
    await get().fetchStatus(); // Refresh the lists after pressing
  },
}));