import * as Storage from './storageService.js';
import * as ClothService from './clothService.js';

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function getAll() {
  return await Storage.get(Storage.KEYS.OUTFITS) || [];
}

export async function getById(id) {
  const outfits = await getAll();
  return outfits.find(outfit => outfit.id === id);
}

export async function create(outfitData) {
  const outfits = await getAll();
  const newOutfit = {
    id: generateId(),
    name: outfitData.name,
    description: outfitData.description || '',
    clothIds: outfitData.clothIds || [],
    image: outfitData.image || null,
    tags: outfitData.tags || [],
    createdAt: new Date().toISOString(),
    ...outfitData
  };
  
  outfits.push(newOutfit);
  await Storage.set(Storage.KEYS.OUTFITS, outfits);
  return newOutfit;
}

export async function update(id, updateData) {
  const outfits = await getAll();
  const index = outfits.findIndex(outfit => outfit.id === id);
  if (index === -1) return null;
  
  outfits[index] = { ...outfits[index], ...updateData };
  await Storage.set(Storage.KEYS.OUTFITS, outfits);
  return outfits[index];
}

export async function deleteOutfit(id) {
  const outfits = await getAll();
  const filtered = outfits.filter(outfit => outfit.id !== id);
  await Storage.set(Storage.KEYS.OUTFITS, filtered);
  return true;
}

export async function getClothesInOutfit(outfitId) {
  const outfit = await getById(outfitId);
  if (!outfit) return [];
  
  const clothes = await Promise.all(
    outfit.clothIds.map(clothId => ClothService.getById(clothId))
  );
  return clothes.filter(Boolean);
}
