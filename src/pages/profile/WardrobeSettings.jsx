import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { LayoutGrid, List, ArrowLeft, Filter, MousePointerClick, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui';
import SettingsSkeleton from '../../components/skeleton/SettingsSkeleton';

// Consistent options
const viewOptions = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
];

const sortOptions = [
  { value: 'newest', label: 'Date Added (Newest First)' },
  { value: 'oldest', label: 'Date Added (Oldest First)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'mostWorn', label: 'Most Worn' },
  { value: 'leastWorn', label: 'Least Worn' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3, ease: 'easeOut' },
  }),
};

export default function WardrobeSettings() {
  const navigate = useNavigate();
  const { preferences, updatePreference, fetchPreferences } = useSettingsStore();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!preferences) {
      fetchPreferences();
    } else if (preferences.wardrobeDefaults) {
      const { viewMode: currentView, sortBy: currentSort } = preferences.wardrobeDefaults;
      if (currentView) setViewMode(currentView);
      if (currentSort) setSortBy(currentSort);
    }
  }, [preferences, fetchPreferences]);

  const handlePreferenceChange = async (key, value) => {
    setIsSaving(true);
    const newDefaults = { ...preferences?.wardrobeDefaults, viewMode, sortBy, [key]: value };
    await updatePreference('wardrobeDefaults', newDefaults);
    // A small delay to give feedback that something happened
    setTimeout(() => setIsSaving(false), 300);
  };

  if (!preferences) {
    return <SettingsSkeleton />;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto p-4 pb-24 sm:p-6"
    >
      <header className="flex items-center gap-2 mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full" aria-label="Go back">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Wardrobe Defaults</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Customize your default wardrobe view.</p>
        </div>
      </header>

      <div className="space-y-6">
        <motion.div variants={fadeInUp} custom={1} className="glass-card p-6 rounded-xl">
          {/* Default View Setting */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Default View</h2>
            <div className="grid grid-cols-2 gap-4">
              {viewOptions.map(({ value, label, icon: Icon }) => {
                const isActive = viewMode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setViewMode(value); handlePreferenceChange('viewMode', value); }}
                    disabled={isSaving}
                    className={`p-4 border rounded-lg transition-all flex flex-col items-center justify-center gap-2 text-sm font-medium ${
                      isActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 ring-2 ring-primary-500'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 dark:hover:border-primary-600'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Default Sort Setting */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Default Sort Order</h2>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); handlePreferenceChange('sortBy', e.target.value); }}
                disabled={isSaving}
                className="w-full appearance-none p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </section>
        </motion.div>

        {/* Wardrobe Tips Card */}
        <motion.div variants={fadeInUp} custom={2} className="glass-card p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Wardrobe Tips</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-500 dark:text-blue-400">
                <Filter size={18} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Quick Filters</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the filter button in your wardrobe to quickly find items by category, color, or season.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-500 dark:text-green-400">
                <MousePointerClick size={18} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Bulk Actions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Long-press an item to enter selection mode. This allows you to edit, delete, or add multiple items to an outfit at once.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}