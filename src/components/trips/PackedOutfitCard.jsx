import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MinusCircle } from 'lucide-react';
import { getClothStatusMeta } from '../../utils/clothStatus';

const PackedClothItem = ({ cloth, isPacked, onToggle }) => {
  const statusMeta = getClothStatusMeta(cloth.status);
  // MODIFIED: This now allows the status to be shown even if it's 'clean'
  const showStatus = cloth.status;

  return (
    <div className="flex items-center gap-3 pl-4 py-2">
      <input
        type="checkbox"
        checked={isPacked}
        onChange={() => onToggle(cloth.id, 'cloth')}
        className="h-4 w-4 rounded border-gray-400 text-primary-deep focus:ring-primary-deep"
      />
      <span
        className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-white/40 dark:border-gray-700"
        style={{ backgroundColor: cloth.color || '#1f2937' }}
      >
        {cloth.image ? (
          <img src={cloth.image} alt={cloth.name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/90">
            {cloth.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{cloth.name}</p>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <span>{cloth.categoryName || 'Uncategorized'}</span>
          {showStatus && <span className={`${statusMeta.className} px-2 py-0.5`}>{statusMeta.label}</span>}
        </div>
      </div>
    </div>
  );
};

export default function PackedOutfitCard({ outfit, trip, onTogglePacked, onRemove, outfitStatus, clothesMap }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const outfitClothes = useMemo(() => {
    return (outfit.clothIds || []).map((id) => clothesMap.get(id)).filter(Boolean);
  }, [outfit, clothesMap]);

  const buttonStyles = {
    full: 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-300',
    partial: 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-300',
    none: 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300',
  };

  const buttonLabels = {
    full: 'Packed',
    partial: 'Pack Remaining',
    none: 'Pack All',
  };

  const handlePackAll = () => {
    const clothIdsToPack = outfitClothes.map((c) => c.id);
    onTogglePacked(clothIdsToPack, 'cloth-bulk');
  };

  return (
    <div
      className={`rounded-xl border transition-colors ${
        outfitStatus === 'full'
          ? 'border-emerald-300/80 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/30'
          : outfitStatus === 'partial'
            ? 'border-amber-300/80 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/30'
            : 'border-gray-200/70 dark:border-gray-700/60'
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left flex-1"
        >
          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{outfit.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{outfit.clothIds?.length || 0} pieces</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePackAll}
            className={`rounded-full border px-2 py-1 text-xs font-semibold ${buttonStyles[outfitStatus]}`}
          >
            {buttonLabels[outfitStatus]}
          </button>
          <button
            type="button"
            onClick={() => onRemove(outfit.id, 'outfit', { clothIds: outfitClothes.map((c) => c.id) })}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            aria-label={`Remove ${outfit.name}`}
          >
            <MinusCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200/70 dark:border-gray-700/60"
          >
            {outfitClothes.map((cloth) => (
              <PackedClothItem
                key={cloth.id}
                cloth={cloth}
                isPacked={(trip.packedClothIds || []).includes(cloth.id)}
                onToggle={onTogglePacked}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}