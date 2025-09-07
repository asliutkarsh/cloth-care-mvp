import React, { useState, useEffect, useMemo } from 'react';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

export default function AddActivityModal({ open, onClose, date, outfits, clothes, categories, onSubmit }) {
  const { createOutfit } = useWardrobeStore();
  const [activeTab, setActiveTab] = useState('outfits');
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [selectedClothIds, setSelectedClothIds] = useState([]);
  const [activityDate, setActivityDate] = useState(date);
  const [saveAsOutfit, setSaveAsOutfit] = useState(false);
  const [newOutfitName, setNewOutfitName] = useState('');

  useEffect(() => {
    if (open) {
      setActivityDate(date);
      setActiveTab('outfits');
      setSelectedOutfitId(null);
      setSelectedClothIds([]);
      setSaveAsOutfit(false);
      setNewOutfitName('');
    }
  }, [open, date]);

  const groupedClothes = useMemo(() => {
    if (!categories || !clothes) return [];
    return categories.map(category => ({
      ...category,
      clothes: clothes.filter(cloth => cloth.categoryId === category.id)
    })).filter(group => group.clothes.length > 0);
  }, [clothes, categories]);

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
        const newOutfit = await createOutfit({ name: newOutfitName, clothIds: selectedClothIds });
        payload = { type: 'outfit', outfitId: newOutfit.id };
      } else {
        payload = { type: 'individual', clothIds: selectedClothIds };
      }
    }
    if (payload) {
      onSubmit(payload);
    }
  };

  const isSubmitDisabled = 
    (activeTab === 'outfits' && !selectedOutfitId) ||
    (activeTab === 'clothes' && selectedClothIds.length === 0) ||
    (activeTab === 'clothes' && saveAsOutfit && !newOutfitName);

  return (
    <Modal open={open} onClose={onClose} title="Log Activity">
      <div className="w-full max-w-md md:min-w-[480px] flex flex-col">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <Input type="date" value={activityDate.toISOString().split('T')[0]} onChange={handleDateChange} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="outfits">Saved Outfits</TabsTrigger>
            <TabsTrigger value="clothes">Individual Items</TabsTrigger>
          </TabsList>
          <div className="mt-4 max-h-80 overflow-y-auto p-1">
            <TabsContent value="outfits">
              <div className="space-y-2">
                {outfits.map((outfit) => (
                  <button key={outfit.id} onClick={() => setSelectedOutfitId(outfit.id)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedOutfitId === outfit.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                    <p className="font-medium">{outfit.name}</p>
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="clothes">
              <div className="space-y-4">
                {groupedClothes.length > 0 ? groupedClothes.map(group => (
                  <div key={group.id}>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">{group.name}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {group.clothes.map(cloth => (
                        <button key={cloth.id} onClick={() => handleClothToggle(cloth.id)} className={`p-2 rounded-lg border text-center transition-colors ${selectedClothIds.includes(cloth.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                          <div className="text-xs font-medium truncate">{cloth.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-500 text-center py-4">No clean clothes available.</p>}
                
                {selectedClothIds.length > 1 && (
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1">
                      <input type="checkbox" checked={saveAsOutfit} onChange={(e) => setSaveAsOutfit(e.target.checked)} />
                      Save as new outfit
                    </label>
                    {saveAsOutfit && (
                      <Input placeholder="New outfit name..." value={newOutfitName} onChange={(e) => setNewOutfitName(e.target.value)} />
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-6">
          <Button onClick={handleSubmit} disabled={isSubmitDisabled} fullWidth>
            Log Activity
          </Button>
        </div>
      </div>
    </Modal>
  );
}