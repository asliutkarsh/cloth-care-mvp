// src/layouts/AppLayout.jsx (Updated)

import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import AddClothModal from '../components/modal/AddClothModal';
import OutfitModal from '../components/modal/OutfitModal';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import BaseLayout from './BaseLayout'; // Use the new BaseLayout

export default function AppLayout() {
  const { addCloth, createOutfit } = useWardrobeStore();
  const [isAddClothModalOpen, setAddClothModalOpen] = useState(false);
  const [isOutfitModalOpen, setOutfitModalOpen] = useState(false);
  const [outfitInitialData, setOutfitInitialData] = useState(null);
  const navigate = useNavigate();

  const handleLogWearClick = () => {
    navigate('/calendar?openAdd=1');
  };

  const handleAddCloth = async (newClothData) => {
    await addCloth(newClothData);
    setAddClothModalOpen(false);
  };

  // Allow other components to request opening the AddCloth modal via a window event
  useEffect(() => {
    const handler = () => setAddClothModalOpen(true);
    window.addEventListener('open-add-cloth', handler);
    return () => window.removeEventListener('open-add-cloth', handler);
  }, []);

  // Global handler to open Outfit modal
  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || null;
      setOutfitInitialData(detail || null);
      setOutfitModalOpen(true);
    };
    window.addEventListener('open-outfit-modal', handler);
    return () => window.removeEventListener('open-outfit-modal', handler);
  }, []);

  return (
    <BaseLayout>
      <Navbar />
      {/* Desktop Sidebar and shifted content */}
      <div className="relative">
        <Sidebar />
        {/* Add padding-bottom to prevent content from being hidden by the fixed BottomNav; shift content on desktop */}
        <main className="flex-1 pb-24 md:pb-0 md:ml-60">
          <Outlet />
        </main>
      </div>
      
      <BottomNav
        onAddClothClick={() => setAddClothModalOpen(true)}
        onLogWearClick={handleLogWearClick}
      />

      {isAddClothModalOpen && (
        <AddClothModal
          open={isAddClothModalOpen}
          onClose={() => setAddClothModalOpen(false)}
          onAdd={handleAddCloth}
        />
      )}

      {isOutfitModalOpen && (
        <OutfitModal
          open={isOutfitModalOpen}
          onClose={() => { setOutfitModalOpen(false); setOutfitInitialData(null); }}
          initialData={outfitInitialData}
          onSubmit={async (data) => {
            await createOutfit(data)
            setOutfitModalOpen(false)
            setOutfitInitialData(null)
          }}
        />
      )}
    </BaseLayout>
  );
}