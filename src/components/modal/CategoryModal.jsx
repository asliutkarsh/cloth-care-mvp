import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import EmojiPicker from '../ui/EmojiPicker';

export default function CategoryModal({ open, onClose, onSubmit, initialData = null }) {
  const [name, setName] = useState('');
  const [maxWearCount, setMaxWearCount] = useState(2);
  const [icon, setIcon] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setMaxWearCount(initialData.maxWearCount || 2);
      setIcon(initialData.icon || '');
    } else {
      setName('');
      setMaxWearCount(2);
      setIcon('');
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (icon || '').trim();
    // Simple emoji validation using Extended_Pictographic unicode class
    const isEmoji = (s) => /\p{Extended_Pictographic}/u.test(s);
    const finalIcon = trimmed ? (isEmoji(trimmed) ? trimmed : '👕') : '👕';
    onSubmit({ name, maxWearCount, icon: finalIcon });
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Icon (optional)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-2xl"
              onClick={() => setShowPicker((p) => !p)}
              title="Pick an emoji"
            >
              <span>{icon || '👕'}</span>
            </button>
            <Input
              value={icon}
              onChange={(e) => {
                const val = (e.target.value || '').trim();
                // Capture first emoji using Extended_Pictographic
                const m = val.match(/\p{Extended_Pictographic}/u);
                setIcon(m ? m[0] : '');
              }}
              placeholder="e.g., 👕"
            />
          </div>
          {showPicker && (
            <div className="mt-2 relative z-20">
              <EmojiPicker
                value={icon}
                onChange={(e) => { setIcon(e); setShowPicker(false); }}
              />
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">Must be an emoji. If left blank or invalid, defaults to 👕.</p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Category</Button>
        </div>
      </form>
    </Modal>
  );
}