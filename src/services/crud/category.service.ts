import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../setup/storage.service';
import { Category } from '../model/category.model';

interface CategoryData {
  name: string;
  parentId?: string | null;
  maxWearCount?: number;
  icon?: string;
  isHidden?: boolean;
  defaultProperties?: {
    requiresPressing?: boolean;
    season?: string;
  };
}

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    return StorageService.getAll(StorageService.KEYS.CATEGORIES);
  },

  async getById(id: string): Promise<Category | null> {
    const category = await StorageService.getById<Category>(StorageService.KEYS.CATEGORIES, id);
    return category || null;
  },

  /**
   * Adds a new top-level category.
   */
  async addCategory(categoryData: CategoryData): Promise<Category> {
    const newCategory: Category = {
      id: uuidv4(),
      parentId: null,
      maxWearCount: 2,
      isHidden: false,
      ...categoryData,
      icon: categoryData?.icon || '👕',
      createdAt: new Date().toISOString(),
    };
    await StorageService.add(StorageService.KEYS.CATEGORIES, newCategory);
    return newCategory;
  },

  /**
   * Adds a new subcategory under a specified parent.
   */
  async addSubCategory(parentId: string, categoryData: CategoryData): Promise<Category> {
    const parent = await this.getById(parentId);
    if (!parent) {
      throw new Error(`Parent category with id "${parentId}" not found.`);
    }

    const newSubCategory: Category = {
      id: uuidv4(),
      isHidden: false,
      ...categoryData,
      parentId: parentId,
      maxWearCount: categoryData.maxWearCount || parent.maxWearCount || 2,
      icon: categoryData?.icon || parent.icon || '👕',
      createdAt: new Date().toISOString(),
    };
    await StorageService.add(StorageService.KEYS.CATEGORIES, newSubCategory);
    return newSubCategory;
  },

  async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const updated = await StorageService.update(StorageService.KEYS.CATEGORIES, id, updates);
    return updated || null;
  },

  /**
   * Removes a category, but only if it has no children.
   */
  async remove(id: string): Promise<boolean> {
    if (await this.hasChildren(id)) {
      throw new Error("Cannot remove a category that has subcategories.");
    }
    await StorageService.remove(StorageService.KEYS.CATEGORIES, id);
    return true;
  },

  // --- UTILITY FUNCTIONS ---

  /**
   * Checks if a category has any subcategories.
   */
  async hasChildren(categoryId: string): Promise<boolean> {
    const categories = await this.getAll();
    return categories.some(cat => cat.parentId === categoryId);
  },

  /**
   * Checks if a given category object is a subcategory.
   * Note: This is a synchronous helper as it operates on an object you already have.
   */
  isSubCategory(category: Category): boolean {
    return category && category.parentId !== null;
  },

  async getMaxWearCount(categoryId: string): Promise<number> {
    const category = await this.getById(categoryId);
    if (!category) return 2;

    if (category.maxWearCount !== undefined && category.maxWearCount !== null) {
      return category.maxWearCount;
    }

    if (category.parentId) {
      return await this.getMaxWearCount(category.parentId);
    }
    return 2;
  },

  async getHierarchy(): Promise<Category[]> {
    const categories = await this.getAll();
    const buildTree = (parentId: string | null = null): Category[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id)
        }));
    };
    return buildTree();
  },
};
