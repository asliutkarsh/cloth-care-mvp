import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';
import { useSettingsStore } from '../stores/useSettingsStore';
import { INSIGHT_MODULES, SECTION_GROUPS, MIN_MODULES, MAX_MODULES } from '../components/insights/insightsConfig';
import SettingsSkeleton from '../components/skeleton/SettingsSkeleton';
import { useToast } from '../context/ToastProvider.jsx';

export default function SettingsInsightsPage() {
  const navigate = useNavigate();
  const { preferences, fetchPreferences, updatePreference } = useSettingsStore();
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!preferences) {
      fetchPreferences();
    }
  }, [preferences, fetchPreferences]);

  useEffect(() => {
    if (preferences?.insightsModules?.selected) {
      setSelected(new Set(preferences.insightsModules.selected));
    }
  }, [preferences?.insightsModules?.selected]);

  const insightsBySection = useMemo(() => {
    const map = new Map();
    SECTION_GROUPS.forEach((group) => {
      map.set(
        group.id,
        INSIGHT_MODULES.filter((module) => module.section === group.id)
      );
    });
    return map;
  }, []);

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
      console.error('Failed to save insights selection', err);
      addToast('Could not save insights selection.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!preferences) {
    return <SettingsSkeleton />;
  }

  const selectionCount = selected.size;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-28 sm:p-6 md:p-8">
      <div className="glass-card w-full p-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Insights Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose which analytics cards appear on your Insights page.
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectionCount} selected · choose {MIN_MODULES}–{MAX_MODULES}
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {SECTION_GROUPS.map((group) => {
            const modules = insightsBySection.get(group.id) || [];
            if (!modules.length) return null;
            return (
              <section key={group.id} className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {group.label}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{modules.length} options</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {modules.map((module) => {
                    const isSelected = selected.has(module.id);
                    const disableAdd = !isSelected && selectionCount >= MAX_MODULES;
                    const disableRemove = isSelected && selectionCount <= MIN_MODULES;
                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => toggleSelection(module.id)}
                        disabled={disableAdd || disableRemove}
                        className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                          isSelected
                            ? 'border-primary-deep bg-primary-deep/10 dark:border-primary-bright/40 dark:bg-primary-bright/15 text-primary-deep dark:text-primary-bright'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                        } ${disableAdd || disableRemove ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium text-sm leading-tight">{module.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">{module.description}</p>
                          </div>
                          <div
                            className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
                              isSelected
                                ? 'border-primary-deep bg-primary-deep text-white dark:border-primary-bright dark:bg-primary-bright'
                                : 'border-gray-300 dark:border-gray-600 text-gray-400'
                            }`}
                          >
                            {isSelected ? '✓' : '+'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 z-40 p-3">
        <div className="mx-auto max-w-4xl flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-lg">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {selectionCount} insights selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
