import React, { useState } from 'react'
import {
  Edit,
  Trash2,
  PlusCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Button } from '../ui'
import { motion, AnimatePresence } from 'framer-motion'

export default function CategoryItem({
  category,
  allClothes,
  getRecursiveItemCount,
  onEdit,
  onDelete,
  onAddSub,
}) {
  const itemCount = getRecursiveItemCount(category, allClothes)
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700"
    >
      <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="text-xs focus:outline-none text-gray-600 dark:text-gray-400"
          >
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none" title="Icon">{category.icon || '👕'}</span>
            <p className="font-medium">{category.name}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Max Wears: {category.maxWearCount}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>Items: {itemCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onAddSub?.(category.id)}>
            <PlusCircle size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit?.(category)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete?.(category.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && category.children?.length > 0 && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {category.children.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                allClothes={allClothes}
                getRecursiveItemCount={getRecursiveItemCount}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSub={onAddSub}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
