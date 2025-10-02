import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../setup/storage.service';
import { ClothService } from './cloth.service';
import { PreferenceService } from './preference.service';
import { Outfit } from '../model/outfit.model';
import { Cloth } from '../model/cloth.model';

interface OutfitData {
  name: string;
  clothIds?: string[];
  description?: string;
  tags?: string[];
  occasion?: 'work' | 'casual' | 'formal' | 'sport';
  favorite?: boolean;
}

export const OutfitService = {
  async getAll(): Promise<Outfit[]> {
    return StorageService.getAll<Outfit>(StorageService.KEYS.OUTFITS);
  },

  async getById(id: string): Promise<Outfit | null> {
    const outfit = await StorageService.getById<Outfit>(StorageService.KEYS.OUTFITS, id);
    return outfit || null;
  },

  /**
   * Adds a new outfit with default values and validation.
   */
  async add(outfitData: OutfitData): Promise<Outfit> {
    // Validate that all cloth IDs exist
    for (const clothId of outfitData.clothIds || []) {
      const clothExists = await ClothService.getById(clothId);
      if (!clothExists) {
        throw new Error(`Cloth with id "${clothId}" not found.`);
      }
    }

    const rawTags = Array.isArray(outfitData.tags) ? outfitData.tags : [];
    const normalizedTags: string[] = [...new Set(rawTags.map(t => {
      const s = (t || '').trim();
      if (!s) return null;
      const withHash = s.startsWith('#') ? s : `#${s}`;
      return withHash.toLowerCase();
    }).filter((tag): tag is string => tag !== null))];
        
    const newOutfit: Outfit = {
      id: uuidv4(),
      name: outfitData.name,
      clothIds: outfitData.clothIds || [],
      description: outfitData.description || '',
      tags: normalizedTags,
      occasion: outfitData.occasion,
      favorite: outfitData.favorite ?? false,
      createdAt: new Date().toISOString(),
    };

    await StorageService.add(StorageService.KEYS.OUTFITS, newOutfit);

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

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit | null> {
    const existing = await StorageService.getById<Outfit>(StorageService.KEYS.OUTFITS, id);
    if (!existing) {
      return null;
    }

    const normalizedUpdates = { ...updates };
    if (Array.isArray(updates.tags)) {
      const normalized: string[] = [...new Set(updates.tags.map(t => {
        const s = (t || '').trim();
        if (!s) return null;
        const withHash = s.startsWith('#') ? s : `#${s}`;
        return withHash.toLowerCase();
      }).filter((tag): tag is string => tag !== null))];
      normalizedUpdates.tags = normalized;
    }
    
    const updatedOutfit = await StorageService.update(StorageService.KEYS.OUTFITS, id, normalizedUpdates);

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
    return updatedOutfit || null;
  },

  async remove(id: string): Promise<boolean> {
    await StorageService.remove(StorageService.KEYS.OUTFITS, id);
    return true;
  },

  /**
   * Retrieves all the full cloth objects for a given outfit.
   */
  async getClothesInOutfit(outfitId: string): Promise<Cloth[]> {
    const outfit = await this.getById(outfitId);
    if (!outfit) return [];

    const clothes = await Promise.all(
      outfit.clothIds.map(clothId => ClothService.getById(clothId))
    );

    return clothes.filter((cloth): cloth is Cloth => cloth !== null);
  },
};
