import { useMemo } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { formatPrice } from '../utils/formatting';

const DEFAULT_CATEGORY = { name: 'Unknown', icon: '❓' };

const findCategoryById = (categoryTree = [], targetId) => {
  if (!targetId) return null;
  for (const node of categoryTree) {
    if (node?.id === targetId) return node;
    const childMatch = findCategoryById(node?.children || [], targetId);
    if (childMatch) return childMatch;
  }
  return null;
};

export const useClothData = (cloth, categories = []) => {
  const { preferences } = useSettingsStore();

  // Status mapping
  const statusMap = useMemo(() => ({
    clean: {
      tagClass: 'tag-clean',
      ringClass: 'status-ring-clean',
      label: 'Clean',
    },
    dirty: {
      tagClass: 'tag-dirty',
      ringClass: 'status-ring-dirty',
      label: 'Dirty',
    },
    needs_pressing: {
      tagClass: 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/30 rounded-full px-2 py-0.5 text-xs font-medium',
      ringClass: 'status-ring-new',
      label: 'Needs Pressing',
    },
  }), []);

  // Status data
  const status = useMemo(() => 
    statusMap[cloth?.status] || { tagClass: 'tag', ringClass: '', label: 'Unknown' },
    [cloth?.status, statusMap]
  );

  // Category resolution
  const categoryData = useMemo(() => {
    if (!cloth) return DEFAULT_CATEGORY;
    
    const rawCategory = cloth.category;
    const categoryId = 
      cloth.categoryId ??
      (typeof rawCategory === 'object' && rawCategory?.id) ??
      (typeof rawCategory === 'string' || typeof rawCategory === 'number' ? rawCategory : null);
    
    const resolvedCategory = findCategoryById(categories, categoryId);
    
    return (
      resolvedCategory ||
      (typeof rawCategory === 'object' && (rawCategory.name || rawCategory.icon)
        ? rawCategory
        : null) ||
      DEFAULT_CATEGORY
    );
  }, [cloth, categories]);

  const categoryIcon = categoryData.icon || DEFAULT_CATEGORY.icon;
  const categoryName = categoryData.name || DEFAULT_CATEGORY.name;

  // Color handling
  const hasColor = useMemo(() => 
    typeof cloth?.color === 'string' && cloth.color.trim().length > 0,
    [cloth?.color]
  );
  
  const colorValue = useMemo(() => 
    hasColor ? cloth.color : '#d1d5db',
    [hasColor, cloth?.color]
  );
  
  const colorLabel = useMemo(() => 
    hasColor ? cloth.color : 'Neutral color',
    [hasColor, cloth?.color]
  );

  // Cost and wear calculations
  const wearCount = useMemo(() => cloth?.totalWearCount ?? 0, [cloth?.totalWearCount]);
  
  const cost = useMemo(() => 
    typeof cloth?.cost === 'number' ? cloth.cost : Number(cloth?.cost || 0),
    [cloth?.cost]
  );
  
  const hasCost = useMemo(() => 
    Number.isFinite(cost) && cost > 0,
    [cost]
  );
  
  const costPerWear = useMemo(() => 
    hasCost && wearCount > 0 ? cost / wearCount : cost,
    [hasCost, cost, wearCount]
  );
  
  const costPerWearLabel = useMemo(() => 
    hasCost
      ? wearCount > 0
        ? `${formatPrice(costPerWear, preferences?.currency)} per wear`
        : `${formatPrice(cost, preferences?.currency)} total`
      : null,
    [hasCost, cost, wearCount, costPerWear, preferences?.currency]
  );

  return {
    // Status
    status,
    
    // Category
    categoryData,
    categoryIcon,
    categoryName,
    
    // Color
    hasColor,
    colorValue,
    colorLabel,
    
    // Cost and wear
    wearCount,
    cost,
    hasCost,
    costPerWear,
    costPerWearLabel,
    
    // Helpers
    formatPrice: (value) => formatPrice(value, preferences?.currency),
  };
};

export default useClothData;
