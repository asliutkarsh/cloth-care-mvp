import { v4 as uuidv4 } from 'uuid';

// ✅ Categories with Subcategories (Minimal for demo)
export const createDefaultCategories = () => {
  const tops = { id: uuidv4(), name: 'Tops', parentId: null, maxWearCount: 1 };
  const bottoms = { id: uuidv4(), name: 'Bottoms', parentId: null, maxWearCount: 2 };
  const footwear = { id: uuidv4(), name: 'Footwear', parentId: null, maxWearCount: 5 };
  const accessories = { id: uuidv4(), name: 'Accessories', parentId: null, maxWearCount: 10 };

  const subcategories = [
    { id: uuidv4(), name: 'Shirts', parentId: tops.id },
    { id: uuidv4(), name: 'T-Shirts', parentId: tops.id },
    { id: uuidv4(), name: 'Trousers', parentId: bottoms.id },
    { id: uuidv4(), name: 'Jeans', parentId: bottoms.id },
  ];

  return [tops, bottoms, footwear, accessories, ...subcategories];
};

// ✅ Minimal Clothing Items for Demo Start (4 items only)
export const createDefaultClothes = (categories) => {
  const getCategory = (name) => categories.find(c => c.name === name);
  const getSub = (name) => categories.find(c => c.name === name);

  return [
    // Essential Items (4 total)
    { name: "White T-Shirt", color: "White", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Blue Jeans", color: "Blue", fabric: "Denim", categoryId: getSub("Jeans").id },
    { name: "White Sneakers", color: "White", fabric: "Canvas", categoryId: getCategory("Footwear").id },
    { name: "Watch", color: "Silver", fabric: "Metal", categoryId: getCategory("Accessories").id },
  ].map(item => ({ ...item, id: uuidv4() }));
};

// ✅ Single Outfit for Demo Start
export const createDefaultOutfits = (clothes) => {
  const find = (name) => clothes.find(c => c.name === name)?.id;

  return [
    {
      id: uuidv4(),
      name: "Casual Day",
      description: "Simple everyday outfit",
      clothIds: [
        find("White T-Shirt"),
        find("Blue Jeans"),
        find("White Sneakers"),
      ].filter(Boolean),
      occasion: "Casual",
      favorite: true,
    },
  ];
};
