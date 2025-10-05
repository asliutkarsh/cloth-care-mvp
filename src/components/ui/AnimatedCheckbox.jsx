import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const AnimatedCheckbox = ({ checked, onChange, className = '', ...props }) => {
  return (
    <motion.div 
      className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-colors ${checked ? 'bg-primary-deep' : 'border-2 border-gray-300 dark:border-gray-500'} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      whileTap={{ scale: 0.9 }}
      {...props}
    >
      <motion.div
        initial={false}
        animate={{ scale: checked ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
      </motion.div>
    </motion.div>
  );
};

export default React.memo(AnimatedCheckbox);
