import React, { useMemo, useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../common/Tabs';
import { Layers, Shirt } from 'lucide-react';

/**
 * AddActivityModal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - date: Date
 * - outfits: Array<{ id: string, name: string, items: string[] }>
 * - clothes: Array<{ id: string, name: string, category?: string, status?: string }>
 * - onSubmit: (payload: { type: 'outfit' | 'cloth', name: string, items: string[], date?: Date }) => void
 */
export default function AddActivityModal({ open, onClose, date, outfits = [], clothes = [], onSubmit }) {
    const [tab, setTab] = useState('outfits');
    const [selectedOutfit, setSelectedOutfit] = useState('');
    const [selectedClothes, setSelectedClothes] = useState([]);
    const [saveAsOutfit, setSaveAsOutfit] = useState(false);
    const [outfitName, setOutfitName] = useState('');
    const [activityDate, setActivityDate] = useState(date || new Date());

    useEffect(() => {
        // keep local date in sync when prop changes
        if (date && !isNaN(date.getTime())) setActivityDate(date);
    }, [date]);

    const formatDateInputValue = (d) => {
        try {
            return d instanceof Date && !isNaN(d) ? d.toISOString().split('T')[0] : '';
        } catch {
            return '';
        }
    };

    const parseDateFromInput = (val) => {
        // val is YYYY-MM-DD
        if (!val) return new Date();
        const parts = val.split('-').map((n) => parseInt(n, 10));
        if (parts.length === 3) {
            // Construct date in local time to avoid TZ shifting
            const [y, m, day] = parts;
            return new Date(y, (m - 1), day);
        }
        const d = new Date(val);
        return isNaN(d) ? new Date() : d;
    };

    const cleanClothes = useMemo(
        () => clothes.filter((c) => (c.status ?? 'clean') === 'clean'),
        [clothes]
    );

    const toggleCloth = (id) => {
        setSelectedClothes((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (tab === 'outfits' && selectedOutfit) {
            const outfit = outfits.find((o) => o.id === selectedOutfit);
            if (!outfit) return;
            onSubmit?.({ type: 'outfit', name: outfit.name, items: outfit.items, date: activityDate });
            onClose?.();
            return;
        }

        if (tab === 'clothes' && selectedClothes.length > 0) {
            const items = selectedClothes
                .map((id) => clothes.find((c) => c.id === id)?.name)
                .filter(Boolean);

            const isSingle = selectedClothes.length === 1;
            const name = isSingle ? items[0] : outfitName || 'Custom Outfit';
            // Optionally handle saveAsOutfit externally if needed
            onSubmit?.({ type: isSingle ? 'cloth' : 'outfit', name, items, date: activityDate });
            onClose?.();
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="w-full max-w-md flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Log Activity
                    </h2>
                    {/* Close button */}
                    <div className="flex justify-end">
                        <Button type="button" onClick={onClose} variant="secondary" className="w-full sm:w-auto mr-2">
                            <span className="sr-only">Cancel</span>
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M6 18L18 6M6 6L18 18"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Button>
                    </div>
                </div>

                {/* Date selector */}
                <div className="mb-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <Input
                        type="date"
                        value={formatDateInputValue(activityDate)}
                        onChange={(e) => setActivityDate(parseDateFromInput(e.target.value))}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Selected: {activityDate?.toLocaleDateString?.() || ''}
                    </div>
                </div>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="outfits">Saved Outfits</TabsTrigger>
                        <TabsTrigger value="clothes">Individual Items</TabsTrigger>
                    </TabsList>

                    <div className="mt-3 max-h-96 overflow-y-auto">
                        <TabsContent value="outfits">
                            <div className="space-y-3">
                                {outfits.map((outfit) => (
                                    <button
                                        key={outfit.id}
                                        onClick={() => setSelectedOutfit(outfit.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedOutfit === outfit.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <Layers size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{outfit.name}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {outfit.items.join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="clothes">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {cleanClothes.map((cloth) => (
                                        <button
                                            key={cloth.id}
                                            onClick={() => toggleCloth(cloth.id)}
                                            className={`p-3 rounded-lg border transition-colors ${selectedClothes.includes(cloth.id)
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-2 flex items-center justify-center">
                                                <Shirt size={20} className="text-gray-400" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {cloth.name}
                                            </div>
                                            {cloth.category && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {cloth.category}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {selectedClothes.length > 1 && (
                                    <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <input
                                                type="checkbox"
                                                checked={saveAsOutfit}
                                                onChange={(e) => setSaveAsOutfit(e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            Save as new outfit
                                        </label>

                                        {saveAsOutfit && (
                                            <Input
                                                value={outfitName}
                                                onChange={(e) => setOutfitName(e.target.value)}
                                                placeholder="Enter outfit name"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="mt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            (tab === 'outfits' && !selectedOutfit) ||
                            (tab === 'clothes' && selectedClothes.length === 0)
                        }
                        className="w-full"
                    >
                        Log Activity
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
