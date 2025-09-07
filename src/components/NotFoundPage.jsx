// src/pages/NotFoundPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export default function NotFoundPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleGoHome = () => {
    // If user is logged in, go to their dashboard. Otherwise, go to the landing page.
    navigate(user ? '/dashboard' : '/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black text-white p-4">
      <h1 className="text-6xl font-bold logo-gradient">404</h1>
      <h2 className="mt-4 text-3xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-gray-400">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <button
        onClick={handleGoHome}
        className="mt-8 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold"
      >
        <Home size={18} />
        Go Back Home
      </button>
    </div>
  );
}