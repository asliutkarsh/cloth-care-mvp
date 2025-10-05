import { ClothService } from '../crud/cloth.service';
import { WashHistoryService } from '../crud/wash-history.service';
import { Cloth } from '../model/cloth.model';

interface WashResult {
  totalWashed: number;
  needsPressingCount: number;
  washedClothes: Cloth[];
  needsPressing: Cloth[];
}

interface PressResult {
  totalPressed: number;
  pressedClothes: Cloth[];
}

interface MarkDirtyResult {
  totalMarked: number;
  marked: Cloth[];
}

interface LaundryStatus {
  dirty: Cloth[];
  needsPressing: Cloth[];
  dirtyCount: number;
  pressingCount: number;
}

export const LaundryService = {
  /**
   * Washes a list of dirty clothes, updating their status accordingly.
   */
  async washClothes(clothIds: string[]): Promise<WashResult> {
    const washedClothes: Cloth[] = [];
    const needsPressing: Cloth[] = [];

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

          try {
            await WashHistoryService.logEvent(clothId, 'wash');
          } catch (error) {
            console.warn(`Failed to log wash event for cloth ${clothId}`, error);
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
   */
  async pressClothes(clothIds: string[]): Promise<PressResult> {
    const pressedClothes: Cloth[] = [];
    for (const clothId of clothIds) {
      const cloth = await ClothService.getById(clothId);
      if (cloth && cloth.status === ClothService.STATUSES.NEEDS_PRESSING) {
        const updatedCloth = await ClothService.update(clothId, {
          status: ClothService.STATUSES.CLEAN,
        });
        if (updatedCloth) {
          pressedClothes.push(updatedCloth);

          try {
            await WashHistoryService.logEvent(clothId, 'press');
          } catch (error) {
            console.warn(`Failed to log press event for cloth ${clothId}`, error);
          }
        }
      }
    }
    return {
      totalPressed: pressedClothes.length,
      pressedClothes,
    };
  },

  async markDirty(clothIds: string[]): Promise<MarkDirtyResult> {
    const marked: Cloth[] = [];
    for (const clothId of clothIds) {
      const cloth = await ClothService.getById(clothId);
      if (cloth && cloth.status !== ClothService.STATUSES.DIRTY) {
        const updated = await ClothService.update(clothId, {
          status: ClothService.STATUSES.DIRTY,
        });
        if (updated) {
          marked.push(updated);
        }
      }
    }
    return {
      totalMarked: marked.length,
      marked,
    };
  },

  /**
   * Gets the current counts and lists of clothes needing laundry services.
   */
  async getLaundryStatus(): Promise<LaundryStatus> {
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
