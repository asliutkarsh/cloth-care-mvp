import * as Storage from './storageService.js';

export const LOG_TYPES = {
  CLOTH: 'cloth',
  CATEGORY: 'category',
  OUTFIT: 'outfit',
  ACTIVITY: 'activity',
  LAUNDRY: 'laundry',
  SYSTEM: 'system'
};

export const ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  WEAR: 'wear',
  WASH: 'wash',
  PRESS: 'press',
  STATUS_CHANGE: 'status_change'
};

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function getAll() {
  return await Storage.get(Storage.KEYS.AUDIT_LOGS) || [];
}

export async function log(logData) {
  const logs = await getAll();
  const newLog = {
    id: generateId(),
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
  
  await Storage.set(Storage.KEYS.AUDIT_LOGS, logs);
  return newLog;
}

export async function getLogsByType(type) {
  const logs = await getAll();
  return logs.filter(log => log.type === type);
}

export async function getLogsByEntity(entityId) {
  const logs = await getAll();
  return logs.filter(log => log.entityId === entityId);
}

export async function getLogsByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const logs = await getAll();
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && logDate <= end;
  });
}

export async function getRecentLogs(limit = 50) {
  const logs = await getAll();
  return logs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

export async function searchLogs(searchTerm) {
  const logs = await getAll();
  const term = searchTerm.toLowerCase();
  
  return logs.filter(log => 
    log.entityName.toLowerCase().includes(term) ||
    log.action.toLowerCase().includes(term) ||
    log.type.toLowerCase().includes(term) ||
    JSON.stringify(log.details).toLowerCase().includes(term)
  );
}

export async function clearOldLogs(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const logs = await getAll();
  const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
  
  await Storage.set(Storage.KEYS.AUDIT_LOGS, filteredLogs);
  return logs.length - filteredLogs.length; // Return number of deleted logs
}
