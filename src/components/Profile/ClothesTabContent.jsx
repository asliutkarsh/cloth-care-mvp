import React from 'react';
import { Filter, X, Shirt } from 'lucide-react';
import Button from '../common/Button';

export default function ClothesTabContent({
  filteredClothes,
  selectedFilter,
  setSelectedFilter,
  showFilters,
  setShowFilters,
  categories,
}) {
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
        {selectedFilter !== 'all' && (
          <Button
            onClick={() => setSelectedFilter('all')}
            variant="secondary"
            size="sm"
            className="gap-1 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70"
          >
            {selectedFilter}
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
          <Button
            onClick={() => {
              setSelectedFilter('all');
              setShowFilters(false);
            }}
            size="sm"
            variant={selectedFilter === 'all' ? 'primary' : 'secondary'}
            className={selectedFilter === 'all' ? '' : 'bg-white/50 dark:bg-gray-600/50'}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => {
                setSelectedFilter(category.name);
                setShowFilters(false);
              }}
              size="sm"
              variant={selectedFilter === category.name ? 'primary' : 'secondary'}
              className={selectedFilter === category.name ? '' : 'bg-white/50 dark:bg-gray-600/50'}
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}

      {/* Clothes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredClothes.map((cloth) => (
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
              <span className="text-xs text-gray-600 dark:text-gray-400">{cloth.category}</span>
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
    </div>
  );
}
