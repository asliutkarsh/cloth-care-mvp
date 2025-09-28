import React from 'react';
import { motion } from 'framer-motion';

// Skeleton for profile avatar and info
const ProfileHeaderSkeleton = () => (
  <div role="status" aria-label="Loading profile" className="animate-pulse flex flex-col items-center space-y-4 mb-8">
    <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700"></div>
    <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
    <div className="h-4 w-60 bg-gray-300 dark:bg-gray-700 rounded"></div>
  </div>
);

// Skeleton for stat cards
const StatCardSkeleton = () => (
  <div className="glass-card p-4 text-center animate-pulse rounded-lg" role="status" aria-label="Loading statistic">
    <div className="w-10 h-10 mx-auto bg-emerald-200 dark:bg-emerald-900/40 rounded-full mb-2"></div>
    <div className="h-8 w-12 mx-auto bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
    <div className="h-4 w-20 mx-auto bg-gray-300 dark:bg-gray-700 rounded"></div>
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

// Skeleton for tab content
const TabContentSkeleton = () => (
  <div className="space-y-4">
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-32"></div>
    <div className="space-y-3">
      <ActivityItemSkeleton />
      <ActivityItemSkeleton />
      <ActivityItemSkeleton />
      <ActivityItemSkeleton />
    </div>
  </div>
);

export default function ProfileSkeleton() {
  return (
    <main className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      {/* Profile Header Skeleton */}
      <ProfileHeaderSkeleton />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Tabs Navigation Skeleton */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-24"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-20"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-28"></div>
      </div>

      {/* Tab Content Skeleton */}
      <TabContentSkeleton />
    </main>
  );
}
