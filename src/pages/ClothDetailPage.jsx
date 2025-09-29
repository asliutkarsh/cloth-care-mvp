import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Tag as TagIcon,
  Palette,
  DollarSign,
  Sparkles,
  Droplet,
  Calendar,
  Layers,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui';
import ClothModal from '../components/modal/ClothModal';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import { useToast } from '../context/ToastProvider.jsx';

const statusMeta = {
  clean: { label: 'Clean', tone: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200' },
  dirty: { label: 'Dirty', tone: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-200' },
  needs_pressing: { label: 'Needs Pressing', tone: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200' },
};

const InfoCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-200">
        {icon}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value ?? 'N/A'}</p>
  </div>
);

const formatCurrency = (value) => {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return `$${parsed.toFixed(2)}`;
};

export default function ClothDetailPage() {
  const navigate = useNavigate();
  const { clothId } = useParams();
  const { clothes, outfits = [], categories = [], updateCloth, removeCloth, markClothesDirty, isInitialized } = useWardrobeStore();
  const { addToast } = useToast();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const cloth = useMemo(() => clothes.find((c) => c.id === clothId), [clothes, clothId]);

  const flatCategories = useMemo(
    () => categories.flatMap((category) => [category, ...(category.children || [])]),
    [categories]
  );

  const category = useMemo(() => {
    if (!cloth) return null;
    return flatCategories.find((cat) => cat.id === cloth.categoryId) || null;
  }, [cloth, flatCategories]);

  const relatedOutfits = useMemo(() => {
    if (!cloth) return [];
    return outfits.filter((outfit) => (outfit.clothIds || []).includes(cloth.id));
  }, [outfits, cloth]);

  if (!isInitialized) {
    return <div className="max-w-5xl mx-auto p-6">Loading item...</div>;
  }
  if (!cloth) {
    return <div className="max-w-5xl mx-auto p-6">Cloth not found. It may have been deleted.</div>;
  }

  const costValue = formatCurrency(cloth.cost);
  const wearCount = cloth.currentWearCount ?? 0;
  const costPerWear = costValue && wearCount > 0 ? `$${(Number(cloth.cost) / wearCount).toFixed(2)}` : costValue ? `${costValue} (not worn yet)` : null;
  const status = statusMeta[cloth.status] || { label: cloth.status || 'Unknown', tone: 'text-gray-700 bg-gray-100 dark:bg-gray-800/70 dark:text-gray-200' };

  const maxWearCount = category?.maxWearCount ?? 3;
  const remaining = Math.max(maxWearCount - wearCount, 0);
  const progress = Math.min((wearCount / Math.max(maxWearCount, 1)) * 100, 100);

  const handleDelete = async () => {
    await removeCloth(clothId);
    navigate('/wardrobe');
  };

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center gap-4">
        <Button onClick={() => navigate('/wardrobe')} variant="ghost" size="icon" aria-label="Back to wardrobe">
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{cloth.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Added {new Date(cloth.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800">
        <div className="relative grid grid-cols-1 md:grid-cols-[320px_1fr] bg-white dark:bg-gray-900">
          <div className="relative h-72 md:h-full">
            {cloth.image ? (
              <img src={cloth.image} alt={cloth.name} className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full"
                style={{ background: `linear-gradient(135deg, ${cloth.color || '#111827'} 0%, #111827 100%)` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
                {category?.name && (
                  <span className="rounded-full bg-white/90 dark:bg-gray-900/80 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                    {category.name}
                  </span>
                )}
              </div>
              {cloth.favorite && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                  <Star className="h-3.5 w-3.5" /> Favourite
                </span>
              )}
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoCard icon={<Sparkles className="h-4 w-4" />} label="Times worn" value={`${wearCount} ${wearCount === 1 ? 'time' : 'times'}`} />
              <InfoCard icon={<DollarSign className="h-4 w-4" />} label="Total cost" value={costValue || '—'} />
              <InfoCard icon={<Droplet className="h-4 w-4" />} label="Cost per wear" value={costPerWear || '—'} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">Wears until laundry</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {remaining > 0 ? `${remaining} wear${remaining === 1 ? '' : 's'} until wash` : 'Time for a wash!'}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div className="h-full rounded-full bg-primary-deep dark:bg-primary-bright transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setEditModalOpen(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit details
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={() => updateCloth(clothId, { favorite: !cloth.favorite })}
              >
                <Star className={`h-4 w-4 ${cloth.favorite ? 'fill-current text-amber-500' : ''}`} />
                {cloth.favorite ? 'Remove favourite' : 'Mark favourite'}
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={async () => {
                  await markClothesDirty([clothId]);
                  addToast(`${cloth.name} marked as dirty.`, { type: 'success' });
                }}
              >
                <Droplet className="h-4 w-4" /> Mark dirty
              </Button>
              <Button variant="danger" className="flex items-center gap-2" onClick={() => setConfirmDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete item
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard icon={<TagIcon className="h-4 w-4" />} label="Category" value={category?.name || '—'} />
        <InfoCard icon={<Palette className="h-4 w-4" />} label="Color" value={cloth.color || '—'} />
        <InfoCard icon={<DollarSign className="h-4 w-4" />} label="Brand" value={cloth.brand || '—'} />
        <InfoCard icon={<Sparkles className="h-4 w-4" />} label="Material" value={cloth.material || '—'} />
        <InfoCard icon={<Calendar className="h-4 w-4" />} label="Season" value={cloth.season || 'All season'} />
        <InfoCard icon={<Calendar className="h-4 w-4" />} label="Purchase date" value={cloth.purchaseDate || '—'} />
      </section>

      <section className="space-y-4 rounded-3xl border border-gray-200/70 dark:border-gray-800/70 bg-white/85 dark:bg-gray-900/70 p-6">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-deep/10 text-primary-deep dark:bg-primary-bright/20 dark:text-primary-bright">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Outfits featuring this item</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{relatedOutfits.length} saved outfit{relatedOutfits.length === 1 ? '' : 's'}</p>
          </div>
        </header>
        {relatedOutfits.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            This piece hasn’t been added to any outfits yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedOutfits.map((outfit) => (
              <button
                key={outfit.id}
                onClick={() => navigate(`/wardrobe/outfit/${outfit.id}`)}
                className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 p-4 text-left transition hover:border-primary-deep/60 hover:shadow-lg"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{outfit.name}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(outfit.clothIds?.length || 0)} item{(outfit.clothIds?.length || 0) === 1 ? '' : 's'}
                </p>
                {outfit.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {outfit.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </section>

      <ClothModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={cloth}
        onSubmit={async (updated) => {
          await updateCloth(clothId, updated);
          setEditModalOpen(false);
        }}
      />

      <ConfirmationModal
        open={isConfirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Cloth?"
        message={`Are you sure you want to delete "${cloth.name}"? This action cannot be undone.`}
        isDanger
      />
    </main>
  );
}