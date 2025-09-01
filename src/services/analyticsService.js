import * as ClothService from './clothService.js';
import * as OutfitService from './outfitService.js';
import * as ActivityLogService from './activityLogService.js';
import * as CategoryService from './categoryService.js';

export async function getWardrobeStats() {
  const [clothes, outfits, activities] = await Promise.all([
    ClothService.getAll(),
    OutfitService.getAll(),
    ActivityLogService.getAll()
  ]);
  
  const mostUsedClothes = await getMostUsedClothes(5);
  const leastUsedClothes = await getLeastUsedClothes(5);

  return {
    totalClothes: clothes.length,
    totalOutfits: outfits.length,
    totalActivities: activities.length,
    dirtyClothes: clothes.filter(c => c.status === ClothService.STATUSES.DIRTY).length,
    cleanClothes: clothes.filter(c => c.status === ClothService.STATUSES.CLEAN).length,
    needsPressing: clothes.filter(c => c.status === ClothService.STATUSES.NEEDS_PRESSING).length,
    mostUsedClothes,
    leastUsedClothes
  };
}

export async function getMostUsedClothes(limit = 10) {
  const clothes = await ClothService.getAll();
  return clothes
    .sort((a, b) => b.currentWearCount - a.currentWearCount)
    .slice(0, limit);
}

export async function getLeastUsedClothes(limit = 10) {
  const clothes = await ClothService.getAll();
  return clothes
    .sort((a, b) => a.currentWearCount - b.currentWearCount)
    .slice(0, limit);
}

export async function getActivityHistory(days = 30) {
  const activities = await ActivityLogService.getAll();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return activities
    .filter(activity => new Date(activity.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getCategoryUsage() {
  const [clothes, categories] = await Promise.all([
    ClothService.getAll(),
    CategoryService.getAll()
  ]);
  
  const usage = {};
  for (const cat of categories) {
    const clothesInCategory = clothes.filter(c => c.categoryId === cat.id);
    usage[cat.id] = {
      category: cat,
      clothCount: clothesInCategory.length,
      totalWears: clothesInCategory.reduce((sum, c) => sum + c.currentWearCount, 0)
    };
  }
  
  return usage;
}
