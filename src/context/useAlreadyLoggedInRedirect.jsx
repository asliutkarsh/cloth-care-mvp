// src/hooks/useAlreadyLoggedInRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export function useAlreadyLoggedInRedirect(path = '/dashboard') {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(path);
    }
  }, [user, navigate, path]);
}