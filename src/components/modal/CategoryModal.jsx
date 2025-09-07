import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function CategoryModal({ open, onClose, onSubmit, initialData = null }) {
  const [name, setName] = useState('');
  const [maxWearCount, setMaxWearCount] = useState(2);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setMaxWearCount(initialData.maxWearCount || 2);
    } else {
      setName('');
      setMaxWearCount(2);
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, maxWearCount });
    onClose();
  };

  const title = initialData ? 'Edit Category' : 'Add Category';

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., T-Shirts"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Wears Before Washing
          </label>
          <Input
            type="number"
            value={maxWearCount}
            onChange={(e) => setMaxWearCount(parseInt(e.target.value, 10))}
            min="1"
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Category</Button>
        </div>
      </form>
    </Modal>
  );
}