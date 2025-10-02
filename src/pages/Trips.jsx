import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, CheckCircle2, Luggage, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TripService } from '../services/crud';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { format } from 'date-fns';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastProvider.jsx';

const emptyTrip = {
  name: '',
  startDate: '',
  endDate: '',
};

export default function TripsPage() {
  const navigate = useNavigate();
  const { clothes, outfits } = useWardrobeStore();
  const { addToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyTrip);
  const [saving, setSaving] = useState(false);

  const refreshTrips = async () => {
    setLoading(true);
    const data = await TripService.getAll();
    setTrips(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshTrips();
  }, []);

  const upcomingTrips = useMemo(() => trips.filter((trip) => new Date(trip.endDate) >= new Date()), [trips]);
  const pastTrips = useMemo(() => trips.filter((trip) => new Date(trip.endDate) < new Date()), [trips]);

  const handleOpenModal = () => {
    setForm({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCreateTrip = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      addToast('Name your trip before saving.', { type: 'error' });
      return;
    }
    if (!form.startDate || !form.endDate) {
      addToast('Pick travel dates.', { type: 'error' });
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      addToast('Return date cannot be before the start date.', { type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const trip = await TripService.create({
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setIsModalOpen(false);
      setForm(emptyTrip);
      addToast('Trip created! Start planning your packing list.', { type: 'success' });
      setTrips((prev) => [...prev, trip].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
      navigate(`/trips/${trip.id}`);
    } catch (error) {
      console.error('Failed to create trip', error);
      addToast('Could not create trip. Try again.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    await TripService.remove(tripId);
    addToast('Trip deleted.', { type: 'success' });
    refreshTrips();
  };

  const renderTripCard = (trip) => {
    const clothCount = trip.clothIds?.length || 0;
    const outfitCount = trip.outfitIds?.length || 0;
    const packedCount = (trip.packedClothIds?.length || 0) + (trip.packedOutfitIds?.length || 0);
    const totalCount = clothCount + outfitCount;
    const dirtyItems = (trip.clothIds || []).filter((id) => clothes.find((c) => c.id === id && c.status !== 'clean'));

    return (
      <motion.article
        layout
        key={trip.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.7 }}
        className="glass-card border border-gray-200/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{trip.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <CalendarRange className="w-4 h-4" />
              {format(new Date(trip.startDate), 'MMM d, yyyy')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {dirtyItems.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200 px-3 py-1 text-xs font-medium">
                <AlertTriangle className="w-4 h-4" />
                Wash {dirtyItems.length}
              </span>
            )}
            <Button variant="secondary" size="icon" onClick={() => handleDeleteTrip(trip.id)} aria-label={`Delete ${trip.name}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-1"><Luggage className="w-4 h-4" /> {totalCount} total pieces</span>
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {packedCount} packed</span>
          <span className="inline-flex items-center gap-1 text-primary-deep dark:text-primary-bright font-medium">
            {outfitCount} outfits · {clothCount} items
          </span>
        </div>

        <footer className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            {(trip.outfitIds || []).slice(0, 3).map((id) => {
              const outfit = outfits.find((o) => o.id === id);
              if (!outfit) return null;
              return (
                <span key={id} className="rounded-full bg-primary-deep/10 text-primary-deep px-3 py-1 dark:bg-primary-bright/20 dark:text-primary-bright">
                  {outfit.name}
                </span>
              );
            })}
            {outfitCount > 3 && <span className="rounded-full border border-gray-300 px-3 py-1 dark:border-gray-700">+{outfitCount - 3} more</span>}
          </div>
          <Button onClick={() => navigate(`/trips/${trip.id}`)} variant="primary">
            Open Planner
          </Button>
        </footer>
      </motion.article>
    );
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 pb-24 sm:p-6 md:p-8 space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <div className="glass-card border border-primary-deep/20 dark:border-primary-bright/30 bg-primary-deep/10 dark:bg-primary-bright/10 rounded-2xl p-6 flex flex-col gap-4">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trips & Packing Lists</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Curate outfits and essentials for upcoming travel. Track packed status and avoid laundry surprises.
            </p>
          </div>
          <Button onClick={handleOpenModal} className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Trip
          </Button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Upcoming Trips</p>
            <p className="text-2xl font-bold text-primary-deep dark:text-primary-bright">{upcomingTrips.length}</p>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Past Trips</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{pastTrips.length}</p>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Packable Items</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{clothes.length + outfits.length}</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upcoming Trips</h2>
          {upcomingTrips.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Sorted by start date
            </span>
          )}
        </header>
        {loading ? (
          <div className="glass-card border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
            Loading trips...
          </div>
        ) : upcomingTrips.length === 0 ? (
          <div className="glass-card border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
            Plan your first getaway by creating a trip.
          </div>
        ) : (
          <motion.div layout className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>{upcomingTrips.map(renderTripCard)}</AnimatePresence>
          </motion.div>
        )}
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Past Trips</h2>
        </header>
        {loading ? (
          <div className="glass-card border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
            Loading history...
          </div>
        ) : pastTrips.length === 0 ? (
          <div className="glass-card border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
            Past trips will appear here once your travel dates have passed.
          </div>
        ) : (
          <motion.div layout className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>{pastTrips.map(renderTripCard)}</AnimatePresence>
          </motion.div>
        )}
      </section>

      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Trip"
          size="lg"
          bodyClassName="px-0 py-0"
          footer={
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTrip} disabled={saving}>
                {saving ? 'Saving…' : 'Create Trip'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateTrip} className="flex flex-col gap-4 px-4 py-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trip name</label>
              <Input
                placeholder="e.g., Beach getaway"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </motion.div>
  );
}
