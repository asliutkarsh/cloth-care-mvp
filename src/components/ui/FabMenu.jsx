import React, { useEffect, useRef, useState } from 'react';
import { CirclePlus } from 'lucide-react';

export default function FabMenu({ actions = [], className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <li className={`relative ${className}`} ref={ref}>
      <div
        className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-max flex flex-col gap-2 transition-all duration-200 ease-out ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700/60 p-2 flex flex-col gap-2 min-w-[11rem]">
          {actions.map(({ label, icon: Icon, onClick, description }, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/70 text-left"
            >
              {Icon ? <Icon size={18} /> : null}
              <div className="flex flex-col items-start">
                <span className="font-medium leading-tight">{label}</span>
                {description ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{description}</span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-16 h-16 bg-primary-deep text-white rounded-full shadow-xl hover:bg-primary-deep/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-deep/60 -translate-y-3 transform transition-all hover:scale-105"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <CirclePlus size={26} />
      </button>
    </li>
  );
}
