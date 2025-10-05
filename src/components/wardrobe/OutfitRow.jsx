import React from 'react'
import { Layers, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWardrobeStore } from '../../stores/useWardrobeStore'

export default function OutfitRow({ outfit }) {
  const { updateOutfit } = useWardrobeStore()
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/wardrobe/outfit/${outfit.id}`)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className="w-full grid grid-cols-[56px_1fr_auto] items-center gap-3 px-3 py-2 rounded-lg border border-coolgray-500/30 dark:border-coolgray-700/40 bg-white/80 dark:bg-gray-800/80 backdrop-blur hover-highlight text-left"
    >
      <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-50 dark:bg-gray-900/70 flex items-center justify-center border border-black/5 dark:border-white/5">
        <Layers size={24} className="text-gray-500 dark:text-gray-300" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate text-gray-900 dark:text-gray-100">{outfit.name}</h4>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
          {(outfit.clothIds?.length || 0)} {(outfit.clothIds?.length === 1 ? 'item' : 'items')}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-1 rounded-full bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-white/10 shadow hover-highlight"
          onClick={(e) => {
            e.stopPropagation()
            updateOutfit(outfit.id, { favorite: !outfit.favorite })
          }}
          aria-label={outfit.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${outfit.favorite ? 'fill-current text-red-500' : 'text-gray-500 dark:text-gray-300'}`} />
        </button>
      </div>
    </motion.button>
  )
}