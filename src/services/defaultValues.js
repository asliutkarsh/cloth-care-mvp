import { v4 as uuidv4 } from 'uuid';

// ✅ Categories with Subcategories
export const createDefaultCategories = () => {
  const tops = { id: uuidv4(), name: 'Tops', parentId: null, maxWearCount: 1 };
  const bottoms = { id: uuidv4(), name: 'Bottoms', parentId: null, maxWearCount: 2 };
  const footwear = { id: uuidv4(), name: 'Footwear', parentId: null, maxWearCount: 5 };
  const accessories = { id: uuidv4(), name: 'Accessories', parentId: null, maxWearCount: 10 };

  const subcategories = [
    { id: uuidv4(), name: 'Shirts', parentId: tops.id },
    { id: uuidv4(), name: 'T-Shirts', parentId: tops.id },
    { id: uuidv4(), name: 'Sweaters & Jackets', parentId: tops.id },

    { id: uuidv4(), name: 'Chinos', parentId: bottoms.id },
    { id: uuidv4(), name: 'Trousers/Pants', parentId: bottoms.id },
    { id: uuidv4(), name: 'Jeans', parentId: bottoms.id },
  ];

  return [tops, bottoms, footwear, accessories, ...subcategories];
};

// ✅ Clothing Items from User List
export const createDefaultClothes = (categories) => {
  const getCategory = (name) => categories.find(c => c.name === name);
  const getSub = (name) => categories.find(c => c.name === name);

  return [
    // Shirts
    { name: "Black shirt", color: "Black", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Powder blue shirt", color: "Powder blue", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Light blue & white striped shirt", color: "Light blue/white", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Blue denim shirt", color: "Blue", fabric: "Denim", categoryId: getSub("Shirts").id },
    { name: "Light grey denim jacket", color: "Light grey", fabric: "Denim", categoryId: getSub("Shirts").id },
    { name: "Pale olive green shirt", color: "Olive green", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "White shirt", color: "White", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Charcoal grey shirt", color: "Charcoal grey", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Ribbed beige-brown shirt", color: "Beige-brown", fabric: "Ribbed Cotton", categoryId: getSub("Shirts").id },
    { name: "Dark green shirt", color: "Dark green", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Dark blue shirt", color: "Dark blue", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Dark blue shirt with white stripes", color: "Blue/White", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Steel blue checked shirt", color: "Steel blue", fabric: "Cotton", categoryId: getSub("Shirts").id },
    { name: "Red & blue striped shirt", color: "Red/Blue", fabric: "Cotton", categoryId: getSub("Shirts").id },

    // T-Shirts
    { name: "White T-shirt", color: "White", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Black T-shirt", color: "Black", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Brown T-shirt", color: "Brown", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Olive polo tee", color: "Olive", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "White graphic tee", color: "White", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Light pink graphic tee", color: "Light pink", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Beige graphic tee", color: "Beige", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Darker red graphic tee", color: "Red", fabric: "Cotton", categoryId: getSub("T-Shirts").id },
    { name: "Parrot green graphic tee", color: "Green", fabric: "Cotton", categoryId: getSub("T-Shirts").id },

    // Sweaters & Jackets
    { name: "Light blue sweater", color: "Light blue", fabric: "Wool", categoryId: getSub("Sweaters & Jackets").id },
    { name: "Olive-beige sweater", color: "Olive-beige", fabric: "Wool", categoryId: getSub("Sweaters & Jackets").id },
    { name: "Dark green sweater", color: "Dark green", fabric: "Wool", categoryId: getSub("Sweaters & Jackets").id },
    { name: "Dark blue hoodie (Vegeta)", color: "Dark blue", fabric: "Cotton", categoryId: getSub("Sweaters & Jackets").id },
    { name: "Grey Tokyo Ghoul hoodie", color: "Grey", fabric: "Cotton", categoryId: getSub("Sweaters & Jackets").id },
    { name: "Turtleneck", color: "Beige", fabric: "Wool", categoryId: getSub("Sweaters & Jackets").id },
    { name: "Light navy blue puffer jacket", color: "Navy", fabric: "Polyester", categoryId: getSub("Sweaters & Jackets").id },
    { name: "White creamish sweater", color: "White/Cream", fabric: "Wool", categoryId: getSub("Sweaters & Jackets").id },

    // Chinos
    { name: "Black chinos", color: "Black", fabric: "Cotton", categoryId: getSub("Chinos").id },
    { name: "Khaki chinos", color: "Khaki", fabric: "Cotton", categoryId: getSub("Chinos").id },
    { name: "Beige chinos", color: "Beige", fabric: "Cotton", categoryId: getSub("Chinos").id },

    // Trousers/Pants
    { name: "Navy blue trousers", color: "Navy", fabric: "Polyester", categoryId: getSub("Trousers/Pants").id },
    { name: "Charcoal grey pants", color: "Charcoal grey", fabric: "Wool", categoryId: getSub("Trousers/Pants").id },
    { name: "Dark blue trousers", color: "Dark blue", fabric: "Wool", categoryId: getSub("Trousers/Pants").id },
    { name: "Black pants (older)", color: "Black", fabric: "Cotton", categoryId: getSub("Trousers/Pants").id },

    // Jeans
    { name: "Blue jeans", color: "Blue", fabric: "Denim", categoryId: getSub("Jeans").id },
    { name: "Light grey jeans", color: "Light grey", fabric: "Denim", categoryId: getSub("Jeans").id },
    { name: "Faded green jeans (older)", color: "Green", fabric: "Denim", categoryId: getSub("Jeans").id },

    // Footwear
    { name: "White sneakers", color: "White", fabric: "Canvas", categoryId: getCategory("Footwear").id },
    { name: "Brown Oxford shoes", color: "Brown", fabric: "Leather", categoryId: getCategory("Footwear").id },
    { name: "Grey sports shoes", color: "Grey", fabric: "Mesh", categoryId: getCategory("Footwear").id },

    // Accessories
    { name: "Stainless steel watch", color: "Silver", fabric: "Metal", categoryId: getCategory("Accessories").id },
    { name: "Casio Tiffany-blue watch", color: "Tiffany Blue", fabric: "Rubber/Plastic", categoryId: getCategory("Accessories").id },
  ].map(item => ({ ...item, id: uuidv4() }));
};
export const createDefaultOutfits = (clothes) => {
  const find = (name) => clothes.find(c => c.name === name)?.id;

  return [
    {
      id: uuidv4(),
      name: "Smart Casual Friday",
      description: "A clean and sharp look perfect for casual office days.",
      clothIds: [
        find("White shirt"),
        find("Khaki chinos"),
        find("Brown Oxford shoes"),
        find("Stainless steel watch"),
      ].filter(Boolean),
      occasion: "Smart Casual",
      favorite: true,
    },
    {
      id: uuidv4(),
      name: "Streetwear Chill",
      description: "Comfy, stylish outfit for hanging out or quick errands.",
      clothIds: [
        find("Black T-shirt"),
        find("Light grey jeans"),
        find("White sneakers"),
        find("Dark blue hoodie (Vegeta)"),
      ].filter(Boolean),
      occasion: "Streetwear",
    },
    {
      id: uuidv4(),
      name: "Gym Ready",
      description: "Light, breathable gear perfect for a workout.",
      clothIds: [
        find("Light pink graphic tee"),
        find("Grey sports shoes"),
        find("Casio Tiffany-blue watch"),
      ].filter(Boolean),
      occasion: "Workout",
    },
    {
      id: uuidv4(),
      name: "Weekend Coffee Date",
      description: "Soft earth tones and a cozy vibe for a relaxed day out.",
      clothIds: [
        find("Ribbed beige-brown shirt"),
        find("Beige chinos"),
        find("White creamish sweater"),
        find("Brown Oxford shoes"),
      ].filter(Boolean),
      occasion: "Casual",
    },
    {
      id: uuidv4(),
      name: "Winter Night Out",
      description: "Warm, layered outfit with a clean navy tone.",
      clothIds: [
        find("Charcoal grey shirt"),
        find("Dark blue trousers"),
        find("Light navy blue puffer jacket"),
        find("Black pants (older)"),
        find("Grey sports shoes"),
      ].filter(Boolean),
      occasion: "Evening",
    },
    {
      id: uuidv4(),
      name: "Creative Casual",
      description: "Mix of colors and comfort, good for casual creative workspaces.",
      clothIds: [
        find("Parrot green graphic tee"),
        find("Blue jeans"),
        find("White sneakers"),
        find("Olive-beige sweater"),
      ].filter(Boolean),
      occasion: "Creative Work",
    },
    {
      id: uuidv4(),
      name: "Minimalist Day Out",
      description: "Classic monochrome with a modern twist.",
      clothIds: [
        find("Black shirt"),
        find("Charcoal grey pants"),
        find("White sneakers"),
      ].filter(Boolean),
      occasion: "Everyday",
      favorite: true,
    },
  ];
};
