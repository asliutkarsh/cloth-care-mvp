// services/analyticsService.js
import { ClothService } from "./clothService.js";
import { OutfitService } from "./outfitService.js";
import { ActivityLogService } from "./activityLogService.js";
import { CategoryService } from "./categoryService.js";

export const AnalyticsService = {
  /**
   * Provides a comprehensive overview of the wardrobe.
   */
  async getWardrobeStats() {
    const clothes = await ClothService.getAll();
    const outfits = await OutfitService.getAll();
    const activities = await ActivityLogService.getAll();

    return {
      totalClothes: clothes.length,
      totalOutfits: outfits.length,
      totalActivities: activities.length,
      byStatus: {
        clean: (await ClothService.getCleanClothes()).length,
        dirty: (await ClothService.getDirtyClothes()).length,
        needsPressing: (await ClothService.getNeedsPressing()).length,
      },
      mostUsedClothes: this.getMostUsedClothes(clothes, 5),
      leastUsedClothes: this.getLeastUsedClothes(clothes, 5),
    };
  },

  /**
   * Sorts clothes by wear count to find the most used items.
   * Note: Takes 'clothes' as an argument to be more efficient inside getWardrobeStats.
   */
  getMostUsedClothes(clothes, limit = 10) {
    return [...clothes]
      .sort((a, b) => b.currentWearCount - a.currentWearCount)
      .slice(0, limit);
  },

  /**
   * Sorts clothes by wear count to find the least used items.
   */
  getLeastUsedClothes(clothes, limit = 10) {
    return [...clothes]
      .sort((a, b) => a.currentWearCount - b.currentWearCount)
      .slice(0, limit);
  },

  /**
   * Retrieves user activity within a specific number of days.
   */
  async getActivityHistory(days = 30) {
    const activities = await ActivityLogService.getAll();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return activities
      .filter(activity => new Date(activity.createdAt) >= cutoffDate)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Calculates statistics on a per-category basis.
   */
  async getCategoryUsage() {
    const clothes = await ClothService.getAll();
    const categories = await CategoryService.getAll();
    const usage = {};

    for (const cat of categories) {
      const clothesInCategory = clothes.filter(c => c.categoryId === cat.id);
      usage[cat.id] = {
        category: cat,
        clothCount: clothesInCategory.length,
        totalWears: clothesInCategory.reduce((sum, c) => sum + c.currentWearCount, 0),
      };
    }

    return Object.values(usage);
  },
};