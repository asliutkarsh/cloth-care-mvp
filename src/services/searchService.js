// services/SearchService.js
import { ClothService } from './clothService.js';
import { OutfitService } from './outfitService.js';

export const SearchService = {
  /**
   * Searches across both clothes and outfits for a matching term.
   * @param {string} searchTerm - The text to search for.
   * @returns {object} An object containing arrays of matching clothes and outfits.
   */
  async searchAll(searchTerm) {
    const term = searchTerm.toLowerCase();
    if (!term) {
      return { clothes: [], outfits: [], totalResults: 0 };
    }

    const allClothes = await ClothService.getAll();
    const allOutfits = await OutfitService.getAll();

    const clothes = allClothes.filter(cloth =>
      cloth.name.toLowerCase().includes(term) ||
      (cloth.description && cloth.description.toLowerCase().includes(term)) ||
      (cloth.brand && cloth.brand.toLowerCase().includes(term)) ||
      (cloth.color && cloth.color.toLowerCase().includes(term))
    );

    const outfits = allOutfits.filter(outfit =>
      outfit.name.toLowerCase().includes(term) ||
      (outfit.description && outfit.description.toLowerCase().includes(term))
    );

    return {
      clothes,
      outfits,
      totalResults: clothes.length + outfits.length,
    };
  },

  /**
   * Searches specifically within clothes.
   * @param {string} searchTerm - The text to search for.
   * @returns {Array} An array of matching cloth objects.
   */
  async searchClothes(searchTerm) {
    const term = searchTerm.toLowerCase();
    if (!term) return [];

    const allClothes = await ClothService.getAll();

    return allClothes.filter(cloth =>
      cloth.name.toLowerCase().includes(term) ||
      (cloth.description && cloth.description.toLowerCase().includes(term)) ||
      (cloth.brand && cloth.brand.toLowerCase().includes(term)) ||
      (cloth.color && cloth.color.toLowerCase().includes(term))
    );
  },
};