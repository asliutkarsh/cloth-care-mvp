import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { TrendingUp, TrendingDown, Award, BarChart3, PieChart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as AnalyticsService from '../services/analyticsService';

export default function QuickStatsCards() {
  const { getThemeConfig } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const themeConfig = getThemeConfig();

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      const [mostUsed, leastUsed, wardrobeStats] = await Promise.all([
        AnalyticsService.getMostUsedClothes(3),
        AnalyticsService.getLeastUsedClothes(3),
        AnalyticsService.getWardrobeStats()
      ]);
      
      setStats({ 
        mostUsed: mostUsed || [], 
        leastUsed: leastUsed || [],
        wardrobeStats: wardrobeStats || { totalClothes: 0, cleanClothes: 0, dirtyClothes: 0 }
      });
    } catch (error) {
      console.error('Error loading quick stats:', error);
      setStats({ 
        mostUsed: [], 
        leastUsed: [],
        wardrobeStats: { totalClothes: 0, cleanClothes: 0, dirtyClothes: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className={`text-2xl font-bold ${themeConfig.text} mb-2`}>Quick Stats</h2>
          <p className={`text-sm ${themeConfig.text} opacity-70`}>Your most and least worn items</p>
        </div>
        <Card variant="glass" className="p-8 text-center">
          <Award size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading stats...</p>
        </Card>
      </div>
    );
  }

  const topItem = stats.mostUsed && stats.mostUsed.length > 0 ? stats.mostUsed[0] : null;
  const leastUsedItem = stats.leastUsed && stats.leastUsed.length > 0 ? stats.leastUsed[0] : null;
  const wardrobeStats = stats.wardrobeStats || { totalClothes: 0, cleanClothes: 0, dirtyClothes: 0 };

  // Mini Bar Chart Component
  const MiniBarChart = ({ data, maxValue, color }) => (
    <div className="flex items-end space-x-1 h-8">
      {data.slice(0, 5).map((item, index) => {
        const height = (item.currentWearCount / maxValue) * 100;
        return (
          <div
            key={index}
            className={`w-2 rounded-t ${color}`}
            style={{ height: `${Math.max(height, 10)}%` }}
          />
        );
      })}
    </div>
  );

  // Mini Pie Chart Component
  const MiniPieChart = ({ clean, dirty, total }) => {
    const cleanPercentage = total > 0 ? (clean / total) * 100 : 0;
    const dirtyPercentage = total > 0 ? (dirty / total) * 100 : 0;
    
    return (
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-green-500"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={`${cleanPercentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-red-500"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={`${dirtyPercentage}, 100`}
            strokeDashoffset={`-${cleanPercentage}`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${themeConfig.text} mb-2`}>Quick Stats</h2>
        <p className={`text-sm ${themeConfig.text} opacity-70`}>Your most and least worn items</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Worn Item */}
        <Card variant="accent" className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Most Worn</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {topItem ? topItem.name : 'No data yet'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {topItem ? topItem.currentWearCount : 0}
            </div>
            <div className="text-sm text-gray-500">times worn</div>
          </div>
        </Card>

        {/* Least Worn Item */}
        <Card variant="accent" className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
              <TrendingDown size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Least Worn</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {leastUsedItem ? leastUsedItem.name : 'No data yet'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {leastUsedItem ? leastUsedItem.currentWearCount : 0}
            </div>
            <div className="text-sm text-gray-500">times worn</div>
          </div>
        </Card>

        {/* Wardrobe Status */}
        <Card variant="accent" className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
              <PieChart size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Wardrobe</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status Overview</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {wardrobeStats.totalClothes}
            </div>
            <div className="text-sm text-gray-500">total items</div>
            <div className="mt-2 text-xs text-gray-400">
              {wardrobeStats.cleanClothes} clean • {wardrobeStats.dirtyClothes} dirty
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
