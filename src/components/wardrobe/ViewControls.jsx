// src/components/wardrobe/ViewControls.jsx
import React from 'react'

export default function ViewControls({ viewMode, sortBy, onViewChange, onSortChange, className = '', showViewToggle = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* {showViewToggle && (
        <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''}`}
            onClick={() => onViewChange?.('grid')}
            type="button"
          >
            Grid
          </button>
          <button
            className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''}`}
            onClick={() => onViewChange?.('list')}
            type="button"
          >
            List
          </button>
        </div>
      )}
 */}
      <select
        id='sort-by'
        value={sortBy}
        onChange={(e) => onSortChange?.(e.target.value)}
        className="h-9 px-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="name">Name</option>
        <option value="mostWorn">Most Worn</option>
      </select>
    </div>
  )
}
