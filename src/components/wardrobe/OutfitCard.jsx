import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layers, Heart } from 'lucide-react'
import { useWardrobeStore } from '../../stores/useWardrobeStore'

export default function OutfitCard({ outfit }) {
  const navigate = useNavigate()
  const { updateOutfit } = useWardrobeStore()

  return (
    <motion.button
      onClick={() => navigate(`/wardrobe/outfit/${outfit.id}`)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="text-left w-full rounded-xl shadow-md overflow-hidden card-gradient backdrop-blur border border-white/20 dark:border-white/10 transition-all group"
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-900/70 flex items-center justify-center border-b border-black/5 dark:border-white/5">
        {/* Future collage or preview images */}
        <Layers size={48} className="text-gray-500 dark:text-gray-300" />
        <button
          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-white/10 shadow hover-highlight"
          onClick={(e) => {
            e.stopPropagation();
            updateOutfit(outfit.id, { favorite: !outfit.favorite })
          }}
          aria-label={outfit.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${outfit.favorite ? 'fill-current text-red-500' : 'text-gray-500 dark:text-gray-300'}`} />
        </button>
      </div>

      <div className="p-3 space-y-1">
        <h4 className="font-semibold truncate text-gray-900 dark:text-gray-100">{outfit.name}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {outfit.clothIds?.length || 0} {outfit.clothIds?.length === 1 ? 'item' : 'items'}
        </p>
      </div>
    </motion.button>
  )
}
