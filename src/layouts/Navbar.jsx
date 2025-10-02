import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { ChevronRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/ui/Logo';

const getNavBackgroundStyle = (theme) => {
  if (theme === 'dark') {
    return 'radial-gradient(ellipse 50% 60% at 50% 80%, rgba(16,185,129,0.2), transparent 100%), rgba(0,0,0,0.25)';
  }
  return 'radial-gradient(ellipse at top, rgba(230, 252, 245, 0.7), transparent 80%), rgba(255,255,255,0.5)';
};

export default function Navbar() {
  const { user } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  const renderNavActions = () => {
    if (!user) {
      return <ThemeToggle />;
    }

    if (isLanding) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-gray-800 dark:text-white bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/20 shadow-md hover:shadow-lg transition-all"
        >
          Dashboard
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      );
    }
  };

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-20 p-3 md:p-4 backdrop-blur-sm border-b border-black/10 dark:border-white/10"
      style={{ background: getNavBackgroundStyle(theme) }}
    >
      <div className="container flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={user ? "/" : "/"} className="flex items-center">
          <Logo />
        </Link>
        {renderNavActions()}
      </div>
    </motion.nav>
  );
}