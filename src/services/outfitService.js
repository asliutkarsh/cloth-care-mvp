import * as Storage from './storageService.js';
import * as ClothService from './clothService.js';
import { fileToBase64 } from './imageUploadService';

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
  if (!outfitData || typeof outfitData !== 'object') {
    throw new Error('Invalid outfit data');
  }

  const outfits = await getAll();
  const newOutfit = {
    id: generateId(),
    name: outfitData.name || 'Unnamed Outfit',
    description: outfitData.description || '',
    clothIds: Array.isArray(outfitData.clothIds) ? outfitData.clothIds : [],
    image: outfitData.image || null,
    tags: Array.isArray(outfitData.tags) ? outfitData.tags : [],
    createdAt: new Date().toISOString()
  };
  
  const updatedOutfits = [...outfits, newOutfit];
  await Storage.set(Storage.KEYS.OUTFITS, updatedOutfits);
  return newOutfit;
}

/**
 * Updates an existing outfit
 * @param {string} id - The ID of the outfit to update
 * @param {Object} updateData - The updated outfit data
 * @returns {Promise<Object|null>} The updated outfit or null if not found
 */
export async function update(id, updateData) {
  try {
    if (!id) {
      throw new Error('Outfit ID is required for update');
    }

    const outfits = await getAll();
    const index = outfits.findIndex(outfit => outfit.id === id);
    
    if (index === -1) {
      console.error(`Outfit with ID ${id} not found`);
      return null;
    }
    
    // Preserve existing data that's not being updated
    const updatedOutfit = {
      ...outfits[index],
      ...updateData,
      // Ensure these fields are not accidentally removed
      id: outfits[index].id, // Never update the ID
      createdAt: outfits[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString() // Add update timestamp
    };
    
    // If we have a new image file, handle it
    if (updateData.imageFile) {
      // In a real app, you would upload the new image and delete the old one
      // For now, we'll just use the base64 data
      updatedOutfit.image = await fileToBase64(updateData.imageFile);
      delete updatedOutfit.imageFile;
    }
    
    outfits[index] = updatedOutfit;
    await Storage.set(Storage.KEYS.OUTFITS, outfits);
    
    return updatedOutfit;
  } catch (error) {
    console.error('Error updating outfit:', error);
    throw error; // Re-throw to allow error handling in the component
  }
}

export async function deleteOutfit(id) {
  const outfits = await getAll();
  const filteredOutfits = outfits.filter(outfit => outfit.id !== id);
  await Storage.set(Storage.KEYS.OUTFITS, filteredOutfits);
  return true;
}

export async function getClothesInOutfit(outfitId) {
  try {
    if (!outfitId) return [];
    
    const outfit = await getById(outfitId);
    if (!outfit || !Array.isArray(outfit.clothIds)) return [];
    
    const clothes = await ClothService.getAll();
    if (!Array.isArray(clothes)) return [];
    
    return clothes.filter(cloth => 
      cloth && cloth.id && outfit.clothIds.includes(cloth.id)
    );
  } catch (error) {
    console.error('Error getting clothes in outfit:', error);
    return [];
  }
}
