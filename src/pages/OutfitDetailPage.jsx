import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { TripService, ActivityLogService } from '../services/crud';
import { X, Luggage, ArrowLeft, Layers, Star, Sparkles, Tag, Edit, Droplet, Trash2, Shirt, Calendar, TrendingUp, AlertCircle, Share2, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui';
import OutfitModal from '../components/modal/OutfitModal';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastProvider.jsx';
import OutfitDetailSkeleton from '../components/skeleton/OutfitDetailSkeleton';

// --- Reusable Components ---

const StatCard = ({ icon, label, value, trend, trendLabel }) => (
  <div className="glass-card flex-1 p-4 rounded-xl min-w-[100px] hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value ?? 'N/A'}</p>
      {trend && (
        <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-gray-500'}`}>
          {trend > 0 ? `+${trend}` : trend}
        </span>
      )}
    </div>
    {trendLabel && <p className="text-xs text-gray-500 mt-1">{trendLabel}</p>}
  </div>
);

const TabButton = ({ label, isActive, onClick, badge }) => (
  <button onClick={onClick} className="relative px-4 py-2 text-sm font-medium transition-colors">
    <span className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}>
      {label}
      {badge !== undefined && (
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
          {badge}
        </span>
      )}
    </span>
    {isActive && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" layoutId="tab-underline" />}
  </button>
);

const OutfitVisualizer = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  
  return (
    <div className="relative h-80 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-emerald-800/40 dark:to-emerald-900/40 flex items-center justify-center overflow-hidden">
      {items.length > 0 ? (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full p-4">
          {items.slice(0, 4).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.1 * index, type: 'spring' }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group"
              onClick={() => setSelectedItem(item)}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: item.color || 'emerald' }}>
                  <Shirt size={40} className="text-white opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <p className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                  {item.name}
                </p>
              </div>
              {item.status === 'dirty' && (
                <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Dirty
                </div>
              )}
            </motion.div>
          ))}
          {items.length > 4 && (
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
              +{items.length - 4} more
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <Layers size={80} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No items in this outfit</p>
        </div>
      )}
    </div>
  );
};

const ItemCard = ({ item, onClick }) => (
  <motion.button
    onClick={onClick}
    className="flex items-center gap-3 p-3 rounded-xl hover-highlight text-left group transition-all"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="w-14 h-14 rounded-lg bg-lime-200 dark:bg-emerald-800 flex-shrink-0 overflow-hidden shadow-sm">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: item.color || 'emerald' }}>
          <Shirt size={24} className="text-white opacity-70" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate">{item.name}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500 capitalize">{item.category || 'Uncategorized'}</span>
        {item.status === 'dirty' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
            Dirty
          </span>
        )}
      </div>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowLeft className="rotate-180 h-4 w-4 text-gray-400" />
    </div>
  </motion.button>
);

