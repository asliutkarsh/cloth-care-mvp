// src/components/wardrobe/FilterChipBar.jsx
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/useSettingsStore'

export default function FilterChipBar({
  categories = [],
  filters,
  onChange,
  className = '',
  mode = 'clothes', // 'clothes' | 'outfits'
}) {
  if (!filters) return null

  const { filterChipSettings, outfitTagSuggestions } = useSettingsStore()
  const isClothes = mode === 'clothes'
  const isAll = isClothes ? !filters.categoryId : !filters.tag

  const Chip = ({ active, children, onClick }) => (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all select-none touch-manipulation ${
        active
          ? 'bg-primary-activeBg text-white border-transparent shadow-sm'
          : 'bg-white/80 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border-gray-300/60 dark:border-coolgray-700 hover:bg-accent-violet/10'
      }`}
    >
      {children}
    </motion.button>
  )

  const clothesChips = useMemo(() => {
    const prefIds = filterChipSettings?.clothes || []
    const list = prefIds.length
      ? categories.filter(c => prefIds.includes(c.id))
      : categories
    return list.map(c => ({ id: c.id, label: c.name, icon: c.icon || '👕' }))
  }, [filterChipSettings, categories])

  const outfitChips = useMemo(() => {
    const selected = filterChipSettings?.outfits || []
    const source = selected.length ? selected : (outfitTagSuggestions || [])
    return source.map(t => ({ id: t, label: t }))
  }, [filterChipSettings, outfitTagSuggestions])

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}>
      <div className="flex items-center gap-2 min-w-max">
        <Chip
          active={isAll && !filters.favorite}
          onClick={() => onChange({ ...filters, favorite: false, ...(isClothes ? { categoryId: null } : { tag: null }) })}
        >
          All
        </Chip>
        {/* Favorites chip */}
        <Chip
          active={!!filters.favorite}
          onClick={() => onChange({ ...filters, favorite: !filters.favorite })}
        >
          Favorites ⭐
        </Chip>
        {isClothes
          ? clothesChips.map((c) => (
              <Chip
                key={c.id}
                active={filters.categoryId === c.id}
                onClick={() => onChange({ ...filters, categoryId: filters.categoryId === c.id ? null : c.id })}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="text-base leading-none">{c.icon}</span>
                  <span>{c.label}</span>
                </span>
              </Chip>
            ))
          : outfitChips.map((t) => (
              <Chip
                key={t.id}
                active={filters.tag === t.id}
                onClick={() => onChange({ ...filters, tag: filters.tag === t.id ? null : t.id })}
              >
                {t.label}
              </Chip>
            ))}
        {(!isAll || !!filters.favorite) && (
          <button
            className="ml-2 text-xs text-gray-600 dark:text-gray-300 underline"
            onClick={() => onChange({ ...filters, favorite: false, ...(isClothes ? { categoryId: null } : { tag: null }) })}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
