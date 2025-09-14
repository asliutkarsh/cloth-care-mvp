import React, { useState, useMemo } from 'react'
import { useWardrobeStore } from '../stores/useWardrobeStore'
import { Search, SlidersHorizontal } from 'lucide-react'
import {
  Input,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components/ui'
import ClothList from '../components/wardrobe/ClothList'
import OutfitList from '../components/wardrobe/OutfitList' // 1. Import the new component
import FilterPanel from '../components/wardrobe/FilterPanel'

export default function Wardrobe() {
  const {
    clothes = [],
    outfits = [],
    categories = [],
    isInitialized,
  } = useWardrobeStore()
  const [activeTab, setActiveTab] = useState('clothes')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ status: [], categoryId: null })
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false)

  // 2. Filtered clothes logic
  const filteredClothes = useMemo(() => {
    return clothes.filter((cloth) => {
      const searchMatch = cloth.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const statusMatch =
        filters.status.length === 0 || filters.status.includes(cloth.status)
      const categoryMatch =
        !filters.categoryId || cloth.categoryId === filters.categoryId
      return searchMatch && statusMatch && categoryMatch
    })
  }, [clothes, searchTerm, filters])

  // 3. Filtered outfits logic
  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit) =>
      outfit.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [outfits, searchTerm])

  if (!isInitialized) {
    return (
      <div className="p-8 text-center text-gray-500">Loading wardrobe...</div>
    )
  }

  return (
    <div className="flex">
      <main className="flex-grow max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Wardrobe</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse, search, and manage your clothes and outfits.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="clothes">
                Clothes ({clothes?.length})
              </TabsTrigger>
              <TabsTrigger value="outfits">
                Outfits ({outfits?.length})
              </TabsTrigger>
            </TabsList>

            <div className="relative flex-grow">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder={`Search in ${activeTab}...`} // 4. Dynamic placeholder
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === 'clothes' && (
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={() => setFilterPanelOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Filters
              </Button>
            )}
          </div>

          <TabsContent value="clothes">
            <ClothList clothes={filteredClothes} />
          </TabsContent>

          <TabsContent value="outfits">
            <OutfitList outfits={filteredOutfits} /> {/* 5. Use OutfitList */}
          </TabsContent>
        </Tabs>
      </main>

      {/* Filter Side Panel for clothes */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        clothes={clothes}
        categories={categories}
        currentFilters={filters}
        onFilterChange={setFilters}
      />
    </div>
  )
}
