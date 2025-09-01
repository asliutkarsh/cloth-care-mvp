import * as Storage from './storageService.js';
import * as CategoryService from './categoryService.js';
import * as AnalyticsService from './analyticsService.js';
import * as ClothService from './clothService.js';
import * as OutfitService from './outfitService.js';
import * as ActivityLogService from './activityLogService.js';
import * as NotificationService from './notificationService.js';
import * as AuditLogService from './auditLogService.js';

async function createDefaultCategories() {
  // Create default category structure
  const tops = await CategoryService.create({
    name: 'Tops',
    maxWearCount: 1
  });
  
  const bottoms = await CategoryService.create({
    name: 'Bottoms',
    maxWearCount: 2
  });
  
  const outerwear = await CategoryService.create({
    name: 'Outerwear',
    maxWearCount: 5
  });
  
  // Create subcategories
  await CategoryService.create({
    name: 'T-Shirts',
    parentId: tops.id,
    maxWearCount: 1
  });
  
  await CategoryService.create({
    name: 'Shirts',
    parentId: tops.id,
    maxWearCount: 1
  });
  
  await CategoryService.create({
    name: 'Jeans',
    parentId: bottoms.id,
    maxWearCount: 3
  });
  
  await CategoryService.create({
    name: 'Formal Pants',
    parentId: bottoms.id,
    maxWearCount: 2
  });
}

export async function initializeApp() {
  // Check if this is first time user
  const categories = await CategoryService.getAll();
  
  if (categories.length === 0) {
    await createDefaultCategories();
  }
  
  const stats = await AnalyticsService.getWardrobeStats();

  return {
    isFirstTime: categories.length === 0,
    stats
  };
}

export async function resetApp() {
  await Storage.clear();
  return await initializeApp();
}

export async function exportData() {
  const [categories, clothes, outfits, activityLogs, notificationSettings, auditLogs] = await Promise.all([
    CategoryService.getAll(),
    ClothService.getAll(),
    OutfitService.getAll(),
    ActivityLogService.getAll(),
    NotificationService.getSettings(),
    AuditLogService.getAll()
  ]);

  return {
    categories,
    clothes,
    outfits,
    activityLogs,
    notificationSettings,
    auditLogs,
    exportDate: new Date().toISOString()
  };
}

export async function importData(data) {
  try {
    if (data.categories) await Storage.set(Storage.KEYS.CATEGORIES, data.categories);
    if (data.clothes) await Storage.set(Storage.KEYS.CLOTHES, data.clothes);
    if (data.outfits) await Storage.set(Storage.KEYS.OUTFITS, data.outfits);
    if (data.activityLogs) await Storage.set(Storage.KEYS.ACTIVITY_LOGS, data.activityLogs);
    if (data.notificationSettings) await Storage.set(Storage.KEYS.NOTIFICATION_SETTINGS, data.notificationSettings);
    if (data.auditLogs) await Storage.set(Storage.KEYS.AUDIT_LOGS, data.auditLogs);
    
    return { success: true, message: 'Data imported successfully!' };
  } catch (error) {
    return { success: false, message: 'Error importing data: ' + error.message };
  }
}
