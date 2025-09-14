import React, { useState } from 'react';
import { Button } from '../ui';
import { Shirt, Check } from 'lucide-react';

export default function LaundryList({ title, items, actionText, onAction }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleActionClick = () => {
    onAction(selectedIds);
    setSelectedIds([]); // Clear selection after action
  };

  return (
    <div className="glass-card p-4 sm:p-6">
      <h2 className="text-xl font-bold mb-4">{title} ({items.length})</h2>
      {items.length > 0 ? (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => toggleSelection(item.id)}
                className={`w-full flex items-center gap-4 p-3 text-left rounded-lg transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/50'}`}
              >
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                  {selectedIds.includes(item.id) && <Check size={16} className="text-white" />}
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.color}</p>
                </div>
              </button>
            ))}
          </div>
          <Button
            onClick={handleActionClick}
            disabled={selectedIds.length === 0}
            fullWidth
            className="mt-4"
          >
            {actionText} ({selectedIds.length})
          </Button>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Shirt size={32} className="mx-auto mb-2" />
          <p>Nothing here!</p>
        </div>
      )}
    </div>
  );
}