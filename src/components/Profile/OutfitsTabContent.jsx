import React from 'react';
import { Layers } from 'lucide-react';

export default function OutfitsTabContent({ outfits }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Outfits</h3>
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Create Outfit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outfits && outfits.map((outfit) => (
          <div
            key={outfit.id}
            className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layers size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{outfit.name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Last worn: {outfit.lastWorn}</p>
              </div>
            </div>

            <div className="space-y-1">
              {outfit.items.map((item, index) => (
                <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  • {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
