// src/components/ThemeToggle.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../stores/useThemeStore';

export default function ThemeToggle() {
  const { setTheme } = useThemeStore();
  
  // This local state will determine the visual state of the toggle (on/off)
  // It reads directly from the document to reflect the *actual* current theme
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  // We need to listen for changes to the 'dark' class, especially
  // when the system theme changes while our preference is set to 'system'.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    // When the user clicks the toggle, we set an explicit preference
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 
                 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full flex items-center justify-center 
                   bg-white dark:bg-black text-lg"
        // Animate based on the actual theme state
        animate={{ x: isDark ? 32 : 0 }}
      >
        {isDark ? "🌙" : "☀️"}
      </motion.div>
    </button>
  );
}