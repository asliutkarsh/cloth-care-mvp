import React, { useState, useEffect } from 'react'
import { Layers, Shirt } from 'lucide-react'
import { ActivityLogService, OutfitService, ClothService } from '../../services'

export default function ActivityTabContent() {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    // Get recent logs sorted by date
    const recentActivities = ActivityLogService.getAll().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    setActivities(recentActivities)
  }, [])

  const getActivityDetails = (activity) => {
    if (activity.type === 'outfit') {
      const outfit = OutfitService.getById(activity.outfitId)
      return {
        name: outfit?.name || 'Unnamed Outfit',
        type: 'outfit',
      }
    }

    const cloth = ClothService.getById(activity.clothIds[0])
    return {
      name: cloth?.name || 'Unnamed Item',
      type: 'item',
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.map((activity) => {
          const details = getActivityDetails(activity)
          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  details.type === 'outfit'
                    ? 'bg-blue-200 dark:bg-blue-800'
                    : 'bg-green-200 dark:bg-green-800'
                }`}
              >
                {details.type === 'outfit' ? (
                  <Layers
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                ) : (
                  <Shirt
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {details.type === 'outfit' ? 'Wore outfit:' : 'Wore item:'}{' '}
                  {details.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No activity logged yet.
          </p>
        </div>
      )}
    </div>
  )
}
