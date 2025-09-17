import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/useAuthStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Logo from '../components/ui/Logo'
import {
  House,
  CalendarDays,
  WashingMachine,
  User,
  BookOpenCheck,
} from 'lucide-react'
import FabMenu from '../components/ui/FabMenu'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <House size={24} color="#e042f5" />,
    },
    {
      to: '/wardrobe',
      label: 'Wardrobe',
      icon: <BookOpenCheck size={24} color="#12913c" />,
    },
    {
      to: '/laundry',
      label: 'Laundry',
      icon: <WashingMachine size={24} color="#12913c" />,
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: <User size={24} color="#e042f5" />,
    },
  ]

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-20 p-3 md:p-4 backdrop-blur supports-[backdrop-filter]:bg-transparent dark:supports-[backdrop-filter]:bg-transparent border-b border-white/20"
    >
      {/* if user is not logged in */}
      {!user && (
        <div className="container flex items-center justify-between sm:justify-around mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          <ThemeToggle />
        </div>
      )}

      {/* if user is logged in and landing page */}
      {user && isLanding && (
        <div className="container flex items-center justify-between sm:justify-around mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          <motion.button
            whileHover={{
              scale: 1.02,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              navigate('/dashboard')
              setOpen(false)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg 
                 font-semibold text-white 
                 bg-gradient-to-b from-gray-700 to-gray-900/60
                 dark:from-gray-900 dark:to-gray-800/70
                 shadow-md hover:shadow-lg transition-all"
          >
            Dashboard
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* if user is logged in and not Landing page and desktop */}
      {user && !isLanding && (
        <div className="container hidden sm:flex items-center justify-between mx-auto px-4 sm:px-0 lg:px-6">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <div className="flex justify-end items-center gap-3">
            {navItems.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* if user is logged in and not Landing page and mobile */}
      {user && !isLanding && (
        <div className="container flex items-center justify-between sm:justify-around mx-auto px-4 sm:px-6 lg:px-8 md:hidden">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
        </div>
      )}
    </motion.nav>
  )
}
