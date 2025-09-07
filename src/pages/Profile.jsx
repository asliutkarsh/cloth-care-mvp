import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  ArrowLeft,
  Shirt,
  Layers,
  Grid3x3,
  Activity,
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ClothesTabContent from '../components/Profile/ClothesTabContent';
import OutfitsTabContent from '../components/Profile/OutfitsTabContent';
import ActivityTabContent from '../components/Profile/ActivityTabContent';
import ProfileMainView from '../components/Profile/ProfileMainView';
import {
  ClothService,
  OutfitService,
  ActivityLogService,
  CategoryService,
  AnalyticsService,
} from '../services';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [currentView, setCurrentView] = useState('profile'); // 'profile', 'settings', 'categories'
  const [activeTab, setActiveTab] = useState('clothes'); // 'clothes', 'outfits', 'activity'
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'Hey User',
    email: 'user@clothcare.com',
    joinDate: 'January 1, 2022',
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(AnalyticsService.getWardrobeStats());
  }, []);

  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'clothes':
        return <ClothesTabContent />;
      case 'outfits':
        return <OutfitsTabContent />;
      case 'activity':
        return <ActivityTabContent />;
      default:
        return <ClothesTabContent />;
    }
  };

  return (
    <AnimatedPage>
      <ProfileMainView
        userData={userData}
        profileImage={profileImage}
        stats={stats}
        onUploadImage={handleUploadImage}
        onGoCategories={() => setCurrentView('categories')}
        onGoSettings={() => navigate('/settings')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </ProfileMainView>
    </AnimatedPage>
  );
}