import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { ArrowLeft, Edit, Trash2, Palette, Sparkles, Tag } from 'lucide-react';
import { Button } from '../components/ui';
import ClothModal from '../components/modal/ClothModal'; // We'll reuse the Add/Edit modal
import ConfirmationModal from '../components/modal/ConfirmationModal';

// A small component for displaying details
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 py-3">
    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium">{value || 'N/A'}</p>
    </div>
  </div>
);

export default function ClothDetailPage() {
  const navigate = useNavigate();
  const { clothId } = useParams();
  
  // Get all data and actions from the store
  const { clothes, categories, updateCloth, removeCloth, isInitialized } = useWardrobeStore();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Find the specific cloth item from the store's state
  const cloth = useMemo(() => 
    clothes.find(c => c.id === clothId), 
    [clothes, clothId]
  );
  
  const category = useMemo(() => {
    if (!cloth || !categories) return null;
    // This is a simple lookup, a more complex app might need a recursive find
    return categories.flatMap(c => [c, ...(c.children || [])]).find(cat => cat.id === cloth.categoryId);
  }, [cloth, categories]);

  if (!isInitialized) return <div>Loading item...</div>;
  if (!cloth) return <div>Cloth not found. It may have been deleted.</div>;

  const handleDelete = async () => {
    await removeCloth(clothId);
    navigate('/wardrobe'); // Go back to the main wardrobe after deleting
  };

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate('/wardrobe')} variant="ghost" size="icon" aria-label="Back to wardrobe">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold truncate">{cloth.name}</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg">
            {/* Image would go here */}
          </div>
        </div>
        
        <div className="md:col-span-2 glass-card p-6">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <DetailRow icon={<Tag size={18} />} label="Category" value={category?.name} />
            <DetailRow icon={<Palette size={18} />} label="Color" value={cloth.color} />
            <DetailRow icon={<Sparkles size={18} />} label="Status" value={cloth.status} />
          </div>
          
          <div className="flex gap-4 mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <Button onClick={() => setEditModalOpen(true)} className="flex-1">
              <Edit size={16} className="mr-2" /> Edit Item
            </Button>
            <Button onClick={() => setConfirmDeleteOpen(true)} variant="danger" className="flex-1">
              <Trash2 size={16} className="mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <ClothModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={cloth}
        onSubmit={(updatedData) => {
          updateCloth(clothId, updatedData);
          setEditModalOpen(false);
        }}
      />

      <ConfirmationModal
        open={isConfirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Cloth?"
        message={`Are you sure you want to delete "${cloth.name}"? This action cannot be undone.`}
        isDanger={true}
      />
    </main>
  );
}