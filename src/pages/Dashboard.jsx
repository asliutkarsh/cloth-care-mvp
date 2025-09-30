import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useLaundryStore } from '../stores/useLaundryStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from '../components/ui';
import { PlusCircle, BookPlus, Shirt, Layers, WashingMachine, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardSkeleton from '../components/skeleton/DashboardSkeleton';
import ActivityItem from '../components/dashboard/ActivityItem';
import { useToast } from '../context/ToastProvider.jsx';

// Reusable Stat Card for displaying key metrics
const StatCard = ({ icon, value, label, onClick }) => (
  <motion.button
    onClick={onClick}
    className="glass-card p-4 text-center w-full"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
    aria-label={`View ${label}`}
  >
    <div className="w-10 h-10 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
      {icon}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </motion.button>
);

// Component to display a random favorite outfit suggestion
const OutfitSuggestionCard = () => {
  const { outfits, clothes } = useWardrobeStore();
  const { addActivity } = useCalendarStore();
  const navigate = useNavigate();

  const favoriteOutfits = useMemo(() => {
    return outfits.filter(outfit => outfit.favorite === true);
  }, [outfits]);

  const randomOutfit = useMemo(() => {
    if (favoriteOutfits.length === 0) return null;
    return favoriteOutfits[Math.floor(Math.random() * favoriteOutfits.length)];
  }, [favoriteOutfits]);

  const getOutfitItems = (outfit) => {
    return outfit.clothIds
      .map(clothId => clothes.find(cloth => cloth.id === clothId))
      .filter(Boolean);
  };

  const handleWearToday = async () => {
    if (randomOutfit) {
      try {
        // Log the outfit activity for today
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        await addActivity({
          type: 'outfit',
          outfitId: randomOutfit.id,
          date,
          time,
        });

        // Navigate to calendar to show the logged activity
        navigate('/calendar');
      } catch (error) {
        console.error('Failed to log outfit:', error);
        // Still navigate to calendar even if logging fails
        navigate('/calendar');
      }
    }
  };

  if (!randomOutfit) {
    return (
      <div className="glass-card p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Outfit Suggestion</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No favorite outfits found. Mark some outfits as favorites to get suggestions!
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate('/wardrobe', { state: { defaultTab: 'outfits' } })}
        >
          <Layers className="mr-2" /> View Outfits
        </Button>
      </div>
    );
  }

  const outfitItems = getOutfitItems(randomOutfit);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Today's Outfit Suggestion</h3>

      <div className="mb-4">
        <h4 className="font-medium text-primary-deep dark:text-primary-bright mb-2">
          {randomOutfit.name}
        </h4>
        {randomOutfit.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {randomOutfit.description}
          </p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Items:</p>
          <div className="grid grid-cols-2 gap-2">
            {outfitItems.map(item => (
              <div
                key={item.id}
                className="text-xs bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleWearToday}
        className="w-full"
      >
        <Shirt className="mr-2" /> Wear This Today
      </Button>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    useSettingsStore.getState().initialize();
  }, []);
  const user = useAuthStore(state => state.user);
  const { clothes, outfits, isInitialized: isWardrobeReady } = useWardrobeStore();
  const { dirtyClothes, needsPressing } = useLaundryStore();
  const { activities, getActivityDetails, getPlannedActivitiesForDate, updateActivityStatus } = useCalendarStore();
  const { addToast } = useToast();
  const [markingId, setMarkingId] = useState(null);

  const recentActivities = useMemo(() => {
    return Object.values(activities)
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [activities]);

  const plannedToday = useMemo(() => {
    if (!getPlannedActivitiesForDate) return [];
    return getPlannedActivitiesForDate(new Date());
  }, [getPlannedActivitiesForDate, activities]);

  const plannedWithDetails = useMemo(() => {
    return plannedToday.map((activity) => ({
      activity,
      details: getActivityDetails(activity),
    }));
  }, [plannedToday, getActivityDetails]);

  const handleConfirmPlanned = async (activity) => {
    if (markingId) return;
    setMarkingId(activity.id);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    try {
      await updateActivityStatus(activity.id, 'worn', { time });
      addToast('Marked as worn. Nice follow-through!', { type: 'success' });
    } catch (error) {
      console.error('Failed to mark planned outfit as worn', error);
      addToast('Could not update the planned outfit. Try again.', { type: 'error' });
    } finally {
      setMarkingId(null);
    }
  };

  const cleanClothesCount = clothes.filter(c => c.status === 'clean')?.length || 0;
  const inLaundryCount = (dirtyClothes?.length || 0) + (needsPressing?.length || 0);

  if (!isWardrobeReady || !user) {
    return <DashboardSkeleton />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <main className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{getGreeting()}, {user.name || 'User'}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's a quick look at your wardrobe today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard 
          icon={<Shirt size={20} className="text-emerald-600" />} 
          value={cleanClothesCount} 
          label="Clean Clothes" 
          onClick={() => navigate('/wardrobe')}
        />
        <StatCard 
          icon={<WashingMachine size={20} className="text-emerald-600" />} 
          value={inLaundryCount} 
          label="In Laundry" 
          onClick={() => navigate('/laundry')}
        />
        <StatCard 
          icon={<Layers size={20} className="text-emerald-600" />} 
          value={outfits?.length || 0} 
          label="Outfits" 
          onClick={() => navigate('/wardrobe', { state: { defaultTab: 'outfits' } })}
        />
      </div>

      {/* Quick Actions, Recent Activity & Outfit Suggestion */}
      <div className="space-y-6">
        {plannedWithDetails.length > 0 && (
          <div className="glass-card p-5 space-y-4 border border-blue-200/70 dark:border-blue-700/60 bg-blue-50/60 dark:bg-blue-900/15">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-200/70 dark:bg-blue-800/60">
                <CalendarCheck size={20} className="text-blue-700 dark:text-blue-200" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Planned outfits waiting for today</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Give your planned looks credit by marking them as worn when you follow through.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {plannedWithDetails.map(({ activity, details }) => (
                <div
                  key={activity.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-blue-200/60 dark:border-blue-600/50 bg-white/80 dark:bg-blue-950/40 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{details.title || 'Planned outfit'}</p>
                    {details.subtitle ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{details.subtitle}</p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConfirmPlanned(activity)}
                    disabled={markingId === activity.id}
                    className="sm:w-auto"
                  >
                    {markingId === activity.id ? 'Updating…' : 'Yes, I wore it'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <Button fullWidth size="lg" onClick={() => navigate('/calendar?openAdd=1')} className="hover:from-primary-deep hover:to-primary-bright hover:bg-gradient-to-r">
            <BookPlus className="mr-2" /> Log Today's Wear
          </Button>
          <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/wardrobe')} className="hover:from-primary-deep hover:to-primary-bright hover:bg-gradient-to-r">
            <PlusCircle className="mr-2" /> Add a New Cloth
          </Button>
        </div>

        {/* Outfit Suggestion */}
        <OutfitSuggestionCard />

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          {recentActivities?.length > 0 ? (
            <div className="glass-card p-4 space-y-3">
              {recentActivities.map(act => (
                <ActivityItem key={act.id} activity={act} details={getActivityDetails(act)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 glass-card border border-dashed border-accent-violet/40 bg-accent-violet/10 text-coolgray-700 dark:text-coolgray-500">
              <p className="mb-2">No recent activity logged.</p>
              <p className="text-sm">Try <span className="tag-new">New</span> outfit ideas or mark items as <span className="tag-worn">Worn</span> to keep track.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}
