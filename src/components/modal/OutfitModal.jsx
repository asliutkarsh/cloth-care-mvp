import React, { useState, useEffect, useMemo } from 'react';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, label, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm cursor-grab"
      style={style}
    >
      <span className="truncate text-sm">{label}</span>
      <button type="button" onClick={() => onRemove?.(id)} className="text-xs text-red-500 hover:underline">
        Remove
      </button>
    </div>
  );
}

export default function OutfitModal({ open, onClose, onSubmit, initialData = null }) {
  const { clothes, categories = [] } = useWardrobeStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [name, setName] = useState('');
  const [canvasIds, setCanvasIds] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const tags = useMemo(() =>
    tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  , [tagsInput]);
  const { outfitTagSuggestions = [], fetchPreferences, preferences } = useSettingsStore();
  const outfitTagStats = preferences?.outfitTagStats || {};

  useEffect(() => {
    if (!outfitTagSuggestions?.length) fetchPreferences();
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCanvasIds(initialData.clothIds || []);
      setTagsInput((initialData.tags || []).join(', '));
    } else {
      setName('');
      setCanvasIds([]);
      setTagsInput('');
    }
    // Reset drag state when modal opens/closes
    setIsDraggingOver(false);
  }, [initialData, open]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const cleanClothes = useMemo(
    () => clothes.filter((c) => c.status === 'clean' && c.name.toLowerCase().includes((debouncedSearch||'').toLowerCase()) && (!categoryId || c.categoryId === categoryId)),
    [clothes, debouncedSearch, categoryId]
  );

  const filteredLeftList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cleanClothes.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q);
      const matchesCategory = !categoryId || c.categoryId === categoryId;
      return matchesQuery && matchesCategory;
    });
  }, [cleanClothes, search, categoryId]);

  const handleAddToCanvas = (id) => {
    setCanvasIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRemoveFromCanvas = (id) => {
    setCanvasIds((prev) => prev.filter((x) => x !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    // If dragging from left list into canvas area
    if (overId === 'canvas' && !canvasIds.includes(activeId)) {
      handleAddToCanvas(activeId);
      return;
    }
    // Reorder within canvas if both IDs are in canvasIds
    if (canvasIds.includes(activeId) && canvasIds.includes(overId) && activeId !== overId) {
      const oldIndex = canvasIds.indexOf(activeId);
      const newIndex = canvasIds.indexOf(overId);
      setCanvasIds((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, clothIds: canvasIds, tags });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Outfit' : 'Create Outfit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Outfit Name"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tags input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="#summer, #casual" />
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      const next = tags.filter(x => x.toLowerCase() !== t.toLowerCase())
                      setTagsInput(next.join(', '))
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 hover:opacity-80"
                    title="Remove tag"
                  >
                    <span>{t}</span>
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}
            {outfitTagSuggestions?.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">Suggestions</div>
                <div className="flex flex-wrap gap-2">
                  {[...outfitTagSuggestions]
                    .sort((a, b) => {
                      const sa = outfitTagStats[a] || { count: 0, lastUsed: '' }
                      const sb = outfitTagStats[b] || { count: 0, lastUsed: '' }
                      if (sb.count !== sa.count) return sb.count - sa.count
                      return (sb.lastUsed || '').localeCompare(sa.lastUsed || '')
                    })
                    .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        // Add if not present
                        const current = new Set(tags.map(x => x.toLowerCase()))
                        const norm = s.toLowerCase()
                        if (!current.has(norm)) {
                          const next = [...tags, s]
                          setTagsInput(next.join(', '))
                        }
                      }}
                      className="px-2 py-0.5 rounded-full text-xs border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Left: Clean clothes list */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clothes"
              />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 px-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="max-h-72 overflow-y-auto grid grid-cols-2 gap-2">
                {filteredLeftList.map((cloth) => (
                  <div
                    key={cloth.id}
                    id={cloth.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', cloth.id);
                    }}
                    onDoubleClick={() => handleAddToCanvas(cloth.id)}
                    className="p-2 rounded-md border border-gray-200 dark:border-gray-700 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-grab"
                    title="Drag to add or double-click to add"
                  >
                    {cloth.name}
                  </div>
                ))}
              </div>

              {/* Right panel drop area is outside this DndContext visual but handled via id */}
            </DndContext>
          </div>

          {/* Right: Canvas */}
          <div className="border rounded-lg p-3 min-h-72">
            <div className="text-sm font-medium mb-2">Your Outfit</div>
            <div
              id="canvas"
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={(e) => {
                // Only set to false if we're leaving the canvas entirely
                // (not just moving between child elements)
                if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
                  setIsDraggingOver(false);
                }
              }}
              onDrop={(e) => {
                const id = e.dataTransfer.getData('text/plain');
                if (id) handleAddToCanvas(id);
                setIsDraggingOver(false);
              }}
              className={`min-h-48 rounded-md border-2 border-dashed p-2 transition-all duration-200 ${
                isDraggingOver
                  ? 'border-primary-deep bg-primary-deep/10 dark:border-primary-bright dark:bg-primary-bright/10'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <SortableContext items={canvasIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {canvasIds.map((id) => {
                    const item = clothes.find((c) => c.id === id);
                    if (!item) return null;
                    return (
                      <SortableItem
                        key={id}
                        id={id}
                        label={item.name}
                        onRemove={handleRemoveFromCanvas}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Outfit</Button>
        </div>
      </form>
    </Modal>
  );
}