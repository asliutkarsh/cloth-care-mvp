import React from 'react';

// Skeleton for laundry list items
const LaundryItemSkeleton = () => (
  <div className="glass-card p-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        <div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse w-32"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-24"></div>
        </div>
      </div>
      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
  </div>
);

// Skeleton for laundry section
const LaundrySectionSkeleton = ({ title }) => (
  <div className="space-y-4">
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-32"></div>
    <div className="space-y-3">
      <LaundryItemSkeleton />
      <LaundryItemSkeleton />
      <LaundryItemSkeleton />
    </div>
  </div>
);

export default function LaundrySkeleton() {
  return (
    <main className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-40"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-80"></div>
      </div>

      {/* Laundry Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LaundrySectionSkeleton title="Dirty Clothes" />
        <LaundrySectionSkeleton title="Needs Pressing" />
      </div>
    </main>
  );
}
