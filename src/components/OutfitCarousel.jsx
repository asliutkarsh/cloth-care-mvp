import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import * as OutfitService from '../services/outfitService';
import * as ClothService from '../services/clothService';
import { useTheme } from '../context/ThemeContext';

export default function OutfitCarousel({ title = "Ready to Wear", maxItems = 5, accent }) {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();

  useEffect(() => {
    loadReadyToWearOutfits();
  }, []);

  const loadReadyToWearOutfits = async () => {
    try {
      setLoading(true);
      const allOutfits = await OutfitService.getAll();
      
      // Filter outfits that have clean clothes
      const readyOutfits = [];
      for (const outfit of allOutfits) {
        if (!outfit || !outfit.id) continue;
        
        const clothes = await OutfitService.getClothesInOutfit(outfit.id);
        if (!clothes || clothes.length === 0) continue;
        
        const cleanClothes = clothes.filter(cloth => cloth && cloth.status === 'clean');
        
        // Only include outfits where all clothes are clean
        if (cleanClothes.length === clothes.length && clothes.length > 0) {
          readyOutfits.push({
            ...outfit,
            cleanClothes,
            totalClothes: clothes.length
          });
        }
      }
      
      setOutfits(readyOutfits.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading ready outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (outfits.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % outfits.length);
    }
  };

  const prevSlide = () => {
    if (outfits.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + outfits.length) % outfits.length);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your clean, ready-to-wear outfits</p>
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your clean, ready-to-wear outfits</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No ready-to-wear outfits yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Create outfits with clean clothes to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your clean, ready-to-wear outfits</p>
        </div>
        {outfits.length > 1 && (
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {outfits.map((outfit, index) => {
            const cardBg = accent ? (themeConfig.gradient || themeConfig.card || themeConfig.background) : `linear-gradient(135deg, ${outfit.colors?.primary || '#8B5CF6'} 0%, ${outfit.colors?.secondary || '#A78BFA'} 100%)`;
            return (
              <div
                key={outfit.id}
                className={`flex-shrink-0 w-64 h-40 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  index === currentIndex ? 'scale-105 shadow-lg' : 'scale-100 shadow-md'
                }`}
                style={{ background: cardBg }}
              >
                <div className="relative w-full h-full p-4 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <ImageIcon size={20} className="text-white" />
                    </div>
                    <div className="text-white/90 text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                      {outfit.totalClothes || outfit.cleanClothes?.length || 0} items
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-semibold text-lg mb-2 truncate ${themeConfig.text}`}>
                      {outfit.name || 'Untitled Outfit'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(outfit.tags || []).slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-white/30 text-white text-xs rounded-full backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                      {(!outfit.tags || outfit.tags.length === 0) && (
                        <span className="px-2 py-1 bg-white/30 text-white text-xs rounded-full backdrop-blur-sm">
                          Ready to wear
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots indicator */}
      {outfits.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {outfits.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
