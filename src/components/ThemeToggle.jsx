import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || !localStorage.getItem("theme");
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 
                 bg-gray-300 dark:bg-gray-600"
    >
      {/* Circle that slides */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full flex items-center justify-center 
                   bg-white dark:bg-black text-lg"
        animate={{ x: dark ? 32 : 0 }}
      >
        {dark ? "🌙" : "☀️"}
      </motion.div>
    </button>
  );
}
