import React, { useEffect, useMemo } from 'react';
import { useInsightsStore } from '../stores/useInsightsStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import ModuleCard from '../components/insights/ModuleCard';
import { INSIGHT_MODULES, MIN_MODULES, MAX_MODULES } from '../components/insights/insightsConfig';

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
};

const formatCPW = (value) => {
  const amount = Number(value) || 0;
  return `$${amount.toFixed(2)}`;
};

const SectionHeading = ({ title, subtitle }) => (
  <header className="flex flex-col gap-1">
    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
    {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
  </header>
);

const SummaryStat = ({ label, value }) => (
  <div className="rounded-2xl bg-primary-deep/10 dark:bg-primary-bright/15 px-4 py-3">
    <div className="text-xs uppercase tracking-wide text-primary-deep/80 dark:text-primary-bright/80">{label}</div>
    <div className="mt-1 text-lg font-semibold text-primary-deep dark:text-primary-bright">{value}</div>
  </div>
);

const Pill = ({ children, muted }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
      muted
        ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
        : 'bg-primary-deep/10 text-primary-deep dark:bg-primary-bright/20 dark:text-primary-bright'
    }`}
  >
    {children}
  </span>
);

const ChartPlaceholder = ({ label }) => (
  <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
    {label} (visualisation pending)
  </div>
);

const InsightBadge = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/60 px-4 py-3">
    <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);

const ModuleGrid = ({ modules, render }) => (
  <div className="grid gap-6 lg:grid-cols-12">
    {modules.map((module) => (
      <div key={module.id} className={module.span || 'lg:col-span-6 xl:col-span-4'}>
        {render(module)}
      </div>
    ))}
  </div>
);

const getActiveModules = (selectedIds) => {
  const canonical = INSIGHT_MODULES.filter((module) => selectedIds.includes(module.id));
  if (canonical.length >= MIN_MODULES) return canonical;

  const fallback = INSIGHT_MODULES.filter((module) => !selectedIds.includes(module.id));
  const needed = Math.min(MAX_MODULES, MIN_MODULES) - canonical.length;
  return [...canonical, ...fallback.slice(0, Math.max(needed, 0))];
};

export default function Insights() {
  const { preferences, updatePreference, fetchPreferences } = useSettingsStore();
  const { data, isLoading, error, lastRefreshedAt, initialize, refresh } = useInsightsStore();
  const { categories } = useWardrobeStore();

  const categoryNameLookup = useMemo(() => {
    const map = new Map();
    const walk = (nodes = []) => {
      nodes.forEach((node) => {
        map.set(node.id, node.name);
        if (Array.isArray(node.children) && node.children.length) {
          walk(node.children);
        }
      });
    };
    walk(categories);
    return map;
  }, [categories]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const selectedModules = preferences?.insightsModules?.selected || [];
  const activeModules = getActiveModules(selectedModules);

  const handleRefresh = () => {
    refresh();
  };

  const handleToggleModule = async (moduleId) => {
    const current = new Set(selectedModules);
    const isSelected = current.has(moduleId);

    if (isSelected) {
      if (current.size <= MIN_MODULES) {
        return;
      }
      current.delete(moduleId);
    } else {
      if (current.size >= MAX_MODULES) {
        return;
      }
      current.add(moduleId);
    }
    await updatePreference('insightsModules', { selected: Array.from(current) });
  };

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <SectionHeading title="Wardrobe Insights" subtitle="Understand how you wear, spend, and maximise your closet." />
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-6">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-200">We hit a snag</h2>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            {error.message || 'Unable to load insights. Please try refreshing.'}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700"
          >
            Refresh insights
          </button>
        </div>
      </main>
    );
  }

  if (isLoading || !data) {
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-pulse">
        <SectionHeading title="Wardrobe Insights" subtitle="Crunching the numbers on your wardrobe..." />
        <ChartPlaceholder label="Loading insights" />
      </main>
    );
  }

  const {
    summary,
    categoryBreakdown = [],
    colorPalette = [],
    brandDistribution = [],
    fabricFocus = [],
    newestAdditions = [],
    goToItems = {},
    valueAndSustainability = {},
    financial = {},
    forgottenFavorites = [],
  } = data;

  const workhorseItems = valueAndSustainability.workhorseItems || [];
  const closetGhosts = valueAndSustainability.closetGhosts || [];
  const neverWorn = valueAndSustainability.neverWorn || [];
  const monthlyActivity = goToItems.monthlyActivity || [];
  const topGoToItems = goToItems.top || [];

  const summaryCards = (
    <ModuleCard title="Wardrobe Snapshot" description="Key numbers across your closet">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat label="Total items" value={summary.totalClothes} />
        <SummaryStat label="Total outfits" value={summary.totalOutfits} />
        <SummaryStat label="Closet value" value={formatCurrency(summary.totalWardrobeValue)} />
        <SummaryStat label="Avg cost per wear" value={formatCPW(summary.averageCostPerWear)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Pill>Sustainability score: {summary.sustainabilityScore}</Pill>
        <Pill muted>Last refreshed {lastRefreshedAt ? new Date(lastRefreshedAt).toLocaleString() : 'just now'}</Pill>
      </div>
    </ModuleCard>
  );

  const renderModule = (module) => {
    switch (module.id) {
      case 'overviewCards':
        return summaryCards;
      case 'categoryBreakdown':
        return (
          <ModuleCard title="Category mix" description="How your closet is distributed">
            <ChartPlaceholder label="Category breakdown" />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryBreakdown.map((item) => (
                <li key={item.label} className="flex items-center justify-between rounded-xl bg-gray-100/60 dark:bg-gray-800/70 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'colorPalette':
        return (
          <ModuleCard title="Signature palette" description="Top colors you own">
            <div className="flex flex-wrap gap-3">
              {colorPalette.map((entry) => (
                <div key={entry.label} className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full border border-white shadow" style={{ backgroundColor: entry.label }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.value} pieces</p>
                  </div>
                </div>
              ))}
            </div>
          </ModuleCard>
        );
      case 'brandDistribution':
        return (
          <ModuleCard title="Brands you love" description="Most owned labels">
            <ChartPlaceholder label="Brand distribution" />
            <ul className="space-y-2">
              {brandDistribution.map((brand) => (
                <li key={brand.label} className="flex items-center justify-between rounded-xl border border-gray-200/70 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/60 px-3 py-2 text-sm">
                  <span>{brand.label}</span>
                  <span className="font-semibold">{brand.value}</span>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'fabricFocus':
        return (
          <ModuleCard title="Fabric focus" description="Materials you wear most">
            <ChartPlaceholder label="Fabric breakdown" />
            <div className="flex flex-wrap gap-2">
              {fabricFocus.map((fabric) => (
                <Pill key={fabric.label}>{fabric.label} · {fabric.value}</Pill>
              ))}
            </div>
          </ModuleCard>
        );
      case 'newestAdditions':
        return (
          <ModuleCard title="Newest additions" description="Fresh pieces you recently added">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {newestAdditions.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Added {new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <Pill muted>{item.categoryId ? categoryNameLookup.get(item.categoryId) || 'Uncategorised' : 'Uncategorised'}</Pill>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'topGoToItems':
        return (
          <ModuleCard title="Your go-to items" description="Most worn clothes and outfits">
            {goToItems.goToItem && (
              <div className="rounded-2xl border border-primary-deep/20 dark:border-primary-bright/30 bg-primary-deep/10 dark:bg-primary-bright/15 px-4 py-3">
                <p className="text-xs uppercase text-primary-deep/80 dark:text-primary-bright/70">Ultimate go-to</p>
                <p className="mt-1 text-sm font-semibold text-primary-deep dark:text-primary-bright">{goToItems.goToItem.cloth.name}</p>
              </div>
            )}
            <ul className="space-y-2">
              {topGoToItems.map(({ cloth, count }) => (
                <li key={cloth.id} className="flex items-center justify-between rounded-xl bg-gray-100/60 dark:bg-gray-800/60 px-3 py-2 text-sm">
                  <span>{cloth.name}</span>
                  <Pill>{count} wears</Pill>
                </li>
              ))}
            </ul>
            {goToItems.mostRepeatedOutfit && (
              <InsightBadge label="Most repeated outfit" value={`${goToItems.mostRepeatedOutfit.outfit.name} · ${goToItems.mostRepeatedOutfit.count} wears`} />
            )}
            {goToItems.favoriteGoToOutfit && (
              <InsightBadge label="Favorite go-to outfit" value={`${goToItems.favoriteGoToOutfit.outfit.name}`} />
            )}
          </ModuleCard>
        );
      case 'wearTrend':
        return (
          <ModuleCard title="Wear frequency" description="Monthly wear counts over time">
            <ChartPlaceholder label="Monthly wear trend" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
              {monthlyActivity.map((item) => (
                <div key={item.month} className="flex items-center justify-between rounded-xl border border-gray-200/70 dark:border-gray-800/60 px-3 py-2">
                  <span>{item.month}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </ModuleCard>
        );
      case 'forgottenFavorites':
        return (
          <ModuleCard title="Forgotten favorites" description="Favorites waiting for a comeback">
            <ul className="space-y-2 text-sm">
              {forgottenFavorites.length ? forgottenFavorites.map(({ cloth, lastWorn }) => (
                <li key={cloth.id} className="flex items-center justify-between rounded-xl bg-orange-50 dark:bg-orange-900/20 px-3 py-2">
                  <span>{cloth.name}</span>
                  <span className="text-xs text-orange-600 dark:text-orange-300">Last worn: {lastWorn ? new Date(lastWorn).toLocaleDateString() : 'Never'}</span>
                </li>
              )) : <p>No forgotten favourites right now.</p>}
            </ul>
          </ModuleCard>
        );
      case 'uniformCombo':
        return (
          <ModuleCard title="Your uniform" description="Most frequent category combo">
            {goToItems.uniform ? (
              <div className="flex flex-wrap gap-2">
                {goToItems.uniform.combo.split(' + ').map((part) => (
                  <Pill key={part}>{part}</Pill>
                ))}
                <Pill muted>{goToItems.uniform.count} repeats</Pill>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No outfit combo pattern detected yet.</p>
            )}
          </ModuleCard>
        );
      case 'valueLeaders':
        return (
          <ModuleCard title="Best value pieces" description="High wear counts for minimal cost">
            <ul className="space-y-2 text-sm">
              {workhorseItems.map(({ cloth, costPerWear, wears }) => (
                <li key={cloth.id} className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-2">
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">{cloth.name}</p>
                    <p className="text-xs text-green-600 dark:text-green-300">{wears} wears</p>
                  </div>
                  <Pill>${costPerWear.toFixed(2)}/wear</Pill>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'valueLaggards':
        return (
          <ModuleCard title="Worst value pieces" description="Items needing more wears">
            <ul className="space-y-2 text-sm">
              {valueAndSustainability.worstValueItem ? (
                <li className="flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2">
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-200">{valueAndSustainability.worstValueItem.cloth.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-300">Consider styling this soon</p>
                  </div>
                  <Pill>{formatCPW(valueAndSustainability.worstValueItem.costPerWear)}</Pill>
                </li>
              ) : (
                <p>No underperforming items yet 🎉</p>
              )}
            </ul>
          </ModuleCard>
        );
      case 'sustainabilityScore':
        return (
          <ModuleCard title="Sustainability score" description="Average wears per item">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-200/70 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-8">
              <span className="text-4xl font-semibold text-emerald-700 dark:text-emerald-200">{valueAndSustainability.sustainabilityScore ?? 0}</span>
              <p className="text-sm text-emerald-700 dark:text-emerald-200 text-center">Higher scores mean you are re-wearing items often. Aim for 70+ to maximise sustainability.</p>
            </div>
          </ModuleCard>
        );
      case 'closetGhosts':
        return (
          <ModuleCard title="Closet ghosts" description="Pieces you have ignored for 6 months or more">
            <ul className="space-y-2 text-sm">
              {closetGhosts.map(({ cloth, lastWorn }) => (
                <li key={cloth.id} className="flex items-center justify-between rounded-xl bg-purple-50 dark:bg-purple-900/20 px-3 py-2">
                  <span>{cloth.name}</span>
                  <span className="text-xs text-purple-600 dark:text-purple-300">Last worn: {lastWorn ? new Date(lastWorn).toLocaleDateString() : 'Never'}</span>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'neverWorn':
        return (
          <ModuleCard title="Never worn" description="Pieces still waiting for their debut">
            <ul className="space-y-2 text-sm">
              {neverWorn.map((cloth) => (
                <li key={cloth.id} className="flex items-center justify-between rounded-xl border border-gray-200/70 dark:border-gray-800/60 px-3 py-2">
                  <span>{cloth.name}</span>
                  <Pill muted>Added {new Date(cloth.createdAt || Date.now()).toLocaleDateString()}</Pill>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'financialOverview':
        return (
          <ModuleCard title="Financial snapshot" description="Investment at a glance">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InsightBadge label="Average price per item" value={formatCurrency(financial.averagePrice)} />
              <InsightBadge label="Total wardrobe value" value={formatCurrency(financial.totalWardrobeValue)} />
              {financial.mostExpensiveItem && (
                <InsightBadge label="Most expensive item" value={`${financial.mostExpensiveItem.cloth.name} · ${formatCurrency(financial.mostExpensiveItem.cost)}`} />
              )}
            </div>
          </ModuleCard>
        );
      case 'spendByCategory':
        return (
          <ModuleCard title="Investment by category" description="Where your budget goes">
            <ChartPlaceholder label="Category spending" />
            <ul className="space-y-2 text-sm">
              {(financial.categorySpend || []).map((entry) => (
                <li key={entry.label} className="flex items-center justify-between rounded-xl bg-white/70 dark:bg-gray-900/70 px-3 py-2">
                  <span>{entry.label}</span>
                  <span className="font-semibold">{formatCurrency(entry.value)}</span>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'spendByBrand':
        return (
          <ModuleCard title="Investment by brand" description="Brands you invest in most">
            <ChartPlaceholder label="Brand spending" />
            <ul className="space-y-2 text-sm">
              {(financial.brandSpend || []).map((entry) => (
                <li key={entry.label} className="flex items-center justify-between rounded-xl bg-white/70 dark:bg-gray-900/70 px-3 py-2">
                  <span>{entry.label}</span>
                  <span className="font-semibold">{formatCurrency(entry.value)}</span>
                </li>
              ))}
            </ul>
          </ModuleCard>
        );
      case 'seasonalSpend':
        return (
          <ModuleCard title="Seasonal spend" description="How budgets change across seasons">
            <ChartPlaceholder label="Seasonal spend" />
            <div className="flex flex-wrap gap-2">
              {(financial.seasonalSpend || []).map((entry) => (
                <Pill key={entry.label}>{entry.label}: {formatCurrency(entry.value)}</Pill>
              ))}
            </div>
          </ModuleCard>
        );
      default:
        return null;
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-8">
      <div className="flex flex-col gap-6">
        <SectionHeading title="Wardrobe Insights" subtitle="Your personal style dashboard." />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-deep/90"
          >
            Refresh insights
          </button>
          <Pill muted>
            Showing {activeModules.length} modules · choose between {MIN_MODULES} and {MAX_MODULES}
          </Pill>
        </div>
      </div>

      {summaryCards}

      <ModuleGrid
        modules={activeModules}
        render={(module) => (
          <div className="space-y-3">
            {renderModule(module)}
            <button
              type="button"
              onClick={() => handleToggleModule(module.id)}
              className="text-xs text-gray-500 dark:text-gray-400 underline"
            >
              {selectedModules.includes(module.id) ? 'Remove from dashboard' : 'Add to dashboard'}
            </button>
          </div>
        )}
      />
    </main>
  );
}
