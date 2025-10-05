import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import ClothModal from '../components/modal/ClothModal';
import OutfitModal from '../components/modal/OutfitModal';
import ImportModal from '../components/modal/ImportModal';
import ChangelogModal from '../components/modal/ChangelogModal';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import { APP_VERSION } from '../app.config.js';
import BaseLayout from './BaseLayout';
import { useModalStore, ModalTypes } from '../stores/useModalStore';

export default function AppLayout() {
  const { addCloth, createOutfit, updateCloth } = useWardrobeStore();
  const [showChangelog, setShowChangelog] = useState(false);
  const navigate = useNavigate();
  const currentModal = useModalStore((s) => s.currentModal);
  const modalProps = useModalStore((s) => s.modalProps);
  const closeModal = useModalStore((s) => s.closeModal);

  const handleLogWearClick = () => {
    navigate('/calendar?openAdd=1');
  };

  const handleSubmitCloth = async (data) => {
    // If initialData present, treat as edit; otherwise add
    if (modalProps?.initialData?.id) {
      await updateCloth(modalProps.initialData.id, data);
    } else {
      await addCloth(data);
    }
    closeModal();
  };

  const handleAddOutfit = async (newOutfitData) => {
    await createOutfit(newOutfitData);
    closeModal();
  };

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    if (lastSeenVersion !== APP_VERSION) {
      setShowChangelog(true);
      localStorage.setItem('lastSeenVersion', APP_VERSION);
    }
  }, []);

  const renderModal = () => {
    if (!currentModal) return null;
    if (currentModal === ModalTypes.ADD_CLOTH) {
      return (
        <ClothModal
          open={true}
          onClose={closeModal}
          onSubmit={handleSubmitCloth}
          initialData={modalProps?.initialData}
        />
      );
    }
    if (currentModal === ModalTypes.ADD_OUTFIT) {
      return (
        <OutfitModal
          open={true}
          onClose={closeModal}
          onSubmit={handleAddOutfit}
          initialData={modalProps?.initialData}
        />
      );
    }
    if (currentModal === ModalTypes.IMPORT_DATA) {
      return (
        <ImportModal open={true} onClose={closeModal} />
      );
    }
    return null;
  };

  return (
    <BaseLayout>
      <Navbar />
      <div className="relative">
        <Sidebar />
        <main className="flex-1 pb-24 md:pb-0 md:ml-60">
          <Outlet />
        </main>
      </div>

      <BottomNav onLogWearClick={handleLogWearClick} />

      {renderModal()}

      {showChangelog && (
        <ChangelogModal open={showChangelog} onClose={() => setShowChangelog(false)} />
      )}
    </BaseLayout>
  );
}