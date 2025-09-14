import React, { useState, useEffect } from 'react';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function OutfitModal({ open, onClose, onSubmit, initialData = null }) {
  const { clothes } = useWardrobeStore();
  const [name, setName] = useState('');
  const [selectedClothIds, setSelectedClothIds] = useState([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSelectedClothIds(initialData.clothIds || []);
    }
  }, [initialData, open]);

  const handleClothToggle = (clothId) => {
    setSelectedClothIds((prev) =>
      prev.includes(clothId) ? prev.filter((id) => id !== clothId) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, clothIds: selectedClothIds });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Outfit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Outfit Name"
          required
        />
        <div className="max-h-60 overflow-y-auto grid grid-cols-3 gap-2 p-2 border rounded-md">
          {clothes.filter(c => c.status === 'clean').map(cloth => (
            <button
              key={cloth.id}
              type="button"
              onClick={() => handleClothToggle(cloth.id)}
              className={`p-2 rounded-lg border text-center text-xs transition-colors ${selectedClothIds.includes(cloth.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
            >
              {cloth.name}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Outfit</Button>
        </div>
      </form>
    </Modal>
  );
}