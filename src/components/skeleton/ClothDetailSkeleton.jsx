import React from 'react';
import { motion } from 'framer-motion';

const SkeletonElement = ({ className }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`} />
);

export default function ClothDetailSkeleton() {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SkeletonElement className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <SkeletonElement className="h-7 w-48" />
            <SkeletonElement className="h-5 w-32" />
          </div>
        </div>
        <SkeletonElement className="h-10 w-24" />
      </div>

      {/* Main Card Skeleton */}
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_320px)_1fr]">
          <SkeletonElement className="h-80 md:h-full" />
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-4">
              <SkeletonElement className="h-20 flex-1 rounded-xl" />
              <SkeletonElement className="h-20 flex-1 rounded-xl" />
              <SkeletonElement className="h-20 flex-1 rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonElement className="h-4 w-1/2" />
              <SkeletonElement className="h-2.5 w-full" />
            </div>
            <div className="space-y-2 p-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl">
              <SkeletonElement className="h-9 w-full" />
              <SkeletonElement className="h-9 w-full" />
              <SkeletonElement className="h-9 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="p-6 bg-gray-100 dark:bg-gray-800/50 rounded-2xl space-y-4">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <SkeletonElement className="h-8 w-20 mb-2" />
            <SkeletonElement className="h-8 w-20 mb-2" />
          </div>
          <SkeletonElement className="h-5 w-full" />
          <SkeletonElement className="h-5 w-3/4" />
      </div>
    </motion.main>
  );
}