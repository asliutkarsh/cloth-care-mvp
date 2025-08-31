import { useState, useEffect } from "react";
import ClothCard from "../components/ClothCard";
import AddClothModal from "../components/AddClothModal";
import AnimatedPage from "../components/AnimatedPage";

export default function Wardrobe() {
  const [clothes, setClothes] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("clothes")) || [];
    setClothes(saved);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("clothes", JSON.stringify(clothes));
  }, [clothes]);

  const addCloth = (cloth) => {
    setClothes([...clothes, { ...cloth, id: Date.now(), status: "clean" }]);
  };

  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold dark:text-white">Your Wardrobe</h2>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.99] transition"
            onClick={() => setOpenAdd(true)}
          >
            Add Item
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clothes.map((cloth) => (
            <ClothCard key={cloth.id} cloth={cloth} />
          ))}
        </div>
      </div>

      <AddClothModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={(item) => {
          addCloth(item);
          setOpenAdd(false);
        }}
      />
    </AnimatedPage>
  );
}
