import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { useToast } from '../../context/ToastProvider.jsx';

export default function AddActivityModal({ open, onClose, date, outfits, clothes, categories, onSubmit }) {
  const { createOutfit } = useWardrobeStore();
  const [activeTab, setActiveTab] = useState('outfits');
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [selectedClothIds, setSelectedClothIds] = useState([]);
  const [activityDate, setActivityDate] = useState(date);
  const [saveAsOutfit, setSaveAsOutfit] = useState(false);
  const [newOutfitName, setNewOutfitName] = useState('');
  const [outfitSearch, setOutfitSearch] = useState('');
  const [clothSearch, setClothSearch] = useState('');
  const scrollContainerRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (open) {
      setActivityDate(date);
      setActiveTab('outfits');
      setSelectedOutfitId(null);
      setSelectedClothIds([]);
      setSaveAsOutfit(false);
      setNewOutfitName('');
      setOutfitSearch('');
      setClothSearch('');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [open, date]);

  useEffect(() => {
    if (activeTab === 'outfits') {
      setSelectedClothIds([]);
      setSaveAsOutfit(false);
      setNewOutfitName('');
    } else if (activeTab === 'clothes') {
      setSelectedOutfitId(null);
    }
  }, [activeTab]);

  const groupedClothes = useMemo(() => {
    if (!categories || !clothes) return [];

    const query = clothSearch.trim().toLowerCase();

    const groups = [];
    const walk = (nodes = [], lineage = []) => {
      nodes.forEach((node) => {
        const path = [...lineage, node.name];
        const groupClothes = clothes.filter((cloth) => cloth.categoryId === node.id);
        if (groupClothes.length) {
          const filtered = query
            ? groupClothes.filter((cloth) => cloth.name.toLowerCase().includes(query))
            : groupClothes;
          if (filtered.length) {
            groups.push({ id: node.id, name: path.join(' • '), clothes: filtered });
          }
        }
        if (Array.isArray(node.children) && node.children.length) {
          walk(node.children, path);
        }
      });
    };

    walk(categories, []);
    return groups;
  }, [categories, clothes, clothSearch]);

  const filteredOutfits = useMemo(() => {
    if (!outfits) return [];
    const query = outfitSearch.trim().toLowerCase();
    if (!query) return outfits;
    return outfits.filter((outfit) => (outfit.name || '').toLowerCase().includes(query));
  }, [outfits, outfitSearch]);

  const handleClothToggle = (clothId) => {
    setSelectedClothIds((prev) =>
      prev.includes(clothId) ? prev.filter((id) => id !== clothId) : [...prev, clothId]
    );
  };

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split('-').map(p => parseInt(p, 10));
    setActivityDate(new Date(year, month - 1, day));
  };
  
  const handleSubmit = async () => {
    let payload = null;
    if (activeTab === 'outfits' && selectedOutfitId) {
      payload = { type: 'outfit', outfitId: selectedOutfitId };
    } else if (activeTab === 'clothes' && selectedClothIds.length > 0) {
      if (saveAsOutfit && newOutfitName) {
        try {
          const newOutfit = await createOutfit({ name: newOutfitName, clothIds: selectedClothIds });
          if (newOutfit?.id) {
            addToast('Outfit saved for quick logging!', { type: 'success' });
            payload = { type: 'outfit', outfitId: newOutfit.id };
          }
        } catch (error) {
          console.error('Failed to create outfit from selection', error);
          addToast('Could not save outfit. Try again.', { type: 'error' });
          return;
        }
      } else {
        payload = { type: 'individual', clothIds: selectedClothIds };
      }
    }
    if (payload) {
      try {
        await onSubmit(payload);
        addToast('Activity logged successfully!', { type: 'success' });
      } catch (error) {
        console.error('Failed to log activity', error);
        addToast('Something went wrong while logging.', { type: 'error' });
      }
    }
  };

  const isSubmitDisabled = 
    (activeTab === 'outfits' && !selectedOutfitId) ||
    (activeTab === 'clothes' && selectedClothIds.length === 0) ||
    (activeTab === 'clothes' && saveAsOutfit && !newOutfitName);

  const clearClothSelection = () => {
    setSelectedClothIds([]);
    setSaveAsOutfit(false);
    setNewOutfitName('');
  };

  const footer = (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
        Log Activity
      </Button>
    </div>
  );
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Activity"
      size="2xl"
      bodyClassName="px-0 py-0"
      footer={footer}
    >
      <div
        ref={scrollContainerRef}
        className="w-full sm:w-[520px] md:w-[660px] lg:w-[760px] flex flex-col gap-5 px-5 py-6 max-h-[72vh] overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="activity-date">
              Date
            </label>
            <Input
              id="activity-date"
              type="date"
              value={activityDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="sm:w-48"
            />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="sm:min-w-[140px]">
            Log Activity
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mt-2">
            <TabsTrigger value="outfits" className="rounded-lg py-2 text-sm">
              Saved Outfits
            </TabsTrigger>
            <TabsTrigger value="clothes" className="rounded-lg py-2 text-sm">
              Individual Items
            </TabsTrigger>
          </TabsList>
          <div className="mt-4 space-y-4">
            <TabsContent value="outfits">
              <div className="space-y-3">
                <Input
                  placeholder="Search outfits..."
                  value={outfitSearch}
                  onChange={(e) => setOutfitSearch(e.target.value)}
                  aria-label="Search saved outfits"
                />

                <div className="max-h-72 overflow-y-auto pr-1 scrollbar-hide">
                  {filteredOutfits.length ? (
                    <div className="space-y-2">
                      {filteredOutfits.map((outfit) => (
                        <button
                          key={outfit.id}
                          onClick={() => setSelectedOutfitId(outfit.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${
                            selectedOutfitId === outfit.id
                              ? 'border-primary-deep bg-primary-deep/10 dark:bg-primary-bright/15 text-primary-deep dark:text-primary-bright'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <p className="font-medium flex items-center justify-between">
                            <span>{outfit.name}</span>
                            {Array.isArray(outfit.clothIds) && (
                              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                {outfit.clothIds.length} items
                              </span>
                            )}
                          </p>
                          {outfit.notes ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{outfit.notes}</p>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6">No outfits match your search.</p>
                  )}
                </div>

                {selectedOutfitId && (
                  <div className="rounded-xl border border-emerald-300/70 dark:border-emerald-600/60 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-200">
                    Ready to log <strong className="font-semibold">{filteredOutfits.find((o) => o.id === selectedOutfitId)?.name}</strong>
                    {filteredOutfits.find((o) => o.id === selectedOutfitId)?.clothIds?.length ? (
                      <span> · {filteredOutfits.find((o) => o.id === selectedOutfitId).clothIds.length} pieces</span>
                    ) : null}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="clothes">
              <div className="space-y-4">
                <Input
                  placeholder="Search items..."
                  value={clothSearch}
                  onChange={(e) => setClothSearch(e.target.value)}
                  aria-label="Search wardrobe items"
                />

                <div className="max-h-72 overflow-y-auto pr-1 space-y-4 scrollbar-hide">
                  {groupedClothes.length > 0 ? (
                    groupedClothes.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {group.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">{group.clothes.length}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {group.clothes.map((cloth) => {
                            const isSelected = selectedClothIds.includes(cloth.id);
                            return (
                              <button
                                key={cloth.id}
                                onClick={() => handleClothToggle(cloth.id)}
                                className={`p-2 rounded-xl border text-center transition-colors ${
                                  isSelected
                                    ? 'border-primary-deep bg-primary-deep/10 dark:bg-primary-bright/15 text-primary-deep dark:text-primary-bright'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                              >
                                <div className="text-xs font-medium truncate">{cloth.name}</div>
                                {cloth.color ? (
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">{cloth.color}</div>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6">No items match your filters.</p>
                  )}
                </div>

                {selectedClothIds.length > 0 && (
                  <div className="rounded-xl border border-blue-200/80 dark:border-blue-700/60 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{selectedClothIds.length} item{selectedClothIds.length > 1 ? 's' : ''} selected</span>
                      <button
                        type="button"
                        onClick={clearClothSelection}
                        className="text-xs text-blue-600 dark:text-blue-300 underline"
                      >
                        Clear
                      </button>
                    </div>

                    {selectedClothIds.length > 1 && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input type="checkbox" checked={saveAsOutfit} onChange={(e) => setSaveAsOutfit(e.target.checked)} />
                          Save selection as outfit
                        </label>
                        {saveAsOutfit && (
                          <Input
                            placeholder="Name this outfit..."
                            value={newOutfitName}
                            onChange={(e) => setNewOutfitName(e.target.value)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Modal>
  );
}