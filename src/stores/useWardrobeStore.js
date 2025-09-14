import { create } from 'zustand'
import {
  ClothService,
  CategoryService,
  LaundryService,
  ActivityLogService,
  AnalyticsService,
} from '../services'

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
    ])

    set({
      clothes,
      categories,
      dirtyClothes: laundryStatus.dirty,
      needsPressing: laundryStatus.needsPressing,
      isInitialized: true,
    })
  },

  /**
   * Adds a new cloth item and refreshes the state.
   */
  addCloth: async (clothData) => {
    await ClothService.add(clothData)
    get().fetchAll() // Easiest way to keep everything in sync
  },

  /**
   * Updates an existing cloth item.
   */
  updateCloth: async (clothId, updates) => {
    await ClothService.update(clothId, updates)
    await get().fetchAll() // Refresh all data to ensure UI is in sync
  },

  /**
   * Deletes a cloth item.
   */
  removeCloth: async (clothId) => {
    // You'll likely need this on the detail page too
    await ClothService.remove(clothId)
    await get().fetchAll()
  },

  /**
   * Logs that an outfit was worn and refreshes the state.
   */
  wearOutfit: async (outfitId) => {
    await ActivityLogService.logActivity({ type: 'outfit', outfitId })
    get().fetchAll() // Refresh data to show updated wear counts and laundry
  },

  /**
   * Washes a list of clothes and refreshes the state.
   */
  washItems: async (clothIds) => {
    await LaundryService.washClothes(clothIds)
    get().fetchAll() // Refresh to update laundry lists
  },

  /**
   * Presses a list of clothes and refreshes the state.
   */
  pressItems: async (clothIds) => {
    await LaundryService.pressClothes(clothIds)
    get().fetchAll()
  },

  createOutfit: async (outfitData) => {
    await OutfitService.add(outfitData)
    // Refresh the main wardrobe data after creating a new outfit
    get().fetchAll()
  },

  // --- CATEGORY ACTIONS ---

  /**
   * Adds a new top-level category.
   */
  addCategory: async (categoryData) => {
    await CategoryService.addCategory(categoryData)
    await get().fetchAll() // Refresh all data to reflect changes
  },

  /**
   * Adds a new subcategory under a parent.
   */
  addSubCategory: async (parentId, categoryData) => {
    await CategoryService.addSubCategory(parentId, categoryData)
    await get().fetchAll()
  },

  /**
   * Updates an existing category.
   */
  updateCategory: async (categoryId, updates) => {
    await CategoryService.update(categoryId, updates)
    await get().fetchAll()
  },

  /**
   * Removes a category.
   * Note: The service will throw an error if the category has children.
   */
  removeCategory: async (categoryId) => {
    try {
      await CategoryService.remove(categoryId)
      await get().fetchAll()
    } catch (error) {
      // It's good practice to alert the user if the delete fails (e.g., category not empty)
      alert(error.message)
      console.error('Failed to remove category:', error)
    }
  },
  getMostWornItem: () => {
    const { clothes, isInitialized } = get()
    if (!isInitialized || !clothes?.length) return null
    return AnalyticsService.getMostUsedClothes(clothes, 1)[0] || null
  },


  /**
   * Updates an existing outfit.
   */
  updateOutfit: async (outfitId, updates) => {
    await OutfitService.update(outfitId, updates);
    await get().fetchAll(); // Refresh all data
  },

  /**
   * Removes an outfit.
   */
  removeOutfit: async (outfitId) => {
    await OutfitService.remove(outfitId);
    await get().fetchAll();
  },

}))
