// services/auditLogService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from "./storageService.js";

const KEY = StorageService.KEYS.AUDIT_LOGS;

export const AuditLogService = {
  LOG_TYPES: {
    CLOTH: 'cloth',
    OUTFIT: 'outfit',
    WEAR: 'wear',
    LAUNDRY: 'laundry',
  },
  ACTIONS: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    WASH: 'wash', // From Laundry
    PRESS: 'press', // From Laundry
  },

  async getAll() {
    return StorageService.getAll(KEY);
  },

  /**
   * Logs a new audit entry. Renamed from 'add' for clarity.
   * @param {object} logData - The data for the new log entry.
   * @returns {object} The newly created log entry.
   */
  async log(logData) {
    const logs = await this.getAll();
    const newEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(), // Use ISO string for better sorting
      details: {},
      ...logData,
    };

    // Add the new entry and maintain only the latest 50 entries
    const updatedLogs = [newEntry, ...logs].slice(0, 50);

    await StorageService.bulkUpdate(KEY, updatedLogs);
    return newEntry;
  },

  async clear() {
    await StorageService.clear(KEY);
    return true;
  },

  async getRecentLogs(limit = 50) {
    const logs = await this.getAll();
    return logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },
};