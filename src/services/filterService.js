import * as ClothService from './clothService.js';
import * as CategoryService from './categoryService.js';

async function sortClothes(clothes, sortBy, sortOrder = 'asc') {
  const direction = sortOrder === 'desc' ? -1 : 1;
  
  return [...clothes].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'wearCount':
        valueA = a.currentWearCount;
        valueB = b.currentWearCount;
        break;
      case 'cost':
        valueA = a.cost || 0;
        valueB = b.cost || 0;
        break;
      case 'purchaseDate':
        valueA = new Date(a.purchaseDate || 0);
        valueB = new Date(b.purchaseDate || 0);
        break;
      case 'createdAt':
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
}

export async function filterClothes(filters = {}) {
  let clothes = await ClothService.getAll();
  
  // Filter by status
  if (filters.status && filters.status.length > 0) {
    clothes = clothes.filter(cloth => filters.status.includes(cloth.status));
  }
  
  // Filter by category
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    const categories = await CategoryService.getAll();
    clothes = clothes.filter(cloth => {
      let currentCategoryId = cloth.categoryId;
      while (currentCategoryId) {
        if (filters.categoryIds.includes(currentCategoryId)) {
          return true;
        }
        const currentCategory = categories.find(c => c.id === currentCategoryId);
        currentCategoryId = currentCategory ? currentCategory.parentId : null;
      }
      return false;
    });
  }
  
  // Filter by color
  if (filters.colors && filters.colors.length > 0) {
    clothes = clothes.filter(cloth => filters.colors.includes(cloth.color));
  }
  
  // Filter by brand
  if (filters.brands && filters.brands.length > 0) {
    clothes = clothes.filter(cloth => filters.brands.includes(cloth.brand));
  }
  
  // Filter by material
  if (filters.materials && filters.materials.length > 0) {
    clothes = clothes.filter(cloth => filters.materials.includes(cloth.material));
  }
  
  // Filter by season
  if (filters.seasons && filters.seasons.length > 0) {
    clothes = clothes.filter(cloth => filters.seasons.includes(cloth.season));
  }
  
  // Filter by wear count range
  if (filters.wearCountMin !== undefined) {
    clothes = clothes.filter(cloth => cloth.currentWearCount >= filters.wearCountMin);
  }
  if (filters.wearCountMax !== undefined) {
    clothes = clothes.filter(cloth => cloth.currentWearCount <= filters.wearCountMax);
  }
  
  // Filter by cost range
  if (filters.costMin !== undefined) {
    clothes = clothes.filter(cloth => cloth.cost >= filters.costMin);
  }
  if (filters.costMax !== undefined) {
    clothes = clothes.filter(cloth => cloth.cost <= filters.costMax);
  }
  
  // Filter by purchase date range
  if (filters.purchaseDateFrom) {
    clothes = clothes.filter(cloth => 
      cloth.purchaseDate && new Date(cloth.purchaseDate) >= new Date(filters.purchaseDateFrom)
    );
  }
  if (filters.purchaseDateTo) {
    clothes = clothes.filter(cloth => 
      cloth.purchaseDate && new Date(cloth.purchaseDate) <= new Date(filters.purchaseDateTo)
    );
  }
  
  // Filter by pressing requirement
  if (filters.requiresPressing !== undefined) {
    clothes = clothes.filter(cloth => cloth.requiresPressing === filters.requiresPressing);
  }
  
  // Search by name/description
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    clothes = clothes.filter(cloth => 
      cloth.name.toLowerCase().includes(term) ||
      (cloth.description && cloth.description.toLowerCase().includes(term))
    );
  }
  
  // Sort results
  if (filters.sortBy) {
    clothes = await sortClothes(clothes, filters.sortBy, filters.sortOrder);
  }
  
  return clothes;
}

// Quick filter methods for common use cases
export async function getCleanClothes() {
  return await filterClothes({ status: [ClothService.STATUSES.CLEAN] });
}

export async function getDirtyClothes() {
  return await filterClothes({ status: [ClothService.STATUSES.DIRTY] });
}

export async function getNeedsPressing() {
  return await filterClothes({ status: [ClothService.STATUSES.NEEDS_PRESSING] });
}

export async function getClothesByCategory(categoryId, includeSubcategories = true) {
  if (!includeSubcategories) {
    return await filterClothes({ categoryIds: [categoryId] });
  }
  
  // Get all subcategories
  const allCategories = await CategoryService.getAll();
  const categoryIds = [categoryId];
  
  function addSubcategories(parentId) {
    const subcategories = allCategories.filter(cat => cat.parentId === parentId);
    subcategories.forEach(subcat => {
      categoryIds.push(subcat.id);
      addSubcategories(subcat.id); // Recursive for deeper nesting
    });
  }
  
  addSubcategories(categoryId);
  return await filterClothes({ categoryIds });
}

export async function getAvailableFilters() {
  const [clothes, categories] = await Promise.all([
    ClothService.getAll(),
    CategoryService.getAll()
  ]);
  
  return {
    colors: [...new Set(clothes.map(c => c.color).filter(Boolean))].sort(),
    brands: [...new Set(clothes.map(c => c.brand).filter(Boolean))].sort(),
    materials: [...new Set(clothes.map(c => c.material).filter(Boolean))].sort(),
    seasons: [...new Set(clothes.map(c => c.season).filter(Boolean))].sort(),
    categories,
    wearCountRange: {
      min: clothes.length > 0 ? Math.min(...clothes.map(c => c.currentWearCount)) : 0,
      max: clothes.length > 0 ? Math.max(...clothes.map(c => c.currentWearCount)) : 0
    },
    costRange: {
      min: clothes.length > 0 ? Math.min(...clothes.map(c => c.cost || 0)) : 0,
      max: clothes.length > 0 ? Math.max(...clothes.map(c => c.cost || 0)) : 0
    }
  };
}
