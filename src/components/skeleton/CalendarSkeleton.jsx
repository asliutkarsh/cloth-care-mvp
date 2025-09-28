import React from 'react';

// Skeleton for calendar header
const CalendarHeaderSkeleton = () => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-48"></div>
    <div className="flex gap-2">
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  </div>
);

// Skeleton for weekday headers
const WeekdayHeaderSkeleton = () => (
  <div className="grid grid-cols-7 gap-1 p-4 border-b border-gray-200 dark:border-gray-700">
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    ))}
  </div>
);

// Skeleton for calendar days
const CalendarDaySkeleton = () => (
  <div className="aspect-square p-2 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
    <div className="space-y-1">
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
    </div>
  </div>
);

// Skeleton for calendar grid
const CalendarGridSkeleton = () => (
  <div className="p-4">
    <div className="grid grid-cols-7 gap-1 mb-4">
      {Array.from({ length: 35 }, (_, i) => (
        <CalendarDaySkeleton key={i} />
      ))}
    </div>
  </div>
);

// Skeleton for activity log
const ActivityLogSkeleton = () => (
  <div className="glass-card">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-48"></div>
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-16"></div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function CalendarSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card p-0">
            <CalendarHeaderSkeleton />
            <WeekdayHeaderSkeleton />
            <CalendarGridSkeleton />
          </div>
        </div>
        <div className="lg:col-span-1">
          <ActivityLogSkeleton />
        </div>
      </div>
    </div>
  );
}
