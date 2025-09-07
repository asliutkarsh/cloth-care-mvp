// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Landing, Login, Signup, Dashboard, Settings, Profile, Wardrobe, Laundry, Calendar, ErrorLayout,
} from './pages';
import { AuthProvider } from './context/Authprovider';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import PublicLayout from './layouts/PublicLayout';
import { useEffect } from 'react';
import { useThemeStore } from './stores/useThemeStore';

export default function App() {
    useEffect(() => {
    useThemeStore.getState().initializeTheme();
  }, []);

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
            <Route path="/laundry" element={<Laundry />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* --- Not Found Route --- */}
          <Route path="*" element={<ErrorLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}