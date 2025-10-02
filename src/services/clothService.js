// services/clothService.js
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storageService.js';
import { CategoryService } from './categoryService.js';

const KEY = StorageService.KEYS.CLOTHES;

export const ClothService = {
  STATUSES: {
    CLEAN: 'clean',
    DIRTY: 'dirty',
    NEEDS_PRESSING: 'needs_pressing',
  },

  async getAll() {
    return StorageService.getAll(KEY);
  },

  async getById(id) {
    const cloth = await StorageService.getById(KEY, id);
    return cloth ?? null;
  },

  async add(clothData) {
    const category = await CategoryService.getById(clothData.categoryId);
    if (!category) {
      throw new Error(`Category with id "${clothData.categoryId}" not found.`);
    }

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
      ...clothData,
      status: this.STATUSES.CLEAN,
      currentWearCount: 0,
      createdAt: new Date().toISOString(),
    };

    await StorageService.add(KEY, newCloth);
    return newCloth;
  },

  async update(id, updates) {
    const normalizedUpdates = { ...updates };
    if (Object.prototype.hasOwnProperty.call(normalizedUpdates, 'cost')) {
      const parsedCost = Number(normalizedUpdates.cost);
      normalizedUpdates.cost = Number.isFinite(parsedCost) ? parsedCost : 0;
    }

    return StorageService.update(KEY, id, normalizedUpdates);
  },

  async remove(id) {
    await StorageService.remove(KEY, id);
    return true;
  },

  async incrementWearCount(clothId) {
    const cloth = await this.getById(clothId);
    if (!cloth) return null;

    const newWearCount = cloth.currentWearCount + 1;
    const maxWearCount = await CategoryService.getMaxWearCount(cloth.categoryId);
    const newStatus = newWearCount >= maxWearCount ? this.STATUSES.DIRTY : cloth.status;

    return this.update(clothId, {
      currentWearCount: newWearCount,
      status: newStatus,
    });
  },

  async decrementWearCount(clothId) {
    const cloth = await this.getById(clothId);
    if (!cloth) return null;

    const newWearCount = Math.max(0, cloth.currentWearCount - 1);
    const maxWearCount = await CategoryService.getMaxWearCount(cloth.categoryId);
    const newStatus = newWearCount < maxWearCount ? this.STATUSES.CLEAN : this.STATUSES.DIRTY;

    return this.update(clothId, {
      currentWearCount: newWearCount,
      status: newStatus,
    });
  },

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