import React from 'react';

export default function WeekdayHeader() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {days.map((day) => (
        <div
          key={day}
          className="h-8 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          {day}
        </div>
      ))}
    </div>
  );
}
