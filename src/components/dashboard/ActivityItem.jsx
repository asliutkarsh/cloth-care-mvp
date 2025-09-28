import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Shirt, Clock, ChevronRight } from 'lucide-react'

const TYPE_META = {
  outfit: {
    icon: React.createElement(Layers, { size: 16, className: 'text-blue-600 dark:text-blue-400' }),
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  individual: {
    icon: React.createElement(Shirt, { size: 16, className: 'text-emerald-600 dark:text-emerald-400' }),
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
}

const getFallbackInitials = (name) => {
  if (!name) return '?'
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

const formatTime = (activity) => {
  if (activity?.createdAt) {
    return new Date(activity.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (activity?.date) {
    return activity.date
  }

  return ''
}

export default function ActivityItem({ activity, details }) {
  const meta = TYPE_META[details?.type || activity?.type] || {
    icon: React.createElement(Layers, { size: 16, className: 'text-gray-600' }),
    bg: 'bg-gray-200 dark:bg-gray-700',
  }

  const items = (details?.items || []).filter(Boolean)
  const hasMore = items.length > 4
  const displayItems = hasMore ? items.slice(0, 4) : items
  const timeLabel = formatTime(activity)

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-4 rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3 py-3"
    >
      <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${meta.bg}`}>
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {details?.title || 'Activity'}
            </p>
            {details?.subtitle && (
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {details.subtitle}
              </p>
            )}
          </div>
          {timeLabel && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <Clock size={12} />
              {timeLabel}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: item.color || '#d1d5db' }}
                    title={item.name}
                  >
                    <span className="text-gray-900/80 dark:text-gray-900">
                      {getFallbackInitials(item.name)}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {hasMore && (
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700">
                +{items.length - displayItems.length}
              </span>
            )}
          </div>
        )}

        {activity?.notes && (
          <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400 line-clamp-2">
            “{activity.notes}”
          </p>
        )}
      </div>

      <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
    </motion.div>
  )
}
