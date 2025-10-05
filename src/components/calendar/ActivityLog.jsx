import React, { useState } from 'react';
import { CalendarDays, Clock, Layers, Shirt, Trash2, Plus, Copy, Edit2, MoreVertical } from 'lucide-react';
import { useCalendarStore } from '../../stores/useCalendarStore';
import { Button } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityLog({ 
  selectedDate, 
  activitiesForDay, 
  getActivityDetails, 
  onAddActivity,
  onEditActivity,
  onCopyActivity 
}) {
  const { deleteActivity, updateActivityStatus } = useCalendarStore();
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedMenuId, setExpandedMenuId] = useState(null);

  const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();
  const isPast = new Date(selectedDate) < new Date(new Date().setHours(0, 0, 0, 0));
  const isFuture = new Date(selectedDate) > new Date(new Date().setHours(23, 59, 59, 999));

  const handleDelete = async (activityId) => {
    setDeletingId(activityId);
    try {
      await deleteActivity(activityId);
    } catch (error) {
      console.error('Failed to delete activity:', error);
    } finally {
      setDeletingId(null);
      setExpandedMenuId(null);
    }
  };

  const handleMarkWorn = async (activityId) => {
    setUpdatingId(activityId);
    try {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      await updateActivityStatus(activityId, 'worn', { time });
    } catch (error) {
      console.error('Failed to update activity:', error);
    } finally {
      setUpdatingId(null);
      setExpandedMenuId(null);
    }
  };

  return (
    <div className="glass-card overflow-hidden ">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <CalendarDays size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activitiesForDay.length} {activitiesForDay.length === 1 ? 'activity' : 'activities'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onAddActivity && onAddActivity()}
            className="flex items-center gap-1.5"
          >
            <Plus size={14} />
            {isFuture ? 'Plan' : 'Log'}
          </Button>
        </div>
        {isToday && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Today
          </span>
        )}
        {isFuture && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
            Upcoming
          </span>
        )}
      </div>

      {/* Log Entries Section */}
      <div className="p-4 h-[330px] overflow-y-auto">
        {activitiesForDay.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activitiesForDay.map((activity) => {
                const details = getActivityDetails(activity);
                const isPlanned = activity.status === 'planned';
                const isExpanded = expandedMenuId === activity.id;
                
                return (
                  <motion.div
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`relative group flex items-start gap-3 p-3 rounded-xl border transition-all
                      ${isPlanned
                        ? 'border-blue-200 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-md'}
                    `}
                  >
                    {/* Activity Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        activity.type === 'outfit' 
                          ? 'bg-primary-100 dark:bg-primary-900/30' 
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}
                    >
                      {activity.type === 'outfit' ? (
                        <Layers size={18} className="text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Shirt size={18} className="text-green-600 dark:text-green-400" />
                      )}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {details.title || 'Activity'}
                        </h4>
                        {isPlanned && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                            Planned
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <Clock size={12} />
                        {(activity.time && activity.time.length === 5)
                          ? activity.time
                          : new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {details.subtitle && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {details.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Action Menu */}
                    <div className="flex flex-col items-end gap-1">
                      {isPlanned && !isPast && (
                        <Button
                          size="xs"
                          onClick={() => handleMarkWorn(activity.id)}
                          disabled={updatingId === activity.id}
                          className="whitespace-nowrap"
                        >
                          {updatingId === activity.id ? 'Updating...' : 'Mark Worn'}
                        </Button>
                      )}
                      
                      <button
                        onClick={() => setExpandedMenuId(isExpanded ? null : activity.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="More options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Expanded Menu */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-2 top-12 z-10 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                onEditActivity(activity);
                                setExpandedMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onCopyActivity(activity);
                                setExpandedMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Copy size={14} />
                              Copy
                            </button>
                            <button
                              onClick={() => handleDelete(activity.id)}
                              disabled={deletingId === activity.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 size={14} />
                              {deletingId === activity.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          // Enhanced Empty State
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Activities Yet
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {isFuture 
                ? 'Plan ahead by logging what you want to wear.'
                : 'Start tracking your outfits for this day.'}
            </p>
            <Button
              onClick={() => onAddActivity && onAddActivity()}
              className="inline-flex items-center gap-2"
            >
              <Plus size={16} />
              {isFuture ? 'Plan Activity' : 'Log Activity'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}