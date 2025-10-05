import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function BackupReminderModal({ 
  open, 
  onClose, 
  onBackupNow, 
  isLoading = false, 
  error = null 
}) {
  return (
    <Modal open={open} onClose={onClose} title="Backup Your Data">
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        {!error || error.includes('Preparing') || error.includes('success') ? (
          <>
            <p>Your last backup was over a month ago. We recommend exporting your data to keep it safe.</p>
            <p className="text-sm">This will help prevent data loss if you clear your browser cache or switch devices.</p>
          </>
        ) : null}
        
        {error && (
          <div className={`mt-2 p-2 text-sm rounded ${
            error.includes('success') 
              ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
          }`}>
            {error}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          variant="secondary" 
          onClick={onClose}
          disabled={isLoading}
        >
          Remind Me Later
        </Button>
        <Button 
          onClick={onBackupNow}
          disabled={isLoading}
          className={isLoading ? 'opacity-75 cursor-not-allowed' : ''}
        >
          {isLoading ? 'Creating Backup...' : 'Backup Now'}
        </Button>
      </div>
    </Modal>
  );
}
