// =======================
// 1. STORAGE SERVICE
// =======================
class StorageService {
  static KEYS = {
    CATEGORIES: 'wardrobe_categories',
    CLOTHES: 'wardrobe_clothes',
    OUTFITS: 'wardrobe_outfits',
    ACTIVITY_LOGS: 'wardrobe_activity_logs',
    NOTIFICATION_SETTINGS: 'wardrobe_notifications'
  };

  static get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  static clear() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}

// =======================
// 2. CATEGORY SERVICE
// =======================
class CategoryService {
  static generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static getAll() {
    return StorageService.get(StorageService.KEYS.CATEGORIES) || [];
  }

  static getById(id) {
    const categories = this.getAll();
    return categories.find(cat => cat.id === id);
  }

  static create(categoryData) {
    const categories = this.getAll();
    const newCategory = {
      id: this.generateId(),
      name: categoryData.name,
      parentId: categoryData.parentId || null,
      maxWearCount: categoryData.maxWearCount || 2,
      createdAt: new Date().toISOString(),
      ...categoryData
    };
    
    categories.push(newCategory);
    StorageService.set(StorageService.KEYS.CATEGORIES, categories);
    return newCategory;
  }

  static update(id, updateData) {
    const categories = this.getAll();
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) return null;
    
    categories[index] = { ...categories[index], ...updateData };
    StorageService.set(StorageService.KEYS.CATEGORIES, categories);
    return categories[index];
  }

  static delete(id) {
    const categories = this.getAll();
    const filtered = categories.filter(cat => cat.id !== id);
    StorageService.set(StorageService.KEYS.CATEGORIES, filtered);
    return true;
  }

  static getMaxWearCount(categoryId) {
    const category = this.getById(categoryId);
    if (!category) return 2; // default
    
    if (category.maxWearCount) return category.maxWearCount;
    
    // Inherit from parent if not set
    if (category.parentId) {
      return this.getMaxWearCount(category.parentId);
    }
    
    return 2; // default fallback
  }

  static getHierarchy() {
    const categories = this.getAll();
    const hierarchy = [];
    
    // Get root categories first
    const roots = categories.filter(cat => !cat.parentId);
    
    function buildTree(parentId = null) {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id)
        }));
    }
    
    return buildTree();
  }
}

// =======================
// 3. CLOTH SERVICE
// =======================
class ClothService {
  static STATUSES = {
    CLEAN: 'clean',
    DIRTY: 'dirty',
    NEEDS_PRESSING: 'needs_pressing'
  };

  static generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static getAll() {
    return StorageService.get(StorageService.KEYS.CLOTHES) || [];
  }

  static getById(id) {
    const clothes = this.getAll();
    return clothes.find(cloth => cloth.id === id);
  }

  static getByStatus(status) {
    const clothes = this.getAll();
    return clothes.filter(cloth => cloth.status === status);
  }

  static getDirtyClothes() {
    return this.getByStatus(this.STATUSES.DIRTY);
  }

  static getNeedsPressing() {
    return this.getByStatus(this.STATUSES.NEEDS_PRESSING);
  }

  static getCleanClothes() {
    return this.getByStatus(this.STATUSES.CLEAN);
  }

  static create(clothData) {
    const clothes = this.getAll();
    const newCloth = {
      id: this.generateId(),
      name: clothData.name,
      description: clothData.description || '',
      color: clothData.color,
      image: clothData.image || null,
      categoryId: clothData.categoryId,
      brand: clothData.brand || '',
      material: clothData.material || '',
      season: clothData.season || '',
      cost: clothData.cost || 0,
      purchaseDate: clothData.purchaseDate || null,
      requiresPressing: clothData.requiresPressing || false,
      status: this.STATUSES.CLEAN,
      currentWearCount: 0,
      createdAt: new Date().toISOString(),
      ...clothData
    };
    
    clothes.push(newCloth);
    StorageService.set(StorageService.KEYS.CLOTHES, clothes);
    return newCloth;
  }

  static update(id, updateData) {
    const clothes = this.getAll();
    const index = clothes.findIndex(cloth => cloth.id === id);
    if (index === -1) return null;
    
    clothes[index] = { ...clothes[index], ...updateData };
    StorageService.set(StorageService.KEYS.CLOTHES, clothes);
    return clothes[index];
  }

  static delete(id) {
    const clothes = this.getAll();
    const filtered = clothes.filter(cloth => cloth.id !== id);
    StorageService.set(StorageService.KEYS.CLOTHES, filtered);
    return true;
  }

  static incrementWearCount(clothId) {
    const cloth = this.getById(clothId);
    if (!cloth) return null;

    const newWearCount = cloth.currentWearCount + 1;
    const maxWearCount = CategoryService.getMaxWearCount(cloth.categoryId);
    
    let newStatus = cloth.status;
    if (newWearCount >= maxWearCount) {
      newStatus = this.STATUSES.DIRTY;
    }

    return this.update(clothId, {
      currentWearCount: newWearCount,
      status: newStatus
    });
  }

