import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';
import { Shirt, Check, CheckSquare, Square } from 'lucide-react';
import { useToast } from '../../context/ToastProvider.jsx';

// --- New, Visually-Rich Item Card Component ---
const LaundryItemCard = ({ item, isSelected, onToggle }) => (
  <motion.div
    layout="position"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    onClick={() => onToggle(item.id)}
    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
  >
    {/* --- Image or Fallback Icon --- */}
    {item.imageUrl ? (
      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <Shirt className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" />
      </div>
    )}
    
    {/* --- Gradient Overlay & Name --- */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <p className="absolute bottom-2 left-3 right-3 text-sm font-bold text-white truncate">{item.name}</p>

    {/* --- Selection Checkmark --- */}
    <div className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-200
      ${isSelected 
        ? 'bg-primary-500 border-primary-500' 
        : 'bg-black/30 border-white/50 group-hover:border-white'
      }`}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={16} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);


// --- Main LaundryList Component ---
export default function LaundryList({ title, items, actionText, onAction }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const allIds = useMemo(() => items.map(item => item.id), [items]);
  const areAllSelected = useMemo(() => allIds.length > 0 && selectedIds.length === allIds.length, [selectedIds, allIds]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const toggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleActionClick = async () => {
    if (!selectedIds.length) return;
    setIsProcessing(true);
    try {
      await onAction(selectedIds);
      addToast(`${selectedIds.length} item(s) updated!`, { type: 'success' });
      setSelectedIds([]);
    } catch (error) {
      addToast('Could not update laundry. Please try again.', { type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {items.length > 0 ? (
        <>
          {/* --- Header with Select All --- */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-bold">{title} ({items.length})</h2>
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="flex items-center gap-2">
              {areAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              {areAllSelected ? 'Clear All' : 'Select All'}
            </Button>
          </div>

          {/* --- Items Grid --- */}
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map(item => (
                <LaundryItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.includes(item.id)}
                  onToggle={toggleSelection}
                />
              ))}
          </motion.div>
        </>
      ) : (
        <div className="text-center py-12 px-4 glass-card rounded-xl">
          <Shirt size={40} className="mx-auto mb-4 text-gray-400" />
          <p className="font-semibold">Nothing here!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Items marked as dirty will appear here.</p>
        </div>
      )}

      {/* --- Smart Action Bar --- */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "tween", ease: "easeInOut" }}
            className="fixed bottom-4 left-4 right-4 z-40"
          >
            <div className="max-w-4xl mx-auto">
                <Button
                    onClick={handleActionClick}
                    disabled={isProcessing}
                    fullWidth
                    size="lg"
                    className="shadow-2xl"
                >
                    {isProcessing ? 'Working…' : `${actionText} (${selectedIds.length} Item${selectedIds.length > 1 ? 's' : ''})`}
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}