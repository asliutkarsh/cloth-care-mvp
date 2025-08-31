import React from 'react';
import { Layers, Shirt } from 'lucide-react';

export default function ActivityTabContent({ activity }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      <div className="space-y-3">
        {activity &&    activity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'outfit'
                  ? 'bg-blue-200 dark:bg-blue-800'
                  : 'bg-green-200 dark:bg-green-800'
              }`}
            >
              {activity.type === 'outfit' ? (
                <Layers size={16} className="text-blue-600 dark:text-blue-400" />
              ) : (
                <Shirt size={16} className="text-green-600 dark:text-green-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.type === 'outfit' ? 'Wore outfit:' : 'Wore item:'} {activity.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {activity.date} at {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
