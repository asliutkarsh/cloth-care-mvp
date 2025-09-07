import React from 'react';
import { ChevronRight } from 'lucide-react';

const SettingsMenuItem = ({ title, subtitle, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-lg text-left transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-emerald-500
      ${danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}`}
    aria-label={`${title}${subtitle ? ': ' + subtitle : ''}`}
  >
    <div>
      <div className="font-medium text-base">{title}</div>
      {subtitle && (
        <div className={`text-sm ${danger ? 'text-red-500/80' : 'text-gray-600 dark:text-gray-400'}`}>
          {subtitle}
        </div>
      )}
    </div>
    <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
  </button>
);

export default SettingsMenuItem;
