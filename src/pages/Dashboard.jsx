import React, { useState, useEffect } from 'react'
import AnimatedPage from '../components/AnimatedPage'
import { Link } from 'react-router-dom'
import { AnalyticsService , SetupService} from '../services'
import { Card } from '../components/ui/Card'
import SectionHeader from '../components/ui/SectionHeader'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Initialize the app which creates default categories if none exist
    SetupService.initialize();

    // Fetch wardrobe stats
    const wardrobeStats = AnalyticsService.getWardrobeStats()
    setStats(wardrobeStats)
  }, [])

  if (!stats) {
    return <div>Loading...</div> // Or a proper loading spinner
  }

  return (
    <AnimatedPage>
      <div className="p-6 dark:text-white">
        <SectionHeader title="Dashboard" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Clothes" value={stats.totalClothes} />
          <StatCard title="Total Outfits" value={stats.totalOutfits} />
          <StatCard
            title="Clean"
            value={stats.cleanClothes}
            color="text-green-500"
          />
          <StatCard
            title="Dirty"
            value={stats.dirtyClothes}
            color="text-red-500"
          />
        </div>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickActionLink to="/calendar" title="View Calendar" />
          <QuickActionLink to="/laundry" title="Go to Laundry" />
          <QuickActionLink to="/profile" title="My Profile" />
        </div>

        {/* Recently Added */}
        <SectionHeader title="Recently Added" />
        {/* Placeholder for recently added clothes */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <p className="dark:text-white">No clothes added yet</p>
        </div>
      </div>
    </AnimatedPage>
  )
}

// Helper components for styling

const StatCard = ({ title, value, color = 'dark:text-white' }) => (
  <Card className="text-center">
    <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
      {title}
    </h4>
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
  </Card>
)

const QuickActionLink = ({ to, title }) => (
  <Link
    to={to}
    className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:scale-105 transition text-center"
  >
    <h4 className="text-xl font-semibold">{title}</h4>
  </Link>
)
