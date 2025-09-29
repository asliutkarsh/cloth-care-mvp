import React, { useState, useEffect, useMemo } from 'react';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { BadgePlus, Tag, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastProvider.jsx';

const tagFromInput = (value = '') =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

const ClothChip = ({ cloth, onAdd, selected }) => {
  const color = cloth?.color || '#1f2937';
  return (
    <button
      type="button"
      onClick={() => onAdd?.(cloth.id)}
      className={`group relative flex items-center gap-3 rounded-xl border transition shadow-sm backdrop-blur py-2 pl-2 pr-3 text-left ${
        selected
          ? 'border-primary-deep/70 bg-primary-deep/10 dark:border-primary-bright/60 dark:bg-primary-bright/10'
          : 'border-gray-200/70 bg-white/80 hover:border-primary-deep/60 dark:border-gray-700/60 dark:bg-gray-900/60 hover:shadow-lg'
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
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cloth.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          Worn {cloth.currentWearCount ?? 0} {cloth.currentWearCount === 1 ? 'time' : 'times'}
        </p>
      </div>
      {!selected && (
        <BadgePlus className="h-4 w-4 text-primary-deep/80 dark:text-primary-bright" />
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
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cloth.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cloth.categoryName || 'Uncategorized'}</p>
    </div>
    <button
      type="button"
      onClick={() => onRemove?.(cloth.id)}
      className="rounded-full border border-transparent p-1 text-gray-400 transition hover:border-red-200 hover:text-red-500 dark:hover:text-red-400"
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

  useEffect(() => {
    if (open && !outfitTagSuggestions.length) {
      fetchPreferences();
    }
  }, [open, outfitTagSuggestions.length, fetchPreferences]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSelectedClothIds(initialData.clothIds || []);
      setTagsInput((initialData.tags || []).join(', '));
    } else {
      setName('');
      setSelectedClothIds([]);
      setTagsInput('');
    }
  }, [initialData, open]);

  const tagList = useMemo(() => tagFromInput(tagsInput), [tagsInput]);

  const filteredClothes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clothes
      .filter((cloth) => cloth.status === 'clean')
      .filter((cloth) => (!q ? true : cloth.name.toLowerCase().includes(q)))
      .filter((cloth) => (!categoryFilter ? true : cloth.categoryId === categoryFilter));
  }, [clothes, query, categoryFilter]);

  const selectedClothes = useMemo(
    () => selectedClothIds.map((id) => clothes.find((c) => c.id === id)).filter(Boolean),
    [selectedClothIds, clothes]
  );

  const handleAddCloth = (id) => {
    setSelectedClothIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRemoveCloth = (id) => {
    setSelectedClothIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      addToast('Please give the outfit a name.', { type: 'error' });
      return;
    }
    if (!selectedClothIds.length) {
      addToast('Add at least one item to the outfit.', { type: 'error' });
      return;
    }

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

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Outfit' : 'Create Outfit'} size="3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          <section className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Outfit name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekend brunch"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tags</label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="#summer, #casual"
              />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-deep/10 text-primary-deep px-3 py-1 text-xs font-medium dark:bg-primary-bright/20 dark:text-primary-bright"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {tagSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tagSuggestions.slice(0, 8).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        const next = [...tagList, suggestion];
                        setTagsInput(next.join(', '));
                      }}
                      className="rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-200 hover:border-primary-deep hover:text-primary-deep"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 shadow-sm">
              <div className="border-b border-gray-200/70 dark:border-gray-700/60 px-4 py-3 flex flex-wrap items-center gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your wardrobe"
                  className="flex-1"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 max-h-[400px] overflow-y-auto">
                {filteredClothes.map((cloth) => (
                  <ClothChip
                    key={cloth.id}
                    cloth={cloth}
                    selected={selectedClothIds.includes(cloth.id)}
                    onAdd={handleAddCloth}
                  />
                ))}
                {filteredClothes.length === 0 && (
                  <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">No items match those filters.</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-dashed border-primary-deep/50 dark:border-primary-bright/40 bg-primary-deep/5 dark:bg-primary-bright/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-primary-deep dark:text-primary-bright">Your outfit</h3>
                  <p className="text-xs text-primary-deep/70 dark:text-primary-bright/70">Drag or click items to build the look.</p>
                </div>
                <Sparkles className="h-5 w-5 text-primary-deep dark:text-primary-bright" />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {selectedClothes.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No items selected yet. Add pieces from the left.
                  </div>
                )}
                {selectedClothes.map((cloth) => (
                  <CanvasChip key={cloth.id} cloth={{ ...cloth, categoryName: categories.find((c) => c.id === cloth.categoryId)?.name }} onRemove={handleRemoveCloth} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 px-4 py-3 text-sm">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Quick tips</p>
              <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <li>• Double-click a wardrobe item to add it instantly.</li>
                <li>• Click a selected item to remove it.</li>
                <li>• Tags help surface outfits in search.</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Outfit</Button>
        </div>
      </form>
    </Modal>
  );
}