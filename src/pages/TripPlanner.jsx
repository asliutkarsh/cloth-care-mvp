import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CalendarRange, CheckCircle2, ChevronLeft, ChevronRight, ChevronUp, Layers, Luggage, MinusCircle, PlusCircle, Shirt } from 'lucide-react';
import { TripService, EssentialsService } from '../services/crud';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useToast } from '../context/ToastProvider.jsx';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import PackedOutfitCard from '../components/trips/PackedOutfitCard';
import { getClothStatusMeta } from '../utils/clothStatus';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.01,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

const today = () => new Date().toISOString().split('T')[0];

export default function TripPlanner() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { clothes = [], outfits = [], categories = [] } = useWardrobeStore();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clothes');
  const [expandedWardrobeOutfits, setExpandedWardrobeOutfits] = useState(() => new Set());
  const [essentialsInput, setEssentialsInput] = useState('');
  const [essentialsMaster, setEssentialsMaster] = useState([]);
  const [search, setSearch] = useState('');

  const loadTrip = useCallback(async () => {
    setLoading(true);
    const data = await TripService.getById(tripId);
    if (!data) {
      addToast('Trip not found. Returning to Trips.', { type: 'error' });
      navigate('/trips');
      return;
    }
    setTrip(data);
    setLoading(false);
  }, [tripId, addToast, navigate]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  useEffect(() => {
    async function fetchEssentials() {
      const items = await EssentialsService.getAll();
      setEssentialsMaster(items);
    }
    fetchEssentials();
  }, []);

  const enrichedClothes = useMemo(() => {
    if (!categories || !clothes) return [];

    const subcategoryMap = new Map();
    const mainCategoryMap = new Map();

    (categories || []).forEach((parent) => {
      mainCategoryMap.set(parent.id, parent);
      if (Array.isArray(parent.children)) {
        parent.children.forEach((sub) => {
          if (sub && sub.id) {
            subcategoryMap.set(sub.id, { parent, sub });
          }
        });
      }
    });

    return (clothes || []).map((cloth) => {
      if (!cloth || !cloth.categoryId) {
        return { ...cloth, categoryName: 'Uncategorized' };
      }

      let categoryName = 'Uncategorized';
      let subcategoryName;

      // First, check if the cloth's ID matches a subcategory
      if (subcategoryMap.has(cloth.categoryId)) {
        const { parent, sub } = subcategoryMap.get(cloth.categoryId);
        categoryName = parent.name;
        subcategoryName = sub.name;
      }
      // If not, check if it's a main category
      else if (mainCategoryMap.has(cloth.categoryId)) {
        categoryName = mainCategoryMap.get(cloth.categoryId).name;
      }

      return {
        ...cloth,
        categoryName,
        subcategoryName,
      };
    });
  }, [clothes, categories]);

  const clothMap = useMemo(
    () => new Map(enrichedClothes.map((cloth) => [cloth.id, cloth])),
    [enrichedClothes]
  );

  const outfitMap = useMemo(() => new Map(outfits.map((outfit) => [outfit.id, outfit])), [outfits]);

  // Create a Set of all cloth IDs that are already in the trip (both individually and in outfits)
  const allClothIdsInTrip = useMemo(() => {
    if (!trip) return new Set();

    // 1. Start with individually added clothes
    const ids = new Set(trip.clothIds || []);

    // 2. Add clothes from all the outfits in the trip
    if (trip.outfitIds) {
      for (const outfitId of trip.outfitIds) {
        const outfit = outfitMap.get(outfitId);
        if (outfit?.clothIds) {
          for (const clothId of outfit.clothIds) {
            ids.add(clothId);
          }
        }
      }
    }

    return ids;
  }, [trip, outfitMap]);

  const wardrobeClothes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enrichedClothes
      .filter((cloth) => cloth.archived !== true)
      .filter((cloth) => !allClothIdsInTrip.has(cloth.id))
      .filter((cloth) => (term ? cloth.name.toLowerCase().includes(term) : true));
  }, [enrichedClothes, search, allClothIdsInTrip]);

  const wardrobeOutfits = useMemo(() => {
    if (!trip) return [];
    const term = search.trim().toLowerCase();

    // Get all clothes that are in the trip's packing list (whether packed or not)
    const tripClothSet = new Set(trip.clothIds || []);
    // Also get packed clothes for the packed status
    const packedClothSet = new Set(trip.packedClothIds || []);

    return outfits
      .filter((outfit) => (term ? outfit.name.toLowerCase().includes(term) : true))
      .map(outfit => {
        const outfitClothIds = outfit.clothIds || [];

        // Check how many of these clothes are in the trip's packing list
        const inPackingList = outfitClothIds.filter(id => tripClothSet.has(id));
        const inPackingListCount = inPackingList.length;

        // Check how many are actually packed
        const packedCount = inPackingList.filter(id => packedClothSet.has(id)).length;

        const hasClothesInPackingList = inPackingListCount > 0;
        const allClothesInPackingList = outfitClothIds.length > 0 &&
                                      inPackingListCount === outfitClothIds.length;
        const allPacked = allClothesInPackingList &&
                         packedCount === outfitClothIds.length;

        return {
          ...outfit,
          hasPackedClothes: hasClothesInPackingList,
          allClothesPacked: allPacked,
          packedCount,
          totalClothes: outfitClothIds.length,
          inPackingList, // For debugging
          packedInPackingList: inPackingList.filter(id => packedClothSet.has(id)) // For debugging
        };
      });
  }, [outfits, search, trip]);

  const dirtyClothes = useMemo(() => {
    if (!trip) return [];
    return (trip.clothIds || [])
      .map((id) => clothMap.get(id))
      .filter((cloth) => cloth && cloth.status !== 'clean');
  }, [trip, clothMap]);

  const packedCounts = useMemo(() => {
    if (!trip) return {
      totalClothes: 0,
      packedClothes: 0,
      totalEssentials: trip?.essentials?.length || 0,
      packedEssentials: trip?.essentials?.filter(e => e.packed).length || 0
    };

    // Get all unique packed cloth IDs
    const packedClothSet = new Set(trip.packedClothIds || []);

    // Count all unique clothes in the trip
    const allClothes = new Set([
      ...(trip.clothIds || []),
      ...(trip.outfitIds || []).flatMap(id => outfitMap.get(id)?.clothIds || [])
    ]);

    // Count how many unique clothes are packed
    const packedClothes = [...allClothes].filter(id => packedClothSet.has(id)).length;

    return {
      totalClothes: allClothes.size,
      packedClothes,
      totalEssentials: trip.essentials?.length || 0,
      packedEssentials: trip.essentials?.filter(e => e.packed).length || 0
    };
  }, [trip, outfitMap]);

  const categorySummary = useMemo(() => {
    if (!trip) return [];
    const counts = {};
    (trip.clothIds || []).forEach((id) => {
      const cloth = clothMap.get(id);
      if (!cloth) return;
      const categoryName = cloth.categoryName || 'Other';
      counts[categoryName] = (counts[categoryName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [trip, clothMap]);

  const outfitPackedStatusMap = useMemo(() => {
    if (!trip?.outfitIds) return new Map();

    const packedClothSet = new Set(trip.packedClothIds || []);
    const statusMap = new Map();

    for (const outfitId of trip.outfitIds) {
      const outfit = outfitMap.get(outfitId);
      if (!outfit || !outfit.clothIds || outfit.clothIds.length === 0) {
        statusMap.set(outfitId, 'none');
        continue;
      }

      const packedCount = outfit.clothIds.filter((id) => packedClothSet.has(id)).length;

      if (packedCount === 0) {
        statusMap.set(outfitId, 'none');
      } else if (packedCount === outfit.clothIds.length) {
        statusMap.set(outfitId, 'full');
      } else {
        statusMap.set(outfitId, 'partial');
      }
    }
    return statusMap;
  }, [trip, outfitMap]);

  const handleAddCloth = async (clothId) => {
    if (!trip || trip.clothIds?.includes(clothId)) return;

    if (allClothIdsInTrip.has(clothId)) {
      const cloth = clothMap.get(clothId);
      addToast(
        `${cloth?.name || 'This item'} is already in the trip as part of an outfit.`,
        { type: 'error' }
      );
      return;
    }

    const updated = await TripService.addItems(trip.id, { clothIds: [clothId] });
    setTrip(updated);
  };

  const handleAddOutfit = async (outfitId) => {
    if (!trip || trip.outfitIds?.includes(outfitId)) return;

    const outfitToAdd = outfitMap.get(outfitId);
    if (!outfitToAdd) return;

    const outfitClothIds = new Set(outfitToAdd.clothIds || []);
    const newIndividualClothIds = (trip.clothIds || []).filter((id) => !outfitClothIds.has(id));

    const updated = await TripService.addItems(trip.id, {
      outfitIds: [outfitId],
      clothIds: newIndividualClothIds,
      replaceIndividuals: true,
    });
    setTrip(updated);
  };

  const handleRemove = async (entityId, type, options = {}) => {
    if (!trip) return;
    let updated;
    if (type === 'cloth') {
      updated = await TripService.removeCloth(trip.id, entityId);
    } else if (type === 'outfit') {
      updated = await TripService.removeOutfit(trip.id, entityId, options.clothIds || []);
    } else if (type === 'essential') {
      updated = await TripService.removeEssential(trip.id, entityId);
    }
    if (updated) setTrip(updated);
  };

  const handleTogglePacked = async (entityId, type) => {
    if (!trip) return;
    if (type === 'cloth-bulk') {
      const updated = await TripService.bulkTogglePacked(trip.id, entityId);
      setTrip(updated);
    } else {
      const updated = await TripService.togglePacked(trip.id, entityId, type);
      setTrip(updated);
    }
  };

  const handleToggleEssential = async (essentialId) => {
    if (!trip) return;
    const updated = await TripService.toggleEssentialPacked(trip.id, essentialId);
    if (updated) setTrip(updated);
  };

  const handleAddEssential = async () => {
    if (!trip || !essentialsInput.trim()) return;
    const updated = await TripService.addCustomEssential(trip.id, essentialsInput);
    if (updated) {
      setTrip(updated);
      setEssentialsInput('');
    }
  };

  const handleAddMasterEssential = async (item) => {
    if (!trip) return;
    const updated = await TripService.addEssentialFromMaster(trip.id, item);
    if (updated) setTrip(updated);
  };

  const toggleWardrobeOutfit = (outfitId) => {
    setExpandedWardrobeOutfits((prev) => {
      const next = new Set(prev);
      if (next.has(outfitId)) {
        next.delete(outfitId);
      } else {
        next.add(outfitId);
      }
      return next;
    });
  };

  const formatDateRange = (start, end) => {
    const startDate = start ? new Date(start) : new Date(today());
    const endDate = end ? new Date(end) : startDate;
    return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading || !trip) {
    return (
      <motion.div
        className="max-w-5xl mx-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-card rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              className="w-12 h-12 border-4 border-primary-deep/20 border-t-primary-deep rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p>Loading your trip...</p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 pb-24 sm:p-6 md:p-8 space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.header
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="icon" onClick={() => navigate('/trips')} aria-label="Back to trips">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{trip.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <motion.span animate={{ rotate: [0, 10, -5, 5, 0] }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}>
                <CalendarRange className="w-4 h-4" />
              </motion.span>
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
            <motion.div
              className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-primary-deep/10 text-primary-deep dark:bg-primary-bright/15 dark:text-primary-bright px-3 py-1 font-medium"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Luggage className="w-4 h-4" />
                {trip.outfitIds?.length || 0} outfits · {trip.clothIds?.length || 0} items
              </motion.span>
              <motion.div
                className="inline-flex flex-col gap-1"
                variants={itemVariants}
              >
                <motion.span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 px-3 py-1 font-medium"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {packedCounts.packedClothes}/{packedCounts.totalClothes} clothes
                </motion.span>
                {packedCounts.totalEssentials > 0 && (
                  <motion.span
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 px-3 py-1 text-sm font-medium"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {packedCounts.packedEssentials}/{packedCounts.totalEssentials} essentials
                  </motion.span>
                )}
              </motion.div>
              {categorySummary.map(([category, count]) => (
                <motion.span
                  key={category}
                  className="rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1"
                  variants={itemVariants}
                  custom={count}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}: {count}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Tip: Click items or outfits to add them to your packing list.</span>
          {dirtyClothes.length > 0 && (
            <div className="inline-flex items-start gap-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-2">
              <AlertTriangle className="w-4 h-4 mt-1" />
              <div className="flex flex-col gap-1">
                <span>
                  {dirtyClothes.length} packed {dirtyClothes.length === 1 ? 'item is' : 'items are'} currently in laundry.
                </span>
                <span className="text-xs text-amber-700/80 dark:text-amber-200/80">
                  {dirtyClothes.slice(0, 4).map((cloth) => cloth.name).join(', ')}
                  {dirtyClothes.length > 4 ? ` +${dirtyClothes.length - 4} more` : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.header>

      <motion.div
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.section
          className="glass-card rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 p-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col gap-3">
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Wardrobe</h2>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Input
                  placeholder="Search wardrobe..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sm:w-72"
                />
              </motion.div>
            </motion.div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <TabsList className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                  <TabsTrigger value="clothes" className="py-2 text-sm relative z-10">
                    <motion.span
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Clothes
                    </motion.span>
                  </TabsTrigger>
                  <TabsTrigger value="outfits" className="py-2 text-sm relative z-10">
                    <motion.span
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Outfits
                    </motion.span>
                  </TabsTrigger>
                </TabsList>
                <motion.div
                  className="absolute top-1 bottom-1 left-1 right-1/2 bg-white dark:bg-gray-700 rounded-lg shadow-sm z-0"
                  initial={false}
                  animate={{
                    x: activeTab === 'clothes' ? '0%' : '100%',
                    width: 'calc(50% - 4px)'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </motion.div>
              <TabsContent value="clothes" className="mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    className="max-h-[480px] overflow-y-auto pr-2 space-y-2 scrollbar-hide"
                    key="clothes-content"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          staggerChildren: 0.05,
                          when: "beforeChildren"
                        }
                      },
                      exit: {
                        opacity: 0,
                        y: -10,
                        transition: { duration: 0.2 }
                      }
                    }}
                  >
                    {wardrobeClothes.length === 0 ? (
                      <motion.div
                        className="text-sm text-gray-500 dark:text-gray-400 p-6 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        No clothes match your search.
                      </motion.div>
                    ) : (
                      <AnimatePresence>
                        {wardrobeClothes.map((cloth) => {
                          const added = trip.clothIds?.includes(cloth.id);
                          const statusMeta = getClothStatusMeta(cloth.status);
                          const showStatusBadge = cloth.status; // <-- MODIFIED

                          return (
                            <motion.div
                              key={cloth.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <button
                                type="button"
                                onClick={() => handleAddCloth(cloth.id)}
                                className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ${
                                  added
                                    ? 'border-primary-deep/60 bg-primary-deep/10 dark:border-primary-bright/40 dark:bg-primary-bright/10 text-primary-deep dark:text-primary-bright'
                                    : 'border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/60 hover:border-primary-deep/60'
                                }`}
                                disabled={added}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="h-9 w-9 rounded-lg border border-white/40 dark:border-gray-700 overflow-hidden"
                                    style={{ backgroundColor: cloth.color || '#111827' }}
                                  >
                                    {cloth.image ? (
                                      <img src={cloth.image} alt={cloth.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/80">
                                        {cloth.name.slice(0, 1).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-medium">{cloth.name}</p>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {cloth.categoryName}
                                      </span>
                                      {(cloth.subcategoryName && cloth.subcategoryName !== 'Uncategorized') ? (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                          • {cloth.subcategoryName}
                                        </span>
                                      ) : null}
                                    </div>
                                    {showStatusBadge && (
                                      <span className={`${statusMeta.className} mt-1 inline-flex`}>
                                        {statusMeta.label}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <PlusCircle className="w-5 h-5" />
                                </div>
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
              <TabsContent value="outfits" className="mt-4">
                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                  {wardrobeOutfits.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 p-6 text-center">
                      No outfits match your search.
                    </div>
                  ) : (
                    wardrobeOutfits.map((outfit) => {
                      const added = trip.outfitIds?.includes(outfit.id);

                      return (
                        <div
                          key={outfit.id}
                          className={`rounded-xl border transition ${
                            added
                              ? 'border-primary-deep/60 bg-primary-deep/10 dark:border-primary-bright/40 dark:bg-primary-bright/10 text-primary-deep dark:text-primary-bright'
                              : 'border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/60'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleAddOutfit(outfit.id)}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2"
                            disabled={added}
                          >
                            <div className="text-left">
                              <p className="text-sm font-medium">{outfit.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {outfit.clothIds?.length || 0} items
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!added && outfit.hasPackedClothes && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  outfit.allClothesPacked
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                }`}>
                                  {outfit.allClothesPacked ? 'Packed' : 'Partial'}
                                </span>
                              )}
                              <PlusCircle className={`w-5 h-5 ${added ? 'text-primary-deep/60 dark:text-primary-bright/60' : ''}`} />
                            </div>
                          </button>
                          {outfit.clothIds?.length ? (
                            <motion.div
                              className="border-t border-gray-200/70 dark:border-gray-700/60"
                              initial={false}
                            >
                              <motion.button
                                type="button"
                                onClick={() => toggleWardrobeOutfit(outfit.id)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400"
                                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                                whileTap={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                              >
                                <span>Preview</span>
                                <motion.span
                                  animate={{
                                    rotate: expandedWardrobeOutfits.has(outfit.id) ? 0 : -180,
                                    transition: { duration: 0.2 }
                                  }}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </motion.span>
                              </motion.button>
                              <AnimatePresence>
                                {expandedWardrobeOutfits.has(outfit.id) && (
                                  <motion.div
                                    className="px-3 pb-3 space-y-2 text-xs text-gray-500 dark:text-gray-400 overflow-hidden"
                                    initial="collapsed"
                                    animate="open"
                                    exit="collapsed"
                                    variants={{
                                      open: {
                                        opacity: 1,
                                        height: 'auto',
                                        transition: {
                                          opacity: { duration: 0.2 },
                                          height: { duration: 0.3, ease: 'easeInOut' }
                                        }
                                      },
                                      collapsed: {
                                        opacity: 0,
                                        height: 0,
                                        transition: {
                                          opacity: { duration: 0.2 },
                                          height: { duration: 0.2, ease: 'easeInOut' }
                                        }
                                      }
                                    }}
                                  >
                                    {outfit.clothIds.map((cid) => {
                                      const cloth = clothMap.get(cid);
                                      if (!cloth) return null;
                                      const statusMeta = getClothStatusMeta(cloth.status);
                                      const showStatusBadge = cloth.status; // <-- MODIFIED
                                      return (
                                        <motion.div
                                          key={cid}
                                          className="flex items-center justify-between gap-3"
                                          initial={{ opacity: 0, y: -5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <span>{cloth.name}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                              {cloth.categoryName}
                                            </span>
                                            {showStatusBadge && (
                                              <motion.span
                                                className={`${statusMeta.className} py-0.5 px-2 text-[10px]`}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                              >
                                                {statusMeta.label}
                                              </motion.span>
                                            )}
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.section>

        <motion.section className="glass-card rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-white/95 dark:bg-gray-900/80 p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Packing List</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click the check icon to toggle packed status.
            </span>
          </div>

          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Outfits</h3>
              {trip.outfitIds?.length ? (
                <div className="space-y-2">
                  {trip.outfitIds.map((id) => {
                    const outfit = outfitMap.get(id);
                    if (!outfit) return null;
                    const status = outfitPackedStatusMap.get(id) || 'none';
                    return (
                      <PackedOutfitCard
                        key={id}
                        outfit={outfit}
                        trip={trip}
                        onTogglePacked={handleTogglePacked}
                        onRemove={(id, type) =>
                          handleRemove(id, type, {
                            clothIds: outfit.clothIds || [],
                          })
                        }
                        outfitStatus={status}
                        clothesMap={clothMap}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
                  <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Outfits Added</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Add pre-planned outfits to make packing easier.</p>
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab('outfits')}
                    className="inline-flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    Add Outfits
                  </Button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Individual Items</h3>
              {trip.clothIds?.length ? (
                <div className="space-y-2">
                  {trip.clothIds.map((id) => {
                    const cloth = clothMap.get(id);
                    if (!cloth) return null;
                    const packed = trip.packedClothIds?.includes(id);
                    const statusMeta = getClothStatusMeta(cloth.status);
                    const showStatusBadge = cloth.status; // <-- MODIFIED
                    return (
                      <div
                        key={id}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                          packed
                            ? 'border-emerald-300/80 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/30'
                            : 'border-gray-200/70 dark:border-gray-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-md border border-white/40 dark:border-gray-700 overflow-hidden"
                            style={{ backgroundColor: cloth.color || '#111827' }}
                          >
                            {cloth.image ? (
                              <img src={cloth.image} alt={cloth.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/80">
                                {cloth.name.slice(0, 1).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{cloth.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {cloth.categoryName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {showStatusBadge && (
                            <span className={statusMeta.className}>{statusMeta.label}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleTogglePacked(id, 'cloth')}
                            className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                              packed
                                ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-300'
                                : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300'
                            }`}
                          >
                            {packed ? 'Packed' : 'Mark Packed'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(id, 'cloth')}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            aria-label={`Remove ${cloth.name}`}
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
                  <Shirt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Items Added</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Your packing list is empty. Click items from your wardrobe to add them here.</p>
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab('clothes')}
                    className="inline-flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    Add Items
                  </Button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Essentials</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {trip.essentials?.filter((e) => e.packed).length || 0}/{trip.essentials?.length || 0} packed
                </span>
              </div>
              {trip.essentials?.length ? (
                <div className="space-y-2">
                  {trip.essentials.map((essential) => (
                    <div
                      key={essential.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                        essential.packed
                          ? 'border-emerald-300/80 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/30'
                          : 'border-gray-200/70 dark:border-gray-700/60'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{essential.label}</p>
                        {essential.isCustom && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Trip specific</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleEssential(essential.id)}
                          className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                            essential.packed
                              ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-300'
                              : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300'
                          }`}
                        >
                          {essential.packed ? 'Packed' : 'Mark Packed'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(essential.id, 'essential')}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          aria-label={`Remove ${essential.label}`}
                        >
                          <MinusCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No essentials added yet.
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={essentialsInput}
                    onChange={(e) => setEssentialsInput(e.target.value)}
                    placeholder="Add custom essential"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEssential();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddEssential} disabled={!essentialsInput.trim()}>
                    Add
                  </Button>
                </div>
                {essentialsMaster.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p className="mb-1 font-semibold">Common essentials</p>
                    <div className="flex flex-wrap gap-2">
                      {essentialsMaster.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddMasterEssential(item)}
                          className="rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs hover:border-primary-deep/70 hover:text-primary-deep dark:hover:text-primary-bright"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}