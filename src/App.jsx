// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {
  Landing,
  Login,
  Signup,
  Dashboard,
  Settings,
  Profile,
  Wardrobe,
  Laundry,
  Calendar,
  ErrorLayout,
  CategoryManagementPage,
  ClothDetailPage,
  OutfitDetailPage,
} from './pages'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import PublicLayout from './layouts/PublicLayout'
import { useEffect } from 'react'
import { useThemeStore } from './stores/useThemeStore'
import { useAuthStore } from './stores/useAuthStore'
import { useWardrobeStore } from './stores/useWardrobeStore'

export default function App() {
  useEffect(() => {
    useThemeStore.getState().initializeTheme()
  }, [])

  useEffect(() => {
    // We call the actions directly on the store's initial state
    // because we are outside a React component's render cycle.
    useAuthStore.getState().checkAuth()
    useThemeStore.getState().initializeTheme()
    useWardrobeStore.getState().fetchAll()
  }, [])

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- Public Routes --- */}
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* --- Protected Routes --- */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route
              path="/wardrobe/cloth/:clothId"
              element={<ClothDetailPage />}
            />{' '}
            <Route
              path="/wardrobe/outfit/:outfitId"
              element={<OutfitDetailPage />}
            />{' '}
            {/* Add this route */}
            // Add this route
            <Route path="/laundry" element={<Laundry />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/settings/categories"
              element={<CategoryManagementPage />}
            />
          </Route>

          {/* --- Not Found Route --- */}
          <Route path="*" element={<ErrorLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
