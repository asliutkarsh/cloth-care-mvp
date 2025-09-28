import React from 'react';

// Skeleton for settings menu items
const SettingsMenuItemSkeleton = () => (
  <div className="glass-card p-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse w-32"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-48"></div>
        </div>
      </div>
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  </div>
);

export default function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      {/* Tip Banner Skeleton */}
      <div className="mb-4 glass-card border border-dashed p-3 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-96"></div>
      </div>

      {/* Settings Items Skeleton */}
      <div className="space-y-3">
        <SettingsMenuItemSkeleton />
        <SettingsMenuItemSkeleton />
        <SettingsMenuItemSkeleton />
        <SettingsMenuItemSkeleton />
        <SettingsMenuItemSkeleton />
        <SettingsMenuItemSkeleton />
        <SettingsMenuItemSkeleton />
        <SettingsMenuItemSkeleton />
      </div>
    </div>
  );
}
