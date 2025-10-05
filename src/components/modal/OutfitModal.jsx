// src/components/modal/OutfitModal.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { BadgePlus, Tag, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastProvider.jsx';

const tagFromInput = (value = '') =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag));

const ClothChip = ({ cloth, onAdd, selected }) => {
  const color = cloth?.color || '#1f2937';
  return (
    <button
      type="button"
      onClick={() => onAdd?.(cloth.id)}
      className={`group relative flex items-center gap-3 rounded-xl border transition shadow-sm backdrop-blur py-2 pl-2 pr-3 text-left w-full ${
        selected
          ? 'border-green-500/70 bg-green-500/10 ring-2 ring-green-500'
          : 'border-gray-200/70 bg-white/80 hover:border-primary-500/60 dark:border-gray-700/60 dark:bg-gray-900/60 hover:shadow-lg'
      }`}
      title={selected ? 'Already added' : 'Click to add'}
    >
      <span
        className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/40 dark:border-gray-700"
        style={{ backgroundColor: color }}
      >
        {cloth.image ? (
          <img src={cloth.image} alt={cloth.name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/90">
            {cloth.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cloth.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          Worn {cloth.currentWearCount ?? 0} {cloth.currentWearCount === 1 ? 'time' : 'times'}
        </p>
      </div>
      {!selected && (
        <BadgePlus className="h-4 w-4 text-primary-500/80" />
      )}
    </button>
  );
};

const CanvasChip = ({ cloth, onRemove }) => (
  <div className="group relative flex items-center gap-3 rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 px-3 py-2 shadow-sm">
    <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-white/40 dark:border-gray-700" style={{ backgroundColor: cloth.color || '#1f2937' }}>
      {cloth.image ? (
        <img src={cloth.image} alt={cloth.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/90">
          {cloth.name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cloth.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cloth.categoryName || 'Uncategorized'}</p>
    </div>
    <button
      type="button"
      onClick={() => onRemove?.(cloth.id)}
      className="rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
      aria-label={`Remove ${cloth.name}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
);

export default function OutfitModal({ open, onClose, onSubmit, initialData = null }) {
  const { clothes, categories = [] } = useWardrobeStore();
  const { outfitTagSuggestions = [], fetchPreferences } = useSettingsStore();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedClothIds, setSelectedClothIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [query, setQuery] = useState('');
  const formRef = useRef(null);

  const categoryNameLookup = useMemo(() => {
    const map = new Map();
    const walk = (categoryList) => {
      for (const category of categoryList) {
        map.set(category.id, category.name);
        if (category.children?.length) {
          walk(category.children);
        }
      }
    };
    walk(categories);
    return map;
  }, [categories]);

  useEffect(() => {
    if (open && (!outfitTagSuggestions || outfitTagSuggestions.length === 0)) {
      // Avoid global SplashScreen when opening modal
      fetchPreferences({ trackStatus: false });
    }
  }, [open, outfitTagSuggestions, fetchPreferences]);

  useEffect(() => {
    if (open) {
        if (initialData) {
          setName(initialData.name || '');
          setSelectedClothIds(initialData.clothIds || []);
          setTagsInput((initialData.tags || []).join(', '));
        } else {
          setName('');
          setSelectedClothIds([]);
          setTagsInput('');
        }
        setQuery('');
        setCategoryFilter('');
    }
  }, [initialData, open]);

  const tagList = useMemo(() => tagFromInput(tagsInput), [tagsInput]);
  
  const allCategoryIdsToFilter = useMemo(() => {
    if (!categoryFilter) return null;
    const ids = new Set();
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    const findDescendants = (categoryId) => {
        ids.add(categoryId);
        const category = categoryMap.get(categoryId);
        if (category && category.children) {
            category.children.forEach(child => findDescendants(child.id));
        }
    };
    
    findDescendants(categoryFilter);
    return ids;
  }, [categoryFilter, categories]);

  const filteredClothes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clothes
      .filter((cloth) => cloth.status === 'clean')
      .filter((cloth) => (!q ? true : cloth.name.toLowerCase().includes(q)))
      .filter((cloth) => (!allCategoryIdsToFilter ? true : allCategoryIdsToFilter.has(cloth.categoryId)));
  }, [clothes, query, allCategoryIdsToFilter]);

  const selectedClothes = useMemo(() => selectedClothIds.map((id) => clothes.find((c) => c.id === id)).filter(Boolean), [selectedClothIds, clothes]);

  const handleAddCloth = (id) => setSelectedClothIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const handleRemoveCloth = (id) => setSelectedClothIds((prev) => prev.filter((x) => x !== id));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) { addToast('Please give the outfit a name.', { type: 'error' }); return; }
    if (!selectedClothIds.length) { addToast('Add at least one item to the outfit.', { type: 'error' }); return; }

    try {
      await onSubmit({ name: name.trim(), clothIds: selectedClothIds, tags: tagList });
      addToast(initialData ? 'Outfit updated!' : 'Outfit created!', { type: 'success' });
      onClose();
    } catch (error) {
      console.error('Failed to save outfit', error);
      addToast('Could not save outfit. Please try again.', { type: 'error' });
    }
  };

  const tagSuggestions = useMemo(() => {
    const existing = new Set(tagList.map((tag) => tag.toLowerCase()));
    return (outfitTagSuggestions || []).filter((tag) => !existing.has(tag.toLowerCase()))
  }, [outfitTagSuggestions, tagList]);

  const titleText = initialData ? 'Edit Outfit' : 'Create Outfit';
  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      <Button type="button" onClick={() => formRef.current?.requestSubmit()}>Save Outfit</Button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} size="3xl" title={titleText} footer={footer}>
      <form onSubmit={handleSubmit} ref={formRef}>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          <section className="space-y-6">
            <div>
              <label htmlFor="outfit-name" className="text-sm font-medium mb-1 block">Outfit name</label>
              <Input 
                id="outfit-name" 
                name="outfit-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g., Weekend brunch" 
                required 
              />
            </div>
            <div>
              <label htmlFor="outfit-tags" className="text-sm font-medium mb-1 block">Tags</label>
              <Input 
                id="outfit-tags" 
                name="outfit-tags" 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)} 
                placeholder="summer, casual" 
              />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 text-primary-600 px-2.5 py-1 text-xs font-medium dark:bg-primary-500/20 dark:text-primary-300"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {tagSuggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-gray-500">Suggestions:</span>
                  {tagSuggestions.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        const next = [...tagList, suggestion];
                        setTagsInput(next.join(', '));
                      }}
                      className="rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 shadow-sm">
              <div className="border-b border-gray-200/70 dark:border-gray-700/60 px-4 py-3 flex flex-wrap items-center gap-3">
                <Input 
                  id="cloth-search-query"
                  name="cloth-search-query"
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Search your wardrobe..." 
                  className="flex-1 min-w-[150px]" 
                />
                <Select 
                  id="cloth-category-filter"
                  name="cloth-category-filter"
                  aria-label="Filter items by category"
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)} 
                  className="min-w-[150px]"
                >
                  <option value="" className="bg-white dark:bg-gray-800 text-black dark:text-white">All categories</option>
                  {(categories || []).map((cat) => (<option key={cat.id} value={cat.id} className="bg-white dark:bg-gray-800 text-black dark:text-white">{cat.name}</option>))}
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 max-h-[400px] overflow-y-auto">
                {filteredClothes.map((cloth) => (<ClothChip key={cloth.id} cloth={cloth} selected={selectedClothIds.includes(cloth.id)} onAdd={handleAddCloth} />))}
                {filteredClothes.length === 0 && (<p className="col-span-full text-sm text-gray-500 dark:text-gray-400 p-4 text-center">No items match those filters.</p>)}
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-2xl border border-dashed border-primary-500/50 bg-primary-500/5 dark:bg-primary-500/10 p-4 h-full">
              <div className="flex items-center justify-between flex-shrink-0">
                <div><h3 className="text-sm font-semibold text-primary-600 dark:text-primary-300">Your Outfit</h3><p className="text-xs text-primary-600/70 dark:text-primary-300/70">Items you've selected.</p></div>
                <Sparkles className="h-5 w-5 text-primary-500" />
              </div>
              <div className="mt-4 space-y-3 max-h-[calc(80vh-250px)] overflow-y-auto pr-2 -mr-2">
                {selectedClothes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No items selected yet.</div>
                ) : (
                  selectedClothes.map((cloth) => (
                    <CanvasChip key={cloth.id} cloth={{ ...cloth, categoryName: categoryNameLookup.get(cloth.categoryId) }} onRemove={handleRemoveCloth} />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </form>
    </Modal>
  );
}