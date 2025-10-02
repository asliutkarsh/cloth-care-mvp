import { create } from 'zustand';
import { InsightsService } from '../services/logic';

export const useInsightsStore = create((set, get) => ({
  isLoading: false,
  error: null,
  data: null,
  lastRefreshedAt: null,

  initialize: async () => {
    const state = get();
    if (state.data || state.isLoading) return;
    await get().refresh();
  },

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await InsightsService.getInsights();
      set({
        data,
        lastRefreshedAt: new Date().toISOString(),
        isLoading: false,
      });
    } catch (error) {
      console.error('[useInsightsStore] Failed to load insights', error);
      set({ error, isLoading: false });
    }
  },
}));
