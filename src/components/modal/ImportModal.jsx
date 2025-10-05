// src/components/modal/ImportModal.jsx
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useSettingsStore } from '../../stores/useSettingsStore';

export default function ImportModal({ open, onClose }) {
  const { importData } = useSettingsStore();
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState(null);

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onClose} disabled={isImporting}>
        Close
      </Button>
      <Button type="button" onClick={async () => {
        setIsImporting(true);
        setMessage(null);
        const res = await importData();
        setMessage(res?.message || (res?.success ? 'Imported' : 'Failed'));
        setIsImporting(false);
        if (res?.success) onClose();
      }} disabled={isImporting}>
        {isImporting ? 'Importing…' : 'Choose File'}
      </Button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Import Data" size="md" footer={footer}>
      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Select a previously exported backup JSON file to restore your wardrobe, outfits, activities and preferences.
        </p>
        {message && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{message}</div>
        )}
      </div>
    </Modal>
  );
}
