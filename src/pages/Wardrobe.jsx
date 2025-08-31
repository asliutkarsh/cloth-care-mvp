import { useState, useEffect } from "react";
import ClothCard from "../components/ClothCard";
import AddClothModal from "../components/AddClothModal";
import AnimatedPage from "../components/AnimatedPage";
import { ClothService, CategoryService, FilterService } from "../services/data";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";

export default function Wardrobe() {
  const [clothes, setClothes] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    status: [],
    categoryIds: [],
    searchTerm: ''
  });

  useEffect(() => {
    setCategories(CategoryService.getAll());
    applyFilters();
  }, []);

  const applyFilters = () => {
    const filteredClothes = FilterService.filterClothes(filters);
    setClothes(filteredClothes);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const addCloth = (cloth) => {
    ClothService.create(cloth);
    applyFilters(); // Re-fetch and apply filters
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Your Wardrobe" />
          <Button onClick={() => setOpenAdd(true)}>
            Add Item
          </Button>
        </div>

        {/* Filter Section */}
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="searchTerm"
              placeholder="Search..."
              value={filters.searchTerm}
              onChange={handleFilterChange}
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            />
            <select 
              name="status" 
              onChange={e => setFilters(prev => ({...prev, status: [e.target.value]}))}
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Statuses</option>
              <option value="clean">Clean</option>
              <option value="dirty">Dirty</option>
              <option value="needs_pressing">Needs Pressing</option>
            </select>
            <select 
              name="categoryIds" 
              onChange={e => setFilters(prev => ({...prev, categoryIds: [e.target.value]}))}
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clothes.map((cloth) => (
            <ClothCard key={cloth.id} cloth={cloth} />
          ))}
        </div>
        {clothes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No clothes found. Add one to get started!</p>
          </div>
        )}
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
