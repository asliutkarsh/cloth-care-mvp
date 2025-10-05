import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import {
  LogOut,
  User,
  Sliders,
  Calendar,
  Plane,
  FolderKanban,
  Filter as FilterIcon,
  Package,
  ChartNoAxesColumn ,
  Settings 
} from 'lucide-react';
import { Button } from '../components/ui';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import ProfileSkeleton from '../components/skeleton/ProfileSkeleton';
import { motion } from 'framer-motion';

// --- Reusable Navigation Card Component ---
const ManagementCard = ({ icon, title, subtitle, onClick, variants }) => (
  <motion.button
    variants={variants}
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="w-full p-4 glass-card rounded-xl text-left transition-colors duration-200"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">{icon}</div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  </motion.button>
);

// --- Main Profile Component ---
export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isInitialized } = useWardrobeStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // Animation variants for a staggered fade-in effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (!isInitialized || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 space-y-8"
    >
      {/* --- Header --- */}
      <motion.header variants={itemVariants} className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User size={32} className="text-gray-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name || 'User'}</h1>
          <p className="text-gray-500 dark:text-gray-400">Enjoy your day.</p>
        </div>
      </motion.header>

            {/* --- Activity & Planning Section --- */}
            <motion.section variants={itemVariants} className="space-y-4">
        <h2 className="text-lg font-semibold px-2">Explore Your Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ManagementCard
            icon={<Plane size={22} className="text-sky-500" />}
            title="Trips & Packing"
            subtitle="Plan your outfits for travel"
            onClick={() => navigate('/trips')}
            variants={itemVariants}
          />
          <ManagementCard
            icon={<Calendar size={22} className="text-red-500" />}
            title="Activity Calendar"
            subtitle="View your wear history"
            onClick={() => navigate('/calendar')}
            variants={itemVariants}
          />
          <ManagementCard
            icon={<ChartNoAxesColumn  size={22} className="text-blue-500" />}
            title="Insights"
            subtitle="View your wear insights"
            onClick={() => navigate('/insights')}
            variants={itemVariants}
          />
        </div>
      </motion.section>


      {/* --- Wardrobe Organization Section --- */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h2 className="text-lg font-semibold px-2">Organize Your Wardrobe</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ManagementCard
            icon={<FolderKanban size={22} className="text-blue-500" />}
            title="Manage Categories"
            subtitle="Structure your wardrobe sections"
            onClick={() => navigate('/profile/categories')}
            variants={itemVariants}
          />
          <ManagementCard
            icon={<FilterIcon size={22} className="text-green-500" />}
            title="Manage Quick Filters"
            subtitle="Customize your filter shortcuts"
            onClick={() => navigate('/profile/filters')}
            variants={itemVariants}
          />
        </div>
      </motion.section>


      {/* --- Preferences Section --- */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h2 className="text-lg font-semibold px-2">Customize Your Experience</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ManagementCard
            icon={<Sliders size={22} className="text-purple-500" />}
            title="Wardrobe Defaults"
            subtitle="Set your default view and sort"
            onClick={() => navigate('/profile/wardrobe-settings')}
            variants={itemVariants}
          />
          <ManagementCard
            icon={<Package size={22} className="text-orange-500" />}
            title="Packing Essentials"
            subtitle="Edit your default trip items"
            onClick={() => navigate('/profile/essentials')}
            variants={itemVariants}
          />
          <ManagementCard
            icon={<Settings  size={22} className="text-red-500" />}
            title="Settings"
            subtitle="Customize your app settings"
            onClick={() => navigate('/settings')}
            variants={itemVariants}
          />
        </div>
      </motion.section>



      {/* --- Logout Button --- */}
      <motion.div variants={itemVariants} className="pt-4">
        <Button
          onClick={() => setConfirmLogout(true)}
          variant="danger"
          fullWidth
          className="flex items-center justify-center gap-2 py-3 text-base"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </Button>
      </motion.div>

      <ConfirmationModal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Logout?"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        isDanger={true}
      />
    </motion.main>
  );
}