import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';

// A single filter group (e.g., "Status", "Category")
const FilterGroup = ({ title, children }) => (
  <div className="py-4 border-b border-gray-200 dark:border-gray-700">
    <h4 className="font-semibold mb-3 px-4">{title}</h4>
    <div className="space-y-1 px-2">{children}</div>
  </div>
);

// A single filter option (e.g., "Clean", "Tops")
const FilterOption = ({ label, count, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex justify-between items-center text-left p-2 rounded-md transition-colors ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
  >
    <span>{label}</span>
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{count}</span>
  </button>
);


export default function FilterPanel({
  isOpen,
  onClose,
  clothes,
  categories,
  currentFilters,
  onFilterChange,
}) {
  const statusOptions = ['clean', 'dirty', 'needs_pressing'];

  const handleStatusToggle = (status) => {
    const newStatus = currentFilters.status.includes(status)
      ? currentFilters.status.filter(s => s !== status)
      : [...currentFilters.status, status];
    onFilterChange({ ...currentFilters, status: newStatus });
  };
  
  const handleCategorySelect = (categoryId) => {
    const newCategoryId = currentFilters.categoryId === categoryId ? null : categoryId;
    onFilterChange({ ...currentFilters, categoryId: newCategoryId });
  };

  return (
    <aside className={`fixed top-0 right-0 z-40 w-72 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:w-64 md:flex-shrink-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold">Filters</h3>
        <Button onClick={onClose} variant="ghost" size="icon" className="md:hidden">
          <X size={20} />
        </Button>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        <FilterGroup title="Status">
          {statusOptions.map(status => (
            <FilterOption
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              count={clothes.filter(c => c.status === status).length}
              isSelected={currentFilters.status.includes(status)}
              onClick={() => handleStatusToggle(status)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Category">
          {categories.map(cat => (
            <FilterOption
              key={cat.id}
              label={cat.name}
              count={clothes.filter(c => c.categoryId === cat.id).length}
              isSelected={currentFilters.categoryId === cat.id}
              onClick={() => handleCategorySelect(cat.id)}
            />
          ))}
        </FilterGroup>
      </div>
    </aside>
  );
}