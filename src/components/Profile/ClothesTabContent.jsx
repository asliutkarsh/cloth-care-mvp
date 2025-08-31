import React, { useState, useEffect } from 'react';
import { Filter, X, Shirt } from 'lucide-react';
import Button from '../common/Button';
import { ClothService, CategoryService, FilterService } from '../../services/data';

export default function ClothesTabContent() {
  const [clothes, setClothes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    status: [],
    categoryIds: [],
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const handleCategoryFilter = (categoryId) => {
    setFilters(prev => ({ ...prev, categoryIds: [categoryId] }));
    setShowFilters(false);
  };

  const clearCategoryFilter = () => {
    setFilters(prev => ({ ...prev, categoryIds: [] }));
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <Filter size={16} />
          <span className="text-sm">Filter</span>
        </Button>
        {filters.categoryIds.length > 0 && (
          <Button
            onClick={clearCategoryFilter}
            variant="secondary"
            size="sm"
            className="gap-1 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70"
          >
            {CategoryService.getById(filters.categoryIds[0])?.name}
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
          <Button
            onClick={clearCategoryFilter}
            size="sm"
            variant={filters.categoryIds.length === 0 ? 'primary' : 'secondary'}
            className={filters.categoryIds.length === 0 ? '' : 'bg-white/50 dark:bg-gray-600/50'}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => handleCategoryFilter(category.id)}
              size="sm"
              variant={filters.categoryIds.includes(category.id) ? 'primary' : 'secondary'}
              className={filters.categoryIds.includes(category.id) ? '' : 'bg-white/50 dark:bg-gray-600/50'}
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}

      {/* Clothes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {clothes.map((cloth) => (
          <div
            key={cloth.id}
            className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer"
          >
            <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-2 flex items-center justify-center">
              {cloth.image ? (
                <img src={cloth.image} alt={cloth.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Shirt size={24} className="text-gray-400" />
              )}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{cloth.name}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">{CategoryService.getById(cloth.categoryId)?.name}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  cloth.status === 'clean'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : cloth.status === 'dirty'
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                }`}
              >
                {cloth.status === 'needs_pressing' ? 'Press' : cloth.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {clothes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No clothes found.</p>
        </div>
      )}
    </div>
  );
}
