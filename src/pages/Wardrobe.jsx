import React, { useState, useEffect, useCallback } from 'react';
import { Filter, X, Shirt, Plus, Search } from 'lucide-react';
import Button from '../components/common/Button';
import AddClothModal from '../components/AddClothModal';
import * as CategoryService from '../services/categoryService';
import * as FilterService from '../services/filterService';
import * as ClothService from '../services/clothService';

export default function Wardrobe() {
  const [clothes, setClothes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    categoryIds: [],
    searchTerm: ''
  });

  const applyFilters = useCallback(async () => {
    try {
      const filteredClothes = await FilterService.filterClothes(filters);
      setClothes(Array.isArray(filteredClothes) ? filteredClothes : []);
    } catch (error) {
      console.error('Error applying filters:', error);
      setClothes([]);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await CategoryService.getAll();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    };

    loadCategories();
    applyFilters();
  }, [applyFilters]);

  const addCloth = (cloth) => {
    ClothService.create(cloth);
    applyFilters(); // Re-fetch and apply filters
  };

  const handleCategoryFilter = (categoryId) => {
    setFilters(prev => ({ ...prev, categoryIds: [categoryId] }));
    setShowFilters(false);
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status: [status] }));
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ status: [], categoryIds: [], searchTerm: '' });
    setShowSearch(false);
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const getActiveCategoryName = () => {
    if (filters.categoryIds.length > 0) {
      const category = categories.find(cat => cat.id === filters.categoryIds[0]);
      return category?.name;
    }
    return null;
  };

  const getActiveStatusName = () => {
    if (filters.status.length > 0) {
      const statusMap = {
        clean: 'Clean',
        dirty: 'Dirty',
        needs_pressing: 'Needs Pressing'
      };
      return statusMap[filters.status[0]];
    }
    return null;
  };

  const hasActiveFilters = filters.categoryIds.length > 0 || filters.status.length > 0 || filters.searchTerm;

  return (
    <div className="space-y-4">
      {/* Search Bar - Mobile First */}
      {showSearch && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search clothes..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <Button
            onClick={() => setShowSearch(false)}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>
      )}


      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {!showSearch && (
          <Button
            onClick={() => setShowSearch(true)}
            variant="secondary"
            size="sm"
            className="gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600"
          >
            <Search size={16} />
            <span className="text-sm">Search</span>
          </Button>
        )}

        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          size="sm"
          className="gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600"
        >
          <Filter size={16} />
          <span className="text-sm">Filter</span>
        </Button>

        {/* Active Filters */}
        {getActiveCategoryName() && (
          <Button
            onClick={() => setFilters(prev => ({ ...prev, categoryIds: [] }))}
            variant="secondary"
            size="sm"
            className="gap-1 bg-blue-100/10 border border-blue-500/30 text-blue-300 hover:bg-blue-100/20"
          >
            {getActiveCategoryName()}
            <X size={14} />
          </Button>
        )}

        {getActiveStatusName() && (
          <Button
            onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
            variant="secondary"
            size="sm"
            className="gap-1 bg-green-100/10 border border-green-500/30 text-green-300 hover:bg-green-100/20"
          >
            {getActiveStatusName()}
            <X size={14} />
          </Button>
        )}

        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="secondary"
            size="sm"
            className="text-red-300 hover:text-red-200 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFilters(prev => ({ ...prev, categoryIds: [] }))}
                size="sm"
                variant={filters.categoryIds.length === 0 ? 'primary' : 'secondary'}
                className={filters.categoryIds.length === 0 ? 'bg-blue-600' : 'bg-gray-600/50'}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  size="sm"
                  variant={filters.categoryIds.includes(category.id) ? 'primary' : 'secondary'}
                  className={filters.categoryIds.includes(category.id) ? 'bg-blue-600' : 'bg-gray-600/50'}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Status</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
                size="sm"
                variant={filters.status.length === 0 ? 'primary' : 'secondary'}
                className={filters.status.length === 0 ? 'bg-green-600' : 'bg-gray-600/50'}
              >
                All
              </Button>
              <Button
                onClick={() => handleStatusFilter('clean')}
                size="sm"
                variant={filters.status.includes('clean') ? 'primary' : 'secondary'}
                className={filters.status.includes('clean') ? 'bg-green-600' : 'bg-gray-600/50'}
              >
                Clean
              </Button>
              <Button
                onClick={() => handleStatusFilter('dirty')}
                size="sm"
                variant={filters.status.includes('dirty') ? 'primary' : 'secondary'}
                className={filters.status.includes('dirty') ? 'bg-orange-600' : 'bg-gray-600/50'}
              >
                Dirty
              </Button>
              <Button
                onClick={() => handleStatusFilter('needs_pressing')}
                size="sm"
                variant={filters.status.includes('needs_pressing') ? 'primary' : 'secondary'}
                className={filters.status.includes('needs_pressing') ? 'bg-purple-600' : 'bg-gray-600/50'}
              >
                Needs Pressing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clothes Grid - Mobile optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {clothes.map((cloth) => (
          <div
            key={cloth.id}
            className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-600/40 transition-all duration-200 cursor-pointer border border-gray-600/30"
          >
            {/* Image */}
            <div className="aspect-square bg-gray-600 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
              {cloth.image ? (
                <img
                  src={cloth.image}
                  alt={cloth.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Shirt size={24} className="text-gray-400" />
              )}
            </div>

            {/* Name */}
            <div className="text-sm font-medium text-white truncate mb-1">
              {cloth.name}
            </div>

            {/* Category and Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 truncate">
                {categories.find(cat => cat.id === cloth.categoryId)?.name || 'Unknown'}
              </span>
              <span
                className={`px-2 py-1 rounded-full font-medium ${cloth.status === 'clean'
                    ? 'bg-green-900/40 text-green-300 border border-green-500/30'
                    : cloth.status === 'dirty'
                      ? 'bg-orange-900/40 text-orange-300 border border-orange-500/30'
                      : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                  }`}
              >
                {cloth.status === 'needs_pressing' ? 'Press' : cloth.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {clothes.length === 0 && (
        <div className="text-center py-12">
          <Shirt size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            {hasActiveFilters ? 'No clothes match your filters.' : 'No clothes found. Add one to get started!'}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="secondary" size="sm">
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      <AddClothModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={(item) => {
          addCloth(item);
          setOpenAdd(false);
        }}
      />
    </div>
  );
}