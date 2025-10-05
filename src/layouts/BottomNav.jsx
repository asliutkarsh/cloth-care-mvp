// src/components/BottomNav.jsx
import { Link, useLocation } from 'react-router-dom';
import { FilePlus, BookPlus, WashingMachine, House, User, BookOpenCheck, Shirt } from 'lucide-react';
import FabMenu from '../components/ui/FabMenu';
import { useModalStore, ModalTypes } from '../stores/useModalStore';

const wardrobeFabActions = [
  {
    label: 'Add Cloth',
    icon: FilePlus,
    modal: ModalTypes.ADD_CLOTH,
  },
  {
    label: 'Add Outfit',
    icon: Shirt,
    modal: ModalTypes.ADD_OUTFIT,
  },
  {
    label: 'Log Wear',
    icon: BookPlus,
    action: 'logWear',
  },
];

export default function BottomNav({ onAddClothClick, onLogWearClick }) {
  const location = useLocation();
  const openModal = useModalStore((s) => s.openModal);
  const isLanding = location.pathname === '/';

  // Recommended nav items
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <House size={16} /> },
    { to: '/wardrobe', label: 'Wardrobe', icon: <BookOpenCheck size={16} /> },
    { to: '/laundry', label: 'Laundry', icon: <WashingMachine size={16} /> },
    { to: '/profile', label: 'Profile', icon: <User size={16} /> },
  ];

  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  if (isLanding) {
    return null; // Don't render anything on the landing page
  }

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
      <ul className="flex items-end gap-2 rounded-3xl px-3 py-2 backdrop-blur bg-white/85 dark:bg-gray-900/85 border border-white/20 dark:border-white/10 shadow-xl">
        {leftItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link to={item.to} className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs w-16 h-14 transition-colors ${active ? 'bg-gray-100/90 dark:bg-gray-800/80 text-primary-deep dark:text-primary-bright' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'}`}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="mt-1 leading-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}

        <FabMenu
          actions={wardrobeFabActions.map(({ label, icon, modal, action }) => ({
            label,
            icon,
            onClick: () => {
              if (modal) {
                openModal(modal);
              }
              if (action === 'logWear') {
                onLogWearClick?.();
              }
            },
          }))}
        />

        {rightItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link to={item.to} className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs w-16 h-14 transition-colors ${active ? 'bg-gray-100/90 dark:bg-gray-800/80 text-primary-deep dark:text-primary-bright' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'}`}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="mt-1 leading-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}