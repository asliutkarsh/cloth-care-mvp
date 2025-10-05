import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const sizes = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    '2xl': 'max-w-3xl',
    '3xl': 'max-w-4xl',
  };
  const panelSizeClass = sizes[size] || sizes.md;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            className={`relative w-full ${panelSizeClass} glass-card border-t border-gray-200 dark:border-gray-700 sm:border flex flex-col max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl`}
            initial={{ y: '100%', sm: { y: 40, opacity: 0 } }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', sm: { y: 40, opacity: 0 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            <header className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 text-center relative">
               <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full sm:hidden" />
               <h3 className="text-lg font-semibold pt-2 sm:pt-0">{title}</h3>
               <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-2 right-2 rounded-full" aria-label="Close">
                  <X size={20} />
                </Button>
            </header>

            <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
                {children}
            </div>

            {footer && (
              <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}