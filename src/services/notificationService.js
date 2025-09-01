import * as Storage from './storageService.js';
import * as ClothService from './clothService.js';

export async function getSettings() {
  return await Storage.get(Storage.KEYS.NOTIFICATION_SETTINGS) || {
    enabled: true,
    dayOfWeek: 0, // 0 = Sunday, 1 = Monday, etc.
    timeOfDay: '09:00',
    lastSent: null
  };
}

export async function updateSettings(settings) {
  const currentSettings = await getSettings();
  const newSettings = { ...currentSettings, ...settings };
  await Storage.set(Storage.KEYS.NOTIFICATION_SETTINGS, newSettings);
  return newSettings;
}

export async function getDirtyClothesCount() {
  const dirtyClothes = await ClothService.getDirtyClothes();
  return dirtyClothes.length;
}

export async function shouldSendNotification() {
  const settings = await getSettings();
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

export async function createNotificationMessage() {
  const dirtyCount = await getDirtyClothesCount();
  if (dirtyCount === 0) return "All your clothes are clean! 🎉";
  if (dirtyCount === 1) return "You have 1 item to wash.";
  return `You have ${dirtyCount} items to wash.`;
}

export async function markNotificationSent() {
  const settings = await getSettings();
  settings.lastSent = new Date().toISOString();
  await Storage.set(Storage.KEYS.NOTIFICATION_SETTINGS, settings);
}
