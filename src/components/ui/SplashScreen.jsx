// src/components/SplashScreen.jsx
import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        // Animation zooms in and out infinitely
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        {/* We can reuse the logo style from your Navbar */}
        <h1 className="font-bold text-4xl logo-gradient">
          ClothCare
        </h1>
      </motion.div>
    </div>
  );
}