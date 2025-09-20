import React from 'react'
import { motion } from 'framer-motion'
import ClothCard from './ClothCard'
import { Shirt } from 'lucide-react'

export default function ClothList({ clothes, isSelectMode = false, selectedItems = [], onSelectToggle }) {
  if (!clothes || clothes.length === 0) {
    return (
      <div className="text-center py-16">
        <Shirt size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No clothes found</h3>
        <p className="text-gray-500">Try adjusting your search or filters, or add a new item!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {clothes.map((cloth, i) => (
        <motion.div key={cloth.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <ClothCard
            cloth={cloth}
            isSelectMode={isSelectMode}
            selected={selectedItems.includes(cloth.id)}
            onSelectToggle={onSelectToggle}
          />
        </motion.div>
      ))}
    </div>
  )
}
