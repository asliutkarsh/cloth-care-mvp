import React from 'react';

// Skeleton for individual cloth cards
const ClothCardSkeleton = () => (
  <div className="relative text-left w-full rounded-xl shadow-md overflow-hidden card-gradient backdrop-blur border border-white/20 dark:border-white/10">
    <div className="relative aspect-square bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-b border-black/5 dark:border-white/5 animate-pulse">
      <div className="flex flex-col items-center justify-center gap-3 w-full h-full p-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
        <div className="w-7 h-7 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
    <div className="p-3 space-y-1">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-2/3"></div>
    </div>
  </div>
);

// Skeleton for outfit cards
const OutfitCardSkeleton = () => (
  <div className="glass-card p-4 rounded-xl animate-pulse">
    <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg mb-3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
    </div>
  </div>
);

// Skeleton for tabs
const TabsSkeleton = () => (
  <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse flex-shrink-0 w-24"></div>
    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse flex-shrink-0 w-20"></div>
  </div>
);

// Skeleton for search bar
const SearchSkeleton = () => (
  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
);

export default function WardrobeSkeleton() {
  return (
    <div className="flex relative">
      <main className="flex-grow max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
        <div className="mb-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-64"></div>
        </div>

        <TabsSkeleton />

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <SearchSkeleton />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-32"></div>
          </div>
        </div>

        {/* Clothes Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <ClothCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
