import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarRange, CheckCircle2, ChevronLeft, Luggage, MinusCircle, PlusCircle } from 'lucide-react';
import { TripService } from '../services';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useToast } from '../context/ToastProvider.jsx';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

const today = () => new Date().toISOString().split('T')[0];

export default function TripPlanner() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { clothes = [], outfits = [] } = useWardrobeStore();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clothes');
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

  const clothMap = useMemo(() => new Map(clothes.map((cloth) => [cloth.id, cloth])), [clothes]);
  const outfitMap = useMemo(() => new Map(outfits.map((outfit) => [outfit.id, outfit])), [outfits]);

  const wardrobeClothes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clothes
      .filter((cloth) => cloth.archived !== true)
      .filter((cloth) => (term ? cloth.name.toLowerCase().includes(term) : true));
  }, [clothes, search]);

  const wardrobeOutfits = useMemo(() => {
    const term = search.trim().toLowerCase();
    return outfits
      .filter((outfit) => (term ? outfit.name.toLowerCase().includes(term) : true));
  }, [outfits, search]);

  const dirtyClothes = useMemo(() => {
    if (!trip) return [];
    return (trip.clothIds || [])
      .map((id) => clothMap.get(id))
      .filter((cloth) => cloth && cloth.status !== 'clean');
  }, [trip, clothMap]);

  const packedCounts = useMemo(() => {
    if (!trip) return { total: 0, packed: 0 };
    const outfitsPacked = trip.packedOutfitIds?.length || 0;
    const clothesPacked = trip.packedClothIds?.length || 0;
    const total = (trip.outfitIds?.length || 0) + (trip.clothIds?.length || 0);
    return { total, packed: outfitsPacked + clothesPacked };
  }, [trip]);

  const categorySummary = useMemo(() => {
    if (!trip) return [];
    const counts = {};
    (trip.clothIds || []).forEach((id) => {
      const cloth = clothMap.get(id);
      const categoryName = cloth?.categoryName || cloth?.category || 'Other';
      if (!categoryName) return;
      counts[categoryName] = (counts[categoryName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [trip, clothMap]);

  const handleAddCloth = async (clothId) => {
    if (!trip || trip.clothIds?.includes(clothId)) return;
    const updated = await TripService.addItems(trip.id, { clothIds: [clothId] });
    setTrip(updated);
  };

  const handleAddOutfit = async (outfitId) => {
    if (!trip || trip.outfitIds?.includes(outfitId)) return;
    const updated = await TripService.addItems(trip.id, { outfitIds: [outfitId] });
    setTrip(updated);
  };

  const handleRemove = async (entityId, type) => {
    if (!trip) return;
    const updated = await TripService.removeItem(trip.id, entityId, type);
    setTrip(updated);
  };

  const handleTogglePacked = async (entityId, type) => {
    if (!trip) return;
    const updated = await TripService.togglePacked(trip.id, entityId, type);
    setTrip(updated);
  };

  const formatDateRange = (start, end) => {
    const startDate = start ? new Date(start) : new Date(today());
    const endDate = end ? new Date(end) : startDate;
    return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading || !trip) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="glass-card rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400">
          Loading trip planner...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24 sm:p-6 md:p-8 space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trips')} aria-label="Back to trips">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{trip.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <CalendarRange className="w-4 h-4" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-deep/10 text-primary-deep dark:bg-primary-bright/15 dark:text-primary-bright px-3 py-1 font-medium">
                <Luggage className="w-4 h-4" />
                {trip.outfitIds?.length || 0} outfits · {trip.clothIds?.length || 0} items
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 px-3 py-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {packedCounts.packed}/{packedCounts.total} packed
              </span>
              {categorySummary.map(([category, count]) => (
                <span key={category} className="rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1">
                  {category}: {count}
                </span>
              ))}
            </div>
          </div>
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
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="glass-card rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Wardrobe</h2>
              <Input
                placeholder="Search wardrobe..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:w-72"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                <TabsTrigger value="clothes" className="py-2 text-sm">Clothes</TabsTrigger>
                <TabsTrigger value="outfits" className="py-2 text-sm">Outfits</TabsTrigger>
              </TabsList>
              <TabsContent value="clothes" className="mt-4">
                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-2">
                  {wardrobeClothes.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 p-6 text-center">
                      No clothes match your search.
                    </div>
                  ) : (
                    wardrobeClothes.map((cloth) => {
                      const added = trip.clothIds?.includes(cloth.id);
                      const dirty = cloth.status && cloth.status !== 'clean';
                      return (
                        <button
                          key={cloth.id}
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
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {cloth.categoryName || cloth.category || 'Uncategorized'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {dirty && (
                              <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5">
                                Laundry
                              </span>
                            )}
                            <PlusCircle className="w-5 h-5" />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </TabsContent>
              <TabsContent value="outfits" className="mt-4">
                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-2">
                  {wardrobeOutfits.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 p-6 text-center">
                      No outfits match your search.
                    </div>
                  ) : (
                    wardrobeOutfits.map((outfit) => {
                      const added = trip.outfitIds?.includes(outfit.id);
                      return (
                        <button
                          key={outfit.id}
                          type="button"
                          onClick={() => handleAddOutfit(outfit.id)}
                          className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ${
                            added
                              ? 'border-primary-deep/60 bg-primary-deep/10 dark:border-primary-bright/40 dark:bg-primary-bright/10 text-primary-deep dark:text-primary-bright'
                              : 'border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/60 hover:border-primary-deep/60'
                          }`}
                          disabled={added}
                        >
                          <div className="text-left">
                            <p className="text-sm font-medium">{outfit.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {outfit.clothIds?.length || 0} items
                            </p>
                          </div>
                          <PlusCircle className="w-5 h-5" />
                        </button>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="glass-card rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-white/95 dark:bg-gray-900/80 p-5 flex flex-col gap-4">
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
                    const packed = trip.packedOutfitIds?.includes(id);
                    return (
                      <div
                        key={id}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                          packed
                            ? 'border-emerald-300/80 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/30'
                            : 'border-gray-200/70 dark:border-gray-700/60'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{outfit.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{outfit.clothIds?.length || 0} pieces</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePacked(id, 'outfit')}
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
                            onClick={() => handleRemove(id, 'outfit')}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            aria-label={`Remove ${outfit.name}`}
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl px-4 py-8 text-center">
                  Add outfits from your wardrobe to plan multi-piece looks.
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
                    const dirty = cloth.status && cloth.status !== 'clean';
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
                              {cloth.categoryName || cloth.category || 'Uncategorized'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {dirty && (
                            <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5 text-xs">
                              Laundry
                            </span>
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
                <div className="text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl px-4 py-8 text-center">
                  Add individual pieces you need to remember to pack.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
