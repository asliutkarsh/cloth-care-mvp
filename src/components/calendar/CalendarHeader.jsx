import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarHeader({ monthLabel, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onPrev}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        aria-label="Previous month"
      >
        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
      </button>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {monthLabel}
      </h2>

      <button
        onClick={onNext}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        aria-label="Next month"
      >
        <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
}
