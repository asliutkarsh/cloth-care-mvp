// src/components/SplashScreen.jsx
import { motion } from 'framer-motion';
import Logo from './Logo';

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
        <div className="text-5xl">
          <Logo />
        </div>
      </motion.div>
    </div>
  );
}