  static washClothes(clothIds) {
    const results = [];
    const clothesNeedingPress = [];
    
    clothIds.forEach(clothId => {
      const cloth = this.getById(clothId);
      if (cloth && cloth.status === this.STATUSES.DIRTY) {
        const newStatus = cloth.requiresPressing 
          ? this.STATUSES.NEEDS_PRESSING 
          : this.STATUSES.CLEAN;
        
        const updatedCloth = this.update(clothId, {
          currentWearCount: 0,
          status: newStatus
        });
        
        results.push(updatedCloth);
        
        if (cloth.requiresPressing) {
          clothesNeedingPress.push(updatedCloth);
        }
      }
    });
    
    return {
      washedClothes: results,
      needsPressing: clothesNeedingPress
    };
  }

  static markAsPressed(clothIds) {
    const results = [];
    
    clothIds.forEach(clothId => {
      const cloth = this.getById(clothId);
      if (cloth && cloth.status === this.STATUSES.NEEDS_PRESSING) {
        const updatedCloth = this.update(clothId, {
          status: this.STATUSES.CLEAN
        });
        results.push(updatedCloth);
      }
    });
    
    return results;
  }
}

// =======================
// 4. OUTFIT SERVICE
// =======================
class OutfitService {
  static generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static getAll() {
    return StorageService.get(StorageService.KEYS.OUTFITS) || [];
  }

  static getById(id) {
    const outfits = this.getAll();
    return outfits.find(outfit => outfit.id === id);
  }

  static create(outfitData) {
    const outfits = this.getAll();
    const newOutfit = {
      id: this.generateId(),
      name: outfitData.name,
      description: outfitData.description || '',
      clothIds: outfitData.clothIds || [],
      image: outfitData.image || null,
      tags: outfitData.tags || [],
      createdAt: new Date().toISOString(),
      ...outfitData
    };
    
    outfits.push(newOutfit);
    StorageService.set(StorageService.KEYS.OUTFITS, outfits);
    return newOutfit;
  }

  static update(id, updateData) {
    const outfits = this.getAll();
    const index = outfits.findIndex(outfit => outfit.id === id);
    if (index === -1) return null;
    
    outfits[index] = { ...outfits[index], ...updateData };
    StorageService.set(StorageService.KEYS.OUTFITS, outfits);
    return outfits[index];
  }

  static delete(id) {
    const outfits = this.getAll();
    const filtered = outfits.filter(outfit => outfit.id !== id);
    StorageService.set(StorageService.KEYS.OUTFITS, filtered);
    return true;
  }

  static getClothesInOutfit(outfitId) {
    const outfit = this.getById(outfitId);
    if (!outfit) return [];
    
    return outfit.clothIds.map(clothId => ClothService.getById(clothId)).filter(Boolean);
  }
}

// =======================
// 5. ACTIVITY LOG SERVICE
// =======================
class ActivityLogService {
  static generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static getAll() {
    return StorageService.get(StorageService.KEYS.ACTIVITY_LOGS) || [];
  }

  static getById(id) {
    const logs = this.getAll();
    return logs.find(log => log.id === id);
  }

  static getByDate(date) {
    const logs = this.getAll();
    return logs.filter(log => log.date === date);
  }

  static logActivity(activityData) {
    const logs = this.getAll();
    const newLog = {
      id: this.generateId(),
      date: activityData.date || new Date().toISOString().split('T')[0],
      type: activityData.type, // 'outfit' or 'individual'
      outfitId: activityData.outfitId || null,
      clothIds: activityData.clothIds || [],
      notes: activityData.notes || '',
      createdAt: new Date().toISOString(),
      ...activityData
    };
    
    logs.push(newLog);
    StorageService.set(StorageService.KEYS.ACTIVITY_LOGS, logs);
    
    // Update wear counts for clothes
    const clothIds = newLog.type === 'outfit' 
      ? OutfitService.getClothesInOutfit(newLog.outfitId).map(c => c.id)
      : newLog.clothIds;
    
    clothIds.forEach(clothId => {
      ClothService.incrementWearCount(clothId);
    });
    
    return newLog;
  }

  static update(id, updateData) {
    const logs = this.getAll();
    const index = logs.findIndex(log => log.id === id);
    if (index === -1) return null;
    
    logs[index] = { ...logs[index], ...updateData };
    StorageService.set(StorageService.KEYS.ACTIVITY_LOGS, logs);
    return logs[index];
  }

  static delete(id) {
    const logs = this.getAll();
    const filtered = logs.filter(log => log.id !== id);
    StorageService.set(StorageService.KEYS.ACTIVITY_LOGS, filtered);
    return true;
  }

  static createOutfitFromActivity(activityId, outfitName) {
    const activity = this.getById(activityId);
    if (!activity || activity.type !== 'individual') return null;
    
    const newOutfit = OutfitService.create({
      name: outfitName,
      clothIds: activity.clothIds,
      description: `Created from activity on ${activity.date}`
    });
    
    return newOutfit;
  }
}

