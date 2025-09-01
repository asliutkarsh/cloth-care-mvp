import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import * as ClothService from '../../../services/clothService';
import * as OutfitService from '../../../services/outfitService';
import Button from '../../common/Button';
import CreateOutfitModal from './CreateOutfitModal';

export default function OutfitsTabContent() {
  const [outfits, setOutfits] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorLoadingImageIds, setErrorLoadingImageIds] = useState(new Set());

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    try {
      setLoading(true);
      const outfitsData = await OutfitService.getAll();
      setOutfits(Array.isArray(outfitsData) ? outfitsData : []);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async (outfitData) => {
    try {
      setLoading(true);
      if (editingOutfit) {
        await OutfitService.update(editingOutfit.id, outfitData);
      } else {
        await OutfitService.create(outfitData);
      }
      await loadOutfits();
      setEditingOutfit(null);
    } catch (error) {
      console.error('Error saving outfit:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditOutfit = (outfit) => {
    setEditingOutfit(outfit);
    setShowCreateModal(true);
  };

  const handleDeleteOutfit = async (outfitId) => {
    if (!window.confirm('Are you sure you want to delete this outfit? This action cannot be undone.')) return;

    try {
      setDeletingId(outfitId);
      await OutfitService.deleteOutfit(outfitId);
      await loadOutfits();
    } catch (error) {
      console.error('Error deleting outfit:', error);
      alert('Failed to delete outfit. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageError = (outfitId) => {
    setErrorLoadingImageIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(outfitId);
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Outfits</h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
          disabled={loading}
        >
          <Plus size={16} />
          {loading ? 'Loading...' : 'Create Outfit'}
        </Button>
      </div>

      {/* Outfits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outfits.map((outfit) => {
          const imageError = errorLoadingImageIds.has(outfit.id);
          return (
            <div
              key={outfit.id}
              className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Image */}
                {!imageError && outfit.image ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={outfit.image}
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(outfit.id)}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                )}

                {/* Outfit Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {outfit.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {outfit.clothIds?.length || 0} items
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOutfit(outfit);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Edit outfit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOutfit(outfit.id);
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
                    title="Delete outfit"
                    disabled={deletingId === outfit.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Clothes in Outfit */}
              <div className="space-y-1">
                {outfit.clothIds?.map((clothId) => {
                  const cloth = ClothService.getById(clothId);
                  return (
                    <div key={clothId} className="text-sm text-gray-700 dark:text-gray-300">
                      • {cloth ? cloth.name : 'Unknown Item'}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {outfits.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No outfits created yet.</p>
        </div>
      )}

      {/* Create/Edit Outfit Modal */}
      <CreateOutfitModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingOutfit(null);
        }}
        onSubmit={async (outfitData) => {
          try {
            await handleSaveOutfit(outfitData);
            setShowCreateModal(false);
            setEditingOutfit(null);
          } catch (error) {
            console.error('Error in outfit form submission:', error);
          }
        }}
        initialData={editingOutfit}
      />
    </div>
  );
}
