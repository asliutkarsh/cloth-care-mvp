// services/storageService.js
const PREFIX = "wardrobe_";

export const StorageService = {
  KEYS: {
    CATEGORIES: `${PREFIX}categories`,
    CLOTHES: `${PREFIX}clothes`,
    OUTFITS: `${PREFIX}outfits`,
    ACTIVITY_LOGS: `${PREFIX}activity_logs`,
    NOTIFICATION_SETTINGS: `${PREFIX}notifications`,
    AUDIT_LOGS: `${PREFIX}audit_logs`,
    USER: `${PREFIX}user`,
    PREFERENCES: `${PREFIX}preferences`,
    BACKUP: `${PREFIX}backup`,
    ANALYTICS: `${PREFIX}analytics`,
    RECOMMENDATIONS: `${PREFIX}recommendations`,
    SYNC: `${PREFIX}sync`,
    REPORTS: `${PREFIX}reports`,
  },

  async get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[StorageService] Error reading ${key}:`, error);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageService] Error writing ${key}:`, error);
      return false;
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error removing ${key}:`, error);
      return false;
    }
  },

  async clear() {
    try {
      for (const key of Object.values(this.KEYS)) {
        await this.remove(key);
      }
      return true;
    } catch (error) {
      console.error("[StorageService] Error clearing all keys:", error);
      return false;
    }
  },

  async clearAllExceptUser() {
    try {
      for (const key of Object.values(this.KEYS)) {
        if (key !== this.KEYS.USER) {
          await this.remove(key);
        }
      }
      return true;
    } catch (error) {
      console.error("[StorageService] Error clearing all keys except USER:", error);
      return false;
    }
  },
};