// =======================
// 6. NOTIFICATION SERVICE
// =======================
class NotificationService {
  static getSettings() {
    return StorageService.get(StorageService.KEYS.NOTIFICATION_SETTINGS) || {
      enabled: true,
      dayOfWeek: 0, // 0 = Sunday, 1 = Monday, etc.
      timeOfDay: '09:00',
      lastSent: null
    };
  }

  static updateSettings(settings) {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    StorageService.set(StorageService.KEYS.NOTIFICATION_SETTINGS, newSettings);
    return newSettings;
  }

  static getDirtyClothesCount() {
    return ClothService.getDirtyClothes().length;
  }

  static shouldSendNotification() {
    const settings = this.getSettings();
    if (!settings.enabled) return false;
    
    const now = new Date();
    const today = now.getDay(); // 0 = Sunday
    const currentTime = now.toTimeString().substr(0, 5); // HH:MM format
    
    // Check if it's the right day and time
    if (today === settings.dayOfWeek && currentTime >= settings.timeOfDay) {
      // Check if we haven't sent one today
      const lastSent = settings.lastSent ? new Date(settings.lastSent) : null;
      const todayString = now.toISOString().split('T')[0];
      const lastSentString = lastSent ? lastSent.toISOString().split('T')[0] : null;
      
      return todayString !== lastSentString;
    }
    
    return false;
  }

  static createNotificationMessage() {
    const dirtyCount = this.getDirtyClothesCount();
    if (dirtyCount === 0) return "All your clothes are clean! 🎉";
    if (dirtyCount === 1) return "You have 1 item to wash.";
    return `You have ${dirtyCount} items to wash.`;
  }

  static markNotificationSent() {
    const settings = this.getSettings();
    settings.lastSent = new Date().toISOString();
    StorageService.set(StorageService.KEYS.NOTIFICATION_SETTINGS, settings);
  }
}

// =======================
// 7. ANALYTICS SERVICE
// =======================
class AnalyticsService {
  static getWardrobeStats() {
    const clothes = ClothService.getAll();
    const outfits = OutfitService.getAll();
    const activities = ActivityLogService.getAll();
    
    return {
      totalClothes: clothes.length,
      totalOutfits: outfits.length,
      totalActivities: activities.length,
      dirtyClothes: clothes.filter(c => c.status === ClothService.STATUSES.DIRTY).length,
      cleanClothes: clothes.filter(c => c.status === ClothService.STATUSES.CLEAN).length,
      needsPressing: clothes.filter(c => c.status === ClothService.STATUSES.NEEDS_PRESSING).length,
      mostUsedClothes: this.getMostUsedClothes(5),
      leastUsedClothes: this.getLeastUsedClothes(5)
    };
  }

  static getMostUsedClothes(limit = 10) {
    const clothes = ClothService.getAll();
    return clothes
      .sort((a, b) => b.currentWearCount - a.currentWearCount)
      .slice(0, limit);
  }

  static getLeastUsedClothes(limit = 10) {
    const clothes = ClothService.getAll();
    return clothes
      .sort((a, b) => a.currentWearCount - b.currentWearCount)
      .slice(0, limit);
  }

