import React, { useState, useEffect } from 'react';
import AnimatedPage from "../components/AnimatedPage";
import { Link } from "react-router-dom";
import * as AnalyticsService from '../services/analyticsService';
import * as InitializationService from '../services/initializationService';
import { Card } from '../components/common/Card';
import SectionHeader from '../components/common/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import WeatherWidget from '../components/WeatherWidget';
import OutfitCarousel from '../components/OutfitCarousel';
import LaundrySummaryCard from '../components/LaundrySummaryCard';
import QuickStatsCards from '../components/QuickStatsCards';

export default function Dashboard() {
  const { user } = useAuth();
  const { getThemeConfig } = useTheme();
  const [stats, setStats] = useState(null);
  
  const themeConfig = getThemeConfig();

  useEffect(() => {
    // Initialize the app which creates default categories if none exist
    InitializationService.initializeApp();
    
    // Fetch wardrobe stats
    const loadStats = async () => {
      try {
        const wardrobeStats = await AnalyticsService.getWardrobeStats();
        setStats(wardrobeStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!stats) {
    return (
      <AnimatedPage>
        <div className="p-6 dark:text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card variant="accent" className="p-4 md:p-6">
            <div className="text-left">
              <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-1`}>
                {getGreeting()}, {user?.name || 'User'}
              </h1>
              <p className={`text-base ${themeConfig.text} opacity-80`}>
                Here's what you should know right now
              </p>
            </div>
          </Card>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Weather & Laundry */}
          <div className="xl:col-span-1 space-y-6">
            <WeatherWidget />
            <div className="min-h-[120px]">
              <LaundrySummaryCard />
            </div>
          </div>
          {/* Right Column - Outfits & Stats */}
          <div className="xl:col-span-2 space-y-6">
            <OutfitCarousel title="Ready to Wear" accent />
          </div>
        </div>

        <div className="mb-8">
          <QuickStatsCards />
        </div>
        
        {/* Quick Actions Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${themeConfig.text} mb-2`}>Quick Actions</h2>
            <p className={`text-sm ${themeConfig.text} opacity-70`}>Navigate to key features</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionLink to="/wardrobe" title="View Wardrobe" icon="👕" />
            <QuickActionLink to="/laundry" title="Go to Laundry" icon="🧺" />
            <QuickActionLink to="/profile" title="My Profile" icon="👤" />
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

// Helper components for styling

const StatCard = ({ title, value, color = 'dark:text-white' }) => (
  <Card className="text-center">
    <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h4>
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
  </Card>
);

const QuickActionLink = ({ to, title, icon }) => (
  <Link to={to} className="group block p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
    <div className="text-center">
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {title}
      </h4>
    </div>
  </Link>
);
