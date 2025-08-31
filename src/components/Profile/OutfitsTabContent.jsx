import React, { useState, useEffect } from 'react';
import { Layers, Plus } from 'lucide-react';
import { OutfitService, ClothService } from '../../services/data';
import Button from '../common/Button';
// You would create this modal component
// import CreateOutfitModal from './CreateOutfitModal'; 

export default function OutfitsTabContent() {
  const [outfits, setOutfits] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = () => {
    setOutfits(OutfitService.getAll());
  };

  const handleCreateOutfit = (outfitData) => {
    OutfitService.create(outfitData);
    loadOutfits();
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Outfits</h3>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus size={16} />
          Create Outfit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outfits.map((outfit) => (
          <div
            key={outfit.id}
            className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layers size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{outfit.name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{outfit.clothIds.length} items</p>
              </div>
            </div>

            <div className="space-y-1">
              {outfit.clothIds.map((clothId) => {
                const cloth = ClothService.getById(clothId);
                return (
                  <div key={clothId} className="text-sm text-gray-700 dark:text-gray-300">
                    • {cloth ? cloth.name : 'Unknown Item'}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {outfits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No outfits created yet.</p>
        </div>
      )}

      {/* {showCreateModal && (
        <CreateOutfitModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOutfit}
        />
      )} */}
    </div>
  );
}
