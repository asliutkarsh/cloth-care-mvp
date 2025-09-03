import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { FilePlus, BookPlus } from 'lucide-react';
import FabMenu from '../components/common/FabMenu';
import AddClothModal from '../components/AddClothModal';
import * as ClothService from '../services/clothService';

export default function AppLayout() {
  const { user } = useAuth();
  const { currentTheme, getThemeConfig } = useTheme();
  const [openAdd, setOpenAdd] = useState(false);
  const navigate = useNavigate();
  
  const themeConfig = getThemeConfig();

  const handleAddClick = () => setOpenAdd(true);

  const addCloth = async (cloth) => {
    try {
      const response = await ClothService.create(cloth);
      console.log('Cloth added:', response);
      // Optionally: show toast or refresh cloth list
    } catch (error) {
      console.error('Error adding cloth:', error);
      // Optionally: show error toast
    }
  };

  const handleLogClick = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    navigate(`/calender?openAdd=1&date=${encodeURIComponent(todayStr)}`);
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${themeConfig.background}`}>
      {/* Dynamic theme-based background */}
      {currentTheme === 'dark' && (
        <>
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), #000000",
            }}
          />
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 20%, rgba(0, 0, 0, 0.0) 60%)`,
            }}
          />
        </>
      )}
      
      {/* Light theme backgrounds */}
      {currentTheme === 'light' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #10b981, transparent)`,
            backgroundSize: `100% 100%`,
          }}
        />
      )}
      
      {/* Emerald theme background */}
      {currentTheme === 'emerald' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%)`,
          }}
        />
      )}
      
      {/* Ocean theme background */}
      {currentTheme === 'ocean' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59, 130, 246, 0.15), transparent 70%)`,
          }}
        />
      )}
      
      {/* Sunset theme background */}
      {currentTheme === 'sunset' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249, 115, 22, 0.15), transparent 70%)`,
          }}
        />
      )}
      
      {/* Forest theme background */}
      {currentTheme === 'forest' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34, 197, 94, 0.15), transparent 70%)`,
          }}
        />
      )}

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Mobile BottomNav */}
        {user && (
          <div className="md:hidden">
            <BottomNav />
          </div>
        )}

        {/* Desktop FAB */}
        {user && (
          <div className="hidden md:block fixed bottom-4 right-4">
            <FabMenu
              translateX={8}
              actions={[
                { label: 'Add Item', icon: FilePlus, onClick: handleAddClick },
                { label: 'Log Outfit', icon: BookPlus, onClick: handleLogClick },
              ]}
            />
          </div>
        )}
      </div>

      {/* Add Cloth Modal */}
      {openAdd && (
        <AddClothModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onAdd={(item) => {
            addCloth(item);
            setOpenAdd(false);
          }}
        />
      )}
    </div>
  );
}
