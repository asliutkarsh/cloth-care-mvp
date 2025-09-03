import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Thermometer, Droplets, Wind, CloudRain, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as WeatherService from '../services/weatherService';

export default function WeatherWidget() {
  const { getThemeConfig } = useTheme();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const themeConfig = getThemeConfig();

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await WeatherService.getCurrentWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="glass" className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card variant="glass" className="p-4">
        <p className="text-gray-500 dark:text-gray-400">Weather unavailable</p>
      </Card>
    );
  }

  const gradient = WeatherService.getWeatherGradient(weather);
  const cardBg = gradient || themeConfig.card || themeConfig.background;

  return (
    <Card 
      className="p-4 relative overflow-hidden"
      style={{ 
        background: cardBg,
        color: undefined // let text color be controlled by classes
      }}
    >
      {/* Remove the always-on overlay */}
      <div className="relative z-10">
        {/* Current Weather */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{weather.icon}</div>
            <div>
              <div className={`text-2xl font-bold ${themeConfig.text}`}>{weather.temperature}°C</div>
              <div className={`text-sm opacity-90 ${themeConfig.text}`}>{weather.condition}</div>
            </div>
          </div>
          <div className={`flex space-x-4 text-sm opacity-90 ${themeConfig.text}`}>
            <div className="flex items-center space-x-1">
              <Droplets size={16} />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind size={16} />
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
        <div className={`text-xs opacity-80 mb-4 ${themeConfig.text}`}>{weather.description}</div>
        {/* Tomorrow's Forecast */}
        {weather.forecast?.tomorrow && (
          <div className="bg-white/20 dark:bg-black/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sun size={16} />
                <span className="text-sm font-medium">Tomorrow</span>
              </div>
              <div className="text-sm">
                {weather.forecast.tomorrow.high}° / {weather.forecast.tomorrow.low}°
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs opacity-80">{weather.forecast.tomorrow.condition}</span>
              <div className="flex items-center space-x-1 text-xs opacity-80">
                <CloudRain size={12} />
                <span>{weather.forecast.tomorrow.rainChance}%</span>
              </div>
            </div>
          </div>
        )}
        {/* Hourly Forecast */}
        {weather.forecast?.hourly && (
          <div className="space-y-2">
            <div className="text-xs font-medium opacity-90">Next 4 Hours</div>
            <div className="flex space-x-3 overflow-x-auto">
              {weather.forecast.hourly.map((hour, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="text-xs opacity-80">{hour.time}</div>
                  <div className="text-lg my-1">{hour.icon}</div>
                  <div className="text-sm font-medium">{hour.temp}°</div>
                  <div className="text-xs opacity-70">{hour.rainChance}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
