import React from 'react';
import { motion } from 'framer-motion';

// Skeleton for stat cards
const StatCardSkeleton = () => (
  <div className="glass-card p-4 text-center animate-pulse">
    <div className="w-10 h-10 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full mb-2 animate-pulse"></div>
    <div className="h-8 w-12 mx-auto bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
    <div className="h-4 w-20 mx-auto bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
  </div>
);

// Skeleton for activity items
const ActivityItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
    </div>
  </div>
);

// Skeleton for outfit suggestion card
const OutfitSuggestionSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-2/3"></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
    </div>
    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mt-4 animate-pulse"></div>
  </div>
);

// Skeleton for quick actions
const QuickActionsSkeleton = () => (
  <div className="space-y-4">
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <main className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-64"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-80"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Skeleton */}
        <QuickActionsSkeleton />

        {/* Outfit Suggestion Skeleton */}
        <OutfitSuggestionSkeleton />

        {/* Recent Activity Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="glass-card p-4 space-y-3">
            <ActivityItemSkeleton />
            <ActivityItemSkeleton />
            <ActivityItemSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
