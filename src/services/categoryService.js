// services/categoryService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from "./storageService.js";

const KEY = StorageService.KEYS.CATEGORIES;

export const CategoryService = {
  async getAll() {
    return (await StorageService.get(KEY)) || [];
  },

  async getById(id) {
    const categories = await this.getAll();
    return categories.find(cat => cat.id === id) || null;
  },

  /**
   * Adds a new top-level category.
   */
  async addCategory(categoryData) {
    const categories = await this.getAll();
    const newCategory = {
      id: uuidv4(),
      parentId: null,
      maxWearCount: 2,
      ...categoryData,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    await StorageService.set(KEY, categories);
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

    const categories = await this.getAll();
    const newSubCategory = {
      id: uuidv4(),
      ...categoryData,
      parentId: parentId,
      maxWearCount: categoryData.maxWearCount || parent.maxWearCount || 2,
      createdAt: new Date().toISOString(),
    };

    categories.push(newSubCategory);
    await StorageService.set(KEY, categories);
    return newSubCategory;
  },

  async update(id, updates) {
    let categories = await this.getAll();
    let updatedCategory = null;
    const newCategories = categories.map(cat => {
      if (cat.id === id) {
        updatedCategory = { ...cat, ...updates };
        return updatedCategory;
      }
      return cat;
    });
    await StorageService.set(KEY, newCategories);
    return updatedCategory;
  },

  /**
   * Removes a category, but only if it has no children.
   */
  async remove(id) {
    if (await this.hasChildren(id)) {
      throw new Error("Cannot remove a category that has subcategories.");
    }
    let categories = await this.getAll();
    const newCategories = categories.filter(cat => cat.id !== id);
    await StorageService.set(KEY, newCategories);
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