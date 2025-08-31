import { useState, useEffect } from "react";

export default function Laundry() {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("clothes")) || [];
    setClothes(saved);
  }, []);

  const markClean = (id) => {
    const updated = clothes.map((c) =>
      c.id === id ? { ...c, status: "clean" } : c
    );
    setClothes(updated);
    localStorage.setItem("clothes", JSON.stringify(updated));
  };

  const markDirty = (id) => {
    const updated = clothes.map((c) =>
      c.id === id ? { ...c, status: "dirty" } : c
    );
    setClothes(updated);
    localStorage.setItem("clothes", JSON.stringify(updated));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Laundry Status</h2>
      <div className="space-y-3">
        {clothes.map((cloth) => (
          <div key={cloth.id} className="bg-white shadow p-3 rounded flex justify-between">
            <div>
              <p className="font-medium">{cloth.name}</p>
              <p className="text-sm text-gray-500">{cloth.type}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => markDirty(cloth.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Dirty
              </button>
              <button
                onClick={() => markClean(cloth.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Clean
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
