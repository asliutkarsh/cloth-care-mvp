import React, { useState, useMemo, useEffect } from 'react'
import { useWardrobeStore } from '../stores/useWardrobeStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { SlidersHorizontal } from 'lucide-react'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui'
import WardrobeSkeleton from '../components/skeleton/WardrobeSkeleton'
import ClothList from '../components/wardrobe/ClothList'
import OutfitList from '../components/wardrobe/OutfitList'
import OutfitRow from '../components/wardrobe/OutfitRow'
import FilterChipBar from '../components/wardrobe/FilterChipBar'
import ExpandableSearch from '../components/wardrobe/ExpandableSearch'
import CreateNewMenu from '../components/wardrobe/CreateNewMenu'
import ViewControls from '../components/wardrobe/ViewControls'
import ClothRow from '../components/wardrobe/ClothRow'
import BulkActionBar from '../components/wardrobe/BulkActionBar'

export default function Wardrobe() {
  const {
    clothes = [],
    outfits = [],
    categories = [],
    isInitialized,
  } = useWardrobeStore()
  const { preferences, fetchPreferences, updatePreference } = useSettingsStore()

  const [activeTab, setActiveTab] = useState('clothes')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ categoryId: null, tag: null })
  const [viewMode, setViewMode] = useState(preferences?.wardrobeDefaults?.viewMode || 'grid') // 'grid' | 'list'
  const [sortBy, setSortBy] = useState(preferences?.wardrobeDefaults?.sortBy || 'newest') // 'newest' | 'name' | 'mostWorn'
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])

  const filteredClothes = useMemo(() => {
    // Build a set of allowed category IDs including subcategories when a parent is chosen
    let allowedCats = null
    if (filters.categoryId) {
      const buildDescendants = (id, acc = new Set()) => {
        acc.add(id)
        for (const c of categories) {
          if (c.parentId === id) buildDescendants(c.id, acc)
        }
        return acc
      }
      allowedCats = buildDescendants(filters.categoryId)
    }

    const filtered = clothes.filter((cloth) => {
      const searchMatch = cloth.name.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = !allowedCats || allowedCats.has(cloth.categoryId)
      const favoriteMatch = !filters.favorite || !!cloth.favorite
      return searchMatch && categoryMatch && favoriteMatch
    })
    const sorted = [...filtered]
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'mostWorn') {
      sorted.sort((a, b) => (b.currentWearCount ?? 0) - (a.currentWearCount ?? 0))
    } else {
      // newest by createdAt desc
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
    return sorted
  }, [clothes, searchTerm, filters, sortBy])

  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit) => {
      const nameMatch = outfit.name.toLowerCase().includes(searchTerm.toLowerCase())
      const want = (filters.tag || '').toLowerCase()
      const wantNoHash = want.startsWith('#') ? want.slice(1) : want
      const tagMatch = !want || (outfit.tags || []).some(t => {
        const tt = (t || '').toLowerCase()
        return tt === want || tt === `#${wantNoHash}` || (tt.startsWith('#') ? tt.slice(1) : tt) === wantNoHash
      })
      const favoriteMatch = !filters.favorite || !!outfit.favorite
      return nameMatch && tagMatch && favoriteMatch
    })
  }, [outfits, searchTerm, filters])

  if (!isInitialized) return <WardrobeSkeleton />

  return (
    <div className="flex relative">
      <main className="flex-grow max-w-7xl mx-auto p-3 sm:p-4 pb-24 sm:pb-24 md:p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Wardrobe</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse, search, and manage your clothes and outfits.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <TabsList className="w-full sm:w-auto flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                <TabsTrigger
                  value="clothes"
                  className={`${
                    activeTab === 'clothes'
                      ? 'text-white dark:text-red'
                      : 'text-gray-600 dark:text-gray-400'
                  } py-2 px-3 sm:px-4 text-sm sm:text-base rounded-lg transition-all whitespace-nowrap`}
                >
                  Clothes ({clothes?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="outfits"
                  className={`${
                    activeTab === 'outfits'
                      ? 'text-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400'
                  } py-2 px-3 sm:px-4 text-sm sm:text-base rounded-lg transition-all whitespace-nowrap`}
                >
                  Outfits ({outfits?.length || 0})
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-1 items-center gap-2 flex-wrap mt-2 sm:mt-0">
                <ExpandableSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={`Search in ${activeTab}...`}
                  className="flex-1 min-w-0 w-full sm:w-auto"
                />
                <div className="flex items-center gap-2">
                  <CreateNewMenu />

                  {activeTab === 'clothes' && (
                    <Button
                      variant={isSelectMode ? 'secondary' : 'outline'}
                      onClick={() => {
                        setIsSelectMode((s) => !s)
                        setSelectedItems([])
                      }}
                      className="shrink-0"
                    >
                      {isSelectMode ? 'Done' : 'Select'}
                    </Button>
                  )}
                </div>

                {activeTab === 'clothes' && (
                  <ViewControls
                    viewMode={viewMode}
                    sortBy={sortBy}
                    onViewChange={(vm) => {
                      setViewMode(vm)
                      updatePreference('wardrobeDefaults', { ...(preferences?.wardrobeDefaults||{}), viewMode: vm })
                    }}
                    onSortChange={(sb) => {
                      setSortBy(sb)
                      updatePreference('wardrobeDefaults', { ...(preferences?.wardrobeDefaults||{}), sortBy: sb })
                    }}
                    className="w-full sm:w-auto"
                    showViewToggle={false}
                  />
                )}
              </div>
            </div>

            {activeTab === 'clothes' && (
              <FilterChipBar
                categories={categories}
                filters={filters}
                onChange={setFilters}
                className="-mb-1"
              />
            )}
          </div>

          <TabsContent value="clothes" className="mt-2">
            {viewMode === 'grid' ? (
              <ClothList
                clothes={filteredClothes}
                isSelectMode={isSelectMode}
                selectedItems={selectedItems}
                onSelectToggle={(id) => setSelectedItems((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              />
            ) : (
              <div className="space-y-2 -mx-1 sm:mx-0">
                {filteredClothes.map((cloth) => (
                  <ClothRow
                    key={cloth.id}
                    cloth={cloth}
                    category={categories.find((c) => c.id === cloth.categoryId)}
                    isSelectMode={isSelectMode}
                    isSelected={selectedItems.includes(cloth.id)}
                    onSelectToggle={(id) => setSelectedItems((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outfits" className="mt-2">
            <FilterChipBar
              mode="outfits"
              filters={filters}
              onChange={setFilters}
              className="mb-3 -mx-1 sm:mx-0"
            />
            {viewMode === 'grid' ? (
              <div className="-mx-1 sm:mx-0">
                <OutfitList outfits={filteredOutfits} />
              </div>
            ) : (
              <div className="space-y-2 -mx-1 sm:mx-0">
                {filteredOutfits.map((outfit) => (
                  <OutfitRow 
                    key={outfit.id} 
                    outfit={outfit} 
                    onClick={() => navigate(`/wardrobe/outfit/${outfit.id}`)} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {isSelectMode && (
        <BulkActionBar
          count={selectedItems.length}
          onCancel={() => { 
            setIsSelectMode(false); 
            setSelectedItems([]); 
          }}
          onDelete={async () => {
            const { removeCloth } = useWardrobeStore.getState();
            for (const id of selectedItems) {
              await removeCloth(id);
            }
            setSelectedItems([]);
          }}
          onAddToLaundry={async () => {
            const { washItems } = useWardrobeStore.getState();
            await washItems(selectedItems);
            setSelectedItems([]);
          }}
          onCreateOutfit={() => {
            window.dispatchEvent(
              new CustomEvent('open-outfit-modal', { 
                detail: { clothIds: selectedItems } 
              })
            );
          }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:right-4 sm:top-20 sm:w-auto sm:max-w-md"
        />
      )}
    </div>
  );
}
