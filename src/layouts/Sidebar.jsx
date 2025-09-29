// src/layouts/Sidebar.jsx

import { Link, useLocation } from 'react-router-dom';
import {
  House,
  BookOpenCheck,
  WashingMachine,
  User,
  Calendar,
  Settings,
  LineChart,
  Luggage,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: House },
  { to: '/wardrobe', label: 'Wardrobe', Icon: BookOpenCheck },
  { to: '/calendar', label: 'Calendar', Icon: Calendar },
  { to: '/laundry', label: 'Laundry', Icon: WashingMachine },
  { to: '/insights', label: 'Insights', Icon: LineChart },
  { to: '/trips', label: 'Trips', Icon: Luggage },
  { to: '/profile', label: 'Profile', Icon: User },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

// Defined outside the component to prevent re-creation on every render.
export default function Sidebar() {

    const location = useLocation();
    const isLanding = location.pathname === '/';

    if (isLanding) return null;

    return (
        <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-60 z-10">
            <div className="h-full overflow-y-auto px-3 py-4 backdrop-blur-sm border-r border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20">
                <nav>
                    <ul className="flex flex-col gap-1">
                        {navItems?.map(({ to, label, Icon }) => {
                            const active = location.pathname.startsWith(to);
                            return (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                            active
                                              ? 'bg-primary-activeBg text-white shadow-sm'
                                              : 'text-coolgray-700 dark:text-coolgray-500 hover-highlight'
                                          }`}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-coolgray-500 dark:text-coolgray-500'}`} />
                                        <span className="text-sm font-medium">{label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
