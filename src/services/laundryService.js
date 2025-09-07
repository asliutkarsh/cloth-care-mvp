// services/laundryService.js
import { ClothService } from "./clothService.js";

export const LaundryService = {
  /**
   * Washes a list of dirty clothes, updating their status accordingly.
   * @param {string[]} clothIds - An array of cloth IDs to be washed.
   * @returns {object} A summary of the operation.
   */
  async washClothes(clothIds) {
    const washedClothes = [];
    const needsPressing = [];

    for (const clothId of clothIds) {
      const cloth = await ClothService.getById(clothId);
      if (cloth && cloth.status === ClothService.STATUSES.DIRTY) {
        const newStatus = cloth.requiresPressing
          ? ClothService.STATUSES.NEEDS_PRESSING
          : ClothService.STATUSES.CLEAN;

        const updatedCloth = await ClothService.update(clothId, {
          currentWearCount: 0,
          status: newStatus,
        });

        if (updatedCloth) {
          washedClothes.push(updatedCloth);
          if (updatedCloth.status === ClothService.STATUSES.NEEDS_PRESSING) {
            needsPressing.push(updatedCloth);
          }
        }
      }
    }

    return {
      totalWashed: washedClothes.length,
      needsPressingCount: needsPressing.length,
      washedClothes,
      needsPressing,
    };
  },

  /**
   * Marks a list of clothes as pressed, changing their status to clean.
   * @param {string[]} clothIds - An array of cloth IDs to be pressed.
   * @returns {object} A summary of the operation.
   */
  async pressClothes(clothIds) {
    const pressedClothes = [];
    for (const clothId of clothIds) {
      const cloth = await ClothService.getById(clothId);
      if (cloth && cloth.status === ClothService.STATUSES.NEEDS_PRESSING) {
        const updatedCloth = await ClothService.update(clothId, {
          status: ClothService.STATUSES.CLEAN,
        });
        if (updatedCloth) {
          pressedClothes.push(updatedCloth);
        }
      }
    }
    return {
      totalPressed: pressedClothes.length,
      pressedClothes,
    };
  },

  /**
   * Gets the current counts and lists of clothes needing laundry services.
   */
  async getLaundryStatus() {
    const dirty = await ClothService.getDirtyClothes();
    const needsPressing = await ClothService.getNeedsPressing();
    return {
      dirty,
      needsPressing,
      dirtyCount: dirty.length,
      pressingCount: needsPressing.length,
    };
  },
};