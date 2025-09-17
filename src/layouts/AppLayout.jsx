// src/layouts/AppLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useState } from 'react';
import AddClothModal from '../components/modal/AddClothModal';
import { useWardrobeStore } from '../stores/useWardrobeStore';

export default function AppLayout() {
  const { addCloth } = useWardrobeStore();
  const [isAddClothModalOpen, setAddClothModalOpen] = useState(false);
  const navigate = useNavigate();

  // This function will be called by the FAB in the BottomNav
  const handleLogWearClick = () => {
    navigate('/calendar?openAdd=1');
  };

  // This function will be passed to the modal
  const handleAddCloth = async (newClothData) => {
    await addCloth(newClothData);
    setAddClothModalOpen(false); // Close modal on success
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white dark:bg-black">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dark mode gradient */}
        <div
          className="hidden dark:block w-full h-full"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), #000000',
          }}
        />
        {/* Light mode gradient */}
        <div
          className="block dark:hidden w-full h-full"
          style={{
            background: 'radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #10b981 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        
        <BottomNav
          onAddClothClick={() => setAddClothModalOpen(true)}
          onLogWearClick={handleLogWearClick}
        />
      </div>

      {isAddClothModalOpen && (
        <AddClothModal
          open={isAddClothModalOpen}
          onClose={() => setAddClothModalOpen(false)}
          onAdd={handleAddCloth}
        />
      )}
    </div>
  );
}