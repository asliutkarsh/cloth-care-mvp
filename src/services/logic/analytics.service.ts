import { ClothService } from '../crud/cloth.service';
import { OutfitService } from '../crud/outfit.service';
import { ActivityLogService } from '../crud/activity.service';
import { CategoryService } from '../crud/category.service';
import { Cloth } from '../model/cloth.model';
import { ActivityLog } from '../model/activity.model';
import { Category } from '../model/category.model';

interface WardrobeStats {
  totalClothes: number;
  totalOutfits: number;
  totalActivities: number;
  byStatus: {
    clean: number;
    dirty: number;
    needsPressing: number;
  };
  mostUsedClothes: Cloth[];
  leastUsedClothes: Cloth[];
}

interface CategoryUsage {
  category: Category;
  clothCount: number;
  totalWears: number;
}

export const AnalyticsService = {
  /**
   * Provides a comprehensive overview of the wardrobe.
   */
  async getWardrobeStats(): Promise<WardrobeStats> {
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
   */
  getMostUsedClothes(clothes: Cloth[], limit = 10): Cloth[] {
    return [...clothes]
      .sort((a, b) => b.currentWearCount - a.currentWearCount)
      .slice(0, limit);
  },

  /**
   * Sorts clothes by wear count to find the least used items.
   */
  getLeastUsedClothes(clothes: Cloth[], limit = 10): Cloth[] {
    return [...clothes]
      .sort((a, b) => a.currentWearCount - b.currentWearCount)
      .slice(0, limit);
  },

  /**
   * Retrieves user activity within a specific number of days.
   */
  async getActivityHistory(days = 30): Promise<ActivityLog[]> {
    const activities = await ActivityLogService.getAll();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return activities
      .filter(activity => new Date(activity.createdAt) >= cutoffDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Calculates statistics on a per-category basis.
   */
  async getCategoryUsage(): Promise<CategoryUsage[]> {
    const clothes = await ClothService.getAll();
    const categories = await CategoryService.getAll();
    const usage: { [key: string]: CategoryUsage } = {};

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
