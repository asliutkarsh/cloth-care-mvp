import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Info } from 'lucide-react';
import { Button } from '../components/ui';
import { useSettingsStore } from '../stores/useSettingsStore';
import { INSIGHT_MODULES, SECTION_GROUPS, MIN_MODULES, MAX_MODULES } from '../components/insights/insightsConfig';
import SettingsSkeleton from '../components/skeleton/SettingsSkeleton';
import { useToast } from '../context/ToastProvider.jsx';

// --- Reusable Animated Switch Component ---
const AnimatedSwitch = ({ isSelected }) => (
  <div className={`flex w-10 h-6 rounded-full items-center transition-colors ${isSelected ? 'bg-primary-500 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'}`}>
    <motion.div layout className="w-5 h-5 bg-white rounded-full shadow" />
  </div>
);

// --- Reusable Module Toggle Card ---
const ModuleToggleCard = ({ module, isSelected, onToggle, disabled }) => (
  <motion.button
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onToggle}
    disabled={disabled}
    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
      isSelected ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-semibold">{module.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{module.description}</p>
      </div>
      <AnimatedSwitch isSelected={isSelected} />
    </div>
  </motion.button>
);


export default function SettingsInsightsPage() {
  const navigate = useNavigate();
  const { preferences, fetchPreferences, updatePreference } = useSettingsStore();
  const { addToast } = useToast();
  
  const [initialSelected, setInitialSelected] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!preferences) {
      fetchPreferences();
    } else if (preferences?.insightsModules?.selected) {
      const initial = new Set(preferences.insightsModules.selected);
      setInitialSelected(initial);
      setSelected(initial);
    }
  }, [preferences, fetchPreferences]);
  
  const setsEqual = useCallback((a, b) => a.size === b.size && [...a].every(value => b.has(value)), []);
  const hasChanges = useMemo(() => !setsEqual(initialSelected, selected), [initialSelected, selected, setsEqual]);

  const toggleSelection = (moduleId) => {
    setError('');
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        if (next.size <= MIN_MODULES) {
          setError(`Keep at least ${MIN_MODULES} insights selected.`);
          return prev;
        }
        next.delete(moduleId);
      } else {
        if (next.size >= MAX_MODULES) {
          setError(`You can show up to ${MAX_MODULES} insights at once.`);
          return prev;
        }
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreference('insightsModules', { selected: Array.from(selected) });
      addToast('Insights dashboard updated.', { type: 'success' });
      navigate(-1);
    } catch (err) {
      addToast('Could not save insights selection.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSelected(initialSelected);
    setError('');
    addToast('Changes discarded', { type: 'info' });
  };
  
  if (!preferences) return <SettingsSkeleton />;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-28 sm:p-6">
      <header className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
              <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full" aria-label="Go back">
                  <ArrowLeft size={20} />
              </Button>
              <div>
                  <h1 className="text-2xl font-bold">Customize Insights</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose {MIN_MODULES} to {MAX_MODULES} modules to display.</p>
              </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
              <AnimatePresence>
              {hasChanges && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Button variant="ghost" onClick={handleDiscard}>Discard</Button>
                      <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
                  </motion.div>
              )}
              </AnimatePresence>
          </div>
      </header>

      <div className="space-y-8">
        {error && <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

        {SECTION_GROUPS.map((group, index) => {
          const modules = INSIGHT_MODULES.filter(m => m.section === group.id);
          if (!modules.length) return null;
          return (
            <motion.section 
              key={group.id} 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-lg font-semibold">{group.label}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {modules.map(module => {
                  const isSelected = selected.has(module.id);
                  // This logic determines if the toggle action should be disabled
                  const disableToggle = (!isSelected && selected.size >= MAX_MODULES) || (isSelected && selected.size <= MIN_MODULES);
                  return (
                    <ModuleToggleCard
                      key={module.id}
                      module={module}
                      isSelected={isSelected}
                      onToggle={() => toggleSelection(module.id)}
                      // --- THIS IS THE FIX ---
                      // The button is disabled if the toggle action is not allowed.
                      disabled={disableToggle}
                    />
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "tween", ease: "easeInOut" }}
            className="fixed left-0 right-0 bottom-0 z-40 p-3 sm:hidden"
          >
            <div className="mx-auto max-w-4xl flex items-center gap-2 rounded-xl px-4 py-3 glass-card shadow-2xl">
              <span className="text-sm font-medium">{selected.size} modules selected</span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" onClick={handleDiscard}>Discard</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}