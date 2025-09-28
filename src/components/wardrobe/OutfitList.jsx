import React from 'react'
import { motion } from 'framer-motion'
import OutfitCard from './OutfitCard'
import { Layers, Plus } from 'lucide-react'
import { Button } from '../ui'

export default function OutfitList({ outfits }) {
  const handleCreateOutfit = () => {
    // Dispatch global event to open outfit creation modal
    window.dispatchEvent(new CustomEvent('open-outfit-modal'));
  };

  if (!outfits || outfits.length === 0) {
    return (
      <div className="text-center py-16 glass-card border border-dashed border-accent-violet/40 bg-accent-violet/10 text-coolgray-700 dark:text-coolgray-500">
        <Layers size={48} className="mx-auto text-accent-violet mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Outfits Found</h3>
        <p className="text-sm mb-4">Try adding tags like <span className="tag-new">New</span> or mark worn pieces with <span className="tag-worn">Worn</span>.</p>
        <Button
          onClick={handleCreateOutfit}
          className="inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Create an Outfit
        </Button>
      </div>
    )
  }

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
