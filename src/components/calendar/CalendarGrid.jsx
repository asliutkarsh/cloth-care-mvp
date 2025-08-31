import React from 'react';

export default function CalendarGrid({
  daysInMonth,
  firstDay,
  currentDate,
  selectedDate,
  onDateClick,
  onLongPressStart,
  onLongPressEnd,
  isToday,
  isSameDay,
  hasActivity,
}) {
  const cells = [];

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-12 md:h-16" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const selected = isSameDay(date, selectedDate);
    const today = isToday(date);
    const has = hasActivity(date);

    cells.push(
      <button
        key={day}
        onClick={() => onDateClick(date)}
        onMouseDown={() => onLongPressStart(date)}
        onMouseUp={onLongPressEnd}
        onMouseLeave={onLongPressEnd}
        onTouchStart={() => onLongPressStart(date)}
        onTouchEnd={onLongPressEnd}
        className={`
          h-12 md:h-16 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all
          ${selected
            ? 'bg-blue-600 text-white shadow-lg'
            : today
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'}
          ${has ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
        `}
      >
        <span>{day}</span>
        {has && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1" />}
      </button>
    );
  }

  return <div className="grid grid-cols-7 gap-1">{cells}</div>;
}
