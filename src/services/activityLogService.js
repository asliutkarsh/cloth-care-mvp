import * as Storage from './storageService.js';
import * as ClothService from './clothService.js';
import * as OutfitService from './outfitService.js';

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function getAll() {
  return await Storage.get(Storage.KEYS.ACTIVITY_LOGS) || [];
}

export async function getById(id) {
  const logs = await getAll();
  return logs.find(log => log.id === id);
}

export async function getByDate(date) {
  const logs = await getAll();
  return logs.filter(log => log.date === date);
}

export async function logActivity(activityData) {
  const logs = await getAll();
  const newLog = {
    id: generateId(),
    date: activityData.date || new Date().toISOString().split('T')[0],
    type: activityData.type, // 'outfit' or 'individual'
    outfitId: activityData.outfitId || null,
    clothIds: activityData.clothIds || [],
    notes: activityData.notes || '',
    createdAt: new Date().toISOString(),
    ...activityData
  };
  
  logs.push(newLog);
  await Storage.set(Storage.KEYS.ACTIVITY_LOGS, logs);
  
  // Update wear counts for clothes
  const clothesInOutfit = newLog.type === 'outfit' 
    ? await OutfitService.getClothesInOutfit(newLog.outfitId)
    : [];
  
  const clothIds = newLog.type === 'outfit'
    ? clothesInOutfit.map(c => c.id)
    : newLog.clothIds;
  
  for (const clothId of clothIds) {
    await ClothService.incrementWearCount(clothId);
  }
  
  return newLog;
}

export async function update(id, updateData) {
  const logs = await getAll();
  const index = logs.findIndex(log => log.id === id);
  if (index === -1) return null;
  
  logs[index] = { ...logs[index], ...updateData };
  await Storage.set(Storage.KEYS.ACTIVITY_LOGS, logs);
  return logs[index];
}

export async function deleteLog(id) {
  const logs = await getAll();
  const filtered = logs.filter(log => log.id !== id);
  await Storage.set(Storage.KEYS.ACTIVITY_LOGS, filtered);
  return true;
}

export async function createOutfitFromActivity(activityId, outfitName) {
  const activity = await getById(activityId);
  if (!activity || activity.type !== 'individual') return null;
  
  const newOutfit = await OutfitService.create({
    name: outfitName,
    clothIds: activity.clothIds,
    description: `Created from activity on ${activity.date}`
  });
  
  return newOutfit;
}
