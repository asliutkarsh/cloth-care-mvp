import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../setup/storage.service';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: string;
  action: string;
  entityId: string;
  entityType: string;
  details?: Record<string, unknown>;
}

export const AuditLogService = {
  LOG_TYPES: {
    CLOTH: 'cloth',
    OUTFIT: 'outfit',
    WEAR: 'wear',
    LAUNDRY: 'laundry',
  } as const,

  ACTIONS: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    WASH: 'wash',
    PRESS: 'press',
  } as const,

  async getAll(): Promise<AuditLogEntry[]> {
    return StorageService.getAll(StorageService.KEYS.AUDIT_LOGS);
  },

  /**
   * Logs a new audit entry.
   */
  async log(logData: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const logs = await this.getAll();
    const newEntry: AuditLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...logData,
    };

    // Add the new entry and maintain only the latest 50 entries
    const updatedLogs = [newEntry, ...logs].slice(0, 50);

    await StorageService.bulkUpdate(StorageService.KEYS.AUDIT_LOGS, updatedLogs);
    return newEntry;
  },

  async clear(): Promise<boolean> {
    await StorageService.clear(StorageService.KEYS.AUDIT_LOGS);
    return true;
  },

  async getRecentLogs(limit = 50): Promise<AuditLogEntry[]> {
    const logs = await this.getAll();
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },
};
