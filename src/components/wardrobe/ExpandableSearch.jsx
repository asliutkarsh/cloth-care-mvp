// src/components/wardrobe/ExpandableSearch.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

export default function ExpandableSearch({ value, onChange, placeholder = 'Search...', className = '' }) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300/60 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle search"
      >
        <Search size={18} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'clamp(180px, 60vw, 440px)', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden ml-2"
          >
            <div className="relative">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 pl-3 pr-8 rounded-md border border-gray-300/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (value) onChange?.('')
                  else setOpen(false)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
