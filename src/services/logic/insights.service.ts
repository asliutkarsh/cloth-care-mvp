import { ClothService } from '../crud/cloth.service';
import { OutfitService } from '../crud/outfit.service';
import { ActivityLogService } from '../crud/activity.service';
import { CategoryService } from '../crud/category.service';
import { Cloth } from '../model/cloth.model';
import { Outfit } from '../model/outfit.model';

interface InsightsData {
  summary: {
    totalClothes: number;
    totalOutfits: number;
    totalWardrobeValue: number;
    averagePrice: number;
    averageCostPerWear: number;
    sustainabilityScore: number;
  };
  categoryBreakdown: Array<{ label: string; value: number }>;
  colorPalette: Array<{ label: string; value: number }>;
  brandDistribution: Array<{ label: string; value: number }>;
  fabricFocus: Array<{ label: string; value: number }>;
  newestAdditions: Cloth[];
  goToItems: {
    goToItem: { cloth: Cloth; count: number } | null;
    top: Array<{ cloth: Cloth; count: number }>;
    mostRepeatedOutfit: { outfit: Outfit; count: number } | null;
    favoriteGoToOutfit: { outfit: Outfit; count: number } | null;
    mostWornColor: { label: string; value: number } | null;
    uniform: { combo: string; count: number } | null;
    monthlyActivity: Array<{ month: string; count: number }>;
  };
  valueAndSustainability: {
    bestValueItem: { cloth: Cloth; costPerWear: number } | null;
    worstValueItem: { cloth: Cloth; costPerWear: number } | null;
    averageCostPerWear: number;
    workhorseItems: Array<{ cloth: Cloth; costPerWear: number; wears: number }>;
    mostVersatileCloth: { cloth: Cloth; usage: number } | null;
    sustainabilityScore: number;
    closetGhosts: Array<{ cloth: Cloth; lastWorn: Date | null }>;
    neverWorn: Cloth[];
  };
  financial: {
    averagePrice: number;
    totalWardrobeValue: number;
    mostExpensiveItem: { cloth: Cloth; cost: number } | null;
    categorySpend: Array<{ label: string; value: number }>;
    brandSpend: Array<{ label: string; value: number }>;
    seasonalSpend: Array<{ label: string; value: number }>;
  };
  forgottenFavorites: Array<{ cloth: Cloth; lastWorn: Date | null }>;
}

const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'];

const toCurrency = (value: unknown): number => {
  const amount = Number(value) || 0;
  return Number.isFinite(amount) ? amount : 0;
};

const safeDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeKey = (value: unknown, fallback: string): string => {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : fallback;
};

const mapToSortedEntries = (map: Map<string, number>, limit: number, filterEmpty = true) =>
  [...map.entries()]
    .filter(([label]) => (filterEmpty ? Boolean(label) : true))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));

