import React from 'react';

// Skeleton for category items
const CategoryItemSkeleton = () => (
  <div className="glass-card p-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse w-32"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-24"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function CategoryManagementSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <div className="glass-card w-full p-0">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-40"></div>
          </div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-32"></div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 sm:p-6">
          <div className="space-y-2">
            <CategoryItemSkeleton />
            <CategoryItemSkeleton />
            <CategoryItemSkeleton />
            <CategoryItemSkeleton />
            <CategoryItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
