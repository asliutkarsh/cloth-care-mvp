// src/layouts/AppLayout.jsx (Updated)

import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import AddClothModal from '../components/modal/AddClothModal';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import BaseLayout from './BaseLayout'; // Use the new BaseLayout

export default function AppLayout() {
  const { addCloth } = useWardrobeStore();
  const [isAddClothModalOpen, setAddClothModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogWearClick = () => {
    navigate('/calendar?openAdd=1');
  };

  const handleAddCloth = async (newClothData) => {
    await addCloth(newClothData);
    setAddClothModalOpen(false);
  };

  return (
    <BaseLayout>
      <Navbar />
      {/* Add padding-bottom to prevent content from being hidden by the fixed BottomNav */}
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      
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
    </BaseLayout>
  );
}