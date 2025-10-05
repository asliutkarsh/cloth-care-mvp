import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useModalStore, ModalTypes } from '../stores/useModalStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Shirt, Layers, Sparkles, TrendingUp, Package } from 'lucide-react';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui';
import WardrobeSkeleton from '../components/skeleton/WardrobeSkeleton';
import ClothList from '../components/wardrobe/ClothList';
import OutfitList from '../components/wardrobe/OutfitList';
import OutfitRow from '../components/wardrobe/OutfitRow';
import FilterChipBar from '../components/wardrobe/FilterChipBar';
import ExpandableSearch from '../components/wardrobe/ExpandableSearch';
import CreateNewMenu from '../components/wardrobe/CreateNewMenu';
import ViewControls from '../components/wardrobe/ViewControls';
import ClothRow from '../components/wardrobe/ClothRow';
import BulkActionBar from '../components/wardrobe/BulkActionBar';


export default function Wardrobe() {
  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);
  const {
    clothes = [],
    outfits = [],
    categories = [],
    removeCloth,
    removeOutfit,
    isInitialized
  } = useWardrobeStore();

  const { preferences = {}, fetchPreferences, updatePreference } = useSettingsStore();

  // State management
  // Set initial tab based on URL hash if present
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash === 'wardrobe' ? 'outfits' : 'clothes';
    }
    return 'clothes';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoryId: null,
    tag: null,
    status: null,
    favorite: false
  });

  // Default settings
  const defaultWardrobeSettings = { viewMode: 'grid', sortBy: 'newest' };

  // View settings from preferences
  const [viewMode, setViewMode] = useState(
    preferences?.wardrobeDefaults?.viewMode || defaultWardrobeSettings.viewMode
  );
  const [sortBy, setSortBy] = useState(
    preferences?.wardrobeDefaults?.sortBy || defaultWardrobeSettings.sortBy
  );

  // Selection mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Load preferences on mount
  useEffect(() => {
    if (!preferences?.wardrobeDefaults) {
      fetchPreferences();
    }
  }, [fetchPreferences, preferences]);

  // Update view settings when preferences change
  useEffect(() => {
    if (preferences?.wardrobeDefaults) {
      setViewMode(preferences.wardrobeDefaults.viewMode || defaultWardrobeSettings.viewMode);
      setSortBy(preferences.wardrobeDefaults.sortBy || defaultWardrobeSettings.sortBy);
    }
  }, [preferences?.wardrobeDefaults]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = clothes.length;
    const totalOutfits = outfits.length;
    const favoriteItems = clothes.filter(c => c.favorite).length;
    const cleanItems = clothes.filter(c => c.status === 'clean').length;
    const dirtyItems = clothes.filter(c => c.status === 'dirty').length;
    const totalWears = clothes.reduce((sum, c) => sum + (c.totalWearCount || 0), 0);
    const mostWornItem = clothes.reduce((max, c) =>
      (c.totalWearCount || 0) > (max?.totalWearCount || 0) ? c : max, null
    );

    return {
      totalItems,
      totalOutfits,
      favoriteItems,
      cleanItems,
      dirtyItems,
      totalWears,
      mostWornItem
    };
  }, [clothes, outfits]);

  // Search handler
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Filter handler
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({ categoryId: null, tag: null, status: null, favorite: false });
    setSearchTerm('');
  }, []);

  // View mode handler with persistence
  const handleViewChange = useCallback((newView) => {
    setViewMode(newView);
    const updatedSettings = {
      ...(preferences?.wardrobeDefaults || defaultWardrobeSettings),
      viewMode: newView
    };
    updatePreference('wardrobeDefaults', updatedSettings);
  }, [preferences?.wardrobeDefaults, updatePreference]);

  // Sort handler with persistence
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    const updatedSettings = {
      ...(preferences?.wardrobeDefaults || defaultWardrobeSettings),
      sortBy: newSort
    };
    updatePreference('wardrobeDefaults', updatedSettings);
  }, [preferences?.wardrobeDefaults, updatePreference]);

  // Filter and sort clothes
  const filteredClothes = useMemo(() => {
    let result = [...clothes];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cloth => {
        const nameMatch = cloth.name?.toLowerCase().includes(term);
        const brandMatch = cloth.brand?.toLowerCase().includes(term);
        const categoryName = categories.find(c => c.id === cloth.categoryId)?.name?.toLowerCase();
        const categoryMatch = categoryName?.includes(term);
        return nameMatch || brandMatch || categoryMatch;
      });
    }

    // Category filter
    if (filters.categoryId) {
      result = result.filter(cloth => cloth.categoryId === filters.categoryId);
    }

    // Status filter
    if (filters.status) {
      result = result.filter(cloth => cloth.status === filters.status);
    }

    // Favorite filter
    if (filters.favorite) {
      result = result.filter(cloth => cloth.favorite === true);
    }

    // Tag filter (if applicable)
    if (filters.tag) {
      result = result.filter(cloth => cloth.tags?.includes(filters.tag));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'mostWorn':
          return (b.totalWearCount || 0) - (a.totalWearCount || 0);
        case 'leastWorn':
          return (a.totalWearCount || 0) - (b.totalWearCount || 0);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [clothes, categories, searchTerm, filters, sortBy]);

  // Filter and sort outfits
  const filteredOutfits = useMemo(() => {
    let result = [...outfits];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(outfit =>
        outfit.name?.toLowerCase().includes(term) ||
        outfit.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Favorite filter
    if (filters.favorite) {
      result = result.filter(outfit => outfit.favorite === true);
    }

    // Tag filter
    if (filters.tag) {
      result = result.filter(outfit => outfit.tags?.includes(filters.tag));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [outfits, searchTerm, filters, sortBy]);

  // Selection handlers
  const handleSelectToggle = useCallback((id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (activeTab === 'clothes') {
      const allIds = filteredClothes.map(c => c.id);
      setSelectedItems(allIds);
    } else {
      const allIds = filteredOutfits.map(o => o.id);
      setSelectedItems(allIds);
    }
  }, [activeTab, filteredClothes, filteredOutfits]);

  const handleSelectModeToggle = useCallback(() => {
    setIsSelectMode(prev => {
      if (prev) {
        setSelectedItems([]);
      }
      return !prev;
    });
  }, []);

  // Bulk actions
  const handleBulkDelete = useCallback(async () => {
    try {
      if (activeTab === 'clothes') {
        await Promise.all(selectedItems.map(id => removeCloth(id)));
      } else {
        await Promise.all(selectedItems.map(id => removeOutfit(id)));
      }
      setSelectedItems([]);
      setIsSelectMode(false);
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  }, [activeTab, selectedItems, removeCloth, removeOutfit]);

  const handleCreateOutfit = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('open-outfit-modal', {
        detail: { clothIds: selectedItems }
      })
    );
    setIsSelectMode(false);
    setSelectedItems([]);
  }, [selectedItems]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.status) count++;
    if (filters.favorite) count++;
    if (filters.tag) count++;
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm]);

  // Update URL hash when tab changes
  const updateHash = useCallback((tab) => {
    window.location.hash = tab === 'clothes' ? '#cloth' : '#outfits';
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    updateHash(value);
    setIsSelectMode(false);
    setSelectedItems([]);
  }, [updateHash]);

  // Sync active tab with URL hash on mount and hash change
  useEffect(() => {
    // Handle initial hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'wardrobe' && activeTab !== 'outfits') {
        setActiveTab('outfits');
      } else if ((hash === 'cloth' || hash === '') && activeTab !== 'clothes') {
        setActiveTab('clothes');
      }
    };

    // Set initial tab based on hash
    handleHashChange();

    // Add hash change listener
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activeTab]);

  if (!isInitialized) return <WardrobeSkeleton />;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Wardrobe</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your clothes and create stunning outfits
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ExpandableSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Search in ${activeTab}...`}
              className="flex-1 min-w-0 w-full md:w-auto"
            />
            <div className="hidden md:block">
              <CreateNewMenu className="shrink-0" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-grid">
          <TabsTrigger 
            value="clothes" 
            className="flex items-center justify-center gap-2"
            onClick={() => updateHash('clothes')}
          >
            <Shirt className="w-4 h-4" />
            <span>Clothes</span>
            <span className="hidden sm:inline">({filteredClothes.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="outfits" 
            className="flex items-center justify-center gap-2"
            onClick={() => updateHash('outfits')}
          >
            <Layers className="w-4 h-4" />
            <span>Outfits</span>
            <span className="hidden sm:inline">({filteredOutfits.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 py-4">
          <div className="flex-1 min-w-0 ">
            <FilterChipBar
              filters={filters}
              onChange={handleFilterChange}
              categories={categories}
              mode={activeTab}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2 justify-end flex-shrink-0">
            <ViewControls
              viewMode={viewMode}
              sortBy={sortBy}
              onViewChange={handleViewChange}
              onSortChange={handleSortChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectModeToggle}
              className={isSelectMode ? 'bg-primary-500/10 border-primary-500 dark:bg-primary-500/20' : ''}
            >
              {isSelectMode ? 'Cancel' : 'Select'}
            </Button>
            {isSelectMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Clothes Tab */}
            <TabsContent value="clothes" className="mt-0">
              {filteredClothes.length > 0 ? (
                viewMode === 'grid' ? (
                  <ClothList
                    clothes={filteredClothes}
                    isSelectMode={isSelectMode}
                    selectedItems={selectedItems}
                    onSelectToggle={handleSelectToggle}
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredClothes.map((cloth) => (
                      <ClothRow
                        key={cloth.id}
                        cloth={cloth}
                        isSelectMode={isSelectMode}
                        isSelected={selectedItems.includes(cloth.id)}
                        onSelectToggle={handleSelectToggle}
                        categories={categories}
                      />
                    ))}
                  </div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Shirt size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {activeFilterCount > 0 ? 'No clothes match your filters' : 'No clothes yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {activeFilterCount > 0
                      ? 'Try adjusting your search or filters'
                      : 'Start building your wardrobe by adding your first item'}
                  </p>
                  {activeFilterCount > 0 ? (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => openModal(ModalTypes.ADD_CLOTH)}>
                      Add First Item
                    </Button>
                  )}
                </motion.div>
              )}
            </TabsContent>

            {/* Outfits Tab */}
            <TabsContent value="outfits" className="mt-0">
              {filteredOutfits.length > 0 ? (
                viewMode === 'grid' ? (
                  <OutfitList
                    outfits={filteredOutfits}
                    isSelectMode={isSelectMode}
                    selectedItems={selectedItems}
                    onSelectToggle={handleSelectToggle}
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredOutfits.map((outfit) => (
                      <OutfitRow
                        key={outfit.id}
                        outfit={outfit}
                        isSelectMode={isSelectMode}
                        isSelected={selectedItems.includes(outfit.id)}
                        onSelectToggle={handleSelectToggle}
                      />
                    ))}
                  </div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Layers size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {activeFilterCount > 0 ? 'No outfits match your filters' : 'No outfits yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {activeFilterCount > 0
                      ? 'Try adjusting your search or filters'
                      : 'Create your first outfit by combining your clothes'}
                  </p>
                  {activeFilterCount > 0 ? (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => openModal(ModalTypes.ADD_OUTFIT)}>
                      Create First Outfit
                    </Button>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {isSelectMode && selectedItems.length > 0 && (
          <BulkActionBar
            selectedCount={selectedItems.length}
            onCancel={() => {
              setIsSelectMode(false)
              setSelectedItems([])
            }}
            onDelete={handleBulkDelete}
            onCreateOutfit={activeTab === 'clothes' ? handleCreateOutfit : undefined}
            className="fixed bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:right-4 sm:top-20 sm:w-auto sm:max-w-md"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
