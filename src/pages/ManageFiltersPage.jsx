// src/pages/ManageFiltersPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useWardrobeStore } from '../stores/useWardrobeStore'
import { Button } from '../components/ui'

export default function ManageFiltersPage() {
  const navigate = useNavigate()
  const { filterChipSettings, outfitTagSuggestions, fetchPreferences, updateFilterChipSettings } = useSettingsStore()
  const categories = useWardrobeStore(state => state.categories)
  const outfits = useWardrobeStore(state => state.outfits)

  const [clothesSet, setClothesSet] = useState(new Set())
  const [outfitsSet, setOutfitsSet] = useState(new Set())

  const parentCategories = useMemo(() => {
    return (categories || []).filter((category) => !category.parentId)
  }, [categories])

  const uniqueOutfitTags = useMemo(() => {
    const fromData = new Set()
    for (const outfit of outfits || []) {
      for (const tag of outfit?.tags || []) {
        fromData.add(tag)
      }
    }
    const merged = new Set([...(outfitTagSuggestions || []), ...fromData])
    return Array.from(merged)
  }, [outfits, outfitTagSuggestions])

  const setsEqual = (a, b) => {
    if (a.size !== b.size) return false
    for (const value of a) {
      if (!b.has(value)) return false
    }
    return true
  }

  useEffect(() => {
    if (!filterChipSettings) {
      fetchPreferences()
      return
    }

    const clothesPref = filterChipSettings.clothes?.length ? filterChipSettings.clothes : parentCategories.map((c) => c.id)
    const outfitsPref = filterChipSettings.outfits || []

    const nextClothesSet = new Set(clothesPref)
    const nextOutfitsSet = new Set(outfitsPref)

    setClothesSet((prev) => (setsEqual(prev, nextClothesSet) ? prev : nextClothesSet))
    setOutfitsSet((prev) => (setsEqual(prev, nextOutfitsSet) ? prev : nextOutfitsSet))
  }, [filterChipSettings, parentCategories, fetchPreferences])

  const toggleClothes = (id) => {
    setClothesSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleOutfits = (tag) => {
    setOutfitsSet(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const handleSave = async () => {
    await updateFilterChipSettings({ clothes: Array.from(clothesSet), outfits: Array.from(outfitsSet) })
    navigate('/settings')
  }

  const selectAllClothes = () => setClothesSet(new Set(parentCategories.map(c => c.id)))
  const clearAllClothes = () => setClothesSet(new Set())
  const selectAllTags = () => setOutfitsSet(new Set(uniqueOutfitTags))
  const clearAllTags = () => setOutfitsSet(new Set())

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <div className="glass-card w-full p-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate(-1)} variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold sm:text-2xl">Manage Quick Filters</h1>
          </div>
          <Button onClick={handleSave}>Save</Button>
        </div>

        <div className="p-4 sm:p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Clothes Filters ({clothesSet.size}/{parentCategories.length})</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllClothes}>Select All</Button>
                <Button variant="ghost" size="sm" onClick={clearAllClothes}>Clear</Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enable parent categories to appear as quick filter chips.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {parentCategories.map(cat => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 p-2 rounded-md border border-coolgray-500/30 dark:border-coolgray-700/40 hover-highlight cursor-pointer"
                >
                  <input type="checkbox" checked={clothesSet.has(cat.id)} onChange={() => toggleClothes(cat.id)} />
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon || '👕'}</span>
                    <span>{cat.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Outfits Filters ({outfitsSet.size}/{uniqueOutfitTags.length})</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllTags} disabled={uniqueOutfitTags.length === 0}>Select All</Button>
                <Button variant="ghost" size="sm" onClick={clearAllTags}>Clear</Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enable tags to appear as quick filter chips.</p>
            {uniqueOutfitTags.length === 0 ? (
              <div className="text-sm p-4 rounded-md border border-dashed border-accent-violet/40 bg-accent-violet/10 text-coolgray-700 dark:text-coolgray-500">
                No tags yet. Create an outfit with tags to see suggestions here. Try using the <span className="tag-new">New</span> tag or <span className="tag-worn">Worn</span> when appropriate.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {uniqueOutfitTags.map(tag => {
                  const selected = outfitsSet.has(tag)
                  return (
                    <label
                      key={tag}
                      className={`${selected ? 'bg-primary-activeBg text-white border-transparent shadow-sm' : 'tag hover-highlight border border-coolgray-500/30 dark:border-coolgray-700/40'} cursor-pointer`}
                    >
                      <input type="checkbox" className="hidden" checked={selected} onChange={() => toggleOutfits(tag)} />
                      {tag}
                    </label>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed left-0 right-0 bottom-0 z-40 p-3">
        <div className="mx-auto max-w-3xl flex items-center gap-2 rounded-xl px-3 py-2 backdrop-blur bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-lg">
          <span className="text-sm text-gray-700 dark:text-gray-300">{clothesSet.size} clothes filters, {outfitsSet.size} outfit tags selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
