import * as ClothService from './clothService.js';
import * as OutfitService from './outfitService.js';
import * as CategoryService from './categoryService.js';
import * as FilterService from './filterService.js';

export async function searchAll(searchTerm) {
  const term = searchTerm.toLowerCase();
  
  const [clothes, outfits, categories] = await Promise.all([
    ClothService.getAll(),
    OutfitService.getAll(),
    CategoryService.getAll()
  ]);

  const filteredClothes = clothes.filter(cloth =>
    cloth.name.toLowerCase().includes(term) ||
    (cloth.description && cloth.description.toLowerCase().includes(term)) ||
    (cloth.brand && cloth.brand.toLowerCase().includes(term)) ||
    (cloth.color && cloth.color.toLowerCase().includes(term))
  );
  
  const filteredOutfits = outfits.filter(outfit =>
    outfit.name.toLowerCase().includes(term) ||
    (outfit.description && outfit.description.toLowerCase().includes(term))
  );
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(term)
  );
  
  return {
    clothes: filteredClothes,
    outfits: filteredOutfits,
    categories: filteredCategories,
    totalResults: filteredClothes.length + filteredOutfits.length + filteredCategories.length
  };
}

export async function searchClothes(searchTerm, additionalFilters = {}) {
  const filters = {
    ...additionalFilters,
    searchTerm
  };
  return await FilterService.filterClothes(filters);
}