  static getActivityHistory(days = 30) {
    const activities = ActivityLogService.getAll();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return activities
      .filter(activity => new Date(activity.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  static getCategoryUsage() {
    const clothes = ClothService.getAll();
    const categories = CategoryService.getAll();
    
    const usage = {};
    categories.forEach(cat => {
      usage[cat.id] = {
        category: cat,
        clothCount: clothes.filter(c => c.categoryId === cat.id).length,
        totalWears: clothes
          .filter(c => c.categoryId === cat.id)
          .reduce((sum, c) => sum + c.currentWearCount, 0)
      };
    });
    
    return usage;
  }
}

// =======================
// 8. LAUNDRY SERVICE
// =======================
class LaundryService {
  static washSelectedClothes(clothIds) {
    const result = ClothService.washClothes(clothIds);
    
    // Return summary for UI feedback
    return {
      totalWashed: result.washedClothes.length,
      needsPressing: result.needsPressing.length,
      clothesNeedingPress: result.needsPressing,
      message: this.createWashMessage(result)
    };
  }

  static createWashMessage(result) {
    const total = result.washedClothes.length;
    const pressing = result.needsPressing.length;
    
    if (total === 0) return "No clothes were washed.";
    if (pressing === 0) return `${total} item${total > 1 ? 's' : ''} washed and ready to wear!`;
    
    return `${total} item${total > 1 ? 's' : ''} washed. ${pressing} item${pressing > 1 ? 's' : ''} need${pressing === 1 ? 's' : ''} pressing.`;
  }

  static pressSelectedClothes(clothIds) {
    const pressedClothes = ClothService.markAsPressed(clothIds);
    
    return {
      totalPressed: pressedClothes.length,
      message: `${pressedClothes.length} item${pressedClothes.length > 1 ? 's' : ''} pressed and ready to wear!`
    };
  }

  static getLaundryStatus() {
    return {
      dirty: ClothService.getDirtyClothes(),
      needsPressing: ClothService.getNeedsPressing(),
      dirtyCount: ClothService.getDirtyClothes().length,
      pressingCount: ClothService.getNeedsPressing().length
    };
  }
}

// =======================
// 9. DATA INITIALIZATION SERVICE
// =======================
class InitializationService {
  static initializeApp() {
    // Check if this is first time user
    const categories = CategoryService.getAll();
    
    if (categories.length === 0) {
      this.createDefaultCategories();
    }
    
    return {
      isFirstTime: categories.length === 0,
      stats: AnalyticsService.getWardrobeStats()
    };
  }

  static createDefaultCategories() {
    // Create default category structure
    const tops = CategoryService.create({
      name: 'Tops',
      maxWearCount: 1
    });
    
    const bottoms = CategoryService.create({
      name: 'Bottoms',
      maxWearCount: 2
    });
    
    const outerwear = CategoryService.create({
      name: 'Outerwear',
      maxWearCount: 3
    });
    
    // Create subcategories
    CategoryService.create({
      name: 'T-Shirts',
      parentId: tops.id,
      maxWearCount: 1
    });
    
    CategoryService.create({
      name: 'Shirts',
      parentId: tops.id,
      maxWearCount: 1
    });
    
    CategoryService.create({
      name: 'Jeans',
      parentId: bottoms.id,
      maxWearCount: 3
    });
    
    CategoryService.create({
      name: 'Formal Pants',
      parentId: bottoms.id,
      maxWearCount: 2
    });
  }

  static resetApp() {
    StorageService.clear();
    return this.initializeApp();
  }

  static exportData() {
    return {
      categories: CategoryService.getAll(),
      clothes: ClothService.getAll(),
      outfits: OutfitService.getAll(),
      activityLogs: ActivityLogService.getAll(),
      notificationSettings: NotificationService.getSettings(),
      exportDate: new Date().toISOString()
    };
  }

  static importData(data) {
    try {
      if (data.categories) StorageService.set(StorageService.KEYS.CATEGORIES, data.categories);
      if (data.clothes) StorageService.set(StorageService.KEYS.CLOTHES, data.clothes);
      if (data.outfits) StorageService.set(StorageService.KEYS.OUTFITS, data.outfits);
      if (data.activityLogs) StorageService.set(StorageService.KEYS.ACTIVITY_LOGS, data.activityLogs);
      if (data.notificationSettings) StorageService.set(StorageService.KEYS.NOTIFICATION_SETTINGS, data.notificationSettings);
      
      return { success: true, message: 'Data imported successfully!' };
    } catch (error) {
      return { success: false, message: 'Error importing data: ' + error.message };
    }
  }
}

// =======================
// 10. AUDIT LOG SERVICE
// =======================
class AuditLogService {
  static LOG_TYPES = {
    CLOTH: 'cloth',
    CATEGORY: 'category',
    OUTFIT: 'outfit',
    ACTIVITY: 'activity',
    LAUNDRY: 'laundry',
    SYSTEM: 'system'
  };

  static ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    WEAR: 'wear',
    WASH: 'wash',
    PRESS: 'press',
    STATUS_CHANGE: 'status_change'
  };

  static generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static getAll() {
    return StorageService.get('wardrobe_audit_logs') || [];
  }

  static log(logData) {
    const logs = this.getAll();
    const newLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: logData.type,
      action: logData.action,
      entityId: logData.entityId,
      entityName: logData.entityName || '',
      oldValue: logData.oldValue || null,
      newValue: logData.newValue || null,
      details: logData.details || {},
      metadata: logData.metadata || {},
      ...logData
    };
    
    logs.push(newLog);
    
    // Keep only last 1000 logs to prevent storage bloat
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    StorageService.set('wardrobe_audit_logs', logs);
    return newLog;
  }

  static getLogsByType(type) {
    return this.getAll().filter(log => log.type === type);
  }

  static getLogsByEntity(entityId) {
    return this.getAll().filter(log => log.entityId === entityId);
  }

  static getLogsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.getAll().filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  static getRecentLogs(limit = 50) {
    const logs = this.getAll();
    return logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  static searchLogs(searchTerm) {
    const logs = this.getAll();
    const term = searchTerm.toLowerCase();
    
    return logs.filter(log => 
      log.entityName.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.type.toLowerCase().includes(term) ||
      JSON.stringify(log.details).toLowerCase().includes(term)
    );
  }

  static clearOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const logs = this.getAll();
    const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
    
    StorageService.set('wardrobe_audit_logs', filteredLogs);
    return logs.length - filteredLogs.length; // Return number of deleted logs
  }
}

// =======================
// 11. FILTER SERVICE
// =======================
class FilterService {
  static filterClothes(filters = {}) {
    let clothes = ClothService.getAll();
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      clothes = clothes.filter(cloth => filters.status.includes(cloth.status));
    }
    
    // Filter by category
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      clothes = clothes.filter(cloth => {
        if (filters.categoryIds.includes(cloth.categoryId)) return true;
        
        // Check if any parent category matches (for subcategories)
        const category = CategoryService.getById(cloth.categoryId);
        if (category && category.parentId) {
          return filters.categoryIds.includes(category.parentId);
        }
        
        return false;
      });
    }
    
