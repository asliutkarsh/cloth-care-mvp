import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, onClose, title, children, footer, size = 'md', closeOnBackdrop = true }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Panel */}
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              className={`w-full sm:w-auto sm:${sizes[size]} bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-white/10 dark:border-gray-800 flex flex-col max-h-[95vh]`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {title && (
                <div className="px-4 py-3 border-b border-gray-200/60 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                    ✕
                  </button>
                </div>
              )}

              <div className="px-4 py-4 overflow-y-auto">{children}</div>

              {footer && (
                <div className="px-4 py-3 border-t border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">{footer}</div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
