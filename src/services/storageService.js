/**
 * @fileoverview Manages all interactions with the browser's localStorage.
 * All functions are asynchronous to allow for easy swapping with other
 * asynchronous storage solutions (e.g., IndexedDB, server API) in the future.
 */

/**
 * A central object for all storage keys to prevent typos and ensure consistency.
 */
export const KEYS = {
  CATEGORIES: 'wardrobe_categories',
  CLOTHES: 'wardrobe_clothes',
  OUTFITS: 'wardrobe_outfits',
  ACTIVITY_LOGS: 'wardrobe_activity_logs',
  NOTIFICATION_SETTINGS: 'wardrobe_notifications',
  AUDIT_LOGS: 'wardrobe_audit_logs'
};

/**
 * Retrieves an item from localStorage.
 * @param {string} key The key of the item to retrieve.
 * @returns {Promise<any|null>} A promise that resolves with the parsed data or null if not found.
 */
export async function get(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading "${key}" from localStorage:`, error);
    return null;
  }
}

/**
 * Saves an item to localStorage.
 * @param {string} key The key to save the item under.
 * @param {any} value The value to save (will be stringified).
 * @returns {Promise<boolean>} A promise that resolves with true on success, false on failure.
 */
export async function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing "${key}" to localStorage:`, error);
    return false;
  }
}

/**
 * Removes an item from localStorage.
 * @param {string} key The key of the item to remove.
 * @returns {Promise<boolean>} A promise that resolves with true on success, false on failure.
 */
export async function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing "${key}" from localStorage:`, error);
    return false;
  }
}

/**
 * Clears all known application data from localStorage.
 * @returns {Promise<boolean>} A promise that resolves with true on success, false on failure.
 */
export async function clear() {
  try {
    Object.values(KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}
