// src/components/wardrobe/CreateNewMenu.jsx
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FilePlus, Layers, BookPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useModalStore, ModalTypes } from '../../stores/useModalStore'

export default function CreateNewMenu({ className = '' }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const navigate = useNavigate()
  const openModal = useModalStore((s) => s.openModal)

  useEffect(() => {
    const onClick = (e) => {
      if (!btnRef.current) return
      if (!btnRef.current.parentElement.contains(e.target)) setOpen(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const openAddClothModal = () => {
    openModal(ModalTypes.ADD_CLOTH)
    setOpen(false)
  }

  const openAddOutfitModal = () => {
    openModal(ModalTypes.ADD_OUTFIT)
    setOpen(false)
  }

  const items = [
    { label: 'Add Item', icon: FilePlus, onClick: openAddClothModal },
    { label: 'Create Outfit', icon: Layers, onClick: openAddOutfitModal },
    { label: 'Log Wear', icon: BookPlus, onClick: () => navigate('/calendar?openAdd=1') },
  ]

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow"
      >
        <Plus size={16} /> Create New
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-10"
          >
            <ul className="py-1">
              {items.map(({ label, icon: Icon, onClick }) => (
                <li key={label}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // CRITICAL: Stop the click from bubbling
                      onClick();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}