import * as Storage from './storageService.js';

/**
 * @fileoverview Manages all operations related to wardrobe categories.
 */

/**
 * Generates a unique ID for a new category.
 * @returns {string} A unique identifier.
 */
export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Retrieves all categories from storage.
 * @returns {Promise<Array>} A promise that resolves with an array of all categories.
 */
export async function getAll() {
  return await Storage.get(Storage.KEYS.CATEGORIES) || [];
}

/**
 * Finds a single category by its ID.
 * @param {string} id The ID of the category to find.
 * @returns {Promise<Object|undefined>} A promise that resolves with the category object or undefined if not found.
 */
export async function getById(id) {
  const categories = await getAll();
  return categories.find(cat => cat.id === id);
}

/**
 * Creates a new category and saves it to storage.
 * @param {Object} categoryData The data for the new category.
 * @returns {Promise<Object>} A promise that resolves with the newly created category object.
 */
export async function create(categoryData) {
  const categories = await getAll();
  const newCategory = {
    id: generateId(),
    name: categoryData.name,
    parentId: categoryData.parentId || null,
    maxWearCount: categoryData.maxWearCount || 2,
    createdAt: new Date().toISOString(),
    ...categoryData
  };

  categories.push(newCategory);
  await Storage.set(Storage.KEYS.CATEGORIES, categories);
  return newCategory;
}

/**
 * Updates an existing category.
 * @param {string} id The ID of the category to update.
 * @param {Object} updateData An object containing the fields to update.
 * @returns {Promise<Object|null>} A promise that resolves with the updated category or null if not found.
 */
export async function update(id, updateData) {
  const categories = await getAll();
  const index = categories.findIndex(cat => cat.id === id);
  if (index === -1) return null;

  categories[index] = { ...categories[index], ...updateData };
  await Storage.set(Storage.KEYS.CATEGORIES, categories);
  return categories[index];
}

/**
 * Deletes a category from storage.
 * @param {string} id The ID of the category to delete.
 * @returns {Promise<boolean>} A promise that resolves with true upon successful deletion.
 */
export async function deleteCategory(id) {
  const categories = await getAll();
  const filtered = categories.filter(cat => cat.id !== id);
  await Storage.set(Storage.KEYS.CATEGORIES, filtered);
  return true;
}

/**
 * Gets the maximum wear count for a category, inheriting from parent categories if not set.
 * @param {string} categoryId The ID of the category.
 * @returns {Promise<number>} A promise that resolves with the maximum wear count.
 */
export async function getMaxWearCount(categoryId) {
  const category = await getById(categoryId);
  if (!category) return 2; // default

  if (category.maxWearCount !== undefined && category.maxWearCount !== null) {
    return category.maxWearCount;
  }

  // Inherit from parent if not set
  if (category.parentId) {
    return getMaxWearCount(category.parentId);
  }

  return 2; // default fallback
}

/**
 * Builds a hierarchical tree structure of all categories.
 * @returns {Promise<Array>} A promise that resolves with a nested array of category objects.
 */
export async function getHierarchy() {
  const categories = await getAll();

  function buildTree(parentId = null) {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildTree(cat.id)
      }));
  }

  return buildTree();
}
