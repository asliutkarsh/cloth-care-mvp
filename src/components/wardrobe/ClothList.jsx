import React from 'react'
import { motion } from 'framer-motion'
import ClothCard from './ClothCard'

export default function ClothList({ clothes, isSelectMode = false, selectedItems = [], onSelectToggle }) {

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
