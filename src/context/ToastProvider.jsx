import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext({ addToast: () => {}, removeToast: () => {} });

const TOAST_LIFETIME = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, options = {}) => {
      const id = crypto.randomUUID();
      const toast = {
        id,
        message,
        type: options.type || 'info',
        duration: options.duration ?? TOAST_LIFETIME,
        action: options.action,
      };

      setToasts((prev) => [...prev, toast]);

      if (toast.duration > 0) {
        setTimeout(() => removeToast(id), toast.duration);
      }

      return id;
    },
    [removeToast]
  );

  const contextValue = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-72">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`rounded-xl border p-4 shadow-lg text-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur ${
                  toast.type === 'success'
                    ? 'border-emerald-300/80 text-emerald-800 dark:text-emerald-200'
                    : toast.type === 'error'
                    ? 'border-red-300/80 text-red-700 dark:text-red-200'
                    : 'border-gray-200/80 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span>{toast.message}</span>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                    aria-label="Dismiss toast"
                  >
                    ✕
                  </button>
                </div>
                {toast.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action.onClick?.();
                      removeToast(toast.id);
                    }}
                    className="mt-2 inline-flex items-center text-xs font-medium text-primary-deep dark:text-primary-bright hover:underline"
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
