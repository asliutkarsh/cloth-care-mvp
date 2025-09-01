import * as FilterService from './filterService.js';
import * as ClothService from './clothService.js';
import * as CategoryService from './categoryService.js';

// Get clothes by status with optional additional filters
export async function getCleanClothes(additionalFilters = {}) {
  return await FilterService.filterClothes({
    status: [ClothService.STATUSES.CLEAN],
    ...additionalFilters
  });
}

export async function getDirtyClothes(additionalFilters = {}) {
  return await FilterService.filterClothes({
    status: [ClothService.STATUSES.DIRTY],
    ...additionalFilters
  });
}

export async function getNeedsPressing(additionalFilters = {}) {
  return await FilterService.filterClothes({
    status: [ClothService.STATUSES.NEEDS_PRESSING],
    ...additionalFilters
  });
}

// Get clothes by category with status filtering
export async function getClothesByCategory(categoryId, statusFilter = null, includeSubcategories = true) {
  const filters = { };
  if (includeSubcategories) {
      const allCategories = await CategoryService.getAll();
      const categoryIds = [categoryId];
      function addSubcategories(parentId) {
          const subcategories = allCategories.filter(cat => cat.parentId === parentId);
          subcategories.forEach(subcat => {
              categoryIds.push(subcat.id);
              addSubcategories(subcat.id);
          });
      }
      addSubcategories(categoryId);
      filters.categoryIds = categoryIds;
  } else {
      filters.categoryIds = [categoryId];
  }
  
  if (statusFilter) {
    filters.status = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
  }
  return await FilterService.filterClothes(filters);
}

// Get clean clothes by category (ready to wear)
export async function getAvailableClothesInCategory(categoryId) {
  return await getClothesByCategory(categoryId, ClothService.STATUSES.CLEAN, true);
}

// Get clothes nearing dirty status
export async function getClothesNearingDirty(threshold = 0.8) {
  const clothes = await ClothService.getAll();
  const categories = await CategoryService.getAll();
  
  const clothesWithMaxWear = await Promise.all(clothes.map(async cloth => {
    const maxWearCount = await CategoryService.getMaxWearCount(cloth.categoryId);
    return { ...cloth, maxWearCount };
  }));

  return clothesWithMaxWear.filter(cloth => {
    if (cloth.status !== ClothService.STATUSES.CLEAN) return false;
    
    if (cloth.maxWearCount <= 0) return false;
    const wearPercentage = cloth.currentWearCount / cloth.maxWearCount;
    return wearPercentage >= threshold;
  });
}

// Get clothes by multiple statuses
export async function getClothesByStatuses(statuses) {
  return await FilterService.filterClothes({ status: statuses });
}

// Get recently added clothes
export async function getRecentlyAddedClothes(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const clothes = await ClothService.getAll();
  return clothes.filter(cloth => new Date(cloth.createdAt) > cutoffDate);
}

// Get clothes by wear frequency
export async function getFrequentlyWornClothes(minWearCount = 5) {
  return await FilterService.filterClothes({ wearCountMin: minWearCount });
}

export async function getRarelyWornClothes(maxWearCount = 1) {
  return await FilterService.filterClothes({ wearCountMax: maxWearCount });
}

// Get expensive clothes
export async function getExpensiveClothes(minCost = 100) {
  return await FilterService.filterClothes({ costMin: minCost });
}

// Get clothes by season
export async function getClothesBySeason(season) {
  return await FilterService.filterClothes({ seasons: [season] });
}

// Get wardrobe overview
export async function getWardrobeOverview() {
  const [clothes, categories] = await Promise.all([
    ClothService.getAll(),
    CategoryService.getAll()
  ]);
  
  const [clean, dirty, needsPressing] = await Promise.all([
    getCleanClothes(),
    getDirtyClothes(),
    getNeedsPressing()
  ]);

  const overview = {
    totalItems: clothes.length,
    byStatus: {
      clean: clean.length,
      dirty: dirty.length,
      needsPressing: needsPressing.length
    },
    byCategory: {},
    totalValue: clothes.reduce((sum, cloth) => sum + (cloth.cost || 0), 0),
    averageWearCount: clothes.length > 0 
      ? clothes.reduce((sum, cloth) => sum + cloth.currentWearCount, 0) / clothes.length 
      : 0
  };
  
  // Calculate category breakdown using the hierarchy
  const categoryTree = await CategoryService.getHierarchy();
  
  const processCategory = async (category) => {
      const clothesInCategory = await getClothesByCategory(category.id, null, true);
      const cleanInCategory = clothesInCategory.filter(c => c.status === ClothService.STATUSES.CLEAN);
      const dirtyInCategory = clothesInCategory.filter(c => c.status === ClothService.STATUSES.DIRTY);
      const needsPressingInCategory = clothesInCategory.filter(c => c.status === ClothService.STATUSES.NEEDS_PRESSING);

      overview.byCategory[category.name] = {
          id: category.id,
          total: clothesInCategory.length,
          clean: cleanInCategory.length,
          dirty: dirtyInCategory.length,
          needsPressing: needsPressingInCategory.length,
          children: {}
      };
      if(category.children && category.children.length > 0) {
          for (const child of category.children) {
              overview.byCategory[category.name].children[child.name] = await processCategory(child)
          }
      }
      return overview.byCategory[category.name]
  }
  
  for (const rootCategory of categoryTree) {
      await processCategory(rootCategory);
  }
  
  return overview;
}
