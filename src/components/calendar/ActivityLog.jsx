import React from 'react';
import { CalendarDays, Clock, Layers, Shirt, Trash2, Plus } from 'lucide-react';
import { useCalendarStore } from '../../stores/useCalendarStore';
import { Button } from '../ui';

export default function ActivityLog({ selectedDate, activitiesForDay, getActivityDetails, onAddActivity }) {
  // Get the delete action from the central store
  const { deleteActivity } = useCalendarStore();

  const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();

  return (
    <div className="glass-card">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddActivity && onAddActivity()}
            className="flex items-center gap-1"
          >
            <Plus size={14} />
            Log Activity
          </Button>
        </div>
        {isToday && (
          <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
            Today
          </span>
        )}
      </div>

      {/* Log Entries Section */}
      <div className="p-4">
        {activitiesForDay.length > 0 ? (
          <div className="space-y-3">
            {activitiesForDay.map((activity) => {
              const details = getActivityDetails(activity);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${activity.type === 'outfit' ? 'bg-blue-200 dark:bg-blue-800' : 'bg-green-200 dark:bg-green-800'}`}>
                    {activity.type === 'outfit' ? <Layers size={16} className="text-blue-600 dark:text-blue-400" /> : <Shirt size={16} className="text-green-600 dark:text-green-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {details.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <Clock size={12} className="inline mr-1" />
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {details.items}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete activity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State with CTA
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">No activity logged for this date.</p>
            <Button
              variant="secondary"
              onClick={() => onAddActivity && onAddActivity()}
              className="inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Log Activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}