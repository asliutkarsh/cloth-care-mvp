// =======================
// 1. STORAGE SERVICE
// =======================
class StorageService {
  static KEYS = {
    CATEGORIES: 'wardrobe_categories',
    CLOTHES: 'wardrobe_clothes',
    OUTFITS: 'wardrobe_outfits',
    ACTIVITY_LOGS: 'wardrobe_activity_logs',
    NOTIFICATION_SETTINGS: 'wardrobe_notifications',
    AUDIT_LOGS: 'wardrobe_audit_logs'
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
    
    if (category.maxWearCount !== undefined && category.maxWearCount !== null) {
      return category.maxWearCount;
    }
    
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
        
        if (updatedCloth) {
            results.push(updatedCloth);
            if (updatedCloth.status === this.STATUSES.NEEDS_PRESSING) {
                clothesNeedingPress.push(updatedCloth);
            }
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
        if (updatedCloth) {
            results.push(updatedCloth);
        }
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
      clothesWashed: result.washedClothes,
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
      pressedClothes: pressedClothes,
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
      maxWearCount: 5
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
      auditLogs: AuditLogService.getAll(),
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
      if (data.auditLogs) StorageService.set(StorageService.KEYS.AUDIT_LOGS, data.auditLogs);
      
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
    return StorageService.get(StorageService.KEYS.AUDIT_LOGS) || [];
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
    
    StorageService.set(StorageService.KEYS.AUDIT_LOGS, logs);
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
    
    StorageService.set(StorageService.KEYS.AUDIT_LOGS, filteredLogs);
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
        let currentCategory = CategoryService.getById(cloth.categoryId);
        while (currentCategory) {
          if (filters.categoryIds.includes(currentCategory.id)) {
            return true;
          }
          currentCategory = currentCategory.parentId ? CategoryService.getById(currentCategory.parentId) : null;
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
        cloth.purchaseDate && new Date(cloth.purchaseDate) >= new Date(filters.purchaseDateFrom)
      );
    }
    if (filters.purchaseDateTo) {
      clothes = clothes.filter(cloth => 
        cloth.purchaseDate && new Date(cloth.purchaseDate) <= new Date(filters.purchaseDateTo)
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
    
    return [...clothes].sort((a, b) => {
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
      colors: [...new Set(clothes.map(c => c.color).filter(Boolean))].sort(),
      brands: [...new Set(clothes.map(c => c.brand).filter(Boolean))].sort(),
      materials: [...new Set(clothes.map(c => c.material).filter(Boolean))].sort(),
      seasons: [...new Set(clothes.map(c => c.season).filter(Boolean))].sort(),
      categories: CategoryService.getAll(),
      wearCountRange: {
        min: clothes.length > 0 ? Math.min(...clothes.map(c => c.currentWearCount)) : 0,
        max: clothes.length > 0 ? Math.max(...clothes.map(c => c.currentWearCount)) : 0
      },
      costRange: {
        min: clothes.length > 0 ? Math.min(...clothes.map(c => c.cost || 0)) : 0,
        max: clothes.length > 0 ? Math.max(...clothes.map(c => c.cost || 0)) : 0
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
  static getClothesByCategory(categoryId, statusFilter = null, includeSubcategories = true) {
    const filters = { };
    if (includeSubcategories) {
        const allCategories = CategoryService.getAll();
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
    return FilterService.filterClothes(filters);
  }

  // Get clean clothes by category (ready to wear)
  static getAvailableClothesInCategory(categoryId) {
    return this.getClothesByCategory(categoryId, ClothService.STATUSES.CLEAN, true);
  }

  // Get clothes nearing dirty status
  static getClothesNearingDirty(threshold = 0.8) {
    const clothes = ClothService.getAll();
    return clothes.filter(cloth => {
      if (cloth.status !== ClothService.STATUSES.CLEAN) return false;
      
      const maxWearCount = CategoryService.getMaxWearCount(cloth.categoryId);
      if (maxWearCount <= 0) return false;
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
    return FilterService.filterClothes({ wearCountMin: minWearCount });
  }

  static getRarelyWornClothes(maxWearCount = 1) {
    return FilterService.filterClothes({ wearCountMax: maxWearCount });
  }

  // Get expensive clothes
  static getExpensiveClothes(minCost = 100) {
    return FilterService.filterClothes({ costMin: minCost });
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
        clean: this.getCleanClothes().length,
        dirty: this.getDirtyClothes().length,
        needsPressing: this.getNeedsPressing().length
      },
      byCategory: {},
      totalValue: clothes.reduce((sum, cloth) => sum + (cloth.cost || 0), 0),
      averageWearCount: clothes.length > 0 
        ? clothes.reduce((sum, cloth) => sum + cloth.currentWearCount, 0) / clothes.length 
        : 0
    };
    
    // Calculate category breakdown using the hierarchy
    const categoryTree = CategoryService.getHierarchy();
    
    const processCategory = (category) => {
        const clothesInCategory = this.getClothesByCategory(category.id, null, true);
        overview.byCategory[category.name] = {
            id: category.id,
            total: clothesInCategory.length,
            clean: clothesInCategory.filter(c => c.status === ClothService.STATUSES.CLEAN).length,
            dirty: clothesInCategory.filter(c => c.status === ClothService.STATUSES.DIRTY).length,
            needsPressing: clothesInCategory.filter(c => c.status === ClothService.STATUSES.NEEDS_PRESSING).length,
            children: {}
        };
        if(category.children && category.children.length > 0) {
            category.children.forEach(child => {
                overview.byCategory[category.name].children[child.name] = processCategory(child)
            })
        }
        return overview.byCategory[category.name]
    }
    
    categoryTree.forEach(rootCategory => {
        processCategory(rootCategory);
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
      const dateKey = activity.date;
      if (!dailyWears[dateKey]) {
        dailyWears[dateKey] = 0;
      }
      
      const clothCount = activity.type === 'outfit'
        ? OutfitService.getClothesInOutfit(activity.outfitId).length
        : activity.clothIds.length;
      
      dailyWears[dateKey] += clothCount;
    });
    
    const totalWears = Object.values(dailyWears).reduce((a, b) => a + b, 0);
    const activeDays = Object.keys(dailyWears).length;

    return {
      dailyWears,
      averageItemsPerDay: activeDays > 0 ? totalWears / activeDays : 0,
      totalActivities: recentActivities.length,
      activeDays: activeDays
    };
  }

  static getCostPerWear() {
    const clothes = ClothService.getAll();
    return clothes
        .filter(cloth => cloth.cost > 0)
        .map(cloth => ({
            ...cloth,
            costPerWear: cloth.currentWearCount > 0 ? cloth.cost / cloth.currentWearCount : cloth.cost
        }))
        .sort((a,b) => a.costPerWear - b.costPerWear);
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

  static getNumberOfClothesByCategory(categoryId, subcategories) {
    const allClothes = ClothService.getAll();
    const categoryIds = [categoryId, ...subcategories.map(sub => sub.id)];
  
    return allClothes.filter(cloth => categoryIds.includes(cloth.categoryId)).length;
  }  

  static moveClothesToCategory(categoryIds, newCategoryId) {
    if (categoryIds.includes(newCategoryId)) {
      throw new Error("Cannot reassign clothes to the same category being deleted.");
    }
  
    const clothes = ClothService.getAll();
    const clothesToMove = clothes.filter(cloth => categoryIds.includes(cloth.categoryId));
  
    clothesToMove.forEach(cloth => {
      cloth.categoryId = newCategoryId;
      console.log("Cloth updated:", cloth);
      ClothService.update(cloth.id, cloth);
    });
  
    return true;
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