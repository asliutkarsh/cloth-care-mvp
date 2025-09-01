import * as Storage from './storageService.js';
import * as CategoryService from './categoryService.js';

/**
 * @fileoverview Manages all operations related to individual clothing items.
 */

export const STATUSES = {
  CLEAN: 'clean',
  DIRTY: 'dirty',
  NEEDS_PRESSING: 'needs_pressing'
};

export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function getAll() {
  return await Storage.get(Storage.KEYS.CLOTHES) || [];
}

export async function getById(id) {
  const clothes = await getAll();
  return clothes.find(cloth => cloth.id === id);
}

export async function getByStatus(status) {
  const clothes = await getAll();
  return clothes.filter(cloth => cloth.status === status);
}

export async function getDirtyClothes() {
  return await getByStatus(STATUSES.DIRTY);
}

export async function getNeedsPressing() {
  return await getByStatus(STATUSES.NEEDS_PRESSING);
}

export async function getCleanClothes() {
  return await getByStatus(STATUSES.CLEAN);
}


export async function create(clothData) {
  const clothes = await getAll();
  const newCloth = {
    id: generateId(),
    name: clothData.name,
    description: clothData.description || '',
    color: clothData.color,
    image: clothData.image || null,
    categoryId: clothData.categoryId,
    brand: clothData.brand || '',
    material: clothData.material || '',
    season: clothData.season || '',
    cost: clothData.cost || 0,
    purchaseDate: clothData.purchaseDate || null,
    requiresPressing: clothData.requiresPressing || false,
    status: STATUSES.CLEAN,
    currentWearCount: 0,
    createdAt: new Date().toISOString(),
    ...clothData
  };

  clothes.push(newCloth);
  await Storage.set(Storage.KEYS.CLOTHES, clothes);
  return newCloth;
}

export async function update(id, updateData) {
  const clothes = await getAll();
  const index = clothes.findIndex(cloth => cloth.id === id);
  if (index === -1) return null;

  clothes[index] = { ...clothes[index], ...updateData };
  await Storage.set(Storage.KEYS.CLOTHES, clothes);
  return clothes[index];
}

export async function deleteCloth(id) {
  const clothes = await getAll();
  const filtered = clothes.filter(cloth => cloth.id !== id);
  await Storage.set(Storage.KEYS.CLOTHES, filtered);
  return true;
}

export async function incrementWearCount(clothId) {
  const cloth = await getById(clothId);
  if (!cloth) return null;

  const newWearCount = cloth.currentWearCount + 1;
  const maxWearCount = await CategoryService.getMaxWearCount(cloth.categoryId);

  let newStatus = cloth.status;
  if (newWearCount >= maxWearCount) {
    newStatus = STATUSES.DIRTY;
  }

  return await update(clothId, {
    currentWearCount: newWearCount,
    status: newStatus
  });
}

export async function washClothes(clothIds) {
  const results = [];
  const clothesNeedingPress = [];

  for (const clothId of clothIds) {
    const cloth = await getById(clothId);
    if (cloth && cloth.status === STATUSES.DIRTY) {
      const newStatus = cloth.requiresPressing ?
        STATUSES.NEEDS_PRESSING :
        STATUSES.CLEAN;

      const updatedCloth = await update(clothId, {
        currentWearCount: 0,
        status: newStatus
      });

      if (updatedCloth) {
        results.push(updatedCloth);
        if (updatedCloth.status === STATUSES.NEEDS_PRESSING) {
          clothesNeedingPress.push(updatedCloth);
        }
      }
    }
  }

  return {
    washedClothes: results,
    needsPressing: clothesNeedingPress
  };
}

export async function markAsPressed(clothIds) {
  const results = [];

  for (const clothId of clothIds) {
    const cloth = await getById(clothId);
    if (cloth && cloth.status === STATUSES.NEEDS_PRESSING) {
      const updatedCloth = await update(clothId, {
        status: STATUSES.CLEAN
      });
      if (updatedCloth) {
        results.push(updatedCloth);
      }
    }
  }

  return results;
}
