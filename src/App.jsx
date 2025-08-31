import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Wardrobe from "./pages/Wardrobe";
import Laundry from "./pages/Laundry";
import CareTips from "./pages/CareTips";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Calender from "./pages/Calender";
import AddNewCloth from "./pages/AddNewCloth";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wardrobe"
              element={
                <ProtectedRoute>
                  <Wardrobe />
                </ProtectedRoute>
              }
            />
            <Route
              path="/laundry"
              element={
                <ProtectedRoute>
                  <Laundry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/care"
              element={
                <ProtectedRoute>
                  <CareTips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calender"
              element={
                <ProtectedRoute>
                  <Calender />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddNewCloth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            >
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
