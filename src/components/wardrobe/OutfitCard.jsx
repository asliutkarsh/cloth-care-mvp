import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWardrobeStore } from '../../stores/useWardrobeStore'
import MiniOutfitVisualizer from './MiniOutfitVisualizer'

function OutfitCard({ outfit }) {
  const navigate = useNavigate()
  const { updateOutfit } = useWardrobeStore()

  return (
    <motion.div
      onClick={() => navigate(`/wardrobe/outfit/${outfit.id}`)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="text-left w-full rounded-xl shadow-md overflow-hidden card-gradient backdrop-blur border border-white/20 dark:border-white/10 transition-all group"
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-900/70 overflow-hidden border-b border-black/5 dark:border-white/5">
        <AnimatePresence mode="wait">
          <motion.div 
            key={outfit.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <MiniOutfitVisualizer 
              clothIds={outfit.clothIds || []} 
              className="w-full h-full"
            />
          </motion.div>
        </AnimatePresence>
        
        <motion.button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-white/10 shadow-md hover:shadow-lg backdrop-blur-sm transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            updateOutfit(outfit.id, { favorite: !outfit.favorite });
          }}
          aria-label={outfit.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${outfit.favorite ? 'fill-current text-red-500' : 'text-gray-500 dark:text-gray-300'}`} 
          />
        </motion.button>
        
        {outfit.clothIds?.length > 4 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            +{outfit.clothIds.length - 4}
          </div>
        )}
      </div>

      <div className="p-3 space-y-1">
        <h4 className="font-semibold truncate text-gray-900 dark:text-gray-100">{outfit.name}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {outfit.clothIds?.length || 0} {outfit.clothIds?.length === 1 ? 'item' : 'items'}
        </p>
      </div>
    </motion.div>
  )
}

// Performance optimization: Only re-render if outfit changes
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.outfit?.id === nextProps.outfit?.id &&
    // Deep compare outfit object
    JSON.stringify(prevProps.outfit) === JSON.stringify(nextProps.outfit)
  );
};

export default React.memo(OutfitCard, areEqual);
