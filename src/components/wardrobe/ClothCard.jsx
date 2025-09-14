import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react'; // Placeholder icon

export default function ClothCard({ cloth }) {
  const navigate = useNavigate();

  // A simple status indicator
  const statusColors = {
    clean: 'bg-green-500',
    dirty: 'bg-yellow-500',
    needs_pressing: 'bg-blue-500',
  };

  return (
    <motion.button
      onClick={() => navigate(`/wardrobe/cloth/${cloth.id}`)}
      className="text-left w-full rounded-lg overflow-hidden glass-card p-0"
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {/* Replace with an image if available */}
        <Shirt size="40%" className="text-gray-400" />
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold truncate pr-2">{cloth.name}</h4>
          <div 
            className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${statusColors[cloth.status]}`}
            title={`Status: ${cloth.status}`}
          />
        </div>
        <p className="text-xs text-gray-500">Worn {cloth.currentWearCount} times</p>
      </div>
    </motion.button>
  );
}