import React from 'react'
import { motion } from 'framer-motion'
import OutfitCard from './OutfitCard'

export default function OutfitList({ outfits }) { 

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {outfits.map((outfit, i) => (
        <motion.div key={outfit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <OutfitCard outfit={outfit} />
        </motion.div>
      ))}
    </div>
  )
}