export const InsightsService = {
  async getInsights(): Promise<InsightsData> {
    const [clothes, outfits, activities, categories] = await Promise.all([
      ClothService.getAll(),
      OutfitService.getAll(),
      ActivityLogService.getAll(),
      CategoryService.getAll(),
    ]);

    const clothMap = new Map(clothes.map((cloth) => [cloth.id, cloth]));
    const outfitMap = new Map(outfits.map((outfit) => [outfit.id, outfit]));
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const wearStats = new Map<string, { count: number; lastWorn: Date | null }>();
    const outfitWearStats = new Map<string, { count: number }>();
    const monthlyWear = new Map<string, number>();
    const colorTally = new Map<string, number>();
    const brandTally = new Map<string, number>();
    const fabricTally = new Map<string, number>();
    const brandSpend = new Map<string, number>();
    const categorySpend = new Map<string, number>();
    const seasonalSpend = new Map<string, number>();
    const uniformCombos = new Map<string, number>();

    const registerMonthlyWear = (dateString: string | undefined): void => {
      const date = safeDate(dateString);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyWear.set(key, (monthlyWear.get(key) || 0) + 1);
    };

    const registerClothWear = (clothId: string, dateString: string | undefined): void => {
      if (!clothId) return;
      const stats = wearStats.get(clothId) || { count: 0, lastWorn: null };
      stats.count += 1;
      const date = safeDate(dateString);
      if (date && (!stats.lastWorn || date > stats.lastWorn)) {
        stats.lastWorn = date;
      }
      wearStats.set(clothId, stats);
    };

    const comboKeyForCloths = (clothIds: string[]): string | null => {
      const comboCategories = clothIds
        .map((id) => clothMap.get(id))
        .filter(Boolean)
        .map((cloth) => normalizeKey(categoryMap.get(cloth!.categoryId)?.name, 'Other'));
      if (!comboCategories.length) return null;
      const unique = Array.from(new Set(comboCategories)).sort();
      return unique.join(' + ');
    };

    for (const activity of activities) {
      const dateString = activity.createdAt || activity.date;
      registerMonthlyWear(dateString);

      let clothIds: string[] = [];
      if (activity.type === 'outfit' && activity.outfitId) {
        const outfit = outfitMap.get(activity.outfitId);
        if (outfit) {
          clothIds = Array.isArray(outfit.clothIds) ? outfit.clothIds : [];
          const stats = outfitWearStats.get(outfit.id) || { count: 0 };
          stats.count += 1;
          outfitWearStats.set(outfit.id, stats);
        }
      } else if (activity.type === 'individual' && Array.isArray(activity.clothIds)) {
        clothIds = activity.clothIds;
      }

      clothIds.forEach((id) => registerClothWear(id, dateString));

      const comboKey = comboKeyForCloths(clothIds);
      if (comboKey) {
        uniformCombos.set(comboKey, (uniformCombos.get(comboKey) || 0) + 1);
      }
    }

    const totalWardrobeValue = clothes.reduce((sum, cloth) => sum + toCurrency(cloth.cost), 0);
    const averagePrice = clothes.length ? totalWardrobeValue / clothes.length : 0;

    let bestValueItem: { cloth: Cloth; costPerWear: number } | null = null;
    let worstValueItem: { cloth: Cloth; costPerWear: number } | null = null;
    let lowestCPW = Number.POSITIVE_INFINITY;
    let highestCPW = Number.NEGATIVE_INFINITY;

    let totalWearCount = 0;
    const neverWorn: Cloth[] = [];
    const closetGhosts: Array<{ cloth: Cloth; lastWorn: Date | null }> = [];
    const workhorseItems: Array<{ cloth: Cloth; costPerWear: number; wears: number }> = [];

    for (const cloth of clothes) {
      const wears = wearStats.get(cloth.id)?.count ?? cloth.currentWearCount ?? 0;
      const lastWorn = wearStats.get(cloth.id)?.lastWorn || safeDate(cloth.updatedAt) || safeDate(cloth.createdAt);
      totalWearCount += wears;

      const cost = toCurrency(cloth.cost);
      const costPerWear = wears > 0 ? cost / wears : cost;

      if (wears === 0) {
        neverWorn.push(cloth);
      }

      if (cost > 0 && wears >= 3 && costPerWear <= 5) {
        workhorseItems.push({ cloth, costPerWear, wears });
      }

      if (cost > 0) {
        if (costPerWear < lowestCPW) {
          lowestCPW = costPerWear;
          bestValueItem = { cloth, costPerWear };
        }
        if (costPerWear > highestCPW) {
          highestCPW = costPerWear;
          worstValueItem = { cloth, costPerWear };
        }
      }

      if (!lastWorn || lastWorn < sixMonthsAgo) {
        closetGhosts.push({ cloth, lastWorn });
      }

      const colorKey = normalizeKey(cloth.color, 'Unknown');
      colorTally.set(colorKey, (colorTally.get(colorKey) || 0) + 1);

      const brandKey = normalizeKey(cloth.brand, 'Unbranded');
      brandTally.set(brandKey, (brandTally.get(brandKey) || 0) + 1);
      brandSpend.set(brandKey, (brandSpend.get(brandKey) || 0) + cost);

      const fabricKey = normalizeKey(cloth.material, 'Unknown');
      fabricTally.set(fabricKey, (fabricTally.get(fabricKey) || 0) + 1);

      const categoryKey = normalizeKey(categoryMap.get(cloth.categoryId)?.name, 'Uncategorised');
      categorySpend.set(categoryKey, (categorySpend.get(categoryKey) || 0) + cost);

      const purchaseDate = safeDate(cloth.purchaseDate);
      if (purchaseDate) {
        const seasonIndex = Math.floor(((purchaseDate.getMonth() + 1) % 12) / 3);
        const season = SEASONS[seasonIndex] || 'Unknown';
        seasonalSpend.set(season, (seasonalSpend.get(season) || 0) + cost);
      }
    }

    workhorseItems.sort((a, b) => a.costPerWear - b.costPerWear || b.wears - a.wears);
    closetGhosts.sort((a, b) => {
      if (!a.lastWorn && !b.lastWorn) return 0;
      if (!a.lastWorn) return -1;
      if (!b.lastWorn) return 1;
      return a.lastWorn.getTime() - b.lastWorn.getTime();
    });

    const averageCostPerWear = totalWearCount > 0 ? totalWardrobeValue / totalWearCount : 0;
    const sustainabilityScore = clothes.length
      ? Math.min(100, Math.round((totalWearCount / clothes.length) * 10))
      : 0;

    const topGoToItems = [...wearStats.entries()]
      .map(([id, stat]) => ({ cloth: clothMap.get(id), count: stat.count }))
      .filter((entry): entry is { cloth: Cloth; count: number } => entry.cloth !== undefined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const goToItem = topGoToItems[0] || null;

    const outfitWearList = [...outfitWearStats.entries()]
      .map(([id, stat]) => ({ outfit: outfitMap.get(id), count: stat.count }))
      .filter((entry): entry is { outfit: Outfit; count: number } => entry.outfit !== undefined)
      .sort((a, b) => b.count - a.count);

    const mostRepeatedOutfit = outfitWearList[0] || null;
    const favoriteGoToOutfit = outfitWearList.find(({ outfit }) => outfit.favorite) || null;

    const mostVersatileCloth = clothes
      .map((cloth) => ({
        cloth,
        usage: outfits.filter((outfit) => outfit.clothIds?.includes(cloth.id)).length,
      }))
      .sort((a, b) => b.usage - a.usage)[0] || null;

    const uniform = [...uniformCombos.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([combo, count]) => ({ combo, count }))[0] || null;

    const categoryBreakdown = mapToSortedEntries(
      clothes.reduce((acc, cloth) => {
        const key = normalizeKey(categoryMap.get(cloth.categoryId)?.name, 'Uncategorised');
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
      }, new Map<string, number>()),
      10,
    );

    const colorPalette = mapToSortedEntries(colorTally, 5, false);
    const brandDistribution = mapToSortedEntries(brandTally, 6);
    const fabricFocus = mapToSortedEntries(fabricTally, 6);

    const newestAdditions = [...clothes]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);

    return {
      summary: {
        totalClothes: clothes.length,
        totalOutfits: outfits.length,
        totalWardrobeValue,
        averagePrice,
        averageCostPerWear,
        sustainabilityScore,
      },
      categoryBreakdown,
      colorPalette,
      brandDistribution,
      fabricFocus,
      newestAdditions,
      goToItems: {
        goToItem,
        top: topGoToItems,
        mostRepeatedOutfit,
        favoriteGoToOutfit,
        mostWornColor: colorPalette[0] || null,
        uniform,
        monthlyActivity: [...monthlyWear.entries()]
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
      valueAndSustainability: {
        bestValueItem,
        worstValueItem,
        averageCostPerWear,
        workhorseItems: workhorseItems.slice(0, 5),
        mostVersatileCloth,
        sustainabilityScore,
        closetGhosts: closetGhosts.slice(0, 5),
        neverWorn,
      },
      financial: {
        averagePrice,
        totalWardrobeValue,
        mostExpensiveItem: clothes
          .map((cloth) => ({ cloth, cost: toCurrency(cloth.cost) }))
          .sort((a, b) => b.cost - a.cost)[0] || null,
        categorySpend: mapToSortedEntries(categorySpend, 8, false),
        brandSpend: mapToSortedEntries(brandSpend, 8, false),
        seasonalSpend: mapToSortedEntries(seasonalSpend, 4, false),
      },
      forgottenFavorites: closetGhosts
        .filter(({ cloth }) => cloth.favorite)
        .map(({ cloth, lastWorn }) => ({ cloth, lastWorn }))
        .slice(0, 5),
    };
  },
};
