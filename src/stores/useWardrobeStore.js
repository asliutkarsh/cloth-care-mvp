import { create } from 'zustand'
import {
  ClothService,
  CategoryService,
  ActivityLogService,
  OutfitService,
} from '../services/crud';  
import {
  LaundryService,
  AnalyticsService,
} from '../services/logic';  // All logic-related services
import { useAppStore } from './useAppStore';

const replaceById = (items, item) => {
  const index = items.findIndex(existing => existing.id === item.id)
  if (index === -1) {
    return [...items, item]
  }
  const next = items.slice()
  next[index] = item
  return next
}

const removeById = (items, id) => items.filter(item => item.id !== id)

const applyClothUpdates = (state, updatedClothes = []) => {
  if (!updatedClothes.length) {
    return {
      clothes: state.clothes,
      dirtyClothes: state.dirtyClothes,
      needsPressing: state.needsPressing,
    }
  }

  let clothes = state.clothes
  let dirtyClothes = state.dirtyClothes
  let needsPressing = state.needsPressing

  updatedClothes.forEach(cloth => {
    clothes = replaceById(clothes, cloth)
    dirtyClothes = removeById(dirtyClothes, cloth.id)
    needsPressing = removeById(needsPressing, cloth.id)

    if (cloth.status === ClothService.STATUSES.DIRTY) {
      dirtyClothes = [...dirtyClothes, cloth]
    }
    if (cloth.status === ClothService.STATUSES.NEEDS_PRESSING) {
      needsPressing = [...needsPressing, cloth]
    }
  })

  return { clothes, dirtyClothes, needsPressing }
}

const removeClothsFromState = (state, ids = []) => {
  if (!ids.length) return {
    clothes: state.clothes,
    dirtyClothes: state.dirtyClothes,
    needsPressing: state.needsPressing,
  }

  const idSet = new Set(ids)
  return {
    clothes: state.clothes.filter(cloth => !idSet.has(cloth.id)),
    dirtyClothes: state.dirtyClothes.filter(cloth => !idSet.has(cloth.id)),
    needsPressing: state.needsPressing.filter(cloth => !idSet.has(cloth.id)),
  }
}

const detachClothFromOutfits = (outfits, clothIds = []) => {
  if (!clothIds.length) return outfits
  const idSet = new Set(clothIds)
  return outfits.map(outfit => {
    if (!Array.isArray(outfit.clothIds) || !outfit.clothIds.some(id => idSet.has(id))) {
      return outfit
    }
    return {
      ...outfit,
      clothIds: outfit.clothIds.filter(id => !idSet.has(id)),
    }
  })
}

