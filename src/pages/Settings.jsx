import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Download } from 'lucide-react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useToast } from '../context/ToastProvider.jsx';

import ThemeToggle from '../components/ThemeToggle';
import { Button, SettingsMenuItem } from '../components/ui';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import SettingsSkeleton from '../components/skeleton/SettingsSkeleton';
import { APP_VERSION } from '../app.config.js';
import { MIN_MODULES, MAX_MODULES } from '../components/insights/insightsConfig';

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
];

const formatBackupDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return 'Invalid date';

  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Settings() {
  const navigate = useNavigate();
  const { exportData, importData, resetApp, preferences, updatePreference, fetchPreferences, getLastBackupDate } = useSettingsStore();
  const { addToast } = useToast();

  const [currency, setCurrency] = useState('INR');
  const [confirmState, setConfirmState] = useState({ open: false });
  const [isResetting, setIsResetting] = useState(false);

  const lastBackupDate = useMemo(() => getLastBackupDate(), [getLastBackupDate, preferences?.lastBackupDate]);

  useEffect(() => {
    if (!preferences) {
      fetchPreferences();
    } else {
      if (preferences.currency) setCurrency(preferences.currency);
    }
  }, [preferences, fetchPreferences]);
  
  const handleResetApp = () => {
    setConfirmState({
      open: true,
      title: 'Reset All Data?',
      message: 'This will permanently delete all your clothes, outfits, and settings. This action cannot be undone.',
      confirmText: 'Yes, Reset Everything',
      isDanger: true,
      onConfirm: async () => {
        if (isResetting) return;
        setIsResetting(true);
        try {
          await resetApp();
          window.location.reload();
          addToast('App data has been reset successfully.', { type: 'success' });
        } catch (error) {
          addToast(error.message || 'Reset failed. Please try again.', { type: 'error' });
        } finally {
          setIsResetting(false);
          setConfirmState({ open: false });
        }
      },
    });
  };
  
  const handleExportData = async () => {
    try {
      await exportData();
      addToast('Backup created successfully!', { type: 'success' });
    } catch (error) {
      addToast(error.message || 'Failed to create backup', { type: 'error' });
    }
  };

  if (!preferences) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full" aria-label="Go back">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* General Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold px-4 sm:px-0">General</h2>
          <div className="glass-card p-4 space-y-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark or light mode</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">For cost tracking features</p>
              </div>
              <select
                value={currency}
                onChange={e => {
                  const newCurrency = e.target.value;
                  setCurrency(newCurrency);
                  updatePreference('currency', newCurrency);
                }}
                className="w-full sm:w-auto rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              >
                {CURRENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Customization Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold px-4 sm:px-0">Customization</h2>
          <div className="glass-card p-2 space-y-1 rounded-xl">
            <SettingsMenuItem title="Insights Modules" subtitle={`Choose between ${MIN_MODULES} and ${MAX_MODULES} cards`} onClick={() => navigate('/settings/insights')} />
          </div>
        </section>

        {/* Data & Privacy Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold px-4 sm:px-0">Data & Privacy</h2>
          <div className="border border-dashed border-yellow-500/50 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg text-sm">
            <b>Important:</b> Your data is stored locally on this device. Please export it regularly to prevent data loss.
          </div>
          <div className="glass-card p-2 space-y-1 rounded-xl">
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium">Last Backup</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Clock size={14} /> {formatBackupDate(lastBackupDate)}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportData} className="flex items-center gap-1.5">
                <Download size={14} /> Export
              </Button>
            </div>
            <SettingsMenuItem title="Import Data" subtitle="Restore your wardrobe from a backup file" onClick={importData} />
            <SettingsMenuItem title="Reset App Data" subtitle="Delete all data permanently" onClick={handleResetApp} danger />
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold px-4 sm:px-0">About</h2>
          <div className="glass-card p-2 rounded-xl">
            <SettingsMenuItem title="About ClothCare" subtitle={`Version ${APP_VERSION}`} onClick={() => navigate('/about')} />
          </div>
        </section>
      </div>

      <ConfirmationModal
        open={confirmState.open}
        onClose={() => !isResetting && setConfirmState({ open: false })}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={isResetting ? 'Resetting...' : confirmState.confirmText}
        isDanger={confirmState.isDanger}
        loading={isResetting}
      />
    </div>
  );
}