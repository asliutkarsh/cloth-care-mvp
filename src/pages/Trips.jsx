import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarRange, CheckCircle2, Luggage, Plus, Trash2, AlertTriangle, 
  MapPin, Clock, Package, Shirt, Layers, TrendingUp, Archive,
  Calendar, Edit2, Copy, Clock1
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TripService } from '../services/crud';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { 
  format, differenceInDays, isPast, isFuture, isToday, 
  parseISO, setHours, setMinutes, isSameDay
} from 'date-fns';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastProvider.jsx';
import ConfirmationModal from '../components/modal/ConfirmationModal';

// Helper function to format date/time for display
const formatDateTime = (date, time) => {
    if (!date) return '';
    let parsedDate = parseISO(date);
    
    if (time) {
        // Simple parsing of "HH:mm" time string
        const [hours, minutes] = time.split(':').map(Number);
        parsedDate = setHours(parsedDate, hours);
        parsedDate = setMinutes(parsedDate, minutes);
        return format(parsedDate, 'MMM d, yyyy h:mm a');
    }
    
    return format(parsedDate, 'MMM d, yyyy');
};

const emptyTrip = {
  name: '',
  startDate: '',
  endDate: '',
  destination: '',
  startTime: '',
  endTime: '',
};

// Statistics Card Component (no changes)
const StatCard = ({ icon, label, value, color = 'primary', subtitle }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:dark:text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
};

// Trip Status Badge Component (no changes)
const TripStatusBadge = ({ startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isPast(end)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 text-xs font-medium">
        <Archive className="w-3 h-3" />
        Completed
      </span>
    );
  }

  if (isToday(start) || (start <= now && end >= now)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 text-xs font-medium animate-pulse">
        <Clock className="w-3 h-3" />
        Ongoing
      </span>
    );
  }

  const daysUntil = differenceInDays(start, now);
  if (daysUntil <= 7) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-1 text-xs font-medium">
        <Clock className="w-3 h-3" />
        {daysUntil} day{daysUntil !== 1 ? 's' : ''} away
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 text-xs font-medium">
      <Calendar className="w-3 h-3" />
      Upcoming
    </span>
  );
};

