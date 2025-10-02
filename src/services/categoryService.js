// services/categoryService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from "./storageService.js";

const KEY = StorageService.KEYS.CATEGORIES;

export const CategoryService = {
  async getAll() {
    return StorageService.getAll(KEY);
  },

  async getById(id) {
    const category = await StorageService.getById(KEY, id);
    return category || null;
  },

  /**
   * Adds a new top-level category.
   */
  async addCategory(categoryData) {
    const newCategory = {
      id: uuidv4(),
      parentId: null,
      maxWearCount: 2,
      ...categoryData,
      icon: categoryData?.icon || '👕',
      createdAt: new Date().toISOString(),
    };
    await StorageService.add(KEY, newCategory);
    return newCategory;
  },

  /**
   * Adds a new subcategory under a specified parent.
   */
  async addSubCategory(parentId, categoryData) {
    const parent = await this.getById(parentId);
    if (!parent) {
      throw new Error(`Parent category with id "${parentId}" not found.`);
    }

    const newSubCategory = {
      id: uuidv4(),
      ...categoryData,
      parentId: parentId,
      maxWearCount: categoryData.maxWearCount || parent.maxWearCount || 2,
      icon: categoryData?.icon || parent.icon || '👕',
      createdAt: new Date().toISOString(),
    };
    await StorageService.add(KEY, newSubCategory);
    return newSubCategory;
  },

  async update(id, updates) {
    const updated = await StorageService.update(KEY, id, updates);
    return updated || null;
  },

  /**
   * Removes a category, but only if it has no children.
   */
  async remove(id) {
    if (await this.hasChildren(id)) {
      throw new Error("Cannot remove a category that has subcategories.");
    }
    await StorageService.remove(KEY, id);
    return true;
  },

  // --- UTILITY FUNCTIONS ---

  /**
   * Checks if a category has any subcategories.
   */
  async hasChildren(categoryId) {
    const categories = await this.getAll();
    return categories.some(cat => cat.parentId === categoryId);
  },

  /**
   * Checks if a given category object is a subcategory.
   * Note: This is a synchronous helper as it operates on an object you already have.
   */
  isSubCategory(category) {
    return category && category.parentId !== null;
  },

  async getMaxWearCount(categoryId) {
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

  async getHierarchy() {
    const categories = await this.getAll();
    const buildTree = (parentId = null) => {
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