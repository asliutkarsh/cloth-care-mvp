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
            {/* Popover Menu */}
            <div
                className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-max flex flex-col gap-2 transition-all duration-300 ease-in-out ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
            >
                <div
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-2 transition-transform duration-300 ease-in-out ${open ? 'translate-y-0' : 'translate-y-full'
                        }`}
                >
                    {actions.map(({ label, icon: Icon, onClick }, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setOpen(false);
                                onClick?.();
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {Icon ? <Icon size={20} /> : null}
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* FAB Button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 -translate-y-3 transform transition-transform hover:scale-105"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <CirclePlus size={28} />
            </button>
        </li>
    );
}
