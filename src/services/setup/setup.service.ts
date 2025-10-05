import { CategoryService } from '../crud/category.service';
import { ClothService } from '../crud/cloth.service';
import { OutfitService } from '../crud/outfit.service';
import { StorageService } from './storage.service';
import { Cloth } from '../model/cloth.model';
import {
  createDefaultCategories,
  createDefaultClothes,
  createDefaultOutfits,
  createDefaultEssentials,
} from './defaultValues';
import { EssentialsService } from '../crud/essentials.service';

export const SetupService = {
  /**
   * Checks if the database is empty and seeds it with default data if needed.
   */
  async initialize(): Promise<boolean> {
    const categories = await CategoryService.getAll();
    // If there are no categories, assume it's a fresh install
    if (categories.length === 0) {
      console.log("First time setup: Seeding database with default data...");

      // 1. Create Categories
      const defaultCategories = createDefaultCategories();
      for (const cat of defaultCategories) {
        // We'll use addCategory for all, assuming they are top-level
        await CategoryService.addCategory(cat);
      }

      // 3. Create Outfits, linked to the new clothes
      const defaultClothesData = createDefaultClothes(defaultCategories);
      for (const clothData of defaultClothesData) {
        await ClothService.add(clothData);
      }

      // Get the created clothes for outfit creation
      const createdClothes: Cloth[] = await ClothService.getAll();
      const defaultOutfits = createDefaultOutfits(createdClothes);
      for (const outfit of defaultOutfits) {
        await OutfitService.add(outfit);
      }

      const defaultEssentials = createDefaultEssentials();
      await EssentialsService.replaceAll(defaultEssentials);

      console.log("Database seeded successfully!");
      return true; // Indicates that setup was run
    }
    console.log("Existing data found. Skipping setup.");
    return false; // Indicates setup was not needed
  },

  /**
   * Wipes all data and re-initializes the application.
   * A destructive action, typically for development purposes.
   */
  async resetApp(isLogout = false): Promise<boolean> {
    console.warn("Resetting application: All data will be lost.");
    if (!isLogout) {
      // Clear all data except user data
      const tables = Object.values(StorageService.KEYS).filter((key) => key !== StorageService.KEYS.USER);
      await Promise.all(tables.map((table) => StorageService.clear(table)));
    } else {
      // Clear everything including user data
      await Promise.all(Object.values(StorageService.KEYS).map((table) => StorageService.clear(table)));
    }
    return this.initialize();
  }
};
