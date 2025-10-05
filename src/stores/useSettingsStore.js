import { create } from 'zustand';
import { PreferenceService } from '../services/crud';
import { SetupService } from '../services/setup';
import { useAppStore } from './useAppStore';
import { useWardrobeStore } from './useWardrobeStore';
import { useCalendarStore } from './useCalendarStore';
import { BackupService } from '../services/logic/backup.service';
import { useModalStore, ModalTypes } from './useModalStore';

export const useSettingsStore = create((set, get) => ({
  // STATE
  preferences: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  filterChipSettings: { clothes: [], outfits: [] },
  outfitTagSuggestions: [],

  // ACTIONS
  fetchPreferences: async ({ trackStatus = true } = {}) => {
    const { startLoading, finishLoading, setDomainError } = useAppStore.getState();
    if (trackStatus) {
      startLoading('settings');
      set({ isLoading: true, error: null });
    }
    try {
      const prefs = await PreferenceService.getPreferences();
      set({
        preferences: prefs,
        isInitialized: true,
        isLoading: false,
        error: null,
        filterChipSettings: prefs?.filterChipSettings || { clothes: [], outfits: [] },
        outfitTagSuggestions: prefs?.outfitTagSuggestions || [],
      });
      if (trackStatus) finishLoading('settings');
      return prefs;
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      set({ isLoading: false, error });
      if (trackStatus) setDomainError('settings', error);
      throw error;
    }
  },

  // Open Import modal centrally
  openImportModal: () => {
    useModalStore.getState().openModal(ModalTypes.IMPORT_DATA);
  },

  updatePreference: async (key, value) => {
    const { setDomainError } = useAppStore.getState();
    try {
      await PreferenceService.updatePreferences({ [key]: value });
      await get().fetchPreferences({ trackStatus: false });
    } catch (error) {
      console.error('Failed to update preference:', error);
      set({ error });
      setDomainError('settings', error);
      throw error;
    }
  },

  updateFilterChipSettings: async (settings) => {
    const { setDomainError } = useAppStore.getState();
    try {
      await PreferenceService.updatePreferences({ filterChipSettings: settings });
      await get().fetchPreferences({ trackStatus: false });
    } catch (error) {
      console.error('Failed to update filter chip settings:', error);
      set({ error });
      setDomainError('settings', error);
      throw error;
    }
  },

  updateLastBackupDate: async () => {
    const timestamp = new Date().toISOString();
    await PreferenceService.updatePreferences({ lastBackupDate: timestamp });
    await get().fetchPreferences({ trackStatus: false });
    return timestamp;
  },

  // Export all data via BackupService
  exportData: async () => {
    const { startLoading, finishLoading } = useAppStore.getState();
    startLoading('settings');
    set({ isLoading: true, error: null });
    try {
      const payload = await BackupService.exportData();
      const dataStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloth-care-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await get().updateLastBackupDate();
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, message: 'Export failed: ' + (error.message || 'Unknown error') };
    } finally {
      finishLoading('settings');
      set({ isLoading: false });
    }
  },

  // Import all data from JSON using BackupService
  importData: async () => {
    const { startLoading, finishLoading } = useAppStore.getState();
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return resolve({ success: false, message: 'No file selected' });
        try {
          startLoading('settings');
          set({ isLoading: true, error: null });

          const text = await file.text();
          const data = JSON.parse(text);

          const result = await BackupService.importData(data);
          if (!result?.success) throw new Error(result?.message || 'Import failed');

          await Promise.all([
            useWardrobeStore.getState().fetchAll({ trackStatus: false }),
            useSettingsStore.getState().fetchPreferences({ trackStatus: false }),
            useCalendarStore.getState().fetchAll?.() || Promise.resolve(),
          ]);

          finishLoading('settings');
          set({ isLoading: false });
          resolve({ success: true, message: 'Data imported successfully' });
        } catch (error) {
          console.error('Import error:', error);
          finishLoading('settings');
          set({ isLoading: false, error });
          resolve({ success: false, message: 'Failed to import data: ' + (error.message || 'Unknown error') });
        }
      };

      input.oncancel = () => resolve({ success: false, message: 'Import cancelled' });
      input.click();
    });
  },

  // Backup reminders
  getLastBackupDate: () => {
    const { preferences } = get();
    return preferences?.lastBackupDate ? new Date(preferences.lastBackupDate) : null;
  },

  shouldShowBackupReminder: () => {
    const { preferences } = get();
    const lastBackupDate = preferences?.lastBackupDate ? new Date(preferences.lastBackupDate) : null;
    const freq = preferences?.backupFrequency || 'weekly'; // 'daily' | '3days' | 'weekly'
    const days = freq === 'daily' ? 1 : (freq === '3days' ? 3 : 7);
    if (!lastBackupDate) return true;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    return lastBackupDate < threshold;
  },

  dismissBackupReminder: async () => {
    await get().updateLastBackupDate();
  },

    /**
   * Resets all application data.
   */
    resetApp: async () => {
      await SetupService.resetApp();
  },

  // Init
  initialize: async () => {
    await SetupService.initialize();
  },
}));
