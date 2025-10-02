import { ClothService } from '../crud/cloth.service';
import { OutfitService } from '../crud/outfit.service';
import { Cloth } from '../model/cloth.model';
import { Outfit } from '../model/outfit.model';

interface SearchResults {
  clothes: Cloth[];
  outfits: Outfit[];
  totalResults: number;
}

export const SearchService = {
  /**
   * Searches across both clothes and outfits for a matching term.
   */
  async searchAll(searchTerm: string): Promise<SearchResults> {
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
   */
  async searchClothes(searchTerm: string): Promise<Cloth[]> {
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