    // Filter by color
    if (filters.colors && filters.colors.length > 0) {
      clothes = clothes.filter(cloth => filters.colors.includes(cloth.color));
    }
    
    // Filter by brand
    if (filters.brands && filters.brands.length > 0) {
      clothes = clothes.filter(cloth => filters.brands.includes(cloth.brand));
    }
    
    // Filter by material
    if (filters.materials && filters.materials.length > 0) {
      clothes = clothes.filter(cloth => filters.materials.includes(cloth.material));
    }
    
    // Filter by season
    if (filters.seasons && filters.seasons.length > 0) {
      clothes = clothes.filter(cloth => filters.seasons.includes(cloth.season));
    }
    
    // Filter by wear count range
    if (filters.wearCountMin !== undefined) {
      clothes = clothes.filter(cloth => cloth.currentWearCount >= filters.wearCountMin);
    }
    if (filters.wearCountMax !== undefined) {
      clothes = clothes.filter(cloth => cloth.currentWearCount <= filters.wearCountMax);
    }
    
    // Filter by cost range
    if (filters.costMin !== undefined) {
      clothes = clothes.filter(cloth => cloth.cost >= filters.costMin);
    }
    if (filters.costMax !== undefined) {
      clothes = clothes.filter(cloth => cloth.cost <= filters.costMax);
    }
    
    // Filter by purchase date range
    if (filters.purchaseDateFrom) {
      clothes = clothes.filter(cloth => 
        cloth.purchaseDate && cloth.purchaseDate >= filters.purchaseDateFrom
      );
    }
    if (filters.purchaseDateTo) {
      clothes = clothes.filter(cloth => 
        cloth.purchaseDate && cloth.purchaseDate <= filters.purchaseDateTo
      );
    }
    
    // Filter by pressing requirement
    if (filters.requiresPressing !== undefined) {
      clothes = clothes.filter(cloth => cloth.requiresPressing === filters.requiresPressing);
    }
    
    // Search by name/description
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      clothes = clothes.filter(cloth => 
        cloth.name.toLowerCase().includes(term) ||
        (cloth.description && cloth.description.toLowerCase().includes(term))
      );
    }
    
    // Sort results
    if (filters.sortBy) {
      clothes = this.sortClothes(clothes, filters.sortBy, filters.sortOrder);
    }
    
    return clothes;
  }

  static sortClothes(clothes, sortBy, sortOrder = 'asc') {
    const direction = sortOrder === 'desc' ? -1 : 1;
    
    return clothes.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'wearCount':
          valueA = a.currentWearCount;
          valueB = b.currentWearCount;
          break;
        case 'cost':
          valueA = a.cost || 0;
          valueB = b.cost || 0;
          break;
        case 'purchaseDate':
          valueA = new Date(a.purchaseDate || 0);
          valueB = new Date(b.purchaseDate || 0);
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  }

  // Quick filter methods for common use cases
  static getCleanClothes() {
    return this.filterClothes({ status: [ClothService.STATUSES.CLEAN] });
  }

  static getDirtyClothes() {
    return this.filterClothes({ status: [ClothService.STATUSES.DIRTY] });
  }

  static getNeedsPressing() {
    return this.filterClothes({ status: [ClothService.STATUSES.NEEDS_PRESSING] });
  }

  static getClothesByCategory(categoryId, includeSubcategories = true) {
    if (!includeSubcategories) {
      return this.filterClothes({ categoryIds: [categoryId] });
    }
    
    // Get all subcategories
    const allCategories = CategoryService.getAll();
    const categoryIds = [categoryId];
    
    function addSubcategories(parentId) {
      const subcategories = allCategories.filter(cat => cat.parentId === parentId);
      subcategories.forEach(subcat => {
        categoryIds.push(subcat.id);
        addSubcategories(subcat.id); // Recursive for deeper nesting
      });
    }
    
    addSubcategories(categoryId);
    return this.filterClothes({ categoryIds });
  }

  static getAvailableFilters() {
    const clothes = ClothService.getAll();
    
    return {
      colors: [...new Set(clothes.map(c => c.color).filter(Boolean))],
      brands: [...new Set(clothes.map(c => c.brand).filter(Boolean))],
      materials: [...new Set(clothes.map(c => c.material).filter(Boolean))],
      seasons: [...new Set(clothes.map(c => c.season).filter(Boolean))],
      categories: CategoryService.getAll(),
      wearCountRange: {
        min: Math.min(...clothes.map(c => c.currentWearCount)),
        max: Math.max(...clothes.map(c => c.currentWearCount))
      },
      costRange: {
        min: Math.min(...clothes.map(c => c.cost || 0)),
        max: Math.max(...clothes.map(c => c.cost || 0))
      }
    };
  }
}

