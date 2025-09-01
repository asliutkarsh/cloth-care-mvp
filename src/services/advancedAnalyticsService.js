import * as ActivityLogService from './activityLogService.js';
import * as ClothService from './clothService.js';
import * as OutfitService from './outfitService.js';
import * as AuditLogService from './auditLogService.js';
import * as CategoryService from './categoryService.js';

export async function getWearPatterns(days = 30) {
  const activities = await ActivityLogService.getAll();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentActivities = activities.filter(activity => 
    new Date(activity.date) >= cutoffDate
  );
  
  // Analyze daily wear patterns
  const dailyWears = {};
  for (const activity of recentActivities) {
    const dateKey = activity.date;
    if (!dailyWears[dateKey]) {
      dailyWears[dateKey] = 0;
    }
    
    const clothesInOutfit = activity.type === 'outfit'
      ? await OutfitService.getClothesInOutfit(activity.outfitId)
      : [];

    const clothCount = activity.type === 'outfit'
      ? clothesInOutfit.length
      : activity.clothIds.length;
    
    dailyWears[dateKey] += clothCount;
  }
  
  const totalWears = Object.values(dailyWears).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(dailyWears).length;

  return {
    dailyWears,
    averageItemsPerDay: activeDays > 0 ? totalWears / activeDays : 0,
    totalActivities: recentActivities.length,
    activeDays: activeDays
  };
}

export async function getCostPerWear() {
  const clothes = await ClothService.getAll();
  return clothes
      .filter(cloth => cloth.cost > 0)
      .map(cloth => ({
          ...cloth,
          costPerWear: cloth.currentWearCount > 0 ? cloth.cost / cloth.currentWearCount : cloth.cost
      }))
      .sort((a,b) => a.costPerWear - b.costPerWear);
}

export async function getLaundryFrequency(days = 90) {
  const logs = await AuditLogService.getAll();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const washLogs = logs.filter(log => 
    log.type === AuditLogService.LOG_TYPES.LAUNDRY &&
    log.action === AuditLogService.ACTIONS.WASH &&
    new Date(log.timestamp) >= cutoffDate
  );
  
  // Group by week
  const weeklyWashes = {};
  washLogs.forEach(log => {
    const date = new Date(log.timestamp);
    const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
    const weekKey = firstDay.toISOString().split('T')[0];
    
    if (!weeklyWashes[weekKey]) {
      weeklyWashes[weekKey] = 0;
    }
    weeklyWashes[weekKey] += log.details.totalWashed || 0;
  });
  
  const totalWeeks = Object.keys(weeklyWashes).length;

  return {
    weeklyWashes,
    averagePerWeek: totalWeeks > 0 ? Object.values(weeklyWashes).reduce((a, b) => a + b, 0) / totalWeeks : 0,
    totalWashSessions: washLogs.length
  };
}

export async function getNumberOfClothesByCategory(categoryId, subcategories) {
  const allClothes = await ClothService.getAll();
  const categoryIds = [categoryId, ...subcategories.map(sub => sub.id)];

  return allClothes.filter(cloth => categoryIds.includes(cloth.categoryId)).length;
}  

/**
 * Moves clothes from specified categories to a new category
 * @param {string[]} categoryIds - Array of category IDs to move clothes from
 * @param {string} newCategoryId - ID of the target category
 * @returns {Promise<{success: boolean, movedCount: number}>} Result of the operation
 * @throws {Error} If validation fails or operation cannot be completed
 */
export async function moveClothesToCategory(categoryIds, newCategoryId) {
  // Input validation
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    throw new Error("Invalid category IDs provided");
  }
  
  if (!newCategoryId || typeof newCategoryId !== 'string') {
    throw new Error("Invalid target category ID");
  }

  if (categoryIds.includes(newCategoryId)) {
    throw new Error("Cannot reassign clothes to the same category being deleted.");
  }

  try {
    // Verify the target category exists
    const targetCategory = await CategoryService.getCategoryById(newCategoryId);
    if (!targetCategory) {
      throw new Error(`Target category with ID ${newCategoryId} not found`);
    }

    // Get all clothes in the source categories
    const clothes = await ClothService.getAll();
    const clothesToMove = clothes.filter(cloth => categoryIds.includes(cloth.categoryId));

    if (clothesToMove.length === 0) {
      return { success: true, movedCount: 0 };
    }

    // Update each cloth's category
    const updatePromises = clothesToMove.map(cloth => {
      return ClothService.update(cloth.id, { ...cloth, categoryId: newCategoryId });
    });

    await Promise.all(updatePromises);

    return { 
      success: true, 
      movedCount: clothesToMove.length 
    };
  } catch (error) {
    console.error('Error moving clothes between categories:', error);
    throw new Error(`Failed to move clothes: ${error.message}`);
  }
}
