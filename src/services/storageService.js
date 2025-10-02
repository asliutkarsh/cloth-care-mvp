// src/services/storageService.js
import Dexie from 'dexie';

// --- 1. Database Definition ---
const db = new Dexie('ClothCareDB');

// --- Centralized Keys for Table Names ---
export const KEYS = {
  CATEGORIES: 'categories',
  CLOTHES: 'clothes',
  OUTFITS: 'outfits',
  TRIPS: 'trips',
  ACTIVITY_LOGS: 'activity_logs',
  PREFERENCES: 'preferences',
  USER: 'user',
};

// --- 2. Database Schema ---
// All tables use 'id' as the primary key. For preferences and user, 'id' will be a constant.
db.version(1).stores({
  [KEYS.CATEGORIES]: 'id',
  [KEYS.CLOTHES]: 'id',
  [KEYS.OUTFITS]: 'id',
  [KEYS.TRIPS]: 'id',
  [KEYS.ACTIVITY_LOGS]: 'id',
  [KEYS.PREFERENCES]: 'id',
  [KEYS.USER]: 'id',
});

// --- 3. Data Migration from localStorage ---
const migrateFromLocalStorage = async () => {
  const migrationFlag = 'wardrobe_migration_v1_complete';
  if (localStorage.getItem(migrationFlag)) {
    return; // Migration already done
  }

  // Check if there's already data in the database (indicates partial migration or new install)
  try {
    const existingUser = await db.user.get('user');
    if (existingUser) {
      localStorage.setItem(migrationFlag, 'true');
      return;
    }

    const existingCategories = await db.categories.count();
    const existingClothes = await db.clothes.count();
    if (existingCategories > 0 || existingClothes > 0) {
      localStorage.setItem(migrationFlag, 'true');
      return;
    }
  } catch (error) {
  }

  const oldPrefix = 'wardrobe_';
  const keysToMigrate = Object.values(KEYS);

  for (const key of keysToMigrate) {
    // Skip user table as it should be handled by login process
    if (key === KEYS.USER) {
      continue;
    }

    const oldDataRaw = localStorage.getItem(`${oldPrefix}${key}`);
    if (oldDataRaw) {
      try {
        const oldData = JSON.parse(oldDataRaw);
        if (Array.isArray(oldData) && oldData.length > 0) {
          await db[key].bulkPut(oldData);
        } else if (oldData && typeof oldData === 'object' && !Array.isArray(oldData)) {
          // Handle single-object keys like 'preferences'
          const singleObjectId = key; // e.g., 'preferences'
          await db[key].put({ id: singleObjectId, ...oldData });
        }
        // Remove old key after successful migration
        localStorage.removeItem(`${oldPrefix}${key}`);
      } catch (error) {
        console.error(`Failed to migrate key: ${key}`, error);
      }
    }
  }

  localStorage.setItem(migrationFlag, 'true');
};

// Run migration on script load
migrateFromLocalStorage();


// --- 4. New Service Methods ---
export const StorageService = {
  KEYS,

  async getAll(tableName) {
    return db[tableName].toArray();
  },

  async getById(tableName, id) {
    return db[tableName].get(id);
  },

  async add(tableName, item) {
    await db[tableName].add(item);
    return item;
  },

  async put(tableName, item) {
    await db[tableName].put(item);
    return item;
  },

  async update(tableName, id, updates) {
    await db[tableName].update(id, updates);
    return this.getById(tableName, id);
  },
  
  async bulkUpdate(tableName, items) {
    await db[tableName].bulkPut(items);
    return items;
  },

  async remove(tableName, id) {
    return db[tableName].delete(id);
  },
  
  async bulkRemove(tableName, ids) {
    return db[tableName].bulkDelete(ids);
  },

  async clear(tableName) {
    return db[tableName].clear();
  },
};