// =======================
// 12. SEARCH SERVICE
// =======================
class SearchService {
  static searchAll(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    const clothes = ClothService.getAll().filter(cloth =>
      cloth.name.toLowerCase().includes(term) ||
      (cloth.description && cloth.description.toLowerCase().includes(term)) ||
      (cloth.brand && cloth.brand.toLowerCase().includes(term)) ||
      (cloth.color && cloth.color.toLowerCase().includes(term))
    );
    
    const outfits = OutfitService.getAll().filter(outfit =>
      outfit.name.toLowerCase().includes(term) ||
      (outfit.description && outfit.description.toLowerCase().includes(term))
    );
    
    const categories = CategoryService.getAll().filter(category =>
      category.name.toLowerCase().includes(term)
    );
    
    return {
      clothes,
      outfits,
      categories,
      totalResults: clothes.length + outfits.length + categories.length
    };
  }

  static searchClothes(searchTerm, additionalFilters = {}) {
    const filters = {
      ...additionalFilters,
      searchTerm
    };
    return FilterService.filterClothes(filters);
  }
}

// =======================
// UPDATED SERVICES WITH LOGGING
// =======================

// Update CategoryService to include logging
const OriginalCategoryService = { ...CategoryService };
CategoryService.create = function(categoryData) {
  const category = OriginalCategoryService.create.call(this, categoryData);
  
  AuditLogService.log({
    type: AuditLogService.LOG_TYPES.CATEGORY,
    action: AuditLogService.ACTIONS.CREATE,
    entityId: category.id,
    entityName: category.name,
    newValue: category,
    details: { categoryData }
  });
  
  return category;
};

CategoryService.update = function(id, updateData) {
  const oldCategory = this.getById(id);
  const category = OriginalCategoryService.update.call(this, id, updateData);
  
  if (category) {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.CATEGORY,
      action: AuditLogService.ACTIONS.UPDATE,
      entityId: category.id,
      entityName: category.name,
      oldValue: oldCategory,
      newValue: category,
      details: { updateData }
    });
  }
  
  return category;
};

CategoryService.delete = function(id) {
  const category = this.getById(id);
  const result = OriginalCategoryService.delete.call(this, id);
  
  if (result && category) {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.CATEGORY,
      action: AuditLogService.ACTIONS.DELETE,
      entityId: category.id,
      entityName: category.name,
      oldValue: category
    });
  }
  
  return result;
};

// Update ClothService to include logging
const OriginalClothService = { ...ClothService };
ClothService.create = function(clothData) {
  const cloth = OriginalClothService.create.call(this, clothData);
  
  AuditLogService.log({
    type: AuditLogService.LOG_TYPES.CLOTH,
    action: AuditLogService.ACTIONS.CREATE,
    entityId: cloth.id,
    entityName: cloth.name,
    newValue: cloth,
    details: { clothData }
  });
  
  return cloth;
};

ClothService.update = function(id, updateData) {
  const oldCloth = this.getById(id);
  const cloth = OriginalClothService.update.call(this, id, updateData);
  
  if (cloth) {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.CLOTH,
      action: AuditLogService.ACTIONS.UPDATE,
      entityId: cloth.id,
      entityName: cloth.name,
      oldValue: oldCloth,
      newValue: cloth,
      details: { updateData }
    });
  }
  
  return cloth;
};

ClothService.delete = function(id) {
  const cloth = this.getById(id);
  const result = OriginalClothService.delete.call(this, id);
  
  if (result && cloth) {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.CLOTH,
      action: AuditLogService.ACTIONS.DELETE,
      entityId: cloth.id,
      entityName: cloth.name,
      oldValue: cloth
    });
  }
  
  return result;
};

ClothService.incrementWearCount = function(clothId) {
  const oldCloth = this.getById(clothId);
  const cloth = OriginalClothService.incrementWearCount.call(this, clothId);
  
  if (cloth) {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.CLOTH,
      action: AuditLogService.ACTIONS.WEAR,
      entityId: cloth.id,
      entityName: cloth.name,
      oldValue: { wearCount: oldCloth.currentWearCount, status: oldCloth.status },
      newValue: { wearCount: cloth.currentWearCount, status: cloth.status },
      details: { 
        wearCountIncrement: 1,
        statusChanged: oldCloth.status !== cloth.status 
      }
    });
    
    // Log status change separately if it occurred
    if (oldCloth.status !== cloth.status) {
      AuditLogService.log({
        type: AuditLogService.LOG_TYPES.CLOTH,
        action: AuditLogService.ACTIONS.STATUS_CHANGE,
        entityId: cloth.id,
        entityName: cloth.name,
        oldValue: oldCloth.status,
        newValue: cloth.status,
        details: { 
          reason: 'wear_count_exceeded',
          maxWearCount: CategoryService.getMaxWearCount(cloth.categoryId)
        }
      });
    }
  }
  
  return cloth;
};