export default function TripsPage() {
  const navigate = useNavigate();
  const { clothes, outfits } = useWardrobeStore();
  const { addToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [isCopying, setIsCopying] = useState(false);
  const [form, setForm] = useState(emptyTrip); 
  const [saving, setSaving] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState(null);
  const [viewMode, setViewMode] = useState('all'); 

  const isEditing = !!editingTrip && !isCopying;
  const modalTitle = isEditing 
    ? `Edit Trip: ${editingTrip.name}` 
    : isCopying 
      ? `Copy Trip: ${editingTrip.name}`
      : 'Create New Trip';

  const refreshTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TripService.getAll();
      setTrips(data);
    } catch (error) {
      console.error('Failed to load trips:', error);
      addToast('Failed to load trips', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshTrips();
  }, [refreshTrips]);

  // FIX: Adjusted logic for separating upcoming and past trips
  const categorizedTrips = useMemo(() => {
    const now = new Date();
    
    const upcoming = trips.filter((trip) => {
        const startDate = new Date(trip.startDate).getTime();
        const endDate = new Date(trip.endDate).getTime();
        const nowTime = new Date().getTime();
        return startDate > nowTime || (startDate <= nowTime && endDate >= nowTime);
    });

    const past = trips.filter((trip) => {
        const endDate = new Date(trip.endDate).getTime();
        const nowTime = new Date().getTime();
        return endDate < nowTime;
    });
    
    return {
      upcoming: upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
      past: past.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
      all: [...upcoming, ...past]
    };
  }, [trips]);
// ------------------------------------------------------------------------------------------------------------------

  // Calculate statistics (no changes)
  const statistics = useMemo(() => {
    const totalItems = trips.reduce((sum, trip) => 
      sum + (trip.clothIds?.length || 0) + (trip.outfitIds?.length || 0), 0
    );
    const packedItems = trips.reduce((sum, trip) => 
      sum + (trip.packedClothIds?.length || 0) + (trip.packedOutfitIds?.length || 0), 0
    );
    const totalDirty = trips.reduce((sum, trip) => {
      const dirtyCount = (trip.clothIds || []).filter((id) => 
        clothes.find((c) => c.id === id && c.status !== 'clean')
      ).length;
      return sum + dirtyCount;
    }, 0);

    return {
      totalItems,
      packedItems,
      totalDirty,
      upcomingCount: categorizedTrips.upcoming.length,
      pastCount: categorizedTrips.past.length,
    };
  }, [trips, clothes, categorizedTrips]);

  // Handle opening modal for create, edit, or copy (no changes)
  const handleOpenModal = useCallback((tripToModify = null, mode = 'create') => {
    setEditingTrip(tripToModify);
    setIsCopying(mode === 'copy');
    
    if (tripToModify) {
      const startDate = format(new Date(tripToModify.startDate), 'yyyy-MM-dd');
      const endDate = format(new Date(tripToModify.endDate), 'yyyy-MM-dd');
      
      let newForm = {
        name: tripToModify.name,
        startDate: startDate,
        endDate: endDate,
        destination: tripToModify.destination || '',
        startTime: tripToModify.startTime || '', 
        endTime: tripToModify.endTime || '', 
      };

      if (mode === 'copy') {
        newForm.name = `Copy of ${tripToModify.name}`;
      }

      setForm(newForm);
    } else {
      setForm({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        destination: '',
        startTime: '', 
        endTime: '',   
      });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!saving) {
      setIsModalOpen(false);
      setEditingTrip(null);
      setIsCopying(false);
      setForm(emptyTrip);
    }
  }, [saving]);

  // Handle Create/Edit/Copy logic (no changes)
  const handleSaveTrip = async (event) => {
    event.preventDefault();
    
    if (!form.name.trim()) {
      addToast('Please enter a trip name', { type: 'error' });
      return;
    }
    if (!form.startDate || !form.endDate) {
      addToast('Please select travel dates', { type: 'error' });
      return;
    }
    
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (end < start) {
      addToast('End date must be after start date', { type: 'error' });
      return;
    }

    if (isSameDay(start, end) && form.startTime && form.endTime) {
        if (form.endTime <= form.startTime) {
            addToast('End time must be after start time on the same day', { type: 'error' });
            return;
        }
    }


    setSaving(true);
    const tripData = {
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      destination: form.destination?.trim() || '',
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
    };
    
    let resultTrip;
    let toastMessage;

    try {
      if (isEditing) {
        resultTrip = await TripService.update(editingTrip.id, tripData);
        toastMessage = `Trip "${resultTrip.name}" updated successfully!`;
        setTrips(trips.map(t => t.id === resultTrip.id ? resultTrip : t));
      } else if (editingTrip && isCopying) {
        const tripToCopy = {
          ...editingTrip, 
          ...tripData, 
          id: undefined, 
          packedClothIds: [], 
          packedOutfitIds: [],
          essentials: (editingTrip.essentials || []).map(e => ({...e, packed: false}))
        }
        resultTrip = await TripService.create(tripToCopy);
        toastMessage = `Trip "${resultTrip.name}" copied successfully!`;
        setTrips([...trips, resultTrip]);
        navigate(`/trips/${resultTrip.id}`); 
      } else {
        resultTrip = await TripService.create(tripData);
        toastMessage = `Trip "${resultTrip.name}" created successfully!`;
        setTrips([...trips, resultTrip]);
        navigate(`/trips/${resultTrip.id}`); 
      }
      
      handleCloseModal();
      addToast(toastMessage, { type: 'success' });
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : isCopying ? 'copy' : 'create'} trip`, error);
      addToast(`Failed to ${isEditing ? 'update' : isCopying ? 'copy' : 'create'} trip. Please try again.`, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deletingTripId) return;
    
    try {
      await TripService.remove(deletingTripId);
      addToast('Trip deleted successfully', { type: 'success' });
      setTrips(prev => prev.filter(t => t.id !== deletingTripId));
    } catch (error) {
      console.error('Failed to delete trip:', error);
      addToast('Failed to delete trip', { type: 'error' });
    } finally {
      setDeletingTripId(null);
    }
  };

  // renderTripCard (no changes)
  const renderTripCard = (trip) => {
    const clothCount = trip.clothIds?.length || 0;
    const outfitCount = trip.outfitIds?.length || 0;
    const packedCount = (trip.packedClothIds?.length || 0) + (trip.packedOutfitIds?.length || 0);
    const totalCount = clothCount + outfitCount;
    const packingProgress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
    
    const dirtyItems = (trip.clothIds || []).filter((id) => 
      clothes.find((c) => c.id === id && c.status !== 'clean')
    );

    const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;

    // Determine how to display the date range
    let dateRangeDisplay;
    if (isSameDay(new Date(trip.startDate), new Date(trip.endDate))) {
        dateRangeDisplay = formatDateTime(trip.startDate, trip.startTime) + (
            trip.endTime ? ` – ${formatDateTime(trip.endDate, trip.endTime)}` : ''
        );
    } else {
        dateRangeDisplay = `${formatDateTime(trip.startDate, trip.startTime)} – ${formatDateTime(trip.endDate, trip.endTime)}`;
    }
    
    return (
      <motion.article
        layout
        key={trip.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.7 }}
        whileHover={{ scale: 1.01 }}
        className="glass-card border border-gray-200/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all"
      >
        {/* Header */}
        <header 
          className="flex items-start justify-between gap-4 cursor-pointer"
          onClick={() => navigate(`/trips/${trip.id}`)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {trip.name}
              </h3>
              <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
            </div>
            
            <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{dateRangeDisplay}</span>
              </p>
              
              {trip.destination && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{trip.destination}</span>
                </p>
              )}
              
              <p className="flex items-center gap-2">
                <Clock1 className="w-4 h-4 flex-shrink-0" />
                <span>{tripDuration} day{tripDuration !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {dirtyItems.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200 px-2 py-1 text-xs font-medium">
                <AlertTriangle className="w-3 h-3" />
                {dirtyItems.length}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(trip, 'edit');
                }}
                aria-label={`Edit ${trip.name}`}
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(trip, 'copy');
                }}
                aria-label={`Copy ${trip.name}`}
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingTripId(trip.id);
                }}
                aria-label={`Delete ${trip.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </header>

        {/* Packing Progress (no changes) */}
        {totalCount > 0 && (
          <div className="space-y-2 cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Packing Progress</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {packingProgress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${packingProgress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${packingProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Stats (no changes) */}
        <div className="flex flex-wrap items-center gap-3 text-sm cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
          <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <Package className="w-4 h-4" />
            <span className="font-medium">{totalCount}</span> total
          </span>
          <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">{packedCount}</span> packed
          </span>
          {outfitCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
              <Layers className="w-4 h-4" />
              <span className="font-medium">{outfitCount}</span> outfit{outfitCount !== 1 ? 's' : ''}
            </span>
          )}
          {clothCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <Shirt className="w-4 h-4" />
              <span className="font-medium">{clothCount}</span> item{clothCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Outfit Preview (no changes) */}
        {outfitCount > 0 && (
          <div className="flex flex-wrap gap-2 cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
            {(trip.outfitIds || []).slice(0, 3).map((id) => {
              const outfit = outfits.find((o) => o.id === id);
              if (!outfit) return null;
              return (
                <span 
                  key={id} 
                  className="text-xs rounded-full bg-primary-50 text-primary-700 px-2 py-1 dark:bg-primary-900/20 dark:text-primary-300 truncate max-w-[150px]"
                  title={outfit.name}
                >
                  {outfit.name}
                </span>
              );
            })}
            {outfitCount > 3 && (
              <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-1 dark:bg-gray-800 dark:text-gray-400">
                +{outfitCount - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer (no changes) */}
        <footer className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {packingProgress === 100 ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready to go!
              </span>
            ) : totalCount === 0 ? (
              <span>No items added yet</span>
            ) : (
              <span>{totalCount - packedCount} item{totalCount - packedCount !== 1 ? 's' : ''} to pack</span>
            )}
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/${trip.id}`);
            }}
            variant="primary"
            size="sm"
          >
            Open
          </Button>
        </footer>
      </motion.article>
    );
  };

  const displayTrips = viewMode === 'all' ? categorizedTrips.all :
                       viewMode === 'upcoming' ? categorizedTrips.upcoming :
                       categorizedTrips.past;

// ------------------------------------------------------------------------------------------------------------------
  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 pb-24 sm:p-6 md:p-8 space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      {/* Header Section */}
      <div className="glass-card border border-primary-500/20 dark:border-primary-400/30 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Trips & Packing Lists
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              Plan your adventures, organize packing lists, and track everything from outfits to essentials. 
              Never forget an item again!
            </p>
          </div>
          <Button 
            onClick={() => handleOpenModal(null, 'create')}
            className="inline-flex items-center gap-2 flex-shrink-0"
            size="lg"
          >
            <Plus className="w-4 h-4" /> New Trip
          </Button>
        </header>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Upcoming Trips"
            value={statistics.upcomingCount}
            color="primary"
          />
          <StatCard
            icon={<Archive size={18} />}
            label="Past Trips"
            value={statistics.pastCount}
            color="gray"
          />
          <StatCard
            icon={<Package size={18} />}
            label="Items Packed"
            value={statistics.packedItems}
            color="success"
            subtitle={`of ${statistics.totalItems} total`}
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            label="Need Washing"
            value={statistics.totalDirty}
            color="amber"
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={viewMode === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('all')}
        >
          All Trips ({categorizedTrips.all.length})
        </Button>
        <Button
          variant={viewMode === 'upcoming' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('upcoming')}
        >
          Upcoming ({categorizedTrips.upcoming.length})
        </Button>
        <Button
          variant={viewMode === 'past' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('past')}
        >
          Past ({categorizedTrips.past.length})
        </Button>
      </div>

      {/* Trips Grid */}
      <section>
        {loading ? (
          <div className="glass-card border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading trips...</p>
          </div>
        ) : displayTrips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center"
          >
            <Luggage className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {viewMode === 'upcoming' ? 'No Upcoming Trips' :
               viewMode === 'past' ? 'No Past Trips' :
               'No Trips Yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {viewMode === 'upcoming' ? 'Plan your next adventure by creating a trip.' :
               viewMode === 'past' ? 'Your completed trips will appear here.' :
               'Start planning your adventures by creating your first trip.'}
            </p>
            <Button 
              onClick={() => handleOpenModal(null, 'create')}
              className="inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create Your First Trip
            </Button>
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {displayTrips.map(renderTripCard)}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Create/Edit/Copy Trip Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        size="lg"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={handleCloseModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTrip} 
              disabled={saving}
            >
              {saving ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : isCopying ? 'Copy Trip' : 'Create Trip')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTrip} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Trip Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Summer Beach Vacation"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Destination
            </label>
            <Input
              placeholder="e.g., Miami, Florida"
              value={form.destination}
              onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={form.startDate}
                min={isEditing ? undefined : new Date().toISOString().split('T')[0]} 
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value, endTime: '' }))} 
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                End Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={form.endDate}
                min={form.startDate || (isEditing ? undefined : new Date().toISOString().split('T')[0])}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value, startTime: '' }))} 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Start Time (Optional)
              </label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                End Time (Optional)
              </label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={!!deletingTripId}
        onClose={() => setDeletingTripId(null)}
        onConfirm={handleDeleteTrip}
        title="Delete Trip?"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        isDanger
      />
    </motion.div>
  );
}