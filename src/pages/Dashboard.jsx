import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useLaundryStore } from '../stores/useLaundryStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from '../components/ui';
import { 
  PlusCircle, BookPlus, Shirt, Layers, WashingMachine, CalendarCheck,
  TrendingUp, Award, Clock, AlertTriangle, Star, Target, 
  Sparkles, BarChart3, Zap, Package, Calendar, ArrowRight,
  CheckCircle2, Circle, ThumbsUp, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSkeleton from '../components/skeleton/DashboardSkeleton';
import ActivityItem from '../components/dashboard/ActivityItem';
import { useToast } from '../context/ToastProvider.jsx';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  differenceInDays,
  startOfMonth,
  endOfMonth 
} from 'date-fns';

// Enhanced Stat Card with trend indicator
const StatCard = ({ icon, value, label, onClick, trend, color = 'emerald', subtitle }) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  };

  return (
    <motion.button
      onClick={onClick}
      className="glass-card p-5 text-left w-full group hover:shadow-lg transition-all"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
      aria-label={`View ${label}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
      <ArrowRight size={16} className="mt-2 text-gray-400 group-hover:text-primary-500 transition-colors" />
    </motion.button>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ icon, title, description, unlocked = false }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`p-4 rounded-xl border-2 ${
      unlocked 
        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700' 
        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
      unlocked 
        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
    }`}>
      {icon}
    </div>
    <h4 className="font-semibold text-sm mb-1">{title}</h4>
    <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    {unlocked && (
      <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
        <CheckCircle2 size={12} />
        Unlocked!
      </div>
    )}
  </motion.div>
);

// Streak Component
const StreakCard = ({ currentStreak, longestStreak }) => (
  <div className="glass-card p-5 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
        <Flame size={24} className="text-orange-600 dark:text-orange-400" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Activity Streak</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">Keep it going!</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Current Streak</p>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{longestStreak}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Longest Streak</p>
      </div>
    </div>
  </div>
);

// Outfit Suggestion with smart recommendations
const OutfitSuggestionCard = () => {
  const { outfits, clothes } = useWardrobeStore();
  const { activities, addActivity } = useCalendarStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Get least worn favorite outfits
  const suggestedOutfit = useMemo(() => {
    const favoriteOutfits = outfits.filter(outfit => outfit.favorite === true);
    
    if (favoriteOutfits.length === 0) return null;

    // Calculate wear frequency for each outfit
    const outfitWearCounts = favoriteOutfits.map(outfit => {
      const wearCount = Object.values(activities)
        .flat()
        .filter(act => act.type === 'outfit' && act.outfitId === outfit.id)
        .length;
      return { outfit, wearCount };
    });

    // Sort by least worn
    outfitWearCounts.sort((a, b) => a.wearCount - b.wearCount);
    
    return outfitWearCounts[0]?.outfit || null;
  }, [outfits, activities]);

  const getOutfitItems = (outfit) => {
    return outfit.clothIds
      .map(clothId => clothes.find(cloth => cloth.id === clothId))
      .filter(Boolean);
  };

  const handleWearToday = async () => {
    if (!suggestedOutfit) return;
    
    setLoading(true);
    try {
      await addActivity({ type: 'outfit', outfitId: suggestedOutfit.id }, new Date());
      addToast(`Logged "${suggestedOutfit.name}" for today!`, { type: 'success' });
      navigate('/calendar');
    } catch (error) {
      console.error('Failed to log outfit:', error);
      addToast('Failed to log outfit', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!suggestedOutfit) {
    return (
      <div className="glass-card p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
        <Sparkles size={40} className="mx-auto mb-3 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Mark some outfits as favorites to get smart suggestions!
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate('/wardrobe', { state: { defaultTab: 'outfits' } })}
        >
          <Layers className="mr-2" size={16} /> Browse Outfits
        </Button>
      </div>
    );
  }

  const outfitItems = getOutfitItems(suggestedOutfit);

  return (
    <motion.div 
      className="glass-card p-6 bg-gradient-to-br from-primary-50/50 to-purple-50/50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold">Today's Outfit Suggestion</h3>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-lg text-primary-600 dark:text-primary-400 mb-2">
          {suggestedOutfit.name}
        </h4>
        {suggestedOutfit.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {suggestedOutfit.description}
          </p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Package size={14} />
            {outfitItems.length} Items:
          </p>
          <div className="flex flex-wrap gap-2">
            {outfitItems.slice(0, 6).map(item => (
              <span
                key={item.id}
                className="text-xs bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700"
              >
                {item.name}
              </span>
            ))}
            {outfitItems.length > 6 && (
              <span className="text-xs text-gray-500">+{outfitItems.length - 6} more</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleWearToday}
          disabled={loading}
          className="flex-1"
        >
          <Shirt className="mr-2" size={16} /> 
          {loading ? 'Logging...' : 'Wear This Today'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate(`/wardrobe/outfit/${suggestedOutfit.id}`)}
        >
          View
        </Button>
      </div>
    </motion.div>
  );
};

// Weekly Goal Progress
const WeeklyGoalCard = ({ activities }) => {
  const thisWeek = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    
    return Object.values(activities)
      .flat()
      .filter(act => {
        const actDate = new Date(act.date);
        return isWithinInterval(actDate, { start, end });
      });
  }, [activities]);

  const weeklyGoal = 7; // Track outfit/wear 7 times per week
  const progress = Math.min((thisWeek.length / weeklyGoal) * 100, 100);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold">Weekly Goal</h3>
        </div>
        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
          {thisWeek.length}/{weeklyGoal}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {progress >= 100 ? 'Goal achieved! Great job! 🎉' : `${Math.round(progress)}% complete`}
        </p>
      </div>
    </div>
  );
};

// Wardrobe Insights
const InsightCard = ({ icon, title, description, action, variant = 'info' }) => {
  const variants = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  const iconColors = {
    info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    success: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`glass-card p-4 border ${variants[variant]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconColors[variant]} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{description}</p>
          {action}
        </div>
      </div>
    </motion.div>
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

  // Calculate streaks
  const { currentStreak, longestStreak } = useMemo(() => {
    const dates = Object.keys(activities).sort().reverse();
    let current = 0;
    let longest = 0;
    let temp = 0;

    const today = format(new Date(), 'yyyy-MM-dd');
    let checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (activities[dateStr]?.length > 0) {
        temp++;
        if (dateStr === today || i > 0) {
          current = temp;
        }
      } else {
        if (temp > longest) longest = temp;
        if (dateStr !== today) break;
        temp = 0;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { currentStreak: current, longestStreak: Math.max(longest, current) };
  }, [activities]);

  // Recent activities
  const recentActivities = useMemo(() => {
    return Object.values(activities)
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [activities]);

  // Planned today
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

  // Wardrobe insights
  const insights = useMemo(() => {
    const unwornItems = clothes.filter(c => (c.totalWearCount || 0) === 0);
    const needsLaundry = clothes.filter(c => c.status === 'dirty');
    const mostWornItem = clothes.reduce((max, c) => 
      (c.totalWearCount || 0) > (max?.totalWearCount || 0) ? c : max, 
      clothes[0]
    );

    return { unwornItems, needsLaundry, mostWornItem };
  }, [clothes]);

  // Achievements
  const achievements = useMemo(() => {
    const totalWears = clothes.reduce((sum, c) => sum + (c.totalWearCount || 0), 0);
    const totalOutfits = outfits.length;
    
    return [
      { 
        id: 'first-outfit', 
        icon: <Layers size={18} />, 
        title: 'Outfit Creator', 
        description: 'Create your first outfit',
        unlocked: totalOutfits >= 1 
      },
      { 
        id: 'wardrobe-starter', 
        icon: <Shirt size={18} />, 
        title: 'Wardrobe Starter', 
        description: 'Add 10 items to wardrobe',
        unlocked: clothes.length >= 10 
      },
      { 
        id: 'style-tracker', 
        icon: <BarChart3 size={18} />, 
        title: 'Style Tracker', 
        description: 'Log 50 wears',
        unlocked: totalWears >= 50 
      },
      { 
        id: 'week-warrior', 
        icon: <Flame size={18} />, 
        title: 'Week Warrior', 
        description: '7-day activity streak',
        unlocked: currentStreak >= 7 
      },
    ];
  }, [clothes, outfits, currentStreak]);

  const handleConfirmPlanned = useCallback(async (activity) => {
    if (markingId) return;
    setMarkingId(activity.id);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    try {
      await updateActivityStatus(activity.id, 'worn', { time });
      addToast('Marked as worn!', { type: 'success' });
    } catch (error) {
      console.error('Failed to mark planned outfit as worn', error);
      addToast('Could not update status', { type: 'error' });
    } finally {
      setMarkingId(null);
    }
  }, [markingId, updateActivityStatus, addToast]);

  const cleanClothesCount = clothes.filter(c => c.status === 'clean')?.length || 0;
  const inLaundryCount = (dirtyClothes?.length || 0) + (needsPressing?.length || 0);
  const totalWears = clothes.reduce((sum, c) => sum + (c.totalWearCount || 0), 0);

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
    <main className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">
          {getGreeting()}, {user.name || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Shirt size={22} />} 
          value={cleanClothesCount} 
          label="Clean & Ready" 
          onClick={() => navigate('/wardrobe')}
          color="emerald"
          subtitle={`${Math.round((cleanClothesCount/clothes.length) * 100)}% of wardrobe`}
        />
        <StatCard 
          icon={<WashingMachine size={22} />} 
          value={inLaundryCount} 
          label="In Laundry" 
          onClick={() => navigate('/laundry')}
          color="blue"
          subtitle={inLaundryCount > 0 ? 'Needs attention' : 'All clear'}
        />
        <StatCard 
          icon={<Layers size={22} />} 
          value={outfits?.length || 0} 
          label="Total Outfits" 
          onClick={() => navigate('/wardrobe')}
          color="purple"
        />
        <StatCard 
          icon={<TrendingUp size={22} />} 
          value={totalWears} 
          label="Total Wears" 
          onClick={() => navigate('/calendar')}
          color="amber"
          subtitle="All time"
        />
      </div>

      {/* Planned Outfits Alert */}
      <AnimatePresence>
        {plannedWithDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-5 border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                <CalendarCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  You Have Planned Outfits Today
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Mark them as worn to track your follow-through!
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {plannedWithDetails.map(({ activity, details }) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {details.title || 'Planned outfit'}
                    </p>
                    {details.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {details.subtitle}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConfirmPlanned(activity)}
                    disabled={markingId === activity.id}
                    className="w-full sm:w-auto"
                  >
                    {markingId === activity.id ? 'Updating…' : 'Yes, I Wore It'}
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Actions & Streak */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap size={20} className="text-primary-600 dark:text-primary-400" />
              Quick Actions
            </h2>
            <Button 
              fullWidth 
              size="lg" 
              onClick={() => navigate('/calendar?openAdd=1')}
              className="justify-start"
            >
              <BookPlus className="mr-2" size={20} /> Log Today's Outfit
            </Button>
            <Button 
              fullWidth 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate('/wardrobe')}
              className="justify-start"
            >
              <PlusCircle className="mr-2" size={20} /> Add New Item
            </Button>
          </div>

          <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
          <WeeklyGoalCard activities={activities} />
        </div>

        {/* Middle Column - Outfit Suggestion */}
        <div className="space-y-6">
          <OutfitSuggestionCard />
          
          {/* Insights */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award size={20} className="text-primary-600 dark:text-primary-400" />
              Insights
            </h2>
            {insights.unwornItems.length > 5 && (
              <InsightCard
                icon={<AlertTriangle size={18} />}
                title="Unworn Items"
                description={`You have ${insights.unwornItems.length} items that haven't been worn yet.`}
                action={
                  <Button size="sm" variant="ghost" onClick={() => navigate('/wardrobe')}>
                    View Items
                  </Button>
                }
                variant="warning"
              />
            )}
            {insights.needsLaundry.length > 0 && (
              <InsightCard
                icon={<WashingMachine size={18} />}
                title="Laundry Time"
                description={`${insights.needsLaundry.length} items need washing.`}
                action={
                  <Button size="sm" variant="ghost" onClick={() => navigate('/laundry')}>
                    Start Laundry
                  </Button>
                }
                variant="info"
              />
            )}
            {insights.mostWornItem && (
              <InsightCard
                icon={<Star size={18} />}
                title="Wardrobe MVP"
                description={`"${insights.mostWornItem.name}" is your most worn item with ${insights.mostWornItem.totalWearCount} wears!`}
                variant="success"
              />
            )}
          </div>
        </div>

        {/* Right Column - Activity & Achievements */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-primary-600 dark:text-primary-400" />
              Recent Activity
            </h2>
            {recentActivities?.length > 0 ? (
              <div className="glass-card p-4 space-y-3">
                {recentActivities.map(act => (
                  <ActivityItem 
                    key={act.id} 
                    activity={act} 
                    details={getActivityDetails(act)} 
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
                <Calendar size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  No recent activity yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Start tracking your outfits to see them here
                </p>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award size={20} className="text-amber-600 dark:text-amber-400" />
              Achievements
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  icon={achievement.icon}
                  title={achievement.title}
                  description={achievement.description}
                  unlocked={achievement.unlocked}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}