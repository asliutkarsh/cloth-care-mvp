import { create } from 'zustand';
import { LaundryService } from '../services/logic';
import { useWardrobeStore } from './useWardrobeStore';

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
    await Promise.all([
      get().fetchStatus(),
      useWardrobeStore.getState().fetchAll({ trackStatus: false }),
    ]);
  },

  /**
   * Presses a selection of clothes.
   */
  pressSelected: async (clothIds) => {
    await LaundryService.pressClothes(clothIds);
    await Promise.all([
      get().fetchStatus(),
      useWardrobeStore.getState().fetchAll({ trackStatus: false }),
    ]);
  },
}));