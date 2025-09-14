import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui';
import OutfitModal from '../components/modal/OutfitModal';
import ConfirmationModal from '../components/modal/ConfirmationModal';

export default function OutfitDetailPage() {
  const navigate = useNavigate();
  const { outfitId } = useParams();
  const { outfits, clothes, updateOutfit, removeOutfit, isInitialized } = useWardrobeStore();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const outfit = useMemo(() => 
    outfits.find(o => o.id === outfitId), 
    [outfits, outfitId]
  );
  
  const itemsInOutfit = useMemo(() => {
    if (!outfit) return [];
    return outfit.clothIds.map(id => clothes.find(c => c.id === id)).filter(Boolean);
  }, [outfit, clothes]);

  if (!isInitialized) return <div>Loading...</div>;
  if (!outfit) return <div>Outfit not found.</div>;

  const handleDelete = async () => {
    await removeOutfit(outfitId);
    navigate('/wardrobe');
  };

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate('/wardrobe')} variant="ghost" size="icon" aria-label="Back to wardrobe">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">{outfit.name}</h1>
      </header>
      
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-2">Items in this Outfit:</h3>
        <ul className="list-disc list-inside space-y-1">
          {itemsInOutfit.map(item => <li key={item.id}>{item.name}</li>)}
        </ul>
        
        <div className="flex gap-4 mt-6 border-t pt-6">
          <Button onClick={() => setEditModalOpen(true)} className="flex-1">
            <Edit size={16} className="mr-2" /> Edit Outfit
          </Button>
          <Button onClick={() => setConfirmDeleteOpen(true)} variant="danger" className="flex-1">
            <Trash2 size={16} className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      <OutfitModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={outfit}
        onSubmit={(updatedData) => {
          updateOutfit(outfitId, updatedData);
          setEditModalOpen(false);
        }}
      />

      <ConfirmationModal
        open={isConfirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Outfit?"
        message={`Are you sure you want to delete "${outfit.name}"?`}
        isDanger={true}
      />
    </main>
  );
}