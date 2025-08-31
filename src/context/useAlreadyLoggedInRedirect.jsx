import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adjust path if in separate file

export function useAlreadyLoggedInRedirect(path = '/dashboard') {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(path);
    }
  }, [user, navigate, path]);
}
