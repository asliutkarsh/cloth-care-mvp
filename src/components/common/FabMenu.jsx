import React, { useEffect, useRef, useState } from 'react';
import { CirclePlus } from 'lucide-react';

export default function FabMenu({ actions = [], className = '', translateX = 0 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close menu if clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Action Menu (Desktop Popover) */}
      <div
        className={`absolute bottom-[calc(100%+1rem)] right-0 z-50 flex flex-col gap-2 transition-all duration-300 ease-in-out 
        ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[10rem] translate-x-${translateX}`}
        >
          {actions.map(({ label, icon: Icon, onClick }, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              {Icon && <Icon size={20} />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-transform hover:scale-105"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open action menu"
      >
        <CirclePlus size={28} />
      </button>
    </div>
  );
}
