import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react'; // Icon for outfits

export default function OutfitCard({ outfit }) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(`/wardrobe/outfit/${outfit.id}`)}
      className="text-left w-full rounded-lg overflow-hidden glass-card p-0"
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {/* You can show a collage of item images here in the future */}
        <Layers size="40%" className="text-gray-400" />
      </div>
      <div className="p-3">
        <h4 className="font-semibold truncate">{outfit.name}</h4>
        <p className="text-xs text-gray-500">{outfit.clothIds.length} items</p>
      </div>
    </motion.button>
  );
}