// Update OutfitService to include logging
const OriginalOutfitService = { ...OutfitService };
OutfitService.create = function(outfitData) {
  const outfit = OriginalOutfitService.create.call(this, outfitData);
  
  AuditLogService.log({
    type: AuditLogService.LOG_TYPES.OUTFIT,
    action: AuditLogService.ACTIONS.CREATE,
    entityId: outfit.id,
    entityName: outfit.name,
    newValue: outfit,
    details: { 
      outfitData,
      clothCount: outfit.clothIds.length 
    }
  });
  
  return outfit;
};

OutfitService.update = function(id, updateData) {
  const oldOutfit = this.getById(id);
  const outfit = OriginalOutfitService.update.call(this, id, updateData);
  
  if (outfit) {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.OUTFIT,
      action: AuditLogService.ACTIONS.UPDATE,
      entityId: outfit.id,
      entityName: outfit.name,
      oldValue: oldOutfit,
      newValue: outfit,
      details: { updateData }
    });
  }
  
  return outfit;
};

OutfitService.delete = function(id) {
  const outfit = this.getById(id);
  const result = OriginalOutfitService.delete.call(this, id);
  
  if (result && outfit) {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.OUTFIT,
      action: AuditLogService.ACTIONS.DELETE,
      entityId: outfit.id,
      entityName: outfit.name,
      oldValue: outfit
    });
  }
  
  return result;
};

// Update LaundryService to include logging
const OriginalLaundryService = { ...LaundryService };
LaundryService.washSelectedClothes = function(clothIds) {
  const result = OriginalLaundryService.washSelectedClothes.call(this, clothIds);
  
  // Log washing activity
  AuditLogService.log({
    type: AuditLogService.LOG_TYPES.LAUNDRY,
    action: AuditLogService.ACTIONS.WASH,
    entityId: 'batch_' + Date.now(),
    entityName: `Batch wash (${result.totalWashed} items)`,
    details: {
      clothIds,
      totalWashed: result.totalWashed,
      needsPressing: result.needsPressing,
      clothesWashed: result.washedClothes.map(c => ({ id: c.id, name: c.name }))
    }
  });
  
  // Log individual cloth status changes
  result.washedClothes.forEach(cloth => {
    AuditLogService.log({
      type: AuditLogService.LOG_TYPES.CLOTH,
      action: AuditLogService.ACTIONS.STATUS_CHANGE,
      entityId: cloth.id,
      entityName: cloth.name,
      oldValue: ClothService.STATUSES.DIRTY,
      newValue: cloth.status,
      details: { 
        reason: 'washed',
        wearCountReset: true,
        requiresPressing: cloth.requiresPressing
      }
    });
  });
  
  return result;
};

LaundryService.pressSelectedClothes = function(clothIds) {
  const result = OriginalLaundryService.pressSelectedClothes.call(this, clothIds);
  
  // Log pressing activity
  AuditLogService.log({
    type: AuditLogService.LOG_TYPES.LAUNDRY,
    action: AuditLogService.ACTIONS.PRESS,
    entityId: 'press_batch_' + Date.now(),
    entityName: `Batch press (${result.totalPressed} items)`,
    details: {
      clothIds,
      totalPressed: result.totalPressed
    }
  });
  
  // Log individual cloth status changes
  clothIds.forEach(clothId => {
    const cloth = ClothService.getById(clothId);
    if (cloth) {
      AuditLogService.log({
        type: AuditLogService.LOG_TYPES.CLOTH,
        action: AuditLogService.ACTIONS.STATUS_CHANGE,
        entityId: cloth.id,
        entityName: cloth.name,
        oldValue: ClothService.STATUSES.NEEDS_PRESSING,
        newValue: ClothService.STATUSES.CLEAN,
        details: { reason: 'pressed' }
      });
    }
  });
  
  return result;
};

// =======================
// 13. WARDROBE QUERY SERVICE
// =======================
class WardrobeQueryService {
  // Get clothes by status with optional additional filters
  static getCleanClothes(additionalFilters = {}) {
    return FilterService.filterClothes({
      status: [ClothService.STATUSES.CLEAN],
      ...additionalFilters
    });
  }

  static getDirtyClothes(additionalFilters = {}) {
    return FilterService.filterClothes({
      status: [ClothService.STATUSES.DIRTY],
      ...additionalFilters
    });
  }

  static getNeedsPressing(additionalFilters = {}) {
    return FilterService.filterClothes({
      status: [ClothService.STATUSES.NEEDS_PRESSING],
      ...additionalFilters
    });
  }

  // Get clothes by category with status filtering
  static getClothesByCategory(categoryId, statusFilter = null) {
    const filters = { categoryIds: [categoryId] };
    if (statusFilter) {
      filters.status = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
    }
    return FilterService.filterClothes(filters);
  }

  // Get clean clothes by category (ready to wear)
  static getAvailableClothesInCategory(categoryId) {
    return this.getClothesByCategory(categoryId, ClothService.STATUSES.CLEAN);
  }

  // Get clothes nearing dirty status
  static getClothesNearingDirty(threshold = 0.8) {
    const clothes = ClothService.getAll();
    return clothes.filter(cloth => {
      if (cloth.status !== ClothService.STATUSES.CLEAN) return false;
      
      const maxWearCount = CategoryService.getMaxWearCount(cloth.categoryId);
      const wearPercentage = cloth.currentWearCount / maxWearCount;
      return wearPercentage >= threshold;
    });
  }

