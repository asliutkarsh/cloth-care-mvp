import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useWardrobeStore } from '../../stores/useWardrobeStore';

export default function ClothModal({ open, onClose, onSubmit, initialData = null }) {
  const categories = useWardrobeStore(state => state.categories);
  const [cloth, setCloth] = useState({});

  useEffect(() => {
    if (initialData) {
      setCloth(initialData); // Pre-fill form for editing
    } else {
      // Reset form for adding
      setCloth({ name: '', categoryId: '', color: '', status: 'clean' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCloth(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cloth);
    onClose();
  };

  const title = initialData ? 'Edit Cloth' : 'Add New Cloth';

  // Helper to flatten category tree for the select dropdown
  const getCategoryOptions = (categoryList, level = 0) => {
    let options = [];
    for (const category of categoryList) {
      options.push({ 
        value: category.id, 
        label: `${'—'.repeat(level)} ${category.name}` 
      });
      if (category.children && category.children.length > 0) {
        options = options.concat(getCategoryOptions(category.children, level + 1));
      }
    }
    return options;
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" value={cloth.name || ''} onChange={handleChange} placeholder="Cloth Name (e.g., Blue Denim Jacket)" required />
        
        <select name="categoryId" value={cloth.categoryId || ''} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800" required>
          <option value="" disabled>Select a category</option>
          {getCategoryOptions(categories).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        <Input name="color" value={cloth.color || ''} onChange={handleChange} placeholder="Color" />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}