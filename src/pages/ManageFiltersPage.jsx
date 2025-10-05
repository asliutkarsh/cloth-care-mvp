import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Tag, Info } from 'lucide-react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { Button } from '../components/ui';
import { useToast } from '../context/ToastProvider';

// --- Reusable Sub-components (unchanged) ---

const FilterToggleItem = ({ label, icon, isSelected, onToggle }) => (
  <motion.button
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    onClick={onToggle}
    className={`flex items-center w-full gap-3 p-3 rounded-lg border transition-colors duration-200 ${
      isSelected
        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
    }`}
  >
    <span className="text-xl">{icon || '👕'}</span>
    <span className={`flex-1 text-left font-medium ${isSelected ? 'text-primary-700 dark:text-primary-200' : ''}`}>{label}</span>
    <div className={`w-5 h-5 flex items-center justify-center rounded border-2 ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={14} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.button>
);

const OutfitTag = ({ tag, isSelected, onToggle }) => (
    <motion.button
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => onToggle(tag)}
        whileTap={{ scale: 0.95 }}
        className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
            isSelected
            ? 'bg-primary-500 text-white border-primary-500 shadow-md'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
        }`}
    >
        {tag}
    </motion.button>
);


// --- Main Page Component ---
export default function ManageFiltersPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { filterChipSettings, outfitTagSuggestions, fetchPreferences, updateFilterChipSettings } = useSettingsStore();
  const { categories, outfits } = useWardrobeStore();

  const [initialClothesSet, setInitialClothesSet] = useState(new Set());
  const [initialOutfitsSet, setInitialOutfitsSet] = useState(new Set());
  const [clothesSet, setClothesSet] = useState(new Set());
  const [outfitsSet, setOutfitsSet] = useState(new Set());

  const parentCategories = useMemo(() => (categories || []).filter(c => !c.parentId), [categories]);
  const uniqueOutfitTags = useMemo(() => {
    const fromData = new Set(outfits.flatMap(o => o.tags || []));
    return Array.from(new Set([...(outfitTagSuggestions || []), ...fromData])).sort();
  }, [outfits, outfitTagSuggestions]);

  useEffect(() => {
    if (!filterChipSettings) {
      fetchPreferences();
    } else {
      const clothesPref = new Set(filterChipSettings.clothes || parentCategories.map(c => c.id));
      const outfitsPref = new Set(filterChipSettings.outfits || []);
      setClothesSet(clothesPref);
      setInitialClothesSet(clothesPref);
      setOutfitsSet(outfitsPref);
      setInitialOutfitsSet(outfitsPref);
    }
  }, [filterChipSettings, parentCategories, fetchPreferences]);

  const setsEqual = useCallback((a, b) => a.size === b.size && [...a].every(value => b.has(value)), []);

  const hasChanges = useMemo(() => 
    !setsEqual(initialClothesSet, clothesSet) || !setsEqual(initialOutfitsSet, outfitsSet),
    [initialClothesSet, clothesSet, initialOutfitsSet, outfitsSet, setsEqual]
  );
  
  const toggleItem = (setter, item) => setter(prev => {
    const next = new Set(prev);
    if (next.has(item)) next.delete(item); else next.add(item);
    return next;
  });

  const handleSave = async () => {
    await updateFilterChipSettings({ clothes: Array.from(clothesSet), outfits: Array.from(outfitsSet) });
    addToast('Quick filters updated!', { type: 'success' });
    navigate(-1);
  };

  const handleDiscard = () => {
    setClothesSet(initialClothesSet);
    setOutfitsSet(initialOutfitsSet);
    addToast('Changes discarded', { type: 'info' });
  };

  const animationContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const animationItem = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-32 sm:p-6">
      <header className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
            <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full" aria-label="Go back">
                <ArrowLeft size={20} />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">Manage Quick Filters</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose the shortcuts for your wardrobe.</p>
            </div>
        </div>
        
        {/* --- Desktop Save/Discard Buttons --- */}
        <div className="hidden sm:flex items-center gap-2">
            <AnimatePresence>
            {hasChanges && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleDiscard}>Discard</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </header>
      
      <motion.div variants={animationContainer} initial="hidden" animate="visible" className="space-y-6">
        {/* --- Clothes Filters Card --- */}
        <motion.div variants={animationItem} className="glass-card p-4 sm:p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold">Clothes Filters ({clothesSet.size}/{parentCategories.length})</h2>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" onClick={() => setClothesSet(new Set(parentCategories.map(c => c.id)))}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={() => setClothesSet(new Set())}>Clear</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parentCategories.map(cat => (
              <FilterToggleItem
                key={cat.id}
                label={cat.name}
                icon={cat.icon}
                isSelected={clothesSet.has(cat.id)}
                onToggle={() => toggleItem(setClothesSet, cat.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* --- Outfits Filters Card --- */}
        <motion.div variants={animationItem} className="glass-card p-4 sm:p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold">Outfits Filters ({outfitsSet.size}/{uniqueOutfitTags.length})</h2>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" onClick={() => setOutfitsSet(new Set(uniqueOutfitTags))} disabled={!uniqueOutfitTags.length}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={() => setOutfitsSet(new Set())}>Clear</Button>
            </div>
          </div>
          {uniqueOutfitTags.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {uniqueOutfitTags.map(tag => (
                <OutfitTag key={tag} tag={tag} isSelected={outfitsSet.has(tag)} onToggle={() => toggleItem(setOutfitsSet, tag)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <Tag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">No Outfit Tags Found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create an outfit with tags like "Formal" or "Casual" to see them here.</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* --- Mobile-Only Smart Save Bar --- */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: "120%" }}
            animate={{ y: 0 }}
            exit={{ y: "120%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            className="fixed left-0 right-0 bottom-0 z-40 p-3 sm:hidden"
          >
            <div className="mx-auto max-w-4xl flex items-center gap-2 rounded-xl px-4 py-3 glass-card shadow-2xl">
              <Info size={18} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Unsaved changes.</span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" onClick={handleDiscard}>Discard</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}