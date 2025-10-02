import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import AddClothModal from '../components/modal/AddClothModal';
import OutfitModal from '../components/modal/OutfitModal';
import ChangelogModal from '../components/modal/ChangelogModal';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { APP_VERSION } from '../app.config.js';
import BaseLayout from './BaseLayout';

export default function AppLayout() {
  const { addCloth, createOutfit } = useWardrobeStore();
  const [isAddClothModalOpen, setAddClothModalOpen] = useState(false);
  const [isOutfitModalOpen, setOutfitModalOpen] = useState(false);
  const [outfitInitialData, setOutfitInitialData] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const navigate = useNavigate();

  const handleLogWearClick = () => {
    navigate('/calendar?openAdd=1');
  };

  const handleAddCloth = async (newClothData) => {
    await addCloth(newClothData);
    setAddClothModalOpen(false);
  };

  useEffect(() => {
    const handler = () => setAddClothModalOpen(true);
    window.addEventListener('open-add-cloth', handler);
    return () => window.removeEventListener('open-add-cloth', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || null;
      setOutfitInitialData(detail || null);
      setOutfitModalOpen(true);
    };
    window.addEventListener('open-outfit-modal', handler);
    return () => window.removeEventListener('open-outfit-modal', handler);
  }, []);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    if (lastSeenVersion !== APP_VERSION) {
      setShowChangelog(true);
      localStorage.setItem('lastSeenVersion', APP_VERSION);
    }
  }, []);

  return (
    <BaseLayout>
      <Navbar />
      <div className="relative">
        <Sidebar />
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
          onClose={() => {
            setOutfitModalOpen(false);
            setOutfitInitialData(null);
          }}
          initialData={outfitInitialData}
          onSubmit={async (data) => {
            await createOutfit(data);
            setOutfitModalOpen(false);
            setOutfitInitialData(null);
          }}
        />
      )}

      {showChangelog && (
        <ChangelogModal open={showChangelog} onClose={() => setShowChangelog(false)} />
      )}
    </BaseLayout>
  );
}