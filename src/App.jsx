// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import {
  Login, Signup, Dashboard, Settings, ManageFiltersPage,
  Profile, Wardrobe, Laundry, Calendar,Landing,
  ErrorLayout, CategoryManagementPage, ClothDetailPage, OutfitDetailPage,
  Insights, Trips, TripPlanner, SettingsInsightsPage, AboutPage, ChangelogPage,
} from './pages'
import Essentials from './pages/profile/Essentials'
import WardrobeSettings from './pages/profile/WardrobeSettings'
import PublicLayout from './layouts/PublicLayout'
import { useEffect } from 'react'
import { useThemeStore } from './stores/useThemeStore'
import { useAuthStore } from './stores/useAuthStore'
import { useWardrobeStore } from './stores/useWardrobeStore'
import { useSettingsStore } from './stores/useSettingsStore'
import BackupReminder from './components/BackupReminder'

export default function App() {
  useEffect(() => {
    // We call the actions directly on the store's initial state
    // because we are outside a React component's render cycle.
    useAuthStore.getState().checkAuth()
    useThemeStore.getState().initializeTheme()
    useWardrobeStore.getState().fetchAll()
    useSettingsStore.getState().fetchPreferences()
  }, [])

  return (
    <AuthProvider>
      <BackupReminder />
      <Router>
        <Routes>
          {/* --- Public Routes --- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* --- Protected Routes --- */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Profile Routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="profile/essentials" element={<Essentials />} />
            <Route path="profile/wardrobe-settings" element={<WardrobeSettings />} />
            <Route path="profile/categories" element={<CategoryManagementPage />} />
            <Route path="profile/filters" element={<ManageFiltersPage />} />

            {/* Other Routes */}
            <Route path="wardrobe" element={<Wardrobe />} />
            <Route path="wardrobe/cloth/:clothId" element={<ClothDetailPage />} />
            <Route path="wardrobe/outfit/:outfitId" element={<OutfitDetailPage />} />
            <Route path="laundry" element={<Laundry />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="insights" element={<Insights />} />
            <Route path="trips" element={<Trips />} />
            <Route path="trips/:tripId" element={<TripPlanner />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="about/changelog" element={<ChangelogPage />} />
            <Route path="settings/insights" element={<SettingsInsightsPage />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          {/* --- Not Found Route --- */}
          <Route path="*" element={<ErrorLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
