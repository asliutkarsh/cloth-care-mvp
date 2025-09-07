import { create } from 'zustand';
import {
  ClothService,
  CategoryService,
  LaundryService,
  ActivityLogService
} from '../services';

export const useWardrobeStore = create((set, get) => ({
  clothes: [],
  categories: [],
  dirtyClothes: [],
  needsPressing: [],
  isInitialized: false,

  fetchAll: async () => {
    const [clothes, categories, laundryStatus] = await Promise.all([
      ClothService.getAll(),
      CategoryService.getHierarchy(),
      LaundryService.getLaundryStatus(),
    ]);

    set({
      clothes,
      categories,
      dirtyClothes: laundryStatus.dirty,
      needsPressing: laundryStatus.needsPressing,
      isInitialized: true,
    });
  },

  /**
   * Adds a new cloth item and refreshes the state.
   */
  addCloth: async (clothData) => {
    await ClothService.add(clothData);
    get().fetchAll(); // Easiest way to keep everything in sync
  },

  /**
   * Logs that an outfit was worn and refreshes the state.
   */
  wearOutfit: async (outfitId) => {
    await ActivityLogService.logActivity({ type: 'outfit', outfitId });
    get().fetchAll(); // Refresh data to show updated wear counts and laundry
  },

  /**
   * Washes a list of clothes and refreshes the state.
   */
  washItems: async (clothIds) => {
    await LaundryService.washClothes(clothIds);
    get().fetchAll(); // Refresh to update laundry lists
  },

  /**
   * Presses a list of clothes and refreshes the state.
   */
  pressItems: async (clothIds) => {
    await LaundryService.pressClothes(clothIds);
    get().fetchAll();
  },

    createOutfit: async (outfitData) => {
    await OutfitService.add(outfitData);
    // Refresh the main wardrobe data after creating a new outfit
    get().fetchAll(); 
  },

}));