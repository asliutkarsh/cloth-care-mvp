import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CirclePlus, FilePlus, BookPlus,WashingMachine,House, CalendarDays, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import AddClothModal from './AddClothModal';
import FabMenu from './common/FabMenu'

export default function BottomNav() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const navigate = useNavigate();

  const [openAdd, setOpenAdd] = useState(false);

  const handleAddClick = () => {
    setOpenAdd(true);
  };

  const handleLogClick = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    navigate(`/calender?openAdd=1&date=${encodeURIComponent(todayStr)}`);
  };

  // Dummy handler for adding cloth
  const addCloth = (item) => {
    console.log('Added cloth:', item);
  };

  // Navigation items, excluding the central action button
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <House size={16} color="#e042f5" /> },
    { to: '/calender', label: 'Calender', icon: <CalendarDays size={16} color="#12913c" /> },
    { to: '/laundry', label: 'Laundry', icon: <WashingMachine size={16} color="#12913c" /> },
    { to: '/profile', label: 'Profile', icon: <User size={16} color="#e042f5" /> },
  ];

  // Split navigation items to place the FAB in the middle
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <>
      <nav className={`md:hidden ${isLanding ? 'hidden' : 'block'} fixed bottom-4 left-1/2 -translate-x-1/2 z-30`}>
        <ul className="flex items-end gap-2 rounded-2xl px-3 py-2 backdrop-blur bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-white/10 shadow-lg">
          {/* Render left-side navigation items */}
          {leftItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs w-16 h-14 transition-colors ${active
                    ? 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                    }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="mt-1 leading-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}

          <FabMenu
            actions={[
              { label: 'Add New', icon: FilePlus, onClick: handleAddClick },
              { label: 'Log Outfit', icon: BookPlus, onClick: handleLogClick },
            ]}
          />

          {/* Render right-side navigation items */}
          {rightItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs w-16 h-14 transition-colors ${active
                    ? 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                    }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="mt-1 leading-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {openAdd && (
        <AddClothModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onAdd={(item) => {
            addCloth(item);
            setOpenAdd(false);
          }}
        />
      )}
    </>

  );
}
