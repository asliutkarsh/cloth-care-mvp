import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shirt, Heart } from 'lucide-react'
import { useWardrobeStore } from '../../stores/useWardrobeStore'

export default function ClothCard({ cloth, isSelectMode = false, selected = false, onSelectToggle }) {
  const navigate = useNavigate()
  const { categories = [], updateCloth } = useWardrobeStore()
  const longPressTimer = useRef(null)
  const longPressedRef = useRef(false)

  const statusMap = {
    clean: { tagClass: 'tag-clean', ringClass: 'status-ring-clean', label: 'Clean' },
    dirty: { tagClass: 'tag-dirty', ringClass: 'status-ring-dirty', label: 'Dirty' },
    needs_pressing: { tagClass: 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/30 rounded-full px-2 py-0.5 text-xs font-medium', ringClass: 'status-ring-new', label: 'Needs Pressing' },
  }

  const status = statusMap[cloth.status] || { tagClass: 'tag', ringClass: '', label: 'Unknown' }

  const handleClick = () => {
    if (longPressedRef.current) {
      // If a long-press just triggered selection, swallow this click
      longPressedRef.current = false
      return
    }
    if (isSelectMode) {
      onSelectToggle?.(cloth.id)
    } else {
      navigate(`/wardrobe/cloth/${cloth.id}`)
    }
  }

  const startLongPress = () => {
    longPressedRef.current = false
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = setTimeout(() => {
      longPressedRef.current = true
      onSelectToggle?.(cloth.id)
    }, 700) // 0.7s long press
  }

  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  return (
    <motion.button
      onClick={handleClick}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={(e) => {
        // if long-pressed, prevent the click navigation
        cancelLongPress()
        if (longPressedRef.current) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`relative text-left w-full rounded-xl shadow-md overflow-hidden card-gradient backdrop-blur border border-white/20 dark:border-white/10 transition-all group ${selected ? 'ring-2 ring-primary-deep' : ''}`}
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-900/70 flex items-center justify-center border-b border-black/5 dark:border-white/5">
        {cloth.image ? (
          <img
            src={cloth.image}
            alt={cloth.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 w-full h-full p-4">
            {/* Color swatch */}
            <div className={`status-ring ${status.ringClass}`}>
              <div
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: cloth.color || '#e5e7eb' }}
                aria-label="Color swatch"
                title={cloth.color || 'No color'}
              />
            </div>
            {/* Category icon: fallback to Shirt */}
            <Shirt size={28} className="text-gray-500 dark:text-gray-300" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={status.tagClass}>{status.label}</span>
        </div>

        {/* Favorite toggle */}
        <button
          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-white/10 shadow hover-highlight"
          onClick={(e) => {
            e.stopPropagation();
            updateCloth(cloth.id, { favorite: !cloth.favorite });
          }}
          aria-label={cloth.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${cloth.favorite ? 'fill-current text-red-500' : 'text-gray-500 dark:text-gray-300'}`} />
        </button>

        {/* Selection checkbox overlay */}
        {isSelectMode && (
          <div className="absolute top-2 right-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelectToggle?.(cloth.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5"
            />
          </div>
        )}
      </div>

      <div className="p-3 space-y-1">
        <h4 className="font-semibold truncate text-gray-900 dark:text-gray-100">{cloth.name}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Worn {cloth.currentWearCount ?? 0} {cloth.currentWearCount === 1 ? 'time' : 'times'}
        </p>
      </div>

      {/* Category badge (top-right overlay) */}
      {(() => {
        const cat = categories.find((c) => c.id === cloth.categoryId)
        if (!cat) return null
        const icon = cat.icon || '👕'
        return (
          <div className="absolute top-2 right-2 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 shadow-sm">
              <span className="text-base leading-none">{icon}</span>
              <span className="leading-none max-w-[8rem] truncate">{cat.name}</span>
            </span>
          </div>
        )
      })()}
    </motion.button>
  )
}
