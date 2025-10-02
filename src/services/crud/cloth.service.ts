import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../setup/storage.service';
import { CategoryService } from './category.service';
import { Cloth, ClothStatus } from '../model/cloth.model';

interface ClothData {
  name: string;
  categoryId: string;
  status?: ClothStatus;
  currentWearCount?: number;
  totalWearCount?: number;
  images?: string;
  description?: string;
  brand?: string;
  material?: string;
  season?: string;
  color?: string;
  cost?: number;
  purchaseDate?: string;
  requiresPressing?: boolean;
  favorite?: boolean;
  isArchived?: boolean;
  archiveType?: 'donated' | 'lent' | 'storage' | 'other';
  careInstructions?: string;
  linkedItemIds?: string[];
  loanInfo?: {
    to: string;
    returnDate: string;
  };
}

export const ClothService = {
  STATUSES: {
    CLEAN: 'clean' as const,
    DIRTY: 'dirty' as const,
    NEEDS_PRESSING: 'needs_pressing' as const,
  },

  async getAll(): Promise<Cloth[]> {
    return StorageService.getAll<Cloth>(StorageService.KEYS.CLOTHES);
  },

  async getById(id: string): Promise<Cloth | null> {
    const cloth = await StorageService.getById<Cloth>(StorageService.KEYS.CLOTHES, id);
    return cloth ?? null;
  },

  async add(clothData: ClothData): Promise<Cloth> {
    const category = await CategoryService.getById(clothData.categoryId);
    if (!category) {
      throw new Error(`Category with id "${clothData.categoryId}" not found.`);
    }

    const newCloth: Cloth = {
      id: uuidv4(),
      name: clothData.name,
      categoryId: clothData.categoryId,
      description: clothData.description || '',
      brand: clothData.brand || '',
      material: clothData.material || '',
      season: clothData.season || '',
      color: clothData.color,
      cost: clothData?.cost != null ? Number(clothData.cost) : 0,
      purchaseDate: clothData.purchaseDate ?? undefined,
      requiresPressing: clothData.requiresPressing ?? false,
      favorite: clothData.favorite ?? false,
      images: clothData.images || '',
      totalWearCount: clothData.totalWearCount ?? 0,
      isArchived: clothData.isArchived ?? false,
      archiveType: clothData.archiveType,
      careInstructions: clothData.careInstructions,
      linkedItemIds: clothData.linkedItemIds,
      loanInfo: clothData.loanInfo,
      status: clothData.status ?? this.STATUSES.CLEAN,
      currentWearCount: clothData.currentWearCount ?? 0,
      createdAt: new Date().toISOString(),
    };

    await StorageService.add(StorageService.KEYS.CLOTHES, newCloth);
    return newCloth;
  },

  async update(id: string, updates: Partial<Cloth>): Promise<Cloth | null> {
    const normalizedUpdates = { ...updates };
    if (Object.prototype.hasOwnProperty.call(normalizedUpdates, 'cost')) {
      const parsedCost = Number(normalizedUpdates.cost);
      normalizedUpdates.cost = Number.isFinite(parsedCost) ? parsedCost : 0;
    }

    const existing = await this.getById(id);
    if (!existing) return null;

    const updatedCloth = { ...existing, ...normalizedUpdates };
    await StorageService.put(StorageService.KEYS.CLOTHES, updatedCloth);
    return updatedCloth;
  },

  async remove(id: string): Promise<boolean> {
    await StorageService.remove(StorageService.KEYS.CLOTHES, id);
    return true;
  },

  async incrementWearCount(clothId: string): Promise<Cloth | null> {
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

  async decrementWearCount(clothId: string): Promise<Cloth | null> {
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

  async getByStatus(status: ClothStatus): Promise<Cloth[]> {
    const clothes = await this.getAll();
    return clothes.filter(cloth => cloth.status === status);
  },

  async getCleanClothes(): Promise<Cloth[]> {
    return this.getByStatus(this.STATUSES.CLEAN);
  },

  async getDirtyClothes(): Promise<Cloth[]> {
    return this.getByStatus(this.STATUSES.DIRTY);
  },

  async getNeedsPressing(): Promise<Cloth[]> {
    return this.getByStatus(this.STATUSES.NEEDS_PRESSING);
  },
};
