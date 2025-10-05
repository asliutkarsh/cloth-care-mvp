// src/components/PWANotifier.jsx
import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '../context/ToastProvider';

export default function PWANotifier() {
  const { addToast } = useToast();

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      addToast('A new version is available!', {
        duration: 0, // Keep the toast until dismissed or actioned
        action: {
          label: 'Refresh',
          onClick: () => {
            updateServiceWorker(true);
          },
        },
      });
    }
  }, [needRefresh, addToast, updateServiceWorker]);

  return null; // This component doesn't render anything itself
}