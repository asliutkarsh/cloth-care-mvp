// services/clothService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from "./storageService.js";
import { CategoryService } from './categoryService.js'; // We need this for maxWearCount

const KEY = StorageService.KEYS.CLOTHES;

export const ClothService = {
  STATUSES: {
    CLEAN: 'clean',
    DIRTY: 'dirty',
    NEEDS_PRESSING: 'needs_pressing'
  },

  async getAll() {
    return (await StorageService.get(KEY)) || [];
  },

  async getById(id) {
    const clothes = await this.getAll();
    return clothes.find(c => c.id === id) || null;
  },

  /**
   * Adds a new cloth item with smart defaults.
   */
  async add(clothData) {
    // Ensure category exists
    const category = await CategoryService.getById(clothData.categoryId);
    if (!category) {
      throw new Error(`Category with id "${clothData.categoryId}" not found.`);
    }

    const clothes = await this.getAll();
    const newCloth = {
      id: uuidv4(),
      description: '',
      image: null,
      brand: '',
      material: '',
      season: '',
      cost: clothData?.cost != null ? Number(clothData.cost) : 0,
      purchaseDate: null,
      requiresPressing: false,
      favorite: false,
      ...clothData, // User-provided data overrides defaults
      status: this.STATUSES.CLEAN,
      currentWearCount: 0,
      createdAt: new Date().toISOString(),
    };

    clothes.push(newCloth);
    await StorageService.set(KEY, clothes);
    return newCloth;
  },

  async update(id, updates) {
    let clothes = await this.getAll();
    let updatedCloth = null;
    const normalizedUpdates = { ...updates };
    if (Object.prototype.hasOwnProperty.call(normalizedUpdates, 'cost')) {
      const parsedCost = Number(normalizedUpdates.cost);
      normalizedUpdates.cost = Number.isFinite(parsedCost) ? parsedCost : 0;
    }
    const newClothes = clothes.map(c => {
      if (c.id === id) {
        updatedCloth = { ...c, ...normalizedUpdates };
        return updatedCloth;
      }
      return c;
    });
    await StorageService.set(KEY, newClothes);
    return updatedCloth;
  },

  async remove(id) {
    let clothes = await this.getAll();
    const newClothes = clothes.filter(c => c.id !== id);
    await StorageService.set(KEY, newClothes);
    return true;
  },

  // --- STATUS & WEAR COUNT LOGIC ---

  /**
   * Increments the wear count of a cloth item and updates its status if needed.
   * This is a critical function for your application's logic.
   */
  async incrementWearCount(clothId) {
    const cloth = await this.getById(clothId);
    if (!cloth) return null;

    const newWearCount = cloth.currentWearCount + 1;
    const maxWearCount = await CategoryService.getMaxWearCount(cloth.categoryId);

    let newStatus = cloth.status;
    if (newWearCount >= maxWearCount) {
      newStatus = this.STATUSES.DIRTY;
    }

    return this.update(clothId, {
      currentWearCount: newWearCount,
      status: newStatus
    });
  },

  /**
   * Decrements the wear count of a cloth item.
   */
  async decrementWearCount(clothId) {
    const cloth = await this.getById(clothId);
    if (!cloth) return null;

    const newWearCount = Math.max(0, cloth.currentWearCount - 1); // Prevent going below zero
    const newStatus = newWearCount < await CategoryService.getMaxWearCount(cloth.categoryId)
      ? this.STATUSES.CLEAN
      : this.STATUSES.DIRTY;

    return this.update(clothId, {
      currentWearCount: newWearCount,
      status: newStatus, // Status might change back to 'clean'
    });
  },

  // --- HELPER GETTERS ---

  async getByStatus(status) {
    const clothes = await this.getAll();
    return clothes.filter(cloth => cloth.status === status);
  },

  async getCleanClothes() {
    return this.getByStatus(this.STATUSES.CLEAN);
  },

  async getDirtyClothes() {
    return this.getByStatus(this.STATUSES.DIRTY);
  },

  async getNeedsPressing() {
    return this.getByStatus(this.STATUSES.NEEDS_PRESSING);
  },
};