import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { WashHistoryService, ActivityLogService, ClothService } from '../services/crud';
import { ArrowLeft, Edit, Trash2, Tally1,Tag, Palette, DollarSign, Sparkles, Droplet, Calendar, Layers, Star, Copy, Shirt, History, SearchX, CreditCard } from 'lucide-react';
import { Button } from '../components/ui';
import ClothModal from '../components/modal/ClothModal';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import { useToast } from '../context/ToastProvider.jsx';
import { formatPrice } from '../utils/formatting';
import ClothDetailSkeleton from '../components/skeleton/ClothDetailSkeleton';
import { useModalStore, ModalTypes } from '../stores/useModalStore';

// --- Reusable Components ---

const statusMeta = {
  clean: { label: 'Clean', icon: <Sparkles size={12} />, tone: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200' },
  dirty: { label: 'In Laundry', icon: <Droplet size={12} />, tone: 'text-rose-700 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-200' },
  needs_pressing: { label: 'Needs Pressing', icon: <Shirt size={12} />, tone: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-200' },
};

const InfoCard = ({ icon, label, value, children }) => (
  <div className="glass-card flex-1 p-4 rounded-xl">
    <div className="flex items-center gap-3 mb-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300">
        {icon}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
    </div>
    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value ?? 'N/A'}</p>
    {children}
  </div>
);

const TabButton = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className="relative px-4 py-2 text-sm font-medium transition-colors">
    <span className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}>{label}</span>
    {isActive && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" layoutId="tab-underline" />}
  </button>
);

const NotFoundState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <SearchX size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">The clothing item you're looking for might have been moved or deleted.</p>
      <Button onClick={() => navigate('/wardrobe')}>
        <ArrowLeft size={16} className="mr-2" /> Back to Wardrobe
      </Button>
    </div>
  );
};


// --- Main Page Component ---

