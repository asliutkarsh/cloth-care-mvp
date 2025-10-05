import React from 'react';
import { motion } from 'framer-motion';

export default function DayCell({
  date,
  isSelected,
  isToday,
  hasWorn,
  hasPlanned,
  isTrip,
  activityCount,
  onClick,
  onLongPressStart,
  onLongPressEnd
}) {
  const day = date.getDate();

  return (
    <motion.button
      onClick={() => onClick(date)}
      onMouseDown={() => onLongPressStart(date)}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={() => onLongPressStart(date)}
      onTouchEnd={onLongPressEnd}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative h-12 md:h-16 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all
        ${isSelected
          ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-gray-900'
          : isToday
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400 dark:ring-emerald-600'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }
      `}
    >
      {/* Day Number */}
      <span className={`${isSelected ? 'font-bold' : ''}`}>{day}</span>
      
      {/* Activity Indicators */}
      {activityCount > 0 && (
        <div className="flex items-center gap-1 mt-1">
          {hasWorn && (
            <span className="text-xs" role="img" aria-label="Worn outfit">
              👕
            </span>
          )}
          {hasPlanned && (
            <span className="text-xs" role="img" aria-label="Planned outfit">
              📅
            </span>
          )}
          {isTrip && (
            <span className="text-xs" role="img" aria-label="Trip">
              🧳
            </span>
          )}
        </div>
      )}

      {/* Activity Count Badge */}
      {activityCount > 0 && !isSelected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">
          {activityCount}
        </div>
      )}
    </motion.button>
  );
}
