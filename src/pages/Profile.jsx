import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { Settings, Calendar, LogOut, User, Shirt, Layers } from 'lucide-react';
import { Button, SettingsMenuItem } from '../components/ui';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import { motion } from 'framer-motion';
import ProfileSkeleton from '../components/skeleton/ProfileSkeleton';

// Motion variants
const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};


const StatCard = ({ icon, value, label, index }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    custom={index}
    className="glass-card p-4 text-center rounded-lg"
    role="region"
    aria-label={`${label} stat`}
    tabIndex={0}
  >
    <div className="w-10 h-10 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
      {icon}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </motion.div>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { clothes, outfits, isInitialized } = useWardrobeStore();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const mostWorn = useWardrobeStore(state => state.getMostWornItem());

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  if (!isInitialized || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <main className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 md:p-8" aria-live="polite">
      {/* Profile Header */}
      <motion.header
        className="flex flex-col items-center text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <User size={48} className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold break-words max-w-xs">{user.name || 'User'}</h1>
        <p className="text-gray-600 dark:text-gray-400 break-words max-w-xs">{user.email}</p>
      </motion.header>

      {/* Stats Section */}
      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        aria-label="User statistics"
        role="region"
      >
        <StatCard
          icon={<Shirt size={20} className="text-emerald-600" />}
          value={clothes?.length || 0}
          label="Clothes"
          index={0}
        />
        <StatCard
          icon={<Layers size={20} className="text-emerald-600" />}
          value={outfits?.length || 0}
          label="Outfits"
          index={1}
        />
        <StatCard
          icon={
            <span className="text-xl" role="img" aria-label="Trophy">
              🏆
            </span>
          }
          value={mostWorn?.name || 'None'}
          label="Most Worn"
          index={2}
        />
      </section>

      {/* Menu Section */}
      <motion.nav
        className="glass-card p-2 space-y-2 rounded-lg"
        aria-label="Profile settings navigation"
        role="navigation"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SettingsMenuItem
          title="Activity Calendar"
          subtitle="View your wear history"
          onClick={() => navigate('/calendar')}
        />
        <SettingsMenuItem
          title="Trips & Packing"
          subtitle="Plan outfits for upcoming travel"
          onClick={() => navigate('/trips')}
        />
        <SettingsMenuItem
          title="Wardrobe Insights"
          subtitle="See your personalised analytics"
          onClick={() => navigate('/insights')}
        />
        <SettingsMenuItem
          title="Settings"
          subtitle="Manage app preferences and data"
          onClick={() => navigate('/settings')}
        />
      </motion.nav>

      {/* Logout Button */}
      <div className="mt-8">
        <Button
          onClick={() => setConfirmLogout(true)}
          variant="danger"
          fullWidth
          className="flex items-center justify-center gap-2 py-3 text-base"
          aria-haspopup="dialog"
          aria-disabled={isLoggingOut}
          disabled={isLoggingOut}
        >
          <LogOut size={20} />
          <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </Button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmLogout}
        onClose={() => !isLoggingOut && setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Logout?"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        isDanger={true}
        loading={isLoggingOut}
      />
    </main>
  );
}
