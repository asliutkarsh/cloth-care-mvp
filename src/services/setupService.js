// services/setupService.js
import { CategoryService } from "./categoryService.js";
import { ClothService } from "./clothService.js";
import { OutfitService } from "./outfitService.js";
import { StorageService } from './storageService.js';
import {
  createDefaultCategories,
  createDefaultClothes,
  createDefaultOutfits,
} from "./defaultValues.js";

export const SetupService = {
  /**
   * Checks if the database is empty and seeds it with default data if needed.
   */
  async initialize() {
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

      // 2. Create Clothes, linked to the new categories
      const defaultClothes = createDefaultClothes(defaultCategories);
      for (const cloth of defaultClothes) {
        await ClothService.add(cloth);
      }

      // 3. Create Outfits, linked to the new clothes
      const defaultOutfits = createDefaultOutfits(defaultClothes);
      for (const outfit of defaultOutfits) {
        await OutfitService.add(outfit);
      }

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
  async resetApp(isLogout = false) {
    console.warn("Resetting application: All data will be lost.");
    if (!isLogout) {
      await StorageService.clearAllExceptUser();
    }else{
      await StorageService.clear();
    }
    return this.initialize();
  }
};