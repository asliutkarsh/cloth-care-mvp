import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { useToast } from '../../context/ToastProvider.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, ChevronDown, ChevronUp, Search, X, Calendar, Clock,
  Sparkles, Layers, Shirt, CheckCircle2, AlertCircle, Star,
  Package, Filter
} from 'lucide-react';

// Helper functions
const formatDateInput = (value) => {
  if (!value) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof value === 'string') return value;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultTime = (provided) => {
  if (provided) return provided;
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const copy = new Date(value.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  }
  if (typeof value === 'string') {
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const isFutureDate = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed.getTime() > today.getTime();
};

export default function AddActivityModal({
  open, onClose, date, outfits, clothes, categories, onSubmit, activityToEdit, activityToCopy
}) {
  const { createOutfit } = useWardrobeStore();
  const [activeTab, setActiveTab] = useState('outfits');
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [selectedClothIds, setSelectedClothIds] = useState([]);
  const [activityDate, setActivityDate] = useState(formatDateInput(date));
  const [saveAsOutfit, setSaveAsOutfit] = useState(false);
  const [newOutfitName, setNewOutfitName] = useState('');
  const [outfitSearch, setOutfitSearch] = useState('');
  const [clothSearch, setClothSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'clean', 'dirty', 'needs_pressing'
  const scrollContainerRef = useRef(null);
  const { addToast } = useToast();
  const [activityTime, setActivityTime] = useState(getDefaultTime(null));
  const [checkedClothIds, setCheckedClothIds] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const isEditMode = !!activityToEdit;
  const planningMode = isFutureDate(activityDate);

  const getActionLabel = () => {
    if (isEditMode) return 'Save Changes';
    return planningMode ? 'Save Plan' : 'Log Activity';
  };

  const getModalTitle = () => {
    if (isEditMode) return 'Edit Activity';
    return planningMode ? 'Plan an Outfit' : 'Log Activity';
  };

  const successMessage = isEditMode
    ? 'Activity updated!'
    : (planningMode ? 'Outfit plan saved!' : 'Activity logged successfully!');

  // Initialize modal state
  useEffect(() => {
    if (open) {
      const sourceActivity = activityToEdit || activityToCopy;

      setActivityDate(formatDateInput(isEditMode ? sourceActivity?.date : date));
      setActivityTime(getDefaultTime(sourceActivity?.time));

      if (sourceActivity) {
        if (sourceActivity.type === 'outfit') {
          setActiveTab('outfits');
          setSelectedOutfitId(sourceActivity.outfitId);
          setSelectedClothIds([]);
        } else if (sourceActivity.type === 'individual') {
          setActiveTab('clothes');
          setSelectedClothIds(sourceActivity.clothIds || []);
          setSelectedOutfitId(null);
        }
      } else {
        setActiveTab('outfits');
        setSelectedOutfitId(null);
        setSelectedClothIds([]);
        setSaveAsOutfit(false);
        setNewOutfitName('');
        setOutfitSearch('');
        setClothSearch('');
        setStatusFilter('all');
        setShowOnlyFavorites(false);
      }

      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  }, [open, date, activityToEdit, activityToCopy, isEditMode]);

  // Selected outfit details
  const selectedOutfitDetails = useMemo(() => {
    if (!selectedOutfitId || !outfits || !clothes) return null;
    const outfit = outfits.find((o) => o.id === selectedOutfitId);
    if (!outfit) return null;
    const outfitClothes = (outfit.clothIds || [])
      .map((id) => clothes.find((c) => c.id === id))
      .filter(Boolean);
    return { ...outfit, clothes: outfitClothes };
  }, [selectedOutfitId, outfits, clothes]);

  // Sync checked items with selected outfit
  useEffect(() => {
    if (selectedOutfitDetails) {
      setCheckedClothIds(new Set(selectedOutfitDetails.clothIds));
    } else {
      setCheckedClothIds(new Set());
    }
  }, [selectedOutfitDetails]);

  // Reset when switching tabs
  useEffect(() => {
    if (activeTab === 'outfits') {
      setSelectedClothIds([]);
      setSaveAsOutfit(false);
      setNewOutfitName('');
    } else if (activeTab === 'clothes') {
      setSelectedOutfitId(null);
    }
  }, [activeTab]);

  // Grouped and filtered clothes
  const groupedClothes = useMemo(() => {
    if (!categories || !clothes) return [];
    const query = clothSearch.trim().toLowerCase();
    const groups = [];

    const walk = (nodes = [], lineage = []) => {
      nodes.forEach((node) => {
        const path = [...lineage, node.name];
        let groupClothes = clothes.filter((cloth) => cloth.categoryId === node.id);

        // Apply filters
        if (query) {
          groupClothes = groupClothes.filter((cloth) =>
            cloth.name.toLowerCase().includes(query)
          );
        }

        if (statusFilter !== 'all') {
          groupClothes = groupClothes.filter((cloth) => cloth.status === statusFilter);
        }

        if (groupClothes.length) {
          groups.push({
            id: node.id,
            name: path.join(' • '),
            clothes: groupClothes,
            categoryId: node.id
          });
        }

        if (Array.isArray(node.children) && node.children.length) {
          walk(node.children, path);
        }
      });
    };

    walk(categories, []);
    return groups;
  }, [categories, clothes, clothSearch, statusFilter]);

  // Filtered outfits
  const filteredOutfits = useMemo(() => {
    if (!outfits) return [];
    const query = outfitSearch.trim().toLowerCase();
    let filtered = outfits;

    if (query) {
      filtered = filtered.filter((outfit) =>
        (outfit.name || '').toLowerCase().includes(query)
      );
    }

    if (showOnlyFavorites) {
      filtered = filtered.filter((outfit) => outfit.favorite === true);
    }

    return filtered;
  }, [outfits, outfitSearch, showOnlyFavorites]);

  // Handlers
  const handleClothToggle = (clothId) => {
    setSelectedClothIds((prev) =>
      prev.includes(clothId) ? prev.filter((id) => id !== clothId) : [...prev, clothId]
    );
  };

  const handleOutfitClothToggle = (clothId) => {
    setCheckedClothIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clothId)) newSet.delete(clothId);
      else newSet.add(clothId);
      return newSet;
    });
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) newSet.delete(categoryId);
      else newSet.add(categoryId);
      return newSet;
    });
  };

  const handleDateChange = (e) => {
    setActivityDate(e.target.value);
  };

  const handleSubmit = async () => {
    if (!activityDate) {
      addToast('Please select a date for this activity.', { type: 'error' });
      return;
    }

    if (!activityTime) {
      addToast('Please select a time for this activity.', { type: 'error' });
      return;
    }

    let payload = null;

    if (activeTab === 'outfits' && selectedOutfitId) {
      payload = { type: 'individual', clothIds: Array.from(checkedClothIds) };
    } else if (activeTab === 'clothes' && selectedClothIds.length > 0) {
      if (saveAsOutfit && newOutfitName) {
        try {
          const newOutfit = await createOutfit({
            name: newOutfitName,
            clothIds: selectedClothIds
          });
          if (newOutfit?.id) {
            addToast('Outfit saved!', { type: 'success' });
            payload = { type: 'outfit', outfitId: newOutfit.id };
          }
        } catch (error) {
          console.error('Failed to create outfit', error);
          addToast('Could not save outfit. Try again.', { type: 'error' });
          return;
        }
      } else {
        payload = { type: 'individual', clothIds: selectedClothIds };
      }
    }

    if (payload) {
      try {
        const status = planningMode ? 'planned' : 'worn';
        await onSubmit({
          ...payload,
          time: activityTime,
          date: activityDate,
          status
        });
        addToast(successMessage, { type: 'success' });
        onClose();
      } catch (error) {
        console.error('Failed to log/update activity', error);
        addToast('Something went wrong.', { type: 'error' });
      }
    }
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'clean':
        return {
          label: 'Clean',
          className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
          icon: <CheckCircle2 size={10} />
        };
      case 'dirty':
        return {
          label: 'Dirty',
          className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
          icon: <AlertCircle size={10} />
        };
      case 'needs_pressing':
        return {
          label: 'Pressing',
          className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
          icon: <Sparkles size={10} />
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          icon: null
        };
    }
  };

  const isSubmitDisabled =
    !activityDate ||
    !activityTime ||
    (activeTab === 'outfits' && (!selectedOutfitId || checkedClothIds.size === 0)) ||
    (activeTab === 'clothes' && selectedClothIds.length === 0) ||
    (activeTab === 'clothes' && saveAsOutfit && !newOutfitName);

  const clearClothSelection = () => {
    setSelectedClothIds([]);
    setSaveAsOutfit(false);
    setNewOutfitName('');
  };

  const footer = (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 px-6 pb-4">
      {selectedClothIds.length > 1 && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsOutfit}
              onChange={(e) => setSaveAsOutfit(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Save this combination as a new outfit
            </span>
          </label>

          <AnimatePresence>
            {saveAsOutfit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Input
                  placeholder="Enter outfit name..."
                  value={newOutfitName}
                  onChange={(e) => setNewOutfitName(e.target.value)}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
        {getActionLabel()}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={getModalTitle()}
      size="2xl"
      footer={footer}
      bodyClassName="px-0 py-0"
    >
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header with Date/Time */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={14} />
                Date
              </label>
              <Input
                type="date"
                value={activityDate}
                onChange={handleDateChange}
                className="w-full"
              />
              {planningMode && !isEditMode && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  Planning for a future date
                </motion.p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={14} />
                Time
              </label>
              <Input
                type="time"
                value={activityTime}
                onChange={(e) => setActivityTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="outfits" className="flex items-center gap-2">
                <Layers size={16} />
                <span className="hidden sm:inline">Saved Outfits</span>
                <span className="sm:hidden">Outfits</span>
                {filteredOutfits.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30">
                    {filteredOutfits.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="clothes" className="flex items-center gap-2">
                <Shirt size={16} />
                <span className="hidden sm:inline">Individual Items</span>
                <span className="sm:hidden">Items</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'outfits' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'outfits' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Outfits Tab */}
              {activeTab === 'outfits' && (
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search outfits..."
                        value={outfitSearch}
                        onChange={(e) => setOutfitSearch(e.target.value)}
                        className="pl-9"
                      />
                      {outfitSearch && (
                        <button
                          onClick={() => setOutfitSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <Button
                      variant={showOnlyFavorites ? 'primary' : 'outline'}
                      size="icon"
                      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                      title="Show only favorites"
                    >
                      <Star size={16} className={showOnlyFavorites ? 'fill-current' : ''} />
                    </Button>
                  </div>

                  {/* Outfits List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {filteredOutfits.length > 0 ? (
                      filteredOutfits.map((outfit) => {
                        const clothesInOutfit = (outfit.clothIds || [])
                          .map(id => clothes.find(c => c.id === id))
                          .filter(Boolean);
                        const isSelected = selectedOutfitId === outfit.id;

                        return (
                          <motion.div
                            key={outfit.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-xl border-2 transition-all ${isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                          >
                            <button
                              onClick={() => setSelectedOutfitId(isSelected ? null : outfit.id)}
                              className="w-full text-left p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  {outfit.name}
                                  {outfit.favorite && (
                                    <Star size={14} className="fill-amber-400 text-amber-400" />
                                  )}
                                </h4>
                                {isSelected && (
                                  <CheckCircle2 size={18} className="text-primary-600 dark:text-primary-400" />
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Package size={12} />
                                  {clothesInOutfit.length} items
                                </span>
                                {outfit.tags?.length > 0 && (
                                  <span className="flex items-center gap-1 flex-wrap">
                                    {outfit.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                        {tag}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </button>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <Layers size={40} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {showOnlyFavorites
                            ? 'No favorite outfits found'
                            : 'No outfits match your search'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected Outfit Items */}
                  {selectedOutfitDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          Select items to wear
                        </h4>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {checkedClothIds.size} / {selectedOutfitDetails.clothes.length}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {selectedOutfitDetails.clothes.map((cloth) => {
                          const statusMeta = getStatusMeta(cloth.status);
                          return (
                            <label
                              key={cloth.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={checkedClothIds.has(cloth.id)}
                                onChange={() => handleOutfitClothToggle(cloth.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="flex-1 text-sm text-gray-900 dark:text-white">
                                {cloth.name}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusMeta.className}`}>
                                {statusMeta.icon}
                                {statusMeta.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Clothes Tab */}
              {activeTab === 'clothes' && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search items..."
                        value={clothSearch}
                        onChange={(e) => setClothSearch(e.target.value)}
                        className="pl-9"
                      />
                      {clothSearch && (
                        <button
                          onClick={() => setClothSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="clean">Clean Only</option>
                      <option value="dirty">Dirty Only</option>
                      <option value="needs_pressing">Needs Pressing</option>
                    </select>
                  </div>

                  {/* Grouped Clothes */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {groupedClothes.length > 0 ? (
                      groupedClothes.map((group) => {
                        const isExpanded = expandedCategories.has(group.categoryId);

                        return (
                          <div key={group.id} className="space-y-2">
                            <button
                              onClick={() => toggleCategory(group.categoryId)}
                              className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {group.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({group.clothes.length})
                                </span>
                              </div>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-6"
                                >
                                  {group.clothes.map((cloth) => {
                                    const isSelected = selectedClothIds.includes(cloth.id);
                                    const statusMeta = getStatusMeta(cloth.status);

                                    return (
                                      <motion.button
                                        key={cloth.id}
                                        layout
                                        onClick={() => handleClothToggle(cloth.id)}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                          }`}
                                      >
                                        <div className="text-sm font-medium truncate mb-2">
                                          {cloth.name}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusMeta.className}`}>
                                          {statusMeta.icon}
                                          {statusMeta.label}
                                        </span>
                                      </motion.button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <Shirt size={40} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          No items match your filters
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected Items Summary */}
                  {selectedClothIds.length > 0 && !isEditMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Package size={16} />
                          {selectedClothIds.length} item{selectedClothIds.length > 1 ? 's' : ''} selected
                        </span>
                        <button
                          type="button"
                          onClick={clearClothSelection}
                          className="text-sm text-green-700 dark:text-green-300 hover:underline font-medium"
                        >
                          Clear
                        </button>
                      </div>

                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}