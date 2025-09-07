// services/defaultValues.js
import { v4 as uuidv4 } from 'uuid';

// ✅ Demo Categories
export const createDefaultCategories = () => {
  const tops = { id: uuidv4(), name: 'Tops', parentId: null, maxWearCount: 1 };
  const bottoms = { id: uuidv4(), name: 'Bottoms', parentId: null, maxWearCount: 2 };
  const footwear = { id: uuidv4(), name: 'Footwear', parentId: null, maxWearCount: 5 };
  return [tops, bottoms, footwear];
};

// ✅ Demo Clothes
export const createDefaultClothes = (categories) => {
  // Assumes categories are in order: Tops, Bottoms, Footwear
  const [tops, bottoms, footwear] = categories;
  return [
    {
      id: uuidv4(),
      name: "White T-Shirt",
      categoryId: tops.id,
      color: "White",
      fabric: "Cotton",
    },
    {
      id: uuidv4(),
      name: "Blue Jeans",
      categoryId: bottoms.id,
      color: "Blue",
      fabric: "Denim",
    },
    {
      id: uuidv4(),
      name: "White Sneakers",
      categoryId: footwear.id,
      color: "White",
      fabric: "Canvas",
    },
  ];
};

// ✅ Demo Outfits
export const createDefaultOutfits = (clothes) => {
  // Assumes all three default clothes are passed in
  return [
    {
      id: uuidv4(),
      name: "Casual Day Out",
      description: "Simple and comfortable for everyday wear",
      clothIds: clothes.map(c => c.id), // Link to all default clothes
      occasion: "Casual",
    },
  ];
};