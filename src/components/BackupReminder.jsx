import { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import BackupReminderModal from './modal/BackupReminderModal';

export default function BackupReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const { shouldShowBackupReminder, dismissBackupReminder, exportData } = useSettingsStore();
  const clothes = useWardrobeStore(state => state.clothes || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only show reminder if user has more than 4 clothes items
    if (clothes && clothes.length > 4) {
      const show = shouldShowBackupReminder();
      setShowReminder(show);
    }
  }, [clothes, shouldShowBackupReminder]);

  const handleBackupNow = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Show a brief message that the download is starting
      setError('Preparing your backup file...');
      
      // Small delay to ensure the message is shown before the download starts
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await exportData();
      
      if (result && result.success) {
        // Show success message briefly before closing
        setError('Backup downloaded successfully!');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowReminder(false);
      } else {
        throw new Error(result?.message || 'Failed to create backup');
      }
    } catch (err) {
      console.error('Backup failed:', err);
      setError(`Failed to create backup: ${err.message || 'Please try again'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissBackupReminder();
      setShowReminder(false);
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  };

  // Don't render if no clothes or not enough clothes
  if (!clothes || clothes.length <= 4) {
    return null;
  }

  return (
    <BackupReminderModal 
      open={showReminder}
      onClose={handleDismiss}
      onBackupNow={handleBackupNow}
      isLoading={isLoading}
      error={error}
    />
  );
}
