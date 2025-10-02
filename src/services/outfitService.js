// services/outfitService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from "./storageService.js";
import { ClothService } from "./clothService.js"; // Needed for validation and helpers
import { PreferenceService } from "./preferenceService.js";

const KEY = StorageService.KEYS.OUTFITS;

export const OutfitService = {
  async getAll() {
    return StorageService.getAll(KEY);
  },

  async getById(id) {
    const outfit = await StorageService.getById(KEY, id);
    return outfit || null;
  },

  /**
   * Adds a new outfit with default values and validation.
   */
  async add(outfitData) {
    // Validate that all cloth IDs exist
    for (const clothId of outfitData.clothIds || []) {
      const clothExists = await ClothService.getById(clothId);
      if (!clothExists) {
        throw new Error(`Cloth with id "${clothId}" not found.`);
      }
    }

    const rawTags = Array.isArray(outfitData.tags) ? outfitData.tags : [];
    const normalizedTags = [...new Set(rawTags.map(t => {
      const s = (t || '').trim();
      if (!s) return null;
      const withHash = s.startsWith('#') ? s : `#${s}`;
      return withHash.toLowerCase();
    }).filter(Boolean))];
    const newOutfit = {
      id: uuidv4(),
      description: '',
      clothIds: [],
      image: null,
      tags: normalizedTags,
      ...outfitData, // User-provided data overrides defaults
      createdAt: new Date().toISOString(),
    };

    await StorageService.add(KEY, newOutfit);
    // Update tag suggestions and stats in preferences
    const prefs = await PreferenceService.getPreferences();
    const existing = prefs.outfitTagSuggestions || [];
    const merged = [...new Set([...existing, ...normalizedTags])];
    const stats = { ...(prefs.outfitTagStats || {}) };
    const now = new Date().toISOString();
    for (const t of normalizedTags) {
      const prev = stats[t] || { count: 0, lastUsed: '' };
      stats[t] = { count: (prev.count || 0) + 1, lastUsed: now };
    }
    await PreferenceService.updatePreferences({ outfitTagSuggestions: merged, outfitTagStats: stats });
    return newOutfit;
  },

  async update(id, updates) {
    const existing = await StorageService.getById(KEY, id);
    if (!existing) {
      return null;
    }

    const normalizedUpdates = { ...updates };
    if (Array.isArray(updates.tags)) {
      const normalized = [...new Set(updates.tags.map(t => {
        const s = (t || '').trim();
        if (!s) return null;
        const withHash = s.startsWith('#') ? s : `#${s}`;
        return withHash.toLowerCase();
      }).filter(Boolean))];
      normalizedUpdates.tags = normalized;
    }

    const updatedOutfit = await StorageService.update(KEY, id, normalizedUpdates);

    if (updatedOutfit?.tags?.length) {
      const prefs = await PreferenceService.getPreferences();
      const existing = prefs.outfitTagSuggestions || [];
      const merged = [...new Set([...existing, ...updatedOutfit.tags])];
      const stats = { ...(prefs.outfitTagStats || {}) };
      const now = new Date().toISOString();
      for (const t of updatedOutfit.tags) {
        const prev = stats[t] || { count: 0, lastUsed: '' };
        stats[t] = { count: (prev.count || 0) + 1, lastUsed: now };
      }
      await PreferenceService.updatePreferences({ outfitTagSuggestions: merged, outfitTagStats: stats });
    }
    return updatedOutfit;
  },

  async remove(id) {
    await StorageService.remove(KEY, id);
    return true;
  },

  /**
   * Retrieves all the full cloth objects for a given outfit.
   * @param {string} outfitId - The ID of the outfit.
   * @returns {Array} An array of cloth objects.
   */
  async getClothesInOutfit(outfitId) {
    const outfit = await this.getById(outfitId);
    if (!outfit) return [];

    const clothes = await Promise.all(
      outfit.clothIds.map(clothId => ClothService.getById(clothId))
    );

    return clothes.filter(Boolean); // Filter out any nulls if a cloth was deleted
  },
};