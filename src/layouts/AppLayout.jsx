import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { CirclePlus, FilePlus, BookPlus } from 'lucide-react';
import FabMenu from '../components/common/FabMenu'
import AddClothModal from '../components/AddClothModal'

export default function AppLayout() {
  // Optional: could be used later for contextual UI changes by route
  // const location = useLocation();
  const { user } = useAuth();

  const [openAdd, setOpenAdd] = useState(false);

  const navigate = useNavigate();

  const handleAddClick = () => {
    setOpenAdd(true);
  };

  const addCloth = (item) => {
    console.log('Added cloth:', item);
  };


  const handleLogClick = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    navigate(`/calender?openAdd=1&date=${encodeURIComponent(todayStr)}`);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white dark:bg-black">
      {/* Light mode background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none block dark:hidden"
        style={{
          backgroundImage: `radial-gradient(circle at center, #10b981, transparent)`,
          backgroundSize: `100% 100%`,
        }}
      />

      {/* Dark mode background (Emerald Void) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), #000000",
        }}
      />

      {/* Dark mode emerald spotlight overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block"
        style={{
          background: `radial-gradient(circle at center, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 20%, rgba(0, 0, 0, 0.0) 60%)`,
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        {/* Mobile bottom navigation for logged-in users */}
        {user && <BottomNav className="md:hidden" />}

        {/* Desktop FAB for logged-in users */}
        {user &&
          <div className="fixed right-4 bottom-4">
            <FabMenu
              className="justify-end"
              actions={[
                { label: 'Add New', icon: FilePlus, onClick: handleAddClick },
                { label: 'Log Outfit', icon: BookPlus, onClick: handleLogClick },
              ]}
            />
          </div>
        }
      </div>
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
