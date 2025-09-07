// src/contexts/AuthProvider.jsx
import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import {SplashScreen} from '../components/ui';

/**
 * This component's only purpose now is to initialize the auth state
 * when the application first loads.
 */
export function AuthProvider({ children }) {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isAuthInitialized = useAuthStore(state => state.isAuthInitialized);

  useEffect(() => {
    // Check for a logged-in user only once when the app starts
    checkAuth();
  }, [checkAuth]);

  // Optionally, show a loading state until the check is complete
  if (!isAuthInitialized) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}