import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, THEMES } from "../context/ThemeContext";
import { Palette, Sun, Moon, Leaf, Waves, Sunset, TreePine } from "lucide-react";

const THEME_ICONS = {
  [THEMES.LIGHT]: Sun,
  [THEMES.DARK]: Moon,
  [THEMES.EMERALD]: Leaf,
  [THEMES.OCEAN]: Waves,
  [THEMES.SUNSET]: Sunset,
  [THEMES.FOREST]: TreePine
};

export default function ThemeToggle() {
  const { currentTheme, changeTheme, availableThemes, themeConfigs } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentIcon = THEME_ICONS[currentTheme] || Sun;
  const CurrentIcon = currentIcon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 
                   bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700
                   hover:bg-white dark:hover:bg-gray-800 hover:scale-105 shadow-sm"
      >
        <CurrentIcon size={20} className="text-gray-700 dark:text-gray-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Theme Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-14 z-50 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur 
                         rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-2"
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 mb-1">
                Choose Theme
              </div>
              
              {availableThemes.map((theme) => {
                const Icon = THEME_ICONS[theme];
                const config = themeConfigs[theme];
                const isActive = currentTheme === theme;
                
                return (
                  <button
                    key={theme}
                    onClick={() => {
                      changeTheme(theme);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                               ${isActive 
                                 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                                 : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                               }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{config.name}</span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
