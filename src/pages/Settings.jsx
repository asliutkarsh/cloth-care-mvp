import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LogOut } from 'lucide-react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useAuthStore } from '../stores/useAuthStore';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '../components/ui';
import ConfirmationModal from '../components/modal/ConfirmationModal';

const SettingsMenuItem = ({ title, subtitle, onClick, danger = false }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-lg text-left transition-colors ${danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}`}>
    <div>
      <div className="font-medium text-base">{title}</div>
      {subtitle && <div className={`text-sm ${danger ? 'text-red-500/80' : 'text-gray-600 dark:text-gray-400'}`}>{subtitle}</div>}
    </div>
    <ChevronRight size={16} className="text-gray-400" />
  </button>
);

export default function Settings() {
  const navigate = useNavigate();
  const { exportData, importData, resetApp } = useSettingsStore();
  const { logout } = useAuthStore();
  const [confirmState, setConfirmState] = useState({ open: false });

  const onConfirmClose = () => setConfirmState({ open: false });

  const handleResetApp = () => {
    setConfirmState({
      open: true,
      title: 'Reset All Data?',
      message: 'This will permanently delete all your clothes, outfits, and history. This action cannot be undone.',
      confirmText: 'Yes, Reset Everything',
      isDanger: true,
      onConfirm: async () => {
        await resetApp();
        // After reset, log the user out and send to landing
        await logout();
        navigate('/');
      },
    });
  };

  const handleLogout = () => {
    setConfirmState({
      open: true,
      title: 'Logout?',
      message: 'Are you sure you want to log out of your account?',
      confirmText: 'Logout',
      isDanger: false,
      onConfirm: async () => {
        await logout();
        navigate('/');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <div className="glass-card w-full p-0">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="p-2 min-w-10 min-h-10" aria-label="Go back">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
        </div>

        <div className="p-4 sm:p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light mode</div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wardrobe</h3>
            <SettingsMenuItem title="Manage Categories" subtitle="Add, edit, or delete your categories" onClick={() => navigate('/settings/categories')} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data & Privacy</h3>
            <SettingsMenuItem title="Export Data" subtitle="Download your wardrobe data" onClick={exportData} />
            <SettingsMenuItem title="Import Data" subtitle="Restore from a backup file" onClick={importData} />
            <SettingsMenuItem title="Reset App Data" subtitle="Clear all data (cannot be undone)" onClick={handleResetApp} danger />
          </div>

          <Button onClick={handleLogout} variant="danger" fullWidth className="mt-6 flex items-center justify-center gap-2 py-3 text-base">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </div>
      
      <ConfirmationModal
        open={confirmState.open}
        onClose={onConfirmClose}
        onConfirm={() => {
          confirmState.onConfirm?.();
          onConfirmClose();
        }}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        isDanger={confirmState.isDanger}
      />
    </div>
  );
}