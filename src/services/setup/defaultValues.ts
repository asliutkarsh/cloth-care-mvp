import { v4 as uuidv4 } from 'uuid';
import { Category } from '../model/category.model';
import { Cloth } from '../model/cloth.model';
import { Outfit } from '../model/outfit.model';

// ✅ Categories with Subcategories (Minimal for demo)
export const createDefaultCategories = (): Category[] => {
  const tops = { id: uuidv4(), name: 'Tops', parentId: null, maxWearCount: 1, icon: '👕', createdAt: new Date().toISOString(), isHidden: false };
  const bottoms = { id: uuidv4(), name: 'Bottoms', parentId: null, maxWearCount: 2, icon: '👖', createdAt: new Date().toISOString(), isHidden: false };
  const footwear = { id: uuidv4(), name: 'Footwear', parentId: null, maxWearCount: 5, icon: '👟', createdAt: new Date().toISOString(), isHidden: false };
  const accessories = { id: uuidv4(), name: 'Accessories', parentId: null, maxWearCount: 10, icon: '👜', createdAt: new Date().toISOString(), isHidden: false };

  const subcategories: Category[] = [
    { id: uuidv4(), name: 'Shirts', parentId: tops.id, maxWearCount: 1, icon: '👔', createdAt: new Date().toISOString(), isHidden: false },
    { id: uuidv4(), name: 'T-Shirts', parentId: tops.id, maxWearCount: 1, icon: '👕', createdAt: new Date().toISOString(), isHidden: false },
    { id: uuidv4(), name: 'Trousers', parentId: bottoms.id, maxWearCount: 2, icon: '👖', createdAt: new Date().toISOString(), isHidden: false },
    { id: uuidv4(), name: 'Jeans', parentId: bottoms.id, maxWearCount: 2, icon: '👖', createdAt: new Date().toISOString(), isHidden: false },
  ];

  return [tops, bottoms, footwear, accessories, ...subcategories];
};

// ✅ Minimal Clothing Items for Demo Start (4 items only)
export const createDefaultClothes = (categories: Category[]): Omit<Cloth, 'id'>[] => {
  const getCategory = (name: string): Category | undefined => categories.find(c => c.name === name);
  const getSub = (name: string): Category | undefined => categories.find(c => c.name === name);

  return [
    // Essential Items (4 total)
    { name: "White T-Shirt", color: "White", material: "Cotton", categoryId: getSub("T-Shirts")!.id, status: 'clean', currentWearCount: 0, totalWearCount: 0, createdAt: new Date().toISOString(), images: '', requiresPressing: false, favorite: false, isArchived: false },
    { name: "Blue Jeans", color: "Blue", material: "Denim", categoryId: getSub("Jeans")!.id, status: 'clean', currentWearCount: 0, totalWearCount: 0, createdAt: new Date().toISOString(), images: '', requiresPressing: false, favorite: false, isArchived: false },
    { name: "White Sneakers", color: "White", material: "Canvas", categoryId: getCategory("Footwear")!.id, status: 'clean', currentWearCount: 0, totalWearCount: 0, createdAt: new Date().toISOString(), images: '', requiresPressing: false, favorite: false, isArchived: false },
    { name: "Watch", color: "Silver", material: "Metal", categoryId: getCategory("Accessories")!.id, status: 'clean', currentWearCount: 0, totalWearCount: 0, createdAt: new Date().toISOString(), images: '', requiresPressing: false, favorite: false, isArchived: false },
  ];
};

// ✅ Single Outfit for Demo Start
export const createDefaultOutfits = (clothes: Cloth[]): Omit<Outfit, 'id'>[] => {
  const find = (name: string): string | undefined => clothes.find(c => c.name === name)?.id;

  return [
    {
      name: "Casual Day",
      description: "Simple everyday outfit",
      clothIds: [
        find("White T-Shirt"),
        find("Blue Jeans"),
        find("White Sneakers"),
      ].filter(Boolean) as string[],
      occasion: "casual",
      favorite: true,
      createdAt: new Date().toISOString(),
    },
  ];
};
