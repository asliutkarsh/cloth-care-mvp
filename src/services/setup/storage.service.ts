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
  AUDIT_LOGS: 'audit_logs',
} as const;

// --- 2. Database Schema ---
db.version(1).stores({
  [KEYS.CATEGORIES]: 'id',
  [KEYS.CLOTHES]: 'id',
  [KEYS.OUTFITS]: 'id',
  [KEYS.TRIPS]: 'id',
  [KEYS.ACTIVITY_LOGS]: 'id',
  [KEYS.PREFERENCES]: 'id',
  [KEYS.USER]: 'id',
  [KEYS.AUDIT_LOGS]: 'id',
});

// --- 3. Data Migration from localStorage ---
const migrateFromLocalStorage = async (): Promise<void> => {
  const migrationFlag = 'wardrobe_migration_v1_complete';
  if (localStorage.getItem(migrationFlag)) {
    return; // Migration already done
  }

  // Check if there's already data in the database (indicates partial migration or new install)
  try {
    const existingUser = await (db as any)[KEYS.USER].get('user');
    if (existingUser) {
      localStorage.setItem(migrationFlag, 'true');
      return;
    }

    const existingCategories = await (db as any)[KEYS.CATEGORIES].count();
    const existingClothes = await (db as any)[KEYS.CLOTHES].count();
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
          await (db as any)[key].bulkPut(oldData);
        } else if (oldData && typeof oldData === 'object' && !Array.isArray(oldData)) {
          // Handle single-object keys like 'preferences'
          const singleObjectId = key; // e.g., 'preferences'
          await (db as any)[key].put({ id: singleObjectId, ...oldData });
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

  async getAll<T>(tableName: string): Promise<T[]> {
    return (db as any)[tableName].toArray();
  },

  async getById<T>(tableName: string, id: string): Promise<T | undefined> {
    return (db as any)[tableName].get(id);
  },

  async add<T>(tableName: string, item: T): Promise<T> {
    await (db as any)[tableName].add(item);
    return item;
  },

  async put<T>(tableName: string, item: T): Promise<T> {
    await (db as any)[tableName].put(item);
    return item;
  },

  async update<T>(tableName: string, id: string, updates: Partial<T>): Promise<T | undefined> {
    try {
      await (db as any)[tableName].update(id, updates);
      const updated: T | undefined = await this.getById<T>(tableName, id);
      return updated;
    } catch (error) {
      // If update fails (item doesn't exist), return undefined
      return undefined;
    }
  },

  async bulkUpdate<T>(tableName: string, items: T[]): Promise<T[]> {
    await (db as any)[tableName].bulkPut(items);
    return items;
  },

  async remove(tableName: string, id: string): Promise<void> {
    return (db as any)[tableName].delete(id);
  },

  async bulkRemove(tableName: string, ids: string[]): Promise<void> {
    return (db as any)[tableName].bulkDelete(ids);
  },

  async clear(tableName: string): Promise<void> {
    return (db as any)[tableName].clear();
  },

  async clearAll(): Promise<void> {
    await Promise.all(Object.values(KEYS).map((table) => (db as any)[table].clear()));
  },
};