  // Get clothes by multiple statuses
  static getClothesByStatuses(statuses) {
    return FilterService.filterClothes({ status: statuses });
  }

  // Get recently added clothes
  static getRecentlyAddedClothes(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const clothes = ClothService.getAll();
    return clothes.filter(cloth => new Date(cloth.createdAt) > cutoffDate);
  }

  // Get clothes by wear frequency
  static getFrequentlyWornClothes(minWearCount = 5) {
    const clothes = ClothService.getAll();
    return clothes.filter(cloth => cloth.currentWearCount >= minWearCount);
  }

  static getRarelyWornClothes(maxWearCount = 1) {
    const clothes = ClothService.getAll();
    return clothes.filter(cloth => cloth.currentWearCount <= maxWearCount);
  }

  // Get expensive clothes
  static getExpensiveClothes(minCost = 1000) {
    const clothes = ClothService.getAll();
    return clothes.filter(cloth => cloth.cost && cloth.cost >= minCost);
  }

  // Get clothes by season
  static getClothesBySeason(season) {
    return FilterService.filterClothes({ seasons: [season] });
  }

  // Get wardrobe overview
  static getWardrobeOverview() {
    const clothes = ClothService.getAll();
    const categories = CategoryService.getAll();
    
    const overview = {
      totalItems: clothes.length,
      byStatus: {
        clean: clothes.filter(c => c.status === ClothService.STATUSES.CLEAN).length,
        dirty: clothes.filter(c => c.status === ClothService.STATUSES.DIRTY).length,
        needsPressing: clothes.filter(c => c.status === ClothService.STATUSES.NEEDS_PRESSING).length
      },
      byCategory: {},
      totalValue: clothes.reduce((sum, cloth) => sum + (cloth.cost || 0), 0),
      averageWearCount: clothes.length > 0 
        ? clothes.reduce((sum, cloth) => sum + cloth.currentWearCount, 0) / clothes.length 
        : 0
    };
    
    // Calculate category breakdown
    categories.forEach(category => {
      const categoryClothes = FilterService.getClothesByCategory(category.id);
      overview.byCategory[category.name] = {
        total: categoryClothes.length,
        clean: categoryClothes.filter(c => c.status === ClothService.STATUSES.CLEAN).length,
        dirty: categoryClothes.filter(c => c.status === ClothService.STATUSES.DIRTY).length,
        needsPressing: categoryClothes.filter(c => c.status === ClothService.STATUSES.NEEDS_PRESSING).length
      };
    });
    
    return overview;
  }
}

// =======================
// 14. ADVANCED ANALYTICS SERVICE
// =======================
class AdvancedAnalyticsService {
  static getWearPatterns(days = 30) {
    const activities = ActivityLogService.getAll();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentActivities = activities.filter(activity => 
      new Date(activity.date) >= cutoffDate
    );
    
    // Analyze daily wear patterns
    const dailyWears = {};
    recentActivities.forEach(activity => {
      if (!dailyWears[activity.date]) {
        dailyWears[activity.date] = 0;
      }
      
      const clothCount = activity.type === 'outfit'
        ? OutfitService.getClothesInOutfit(activity.outfitId).length
        : activity.clothIds.length;
      
      dailyWears[activity.date] += clothCount;
    });
    
    return {
      dailyWears,
      averageItemsPerDay: Object.values(dailyWears).reduce((a, b) => a + b, 0) / Object.keys(dailyWears).length,
      totalActivities: recentActivities.length,
      activeDays: Object.keys(dailyWears).length
    };
  }

  static getClothUtilization() {
    const clothes = ClothService.getAll();
    const totalWears = clothes.reduce((sum, cloth) => sum + cloth.currentWearCount, 0);
    
    return clothes.map(cloth => ({
      ...cloth,
      utilizationPercentage: totalWears > 0 ? (cloth.currentWearCount / totalWears) * 100 : 0,
      wearRatio: cloth.currentWearCount / CategoryService.getMaxWearCount(cloth.categoryId)
    }));
  }

  static getLaundryFrequency(days = 90) {
    const logs = AuditLogService.getAll();
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
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyWashes[weekKey]) {
        weeklyWashes[weekKey] = 0;
      }
      weeklyWashes[weekKey] += log.details.totalWashed || 0;
    });
    
    return {
      weeklyWashes,
      averagePerWeek: Object.values(weeklyWashes).reduce((a, b) => a + b, 0) / Object.keys(weeklyWashes).length,
      totalWashSessions: washLogs.length
    };
  }
}

// =======================
// EXPORT ALL SERVICES
// =======================
export {
  StorageService,
  CategoryService,
  ClothService,
  OutfitService,
  ActivityLogService,
  NotificationService,
  AnalyticsService,
  LaundryService,
  InitializationService,
  AuditLogService,
  FilterService,
  SearchService,
  WardrobeQueryService,
  AdvancedAnalyticsService
};