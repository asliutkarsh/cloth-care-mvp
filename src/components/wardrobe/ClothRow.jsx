import React, { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import useClothData from '../../hooks/useClothData';
import AnimatedCheckbox from '../ui/AnimatedCheckbox';

function ClothRow({ cloth, isSelectMode = false, isSelected = false, onSelectToggle, categories = [] }) {
  const { updateCloth } = useWardrobeStore();
  const navigate = useNavigate();

  const { status, categoryName, colorValue } = useClothData(cloth, categories);

  const handleClick = () => {
    if (isSelectMode) {
      onSelectToggle?.(cloth.id);
    } else {
      navigate(`/wardrobe/cloth/${cloth.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={handleClick}
      className={`relative w-full flex items-center gap-4 px-3 py-2 rounded-xl border transition-all cursor-pointer ${isSelected
          ? 'border-primary-500/50 bg-primary-500/10 ring-2 ring-primary-500'
          : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
    >
      {/* --- Selection Checkbox (Single, on the left) --- */}
      <AnimatePresence>
        {isSelectMode && (
          <motion.div
            initial={{ opacity: 0, width: 0, marginRight: -16 }}
            animate={{ opacity: 1, width: 'auto', marginRight: 0 }}
            exit={{ opacity: 0, width: 0, marginRight: -16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatedCheckbox
              checked={isSelected}
              onChange={() => onSelectToggle?.(cloth.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Image/Fallback --- */}
      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
        {cloth.image ? (
          <img src={cloth.image} alt={cloth.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: colorValue }} />
        )}
      </div>

      {/* --- Main Content (Simplified for scannability) --- */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{cloth.name}</h4>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
          <span>{categoryName}</span>
          <span>•</span>
          <span className={status.tagClass}>{status.label}</span>
        </div>
      </div>

      {/* --- Favorite Button --- */}
      <div className="flex-shrink-0">
        <button
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            updateCloth(cloth.id, { favorite: !cloth.favorite });
          }}
          aria-label={cloth.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-all ${cloth.favorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
          />
        </button>
      </div>
    </motion.div>
  );
}

export default React.memo(ClothRow);