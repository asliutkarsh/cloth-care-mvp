import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './common/Card';
import { WashingMachine, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as LaundryService from '../services/laundryService';

export default function LaundrySummaryCard() {
  const { getThemeConfig } = useTheme();
  const [laundryStatus, setLaundryStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const themeConfig = getThemeConfig();

  useEffect(() => {
    loadLaundryStatus();
  }, []);

  const loadLaundryStatus = async () => {
    try {
      setLoading(true);
      const status = await LaundryService.getLaundryStatus();
      setLaundryStatus(status);
    } catch (error) {
      console.error('Error loading laundry status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="glass" className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!laundryStatus) {
    return (
      <Card variant="glass" className="p-4">
        <p className="text-gray-500 dark:text-gray-400">Laundry status unavailable</p>
      </Card>
    );
  }

  const totalItems = laundryStatus.dirtyCount + laundryStatus.pressingCount;
  const hasItems = totalItems > 0;

  return (
    <Link to="/laundry" className="block">
      <Card className={`p-4 transition-all duration-200 hover:scale-105 ${
        hasItems 
          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            hasItems 
              ? 'bg-orange-100 dark:bg-orange-900/40' 
              : 'bg-green-100 dark:bg-green-900/40'
          }`}>
            <WashingMachine 
              size={24} 
              className={hasItems ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'} 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Laundry Status
            </h3>
            {hasItems ? (
              <div className="space-y-1">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  You have {totalItems} item{totalItems !== 1 ? 's' : ''} in your laundry basket
                </p>
                {laundryStatus.dirtyCount > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {laundryStatus.dirtyCount} need washing
                  </p>
                )}
                {laundryStatus.pressingCount > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {laundryStatus.pressingCount} need pressing
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-green-700 dark:text-green-300">
                All clean! No laundry needed
              </p>
            )}
          </div>

          {hasItems && (
            <AlertCircle 
              size={20} 
              className="text-orange-500 dark:text-orange-400 flex-shrink-0" 
            />
          )}
        </div>
      </Card>
    </Link>
  );
}
