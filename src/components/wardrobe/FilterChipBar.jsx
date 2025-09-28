// src/components/wardrobe/FilterChipBar.jsx
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/useSettingsStore'

const findCategoryEntry = (nodes = [], targetId, ancestors = []) => {
  for (const node of nodes || []) {
    if (node.id === targetId) {
      return { category: node, ancestors }
    }
    const found = findCategoryEntry(node.children, targetId, [...ancestors, node])
    if (found) return found
  }
  return null
}

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

  const clothesChips = useMemo(() => {
    if (!isClothes) return []
    const prefIds = filterChipSettings?.clothes || []
    const base = prefIds.length ? categories.filter((cat) => prefIds.includes(cat.id)) : categories
    return base.map((cat) => ({ id: cat.id, label: cat.name, icon: cat.icon || '👕' }))
  }, [categories, filterChipSettings, isClothes])

  const outfitChips = useMemo(() => {
    if (isClothes) return []
    const selected = filterChipSettings?.outfits || []
    const source = selected.length ? selected : outfitTagSuggestions || []
    return source.map((tag) => ({ id: tag, label: tag }))
  }, [filterChipSettings, outfitTagSuggestions, isClothes])

  const selection = isClothes && filters.categoryId
    ? findCategoryEntry(categories, filters.categoryId)
    : null
  const selectedCategory = selection?.category || null
  const parentCategory = selectedCategory?.children?.length
    ? selectedCategory
    : selection?.ancestors?.[selection.ancestors.length - 1] || null
  const childCategories = parentCategory?.children || []

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}>
      <div className="flex items-center gap-2 min-w-max">
        <Chip
          active={isAll && !filters.favorite}
          onClick={() =>
            onChange({
              ...filters,
              favorite: false,
              ...(isClothes ? { categoryId: null } : { tag: null }),
            })
          }
        >
          All
        </Chip>
        <Chip
          active={!!filters.favorite}
          onClick={() => onChange({ ...filters, favorite: !filters.favorite })}
        >
          Favorites ⭐
        </Chip>
        {isClothes
          ? clothesChips.map((chip) => (
              <Chip
                key={chip.id}
                active={filters.categoryId === chip.id}
                onClick={() =>
                  onChange({
                    ...filters,
                    categoryId: filters.categoryId === chip.id ? null : chip.id,
                  })
                }
              >
                <span className="inline-flex items-center gap-1">
                  <span className="text-base leading-none">{chip.icon}</span>
                  <span>{chip.label}</span>
                </span>
              </Chip>
            ))
          : outfitChips.map((chip) => (
              <Chip
                key={chip.id}
                active={filters.tag === chip.id}
                onClick={() =>
                  onChange({
                    ...filters,
                    tag: filters.tag === chip.id ? null : chip.id,
                  })
                }
              >
                {chip.label}
              </Chip>
            ))}
        {(!isAll || !!filters.favorite) && (
          <button
            type="button"
            className="ml-2 text-xs text-gray-600 dark:text-gray-300 underline"
            onClick={() =>
              onChange({
                ...filters,
                favorite: false,
                ...(isClothes ? { categoryId: null } : { tag: null }),
              })
            }
          >
            Clear
          </button>
        )}
      </div>

      {isClothes && parentCategory && childCategories.length > 0 && (
        <div className="mt-2 ml-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Chip
              active={filters.categoryId === parentCategory.id}
              onClick={() =>
                onChange({
                  ...filters,
                  categoryId: filters.categoryId === parentCategory.id ? null : parentCategory.id,
                })
              }
            >
              All {parentCategory.name}
            </Chip>
            {childCategories.map((child) => (
              <Chip
                key={child.id}
                active={filters.categoryId === child.id}
                onClick={() =>
                  onChange({
                    ...filters,
                    categoryId: filters.categoryId === child.id ? parentCategory.id : child.id,
                  })
                }
              >
                {child.name}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all select-none touch-manipulation ${
        active
          ? 'bg-primary-activeBg text-white border-transparent shadow-sm'
          : 'bg-white/80 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border-gray-300/60 dark:border-coolgray-700 hover:bg-accent-violet/10'
      }`}
    >
      {children}
    </motion.button>
  )
}