export default function ClothDetailPage() {
  const navigate = useNavigate();
  const { clothId } = useParams();
  const { clothes, outfits = [], categories = [], updateCloth, removeCloth, markClothesDirty, isInitialized } = useWardrobeStore();
  const { preferences } = useSettingsStore();
  const { addToast } = useToast();

  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [washHistory, setWashHistory] = useState([]);
  const [wearHistory, setWearHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [deleteImpact, setDeleteImpact] = useState(null);
  const [isDeleteImpactLoading, setDeleteImpactLoading] = useState(false);
  const [deleteImpactError, setDeleteImpactError] = useState(null);
  const [careCursor, setCareCursor] = useState(null);
  const [careHasMore, setCareHasMore] = useState(false);
  const [isCareLoadingMore, setIsCareLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const cloth = useMemo(() => clothes.find((c) => c.id === clothId), [clothes, clothId]);
  const lastWornDate = useMemo(() => {
    if (wearHistory.length > 0) {
      const mostRecentWear = wearHistory[0];
      try {
        return new Date(mostRecentWear.date).toLocaleDateString();
      } catch (error) {
        console.warn('Invalid date in wear history:', mostRecentWear.date);
        return null;
      }
    }
    return null;
  }, [wearHistory]);

  const category = useMemo(() => categories.find(c => c.id === cloth?.categoryId), [categories, cloth]);
  const relatedOutfits = useMemo(() => outfits.filter((outfit) => outfit.clothIds?.includes(clothId)), [outfits, clothId]);

  useEffect(() => {
    if (clothId && isInitialized) {
      setHistoryLoading(true);
      setHistoryError(null);
      Promise.all([
        WashHistoryService.getHistoryForCloth(clothId),
        ActivityLogService.getHistoryForCloth(clothId),
      ]).then(([washData, wearData]) => {
        setWashHistory(washData.items || []);
        setCareCursor(washData.nextCursor);
        setCareHasMore(Boolean(washData.nextCursor));
        setWearHistory(wearData || []);
      }).catch(err => {
        console.error("Failed to load history:", err);
        setHistoryError("Could not load history.");
      }).finally(() => {
        setHistoryLoading(false);
      });
    }
  }, [clothId, isInitialized]);

  const loadMoreCareHistory = useCallback(async () => {
    if (!careHasMore || isCareLoadingMore) return;
    setIsCareLoadingMore(true);
    try {
      const nextPage = await WashHistoryService.getHistoryForCloth(clothId, { cursor: careCursor });
      setWashHistory(prev => [...prev, ...nextPage.items]);
      setCareCursor(nextPage.nextCursor);
      setCareHasMore(Boolean(nextPage.nextCursor));
    } catch (error) {
      addToast("Failed to load more history.", { type: 'error' });
    } finally {
      setIsCareLoadingMore(false);
    }
  }, [careHasMore, careCursor, clothId, isCareLoadingMore, addToast]);

  useEffect(() => {
    let isMounted = true;
    if (isConfirmDeleteOpen && clothId) {
      setDeleteImpactLoading(true);
      setDeleteImpactError(null);
      ClothService.getReferenceCounts(clothId)
        .then((counts) => {
          if (isMounted) {
            setDeleteImpact(counts);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch cloth references before deletion:', error);
          if (isMounted) {
            setDeleteImpact(null);
            setDeleteImpactError('Unable to check where this item is used right now.');
          }
        })
        .finally(() => {
          if (isMounted) {
            setDeleteImpactLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isConfirmDeleteOpen, clothId]);

  const deleteMessage = useMemo(() => {
    const itemName = cloth?.name || 'this item';
    const baseMessage = `Are you sure you want to delete "${itemName}"?`;

    if (isDeleteImpactLoading) {
      return `${baseMessage} Checking related outfits and trips...`;
    }

    if (deleteImpactError) {
      return `${baseMessage} Deleting will remove it from anywhere it is used.`;
    }

    const impact = deleteImpact || { outfits: 0, trips: 0 };
    const parts = [];
    if (impact.outfits > 0) {
      parts.push(`${impact.outfits} outfit${impact.outfits === 1 ? '' : 's'}`);
    }
    if (impact.trips > 0) {
      parts.push(`${impact.trips} trip${impact.trips === 1 ? '' : 's'}`);
    }

    if (!parts.length) {
      return `${baseMessage} This action cannot be undone.`;
    }

    const joined = parts.join(' and ');
    return `${baseMessage} This will also remove it from ${joined}.`;
  }, [cloth, deleteImpact, deleteImpactError, isDeleteImpactLoading]);

  if (!isInitialized) return <ClothDetailSkeleton />;
  if (!cloth) return <NotFoundState />;

  const status = statusMeta[cloth.status] || { label: 'Unknown', icon: <Shirt size={12} />, tone: 'text-gray-700 bg-gray-100' };
  const costPerWear = cloth.cost && cloth.totalWearCount > 0
    ? formatPrice(Number(cloth.cost) / cloth.totalWearCount, preferences?.currency)
    : cloth.cost ? `${formatPrice(cloth.cost, preferences?.currency)} (not worn yet)` : null;

  const maxWearCount = category?.maxWearCount ?? 3;
  const wearCount = cloth.currentWearCount ?? 0;
  const remainingWears = Math.max(maxWearCount - wearCount, 0);
  const wearProgress = Math.min((wearCount / Math.max(maxWearCount, 1)) * 100, 100);

  const handleDelete = async () => {
    await removeCloth(clothId);
    setConfirmDeleteOpen(false);
    navigate('/wardrobe');
  };

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.main variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <motion.header variants={itemVariants} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/wardrobe')} variant="ghost" size="icon" className="rounded-full flex-shrink-0" aria-label="Go back"><ArrowLeft size={20} /></Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{cloth.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Added on {new Date(cloth.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Button onClick={() => useModalStore.getState().openModal(ModalTypes.ADD_CLOTH, { initialData: cloth })} className="flex-shrink-0"><Edit size={16} className="mr-2" /> Edit</Button>
      </motion.header>

      <motion.section variants={itemVariants} className=" rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_320px)_1fr]">
          <div className="relative h-80 md:h-full">
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cloth.color || '#4b5563'}, #1f2937)` }}>
              {cloth.image ? <img src={cloth.image} alt={cloth.name} className="w-full h-full object-cover" /> : <Shirt size={80} className="text-white/20" />}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.icon}{status.label}</span>
                {category?.name && <span className="rounded-full bg-white/20 px-3 py-1 text-xs text-white font-medium backdrop-blur-sm">{category.name}</span>}
                {cloth.favorite && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                    <Star className="h-3.5 w-3.5" /> Favourite
                  </span>
                )}

              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoCard icon={<History size={16} />} label="Total Wears" value={`${cloth.totalWearCount}`}>
                {lastWornDate ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last worn: {lastWornDate}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Never worn
                  </p>
                )}
              </InfoCard>
              <InfoCard icon={<CreditCard size={16} />} label="Cost" value={cloth.cost ? formatPrice(cloth.cost, preferences?.currency) : 'N/A'} />
              <InfoCard icon={<DollarSign size={16} />} label="Cost / Wear" value={costPerWear ? formatPrice(costPerWear, preferences?.currency) : 'N/A'} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">Wears until laundry</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {remainingWears > 0 ? `${remainingWears} wear${remainingWears === 1 ? '' : 's'} until wash` : 'Time for a wash!'}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div className="h-full rounded-full bg-primary-deep dark:bg-primary-bright transition-all" style={{ width: `${wearProgress}%` }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => updateCloth(cloth.id, { favorite: !cloth.favorite })}><Star size={16} className={`mr-2 ${cloth.favorite ? 'fill-yellow-400 text-yellow-500' : ''}`} /> {cloth.favorite ? 'Unfavorite' : 'Favorite'}</Button>
              <Button variant="secondary" onClick={async () => { await markClothesDirty([clothId]); addToast('Marked as dirty.', { type: 'success' }); }}><Droplet size={16} className="mr-2" /> Mark Dirty</Button>
              <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)}><Trash2 size={16} className="mr-2" /> Delete</Button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-4">Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoCard icon={<Tag size={16} />} label="Category" value={category?.name} />
          <InfoCard icon={<Palette size={16} />} label="Color" value={cloth.color} />
          <InfoCard icon={<Layers size={16} />} label="Material" value={cloth.material} />
          <InfoCard icon={<Sparkles size={16} />} label="Brand" value={cloth.brand} />
          <InfoCard icon={<Calendar size={16} />} label="Season" value={cloth.season} />
          <InfoCard icon={<Calendar size={16} />} label="Purchased" value={cloth.purchaseDate ? new Date(cloth.purchaseDate).toLocaleDateString() : 'N/A'} />
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="glass-card p-4 sm:p-6 rounded-2xl">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <TabButton label="Description" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
          <TabButton label="Care & Wear History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <TabButton label="Outfits" isActive={activeTab === 'outfits'} onClick={() => setActiveTab('outfits')} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }} className="min-h-[150px]">
            {activeTab === 'details' && <p className="text-sm text-gray-600 dark:text-gray-300">{cloth.description || 'No description provided.'}</p>}

            {activeTab === 'history' && (
              historyLoading ? <p>Loading history...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><History size={16} /> Wear Log</h4>
                    <ul className="space-y-1">{wearHistory.map(log => <li key={log.id} className="flex items-center gap-2"><Tally1 size={14} className="flex-shrink-0" />Worn on {new Date(log.date).toLocaleDateString()}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Sparkles size={16} /> Care Log</h4>
                    <ul className="space-y-1">{washHistory.map(e => <li key={e.id} className="flex items-center gap-2">{e.action === 'wash' ? <Droplet size={14} /> : <Shirt size={14} />}{e.action === 'wash' ? 'Washed' : 'Pressed'} on {new Date(e.createdAt).toLocaleDateString()}</li>)}</ul>
                    {careHasMore && <Button variant="link" size="sm" onClick={loadMoreCareHistory} disabled={isCareLoadingMore} className="mt-2">{isCareLoadingMore ? 'Loading...' : 'Load More'}</Button>}
                  </div>
                </div>
              )
            )}

            {activeTab === 'outfits' && (relatedOutfits.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{relatedOutfits.map(o => <button key={o.id} onClick={() => navigate(`/wardrobe/outfit/${o.id}`)} className="p-3 rounded-lg text-left hover-highlight"><strong>{o.name}</strong><p className="text-xs text-gray-500">{o.clothIds.length} items</p></button>)}</div> : <p>Not in any outfits yet.</p>)}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/** Edit modal removed: handled via global modal store in AppLayout */}
      <ClothModal open={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} initialData={cloth} isEditMode={false}/>
      <ConfirmationModal
        open={isConfirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item?"
        message={deleteMessage}
        confirmText="Delete"
        isDanger
      />
    </motion.main>
  );
}


