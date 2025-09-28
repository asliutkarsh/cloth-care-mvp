import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useLaundryStore } from '../stores/useLaundryStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from '../components/ui';
import { PlusCircle, BookPlus, Shirt, Layers, WashingMachine } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardSkeleton from '../components/skeleton/DashboardSkeleton';

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
        await addActivity(
          {
            type: 'outfit',
            outfitId: randomOutfit.id,
          },
          new Date()
        );

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
  const { activities, getActivityDetails } = useCalendarStore();

  const recentActivities = useMemo(() => {
    return Object.values(activities)
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [activities]);

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
    </main>
  );
}