export const useWardrobeStore = create((set, get) => ({
  clothes: [],
  categories: [],
  outfits: [],
  dirtyClothes: [],
  needsPressing: [],
  isInitialized: false,
  isLoading: false,
  error: null,

  fetchAll: async ({ trackStatus = true } = {}) => {
    const { startLoading, finishLoading, setDomainError } = useAppStore.getState();
    if (trackStatus) {
      startLoading('wardrobe');
      set({ isLoading: true, error: null });
    }

    try {
      const [clothes, categories, laundryStatus, outfits] = await Promise.all([
        ClothService.getAll(),
        CategoryService.getHierarchy(),
        LaundryService.getLaundryStatus(),
        OutfitService.getAll(),
      ]);

      set({
        clothes,
        categories,
        outfits,
        dirtyClothes: laundryStatus.dirty,
        needsPressing: laundryStatus.needsPressing,
        isInitialized: true,
        isLoading: false,
        error: null,
      });

      if (trackStatus) {
        finishLoading('wardrobe');
      }
      return true;
    } catch (error) {
      console.error('Failed to fetch wardrobe data:', error);
      set({ isLoading: false, error });
      if (trackStatus) {
        setDomainError('wardrobe', error);
      }
      throw error;
    }
  },

  /**
   * Adds a new cloth item and updates the state directly.
   */
  addCloth: async (clothData) => {
    const newCloth = await ClothService.add(clothData)
    await get().refreshClothesById([newCloth.id], { prefetched: [newCloth] })
    return newCloth
  },

  /**
   * Updates an existing cloth item.
   */
  updateCloth: async (clothId, updates) => {
    const updatedCloth = await ClothService.update(clothId, updates)
    if (!updatedCloth) return null
    await get().refreshClothesById([clothId], { prefetched: [updatedCloth] })
    return updatedCloth
  },

  /**
   * Deletes a cloth item.
   */
  removeCloth: async (clothId) => {
    await ClothService.remove(clothId)
    set(state => {
      const { clothes, dirtyClothes, needsPressing } = removeClothsFromState(state, [clothId])
      return {
        clothes,
        dirtyClothes,
        needsPressing,
        outfits: detachClothFromOutfits(state.outfits, [clothId]),
      }
    })
  },

  /**
   * Logs that an outfit was worn and refreshes the state.
   */
  wearOutfit: async (outfitId) => {
    const outfit = get().outfits.find(o => o.id === outfitId) || await OutfitService.getById(outfitId)
    await ActivityLogService.logActivity({ type: 'outfit', outfitId })

    const clothIds = outfit?.clothIds || []
    if (!clothIds.length) return

    const snapshots = await Promise.all(clothIds.map(id => ClothService.getById(id)))
    const validUpdates = snapshots.filter(Boolean)
    await get().refreshClothesById(clothIds, { prefetched: validUpdates })
  },

  /**
   * Washes a list of clothes and refreshes the state.
   */
  washItems: async (clothIds) => {
    if (!clothIds?.length) return
    const { washedClothes = [] } = await LaundryService.washClothes(clothIds)
    await get().refreshClothesById(clothIds, { prefetched: washedClothes })
  },

  /**
   * Presses a list of clothes and refreshes the state.
   */
  pressItems: async (clothIds) => {
    if (!clothIds?.length) return
    const { pressedClothes = [] } = await LaundryService.pressClothes(clothIds)
    await get().refreshClothesById(clothIds, { prefetched: pressedClothes })
  },

  markClothesDirty: async (clothIds) => {
    if (!clothIds?.length) return;
    try {
      const { marked = [] } = await LaundryService.markDirty(clothIds);
      // Ensure we wait for the refresh to complete
      await get().refreshClothesById(clothIds, { prefetched: marked });
      return { success: true };
    } catch (error) {
      console.error('Error marking clothes as dirty:', error);
      return { success: false, error };
    }
  },
  
  markOutfitDirty: async (outfitId) => {
    if (!outfitId) return
    try {
      const outfit = await OutfitService.getById(outfitId)
      if (!outfit?.clothIds?.length) return
      const { marked = [] } = await LaundryService.markDirty(outfit.clothIds)
      await get().refreshClothesById(outfit.clothIds, { prefetched: marked })
    } catch (error) {
      console.error('Error marking outfit as dirty:', error);
      return { success: false, error };
    }
  },

  /**
   * Increments wear counts for the specified cloth items
   * @param {string[]} clothIds - Array of cloth item IDs
   */
  incrementWearCounts: async (clothIds) => {
    if (!clothIds?.length) return [];
    
    // Update in the database
    const updatedClothes = await Promise.all(
      clothIds.map(id => ClothService.incrementWearCount(id).catch(console.error))
    ).then(results => results.filter(Boolean));
    
    // Update the local state
    if (updatedClothes.length) {
      await get().refreshClothesById(updatedClothes.map(c => c.id), { prefetched: updatedClothes });
    }
    
    return updatedClothes;
  },
  
  /**
   * Decrements wear counts for the specified cloth items
   * @param {string[]} clothIds - Array of cloth item IDs
   */
  decrementWearCounts: async (clothIds) => {
    if (!clothIds?.length) return [];
    
    // Update in the database
    const updatedClothes = await Promise.all(
      clothIds.map(id => ClothService.decrementWearCount(id).catch(console.error))
    ).then(results => results.filter(Boolean));
    
    // Update the local state
    if (updatedClothes.length) {
      await get().refreshClothesById(updatedClothes.map(c => c.id), { prefetched: updatedClothes });
    }
    
    return updatedClothes;
  },

  refreshClothesById: async (clothIds = [], { prefetched = [], removeMissing = false } = {}) => {
    const prefetchedList = (prefetched || []).filter(cloth => cloth && cloth.id)
    const inputIds = Array.isArray(clothIds) ? clothIds : [clothIds]
    const ids = Array.from(new Set([
      ...prefetchedList.map(cloth => cloth.id),
      ...inputIds.filter(Boolean),
    ]))

    if (!ids.length) return []

    const snapshotMap = new Map(prefetchedList.map(cloth => [cloth.id, cloth]))
    const missingIds = ids.filter(id => !snapshotMap.has(id))
    if (missingIds.length) {
      const fetched = await Promise.all(missingIds.map(id => ClothService.getById(id)))
      fetched.filter(Boolean).forEach(cloth => snapshotMap.set(cloth.id, cloth))
    }

    const cloths = Array.from(snapshotMap.values())
    const removedIds = removeMissing
      ? ids.filter(id => !snapshotMap.has(id))
      : []

    set(state => {
      let { clothes, dirtyClothes, needsPressing } = applyClothUpdates(state, cloths)
      if (removedIds.length) {
        const pruned = removeClothsFromState({ clothes, dirtyClothes, needsPressing }, removedIds)
        clothes = pruned.clothes
        dirtyClothes = pruned.dirtyClothes
        needsPressing = pruned.needsPressing
      }
      return { clothes, dirtyClothes, needsPressing }
    })

    return cloths
  },

  createOutfit: async (outfitData) => {
    const newOutfit = await OutfitService.add(outfitData)
    set(state => ({ outfits: [...state.outfits, newOutfit] }))
    return newOutfit
  },

  // --- CATEGORY ACTIONS ---

  /**
   * Adds a new top-level category.
   */
  addCategory: async (categoryData) => {
    await CategoryService.addCategory(categoryData)
    await get().fetchAll({ trackStatus: false }) // Refresh all data to reflect changes
  },

  /**
   * Adds a new subcategory under a parent.
   */
  addSubCategory: async (parentId, categoryData) => {
    await CategoryService.addSubCategory(parentId, categoryData)
    await get().fetchAll({ trackStatus: false })
  },

  /**
   * Updates an existing category.
   */
  updateCategory: async (categoryId, updates) => {
    await CategoryService.update(categoryId, updates)
    await get().fetchAll({ trackStatus: false })
  },

  /**
   * Removes an outfit.
   */
  removeOutfit: async (outfitId) => {
    await OutfitService.remove(outfitId)
    set(state => ({ outfits: removeById(state.outfits, outfitId) }))
  },

  /**
   * Moves clothes from one category to another.
   */
  moveClothesToCategory: async (clothIds, newCategoryId) => {
    console.log('cloths', clothIds)
    console.log('Moving clothes to category:', newCategoryId);
    if (!clothIds?.length || !newCategoryId) return [];

    try {
      // Update all clothes to the new category
      const updatedClothes = await Promise.all(
        clothIds.map(clothId => ClothService.update(clothId, { categoryId: newCategoryId }))
      );

      // Refresh the state with updated clothes
      await get().refreshClothesById(clothIds, { prefetched: updatedClothes });

      return updatedClothes.filter(Boolean);
    } catch (error) {
      console.error('Error moving clothes to category:', error);
      throw error;
    }
  },

  /**
   * Removes a category and handles associated clothes.
   * For subcategories: moves clothes to parent category
   * For parent categories: requires user to specify target category
   */
  removeCategory: async (categoryId, targetCategoryId = null) => {
    // First check if the category has subcategories
    const category = await CategoryService.getById(categoryId);
    const hasChildren = get().hasChildren(categoryId);    

    // Get all clothes associated with the category

    // If the category is a parent, move clothes to the target category
    if (category?.parentId === null && targetCategoryId) {
      const subCategories = await CategoryService.getSubCategories(categoryId);
      const parentClothIds = get().getClothesByCategoryId(categoryId).map(cloth => cloth.id);
      const subClothIds = subCategories.reduce((acc, subCategory) => {
        return [...acc, ...get().getClothesByCategoryId(subCategory.id).map(cloth => cloth.id)];
      }, []);

      await get().moveClothesToCategory([...parentClothIds, ...subClothIds], targetCategoryId);
    }
    // If the category is a subcategory, move clothes to the parent category
    else if (category?.parentId) {
      const clothIds = get().getClothesByCategoryId(categoryId).map(cloth => cloth.id);
      await get().moveClothesToCategory(clothIds, category.parentId);
    }

    try {
      await CategoryService.remove(categoryId);
      await get().fetchAll({ trackStatus: false });
    } catch (error) {
      console.error('Failed to remove category:', error);
      throw error;
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
    const updatedOutfit = await OutfitService.update(outfitId, updates)
    if (!updatedOutfit) return null
    set(state => ({ outfits: replaceById(state.outfits, updatedOutfit) }))
    return updatedOutfit
  },

  // --- CATEGORY HELPERS ---

  /**
   * Checks if a category has any child categories.
   */
  hasChildren: (categoryId) => {
    const { categories } = get();
    return categories.some(cat => cat.parentId === categoryId);
  },

  /**
   * Gets all category IDs including the given category and all its subcategories recursively.
   */
  getCategoryAndSubcategoryIds: (categoryId) => {
    const { categories } = get();
    const categoryIds = new Set([categoryId]);

    const collectSubcategories = (parentId) => {
      const children = categories.filter(cat => cat.parentId === parentId);
      children.forEach(child => {
        categoryIds.add(child.id);
        collectSubcategories(child.id);
      });
    };

    collectSubcategories(categoryId);
    const result = Array.from(categoryIds);
    return result;
  },

  /**
   * Gets all clothes associated with a category and its subcategories.
   */
  getClothesByCategoryId: (categoryId) => {
    const { clothes } = get();
    const categoryIds = get().getCategoryAndSubcategoryIds(categoryId);
    return clothes.filter(cloth => categoryIds.includes(cloth.categoryId));
  },

  /**
   * Gets all available categories for moving clothes to (excluding the category being deleted).
   */
  getAvailableCategoriesForMove: (excludeCategoryId) => {
    const { categories } = get();

    // Flatten hierarchical categories into a single array
    const flattenCategories = (cats) => {
      const result = [];
      for (const cat of cats) {
        if (cat.id !== excludeCategoryId && cat.parentId === null) {
          result.push(cat);
        }
        if (cat.children) {
          result.push(...flattenCategories(cat.children));
        }
      }
      return result;
    };

    return flattenCategories(categories);
  },

  /**
   * Gets the parent category ID of a given category.
   */
  getParentCategoryId: (categoryId) => {
    const { categories } = get();

    // Search for the category in hierarchical structure
    const findCategory = (cats) => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategory(categories);
    return category?.parentId || null;
  },

  // --- SELECTORS ---
  getParentCategories: () => {
    const { categories } = get()
    return (categories || []).filter(c => !c.parentId)
  },
  getUniqueOutfitTags: () => {
    const { outfits } = get()
    const tags = new Set()
    for (const o of outfits || []) {
      for (const t of o.tags || []) tags.add(t)
    }
    return Array.from(tags)
  },

}))
