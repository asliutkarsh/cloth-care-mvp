// src/contexts/AuthProvider.jsx
import { useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useAppStore } from '../stores/useAppStore';
import { SplashScreen } from '../components/ui';

/**
 * This component's only purpose now is to initialize the auth state
 * when the application first loads.
 */
export function AuthProvider({ children }) {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isAuthInitialized = useAuthStore(state => state.isAuthInitialized);
  const fetchWardrobe = useWardrobeStore(state => state.fetchAll);
  const fetchPreferences = useSettingsStore(state => state.fetchPreferences);
  const domainStatus = useAppStore(state => state.domainStatus);
  const appReady = useAppStore(state => state.appReady);
  const resetAppState = useAppStore(state => state.resetAppState);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([
          checkAuth(),
          fetchWardrobe(),
          fetchPreferences(),
        ]);
      } catch (error) {
        console.error('Application bootstrap failed:', error);
      }
    };

    bootstrap();
  }, [checkAuth, fetchWardrobe, fetchPreferences]);

  const hasErrors = useMemo(
    () => Object.values(domainStatus).some(status => status?.error),
    [domainStatus]
  );

  const handleRetry = useCallback(async () => {
    resetAppState();
    try {
      await Promise.all([
        checkAuth(),
        fetchWardrobe({ trackStatus: true }),
        fetchPreferences({ trackStatus: true }),
      ]);
    } catch (error) {
      console.error('Retrying bootstrap failed:', error);
    }
  }, [resetAppState, checkAuth, fetchWardrobe, fetchPreferences]);

  if (hasErrors) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-950 text-white px-6 text-center">
        <div>
          <h2 className="text-2xl font-semibold">We hit a snag while loading your data</h2>
          <p className="mt-2 text-sm text-white/70">
            Please check your connection and try again. If this keeps happening, let us know and we’ll help.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-400 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Show splash screen until auth and core data are ready
  if (!isAuthInitialized || !appReady) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}