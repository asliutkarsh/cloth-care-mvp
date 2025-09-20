// src/components/wardrobe/ClothRow.jsx
import React from 'react'
import { Shirt, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWardrobeStore } from '../../stores/useWardrobeStore'

export default function ClothRow({ cloth, category, isSelectMode, isSelected, onSelectToggle }) {
  const { updateCloth } = useWardrobeStore()
  const statusMap = {
    clean: { tagClass: 'tag-clean', label: 'Clean' },
    dirty: { tagClass: 'tag-dirty', label: 'Dirty' },
    needs_pressing: { tagClass: 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/30 rounded-full px-2 py-0.5 text-xs font-medium', label: 'Needs Pressing' },
  }
  const status = statusMap[cloth.status] || { tagClass: 'tag', label: 'Unknown' }
  const icon = category?.icon || '👕'

  return (
    <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }} className={`grid grid-cols-[56px_1fr_auto] items-center gap-3 px-3 py-2 rounded-lg border border-coolgray-500/30 dark:border-coolgray-700/40 bg-white/80 dark:bg-gray-800/80 backdrop-blur hover-highlight ${isSelected ? 'ring-2 ring-primary-deep' : ''}`}>
      <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {cloth.image ? (
          <img src={cloth.image} alt={cloth.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate">{cloth.name}</h4>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <span className="leading-none">{icon}</span>
            <span className="leading-none max-w-[10rem] truncate">{category?.name || 'Uncategorized'}</span>
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
          <span>Worn {cloth.currentWearCount ?? 0}</span>
          <span className={status.tagClass}>{status.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-1 rounded-full bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-white/10 shadow hover-highlight"
          onClick={(e) => {
            e.stopPropagation();
            updateCloth(cloth.id, { favorite: !cloth.favorite })
          }}
          aria-label={cloth.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${cloth.favorite ? 'fill-current text-red-500' : 'text-gray-500 dark:text-gray-300'}`} />
        </button>
        {isSelectMode && (
          <input type="checkbox" checked={isSelected} onChange={() => onSelectToggle?.(cloth.id)} />
        )}
      </div>
    </motion.div>
  )
}
