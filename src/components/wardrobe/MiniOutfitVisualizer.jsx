import React from 'react';
import { motion } from 'framer-motion';
import { useWardrobeStore } from '../../stores/useWardrobeStore';

export const MiniOutfitVisualizer = ({ clothIds, className = '' }) => {
  const { clothes } = useWardrobeStore();
  
  // Get the first 4 items for the collage
  const items = React.useMemo(() => {
    return clothIds
      .slice(0, 4)
      .map(id => clothes.find(c => c.id === id))
      .filter(Boolean);
  }, [clothIds, clothes]);

  if (items.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/70 ${className}`}>
        <div className="text-gray-400 dark:text-gray-500 text-xs">No items</div>
      </div>
    );
  }

  const gridConfig = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2',
    4: 'grid-cols-2',
  }[items.length];

  return (
    <div className={`w-full h-full grid ${gridConfig} gap-0.5 p-0.5`}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: index * 0.05,
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover aspect-square"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: item.color || '#e5e7eb' }}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default React.memo(MiniOutfitVisualizer);
