// src/components/wardrobe/BulkActionBar.jsx
import React from 'react'
import { Trash2, WashingMachine, Layers } from 'lucide-react'

export default function BulkActionBar({ count, onDelete, onAddToLaundry, onCreateOutfit, onCancel }) {
  if (count === 0) return null
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-auto">
      <div className="mx-auto flex items-center gap-2 rounded-xl px-3 py-2 backdrop-blur bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-lg">
        <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">{count} selected</span>
        <button onClick={onAddToLaundry} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
          <WashingMachine size={16} /> Add to Laundry
        </button>
        <button onClick={onCreateOutfit} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
          <Layers size={16} /> Create Outfit
        </button>
        <button onClick={onDelete} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">
          <Trash2 size={16} /> Delete
        </button>
        <button onClick={onCancel} className="ml-auto text-sm px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
      </div>
    </div>
  )
}
