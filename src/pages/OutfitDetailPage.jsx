import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Sparkles,
  Layers,
  Tag as TagIcon,
  Star,
  Shirt,
} from 'lucide-react';
import { Button } from '../components/ui';
import OutfitModal from '../components/modal/OutfitModal';
import ConfirmationModal from '../components/modal/ConfirmationModal';

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-200">
        {icon}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

const ClothTile = ({ cloth, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-3 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 p-3 text-left transition hover:border-primary-deep/60 hover:shadow-lg"
  >
    <span className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/40 dark:border-gray-700" style={{ backgroundColor: cloth.color || '#111827' }}>
      {cloth.image ? (
        <img src={cloth.image} alt={cloth.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/90">
          {cloth.name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{cloth.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{clothStatusText(cloth)}</p>
    </div>
  </button>
);

const clothStatusText = (cloth) => {
  const status = cloth.status || 'clean';
  if (status === 'clean') return 'Ready to wear';
  if (status === 'dirty') return 'Needs washing';
  if (status === 'needs_pressing') return 'Needs pressing';
  return status;
};

export default function OutfitDetailPage() {
  const navigate = useNavigate();
  const { outfitId } = useParams();
  const { outfits, clothes, updateOutfit, removeOutfit, isInitialized } = useWardrobeStore();
  const { addActivity } = useCalendarStore();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isWearing, setIsWearing] = useState(false);

  const outfit = useMemo(() => outfits.find((o) => o.id === outfitId), [outfits, outfitId]);

  const itemsInOutfit = useMemo(() => {
    if (!outfit) return [];
    return (outfit.clothIds || []).map((id) => clothes.find((c) => c.id === id)).filter(Boolean);
  }, [outfit, clothes]);

  if (!isInitialized) return <div className="max-w-5xl mx-auto p-6">Loading...</div>;
  if (!outfit) return <div className="max-w-5xl mx-auto p-6">Outfit not found.</div>;

  const tags = outfit.tags || [];

  const handleDelete = async () => {
    await removeOutfit(outfitId);
    navigate('/wardrobe');
  };

  const handleWearToday = async () => {
    try {
      setIsWearing(true);
      await addActivity({ type: 'outfit', outfitId: outfit.id }, new Date());
      navigate('/calendar');
    } finally {
      setIsWearing(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center gap-4">
        <Button onClick={() => navigate('/wardrobe')} variant="ghost" size="icon" aria-label="Back to wardrobe">
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{outfit.name}</h1>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-primary-deep/10 px-3 py-1 text-xs font-semibold text-primary-deep dark:bg-primary-bright/20 dark:text-primary-bright">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800">
        <div className="relative grid grid-cols-1 md:grid-cols-[320px_1fr] bg-white dark:bg-gray-900">
          <div className="relative h-72 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/80 via-primary-deep/50 to-transparent" />
            <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundImage: 'url(/textures/noise.png)', opacity: 0.2 }} />
            <div className="relative flex h-full w-full items-center justify-center">
              <Layers className="h-24 w-24 text-white/50" />
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <Shirt className="h-4 w-4" /> {itemsInOutfit.length} item{itemsInOutfit.length === 1 ? '' : 's'}
              </span>
              {outfit.favorite && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-xs font-semibold">
                  <Star className="h-3.5 w-3.5" /> Favourite outfit
                </span>
              )}
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<Layers className="h-4 w-4" />} label="Pieces" value={itemsInOutfit.length} />
              <StatCard icon={<Sparkles className="h-4 w-4" />} label="Ready items" value={`${itemsInOutfit.filter((i) => (i?.status || 'clean') === 'clean').length}`} />
              <StatCard icon={<TagIcon className="h-4 w-4" />} label="Tags" value={tags.length || 'None'} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setEditModalOpen(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit outfit
              </Button>
              <Button variant="secondary" className="flex items-center gap-2" onClick={() => updateOutfit(outfitId, { favorite: !outfit.favorite })}>
                <Star className={`h-4 w-4 ${outfit.favorite ? 'fill-current text-amber-500' : ''}`} />
                {outfit.favorite ? 'Remove favourite' : 'Mark favourite'}
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={handleWearToday}
                disabled={isWearing}
              >
                <Sparkles className="h-4 w-4" /> {isWearing ? 'Logging...' : 'Wear today'}
              </Button>
              <Button variant="danger" className="flex items-center gap-2" onClick={() => setConfirmDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete outfit
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-deep/10 text-primary-deep dark:bg-primary-bright/20 dark:text-primary-bright">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Wardrobe pieces</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tap any item to view its details.</p>
          </div>
        </div>
        {itemsInOutfit.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            No clothes assigned to this outfit yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {itemsInOutfit.map((cloth) => (
              <ClothTile key={cloth.id} cloth={cloth} onClick={() => navigate(`/wardrobe/cloth/${cloth.id}`)} />
            ))}
          </div>
        )}
      </section>

      <OutfitModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={outfit}
        onSubmit={async (updated) => {
          await updateOutfit(outfitId, updated);
          setEditModalOpen(false);
        }}
      />

      <ConfirmationModal
        open={isConfirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Outfit?"
        message={`Are you sure you want to delete "${outfit.name}"?`}
        isDanger
      />
    </main>
  );
}