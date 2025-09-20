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
                className={`w-full flex items-center gap-4 p-3 text-left rounded-lg transition-colors ${selectedIds.includes(item.id) ? 'bg-primary-bright/10 dark:bg-primary-deep/20' : 'hover:bg-accent-violet/10'}`}
              >
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-primary-deep border-primary-deep' : 'border-gray-300 dark:border-gray-600'}`}>
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
        <div className="text-center py-8 glass-card border border-dashed border-accent-violet/40 bg-accent-violet/10 text-coolgray-700 dark:text-coolgray-500">
          <Shirt size={32} className="mx-auto mb-2 text-accent-violet" />
          <p className="mb-1">Nothing here!</p>
          <p className="text-sm">Items marked <span className="tag-dirty">Dirty</span> or <span className="tag-new">New</span> will appear here.</p>
        </div>
      )}
    </div>
  );
}