export default function OutfitDetailPage() {
  const navigate = useNavigate();
  const { outfitId } = useParams();
  const { outfits, clothes,categories = [], updateOutfit, removeOutfit, markOutfitDirty, isInitialized } = useWardrobeStore();
  const { addActivity } = useCalendarStore();
  const { addToast } = useToast();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isWearing, setIsWearing] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [wearHistory, setWearHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');
  const [copied, setCopied] = useState(false);

  const categoryNameLookup = useMemo(() => {
    const map = new Map();
    const walk = (categoryList) => {
        for (const category of categoryList) {
            map.set(category.id, category.name);
            if (category.children?.length) {
                walk(category.children);
            }
        }
    };
    walk(categories);
    return map;
  }, [categories]);


  const outfit = useMemo(() => outfits.find((o) => o.id === outfitId), [outfits, outfitId]);
  const itemsInOutfit = useMemo(() => 
    outfit?.clothIds?.map((id) => clothes.find((c) => c.id === id)).filter(Boolean) || [], 
    [outfit, clothes]
  );

  const dirtyItemsCount = useMemo(() => 
    itemsInOutfit.filter(i => i?.status === 'dirty').length,
    [itemsInOutfit]
  );

  const outfitScore = useMemo(() => {
    if (!itemsInOutfit.length) return 0;
    const cleanPercentage = ((itemsInOutfit.length - dirtyItemsCount) / itemsInOutfit.length) * 100;
    return Math.round(cleanPercentage);
  }, [itemsInOutfit, dirtyItemsCount]);

  useEffect(() => {
    if (outfitId && isInitialized) {
      setHistoryLoading(true);
      ActivityLogService.getHistoryForOutfit(outfitId)
        .then(setWearHistory)
        .catch(err => console.error("Failed to load outfit history", err))
        .finally(() => setHistoryLoading(false));
    }
  }, [outfitId, isInitialized]);

  if (!isInitialized) return <OutfitDetailSkeleton />;
  if (!outfit) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Outfit not found</h2>
        <Button onClick={() => navigate('/wardrobe#outfits')}>Back to Outfits</Button>
      </div>
    );
  }

  const handleDelete = async () => { 
    await removeOutfit(outfitId); 
    addToast(`"${outfit.name}" deleted successfully`, { type: 'success' });
    navigate('/wardrobe#outfits'); 
  };

  const handleWearToday = async () => {
    setIsWearing(true);
    try {
      await addActivity({ type: 'outfit', outfitId: outfit.id }, new Date());
      addToast(`Logged wearing "${outfit.name}" today!`, { type: 'success' });
      // Refresh history
      const updatedHistory = await ActivityLogService.getHistoryForOutfit(outfitId);
      setWearHistory(updatedHistory);
    } catch (error) {
      addToast('Failed to log outfit.', { type: 'error' });
    } finally {
      setIsWearing(false);
    }
  };

  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      setTrips(await TripService.getAll());
    } catch (error) { 
      addToast('Failed to load trips.', { type: 'error' }); 
    } finally { 
      setLoadingTrips(false); 
    }
  };

  const handleAddToTrip = async (tripId) => {
    setAddingToTrip(true);
    try {
      await TripService.addItems(tripId, { outfitIds: [outfit.id] });
      setIsTripModalOpen(false);
      addToast(`"${outfit.name}" added to trip!`, { type: 'success' });
    } catch (error) { 
      addToast('Failed to add outfit to trip.', { type: 'error' }); 
    } finally { 
      setAddingToTrip(false); 
    }
  };

  const handleShare = async () => {
    const outfitDetails = `${outfit.name}\n\nItems:\n${itemsInOutfit.map(i => `• ${i.name}`).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(outfitDetails);
      setCopied(true);
      addToast('Outfit details copied to clipboard!', { type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      addToast('Failed to copy outfit details', { type: 'error' });
    }
  };

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.main 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            size="icon" 
            className="rounded-full flex-shrink-0 mt-1" 
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{outfit.name}</h1>
              {outfit.favorite && (
                <Star size={20} className="fill-amber-500 text-amber-500 flex-shrink-0" />
              )}
            </div>
            {outfit.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {outfit.tags.map(tag => (
                  <span key={tag} className="tag text-xs px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleShare}
            variant="ghost" 
            size="icon"
            className="rounded-full"
            aria-label="Share outfit"
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
          </Button>
          <Button 
            onClick={() => setEditModalOpen(true)} 
            className="flex items-center gap-2 flex-1 sm:flex-initial"
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualizer - Takes 2 columns on large screens */}
        <motion.section 
          variants={itemVariants} 
          className="lg:col-span-2 rounded-2xl overflow-hidden"
        >
          <OutfitVisualizer items={itemsInOutfit} />
        </motion.section>

        {/* Stats Sidebar */}
        <motion.aside variants={itemVariants} className="space-y-4">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Outfit Stats
            </h3>
            <div className="space-y-4">
              <StatCard 
                icon={<Layers size={16} />} 
                label="Pieces" 
                value={itemsInOutfit.length} 
              />
              <StatCard 
                icon={<Sparkles size={16} />} 
                label="Ready" 
                value={itemsInOutfit.filter(i => i?.status === 'clean').length}
              />
              <StatCard 
                icon={<Calendar size={16} />} 
                label="Times Worn" 
                value={wearHistory.length}
              />
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Outfit Score
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{outfitScore}%</p>
                  <span className={`text-xs font-medium ${outfitScore >= 80 ? 'text-green-600' : outfitScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {outfitScore >= 80 ? 'Excellent' : outfitScore >= 50 ? 'Good' : 'Needs Care'}
                  </span>
                </div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${outfitScore >= 80 ? 'bg-green-500' : outfitScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${outfitScore}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {dirtyItemsCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-xl border-2 border-amber-500/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Attention Needed</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {dirtyItemsCount} {dirtyItemsCount === 1 ? 'item needs' : 'items need'} washing
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.aside>
      </div>

      {/* Action Buttons */}
      <motion.section variants={itemVariants} className="glass-card p-4 sm:p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2" 
            onClick={() => updateOutfit(outfitId, { favorite: !outfit.favorite })}
          >
            <Star className={`h-4 w-4 ${outfit.favorite ? 'fill-current text-amber-500' : ''}`} />
            {outfit.favorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={async () => {
              await markOutfitDirty(outfitId);
              addToast(`${outfit.name} items marked as dirty.`, { type: 'success' });
            }}
          >
            <Droplet className="h-4 w-4" /> Mark All Dirty
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={handleWearToday}
            disabled={isWearing}
          >
            <Calendar className="h-4 w-4" /> 
            {isWearing ? 'Logging...' : 'Wear Today'}
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => {
              loadTrips();
              setIsTripModalOpen(true);
            }}
          >
            <Luggage className="h-4 w-4" /> Add to Trip
          </Button>
          <Button 
            variant="danger" 
            className="flex items-center gap-2 ml-auto" 
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </motion.section>

      {/* Tabs Section */}
      <motion.section variants={itemVariants} className="glass-card p-4 sm:p-6 rounded-2xl">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <TabButton 
            label="Items" 
            isActive={activeTab === 'items'} 
            onClick={() => setActiveTab('items')}
            badge={itemsInOutfit.length}
          />
          <TabButton 
            label="History" 
            isActive={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            badge={wearHistory.length}
          />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ y: 10, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -10, opacity: 0 }} 
            transition={{ duration: 0.2 }} 
            className="min-h-[200px]"
          >
            {activeTab === 'items' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itemsInOutfit.length > 0 ? (
                  itemsInOutfit.map(c => (
                    <ItemCard 
                      key={c.id} 
                      item={{...c, category: categoryNameLookup.get(c.categoryId)}} 
                      onClick={() => navigate(`/wardrobe/cloth/${c.id}`)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Layers size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">No items in this outfit yet</p>
                    <Button 
                      onClick={() => setEditModalOpen(true)}
                      variant="ghost"
                      className="mt-4"
                    >
                      Add Items
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'history' && (
              historyLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading history...</p>
                </div>
              ) : wearHistory.length > 0 ? (
                <div className="space-y-3">
                  {wearHistory.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                        <Calendar size={18} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {new Date(log.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.floor((new Date() - new Date(log.date)) / (1000 * 60 * 60 * 24))} days ago
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 mb-4">This outfit hasn't been worn yet</p>
                  <Button onClick={handleWearToday} disabled={isWearing}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Wear it today
                  </Button>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* Modals */}
      <OutfitModal 
        open={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        initialData={outfit} 
        onSubmit={async (d) => {
          await updateOutfit(outfitId, d);
          addToast('Outfit updated successfully!', { type: 'success' });
        }} 
      />
      
      <ConfirmationModal 
        open={isConfirmDeleteOpen} 
        onClose={() => setConfirmDeleteOpen(false)} 
        onConfirm={handleDelete} 
        title="Delete Outfit?" 
        message={`Are you sure you want to delete "${outfit.name}"? This action cannot be undone.`} 
        isDanger 
      />

      <Modal open={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} title="Add to Trip">
        {loadingTrips ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
            <p>Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center p-6">
            <Luggage size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="mb-4 text-gray-600">No trips found. Create one to pack your outfits!</p>
            <Button onClick={() => navigate('/trips')}>Create a Trip</Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {trips.map(trip => (
              <button 
                key={trip.id} 
                onClick={() => handleAddToTrip(trip.id)} 
                disabled={addingToTrip} 
                className="w-full text-left p-4 rounded-lg hover-highlight disabled:opacity-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <Luggage size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{trip.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </motion.main>
  );
}