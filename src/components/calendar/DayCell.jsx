// src/components/calendar/DayCell.jsx
import React from 'react';

export default function DayCell({
  date,
  isSelected,
  isToday,
  hasActivity,
  onClick,
  onLongPressStart,
  onLongPressEnd
}) {
  const day = date.getDate();

  return (
    <button
      onClick={() => onClick(date)}
      onMouseDown={() => onLongPressStart(date)}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={() => onLongPressStart(date)}
      onTouchEnd={onLongPressEnd}
      className={`
        h-12 md:h-16 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all
        ${isSelected
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : isToday
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
        }
      `}
    >
      <span>{day}</span>
      {hasActivity && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1" />}
    </button>
  );
}