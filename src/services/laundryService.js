import * as ClothService from './clothService.js';

async function createWashMessage(result) {
  const total = result.washedClothes.length;
  const pressing = result.needsPressing.length;
  
  if (total === 0) return "No clothes were washed.";
  if (pressing === 0) return `${total} item${total > 1 ? 's' : ''} washed and ready to wear!`;
  
  return `${total} item${total > 1 ? 's' : ''} washed. ${pressing} item${pressing > 1 ? 's' : ''} need${pressing === 1 ? 's' : ''} pressing.`;
}

export async function washSelectedClothes(clothIds) {
  const result = await ClothService.washClothes(clothIds);
  
  // Return summary for UI feedback
  return {
    totalWashed: result.washedClothes.length,
    needsPressing: result.needsPressing.length,
    clothesWashed: result.washedClothes,
    clothesNeedingPress: result.needsPressing,
    message: await createWashMessage(result)
  };
}

export async function pressSelectedClothes(clothIds) {
  const pressedClothes = await ClothService.markAsPressed(clothIds);
  
  return {
    totalPressed: pressedClothes.length,
    pressedClothes: pressedClothes,
    message: `${pressedClothes.length} item${pressedClothes.length > 1 ? 's' : ''} pressed and ready to wear!`
  };
}

export async function getLaundryStatus() {
  const [dirty, needsPressing] = await Promise.all([
    ClothService.getDirtyClothes(),
    ClothService.getNeedsPressing()
  ]);

  return {
    dirty,
    needsPressing,
    dirtyCount: dirty.length,
    pressingCount: needsPressing.length
  };
}
