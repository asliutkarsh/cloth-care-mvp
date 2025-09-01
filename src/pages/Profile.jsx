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
import SettingsView from '../components/Profile/SettingsView';
import ClothesTabContent from '../components/Profile/ClothTab/ClothesTabContent';
import OutfitsTabContent from '../components/Profile/OutfitTab/OutfitsTabContent';
import ActivityTabContent from '../components/Profile/ActivityTab/ActivityTabContent';
import ProfileMainView from '../components/Profile/ProfileMainView';
import CategoriesView from '../components/Profile/CategoriesView';
import Wardrobe from './Wardrobe';
import * as ClothService from '../services/clothService';
import * as OutfitService from '../services/outfitService';
import * as ActivityLogService from '../services/activityLogService';
import * as CategoryService from '../services/categoryService';
import * as AnalyticsService from '../services/analyticsService';

export default function Profile() {
  const [currentView, setCurrentView] = useState('profile'); // 'profile', 'settings', 'categories'
  const [activeTab, setActiveTab] = useState('clothes'); // 'clothes', 'outfits', 'activity'
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({
    name: 'Hey User',
    email: 'user@clothcare.com',
    joinDate: 'January 1, 2022',
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    AnalyticsService.getWardrobeStats().then((stats) => {
      setStats(stats);
    });
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
        return <Wardrobe />;
      case 'outfits':
        return <OutfitsTabContent />;
      case 'activity':
        return <ActivityTabContent />;
      default:
        return <Wardrobe />;
    }
  };

  if (currentView === 'settings') {
    return <SettingsView onBack={() => setCurrentView('profile')} />;
  }

  if (currentView === 'categories') {
    return <CategoriesView onBack={() => setCurrentView('profile')} />;
  }

  return (
    <AnimatedPage>
      <ProfileMainView
        userData={userData}
        profileImage={profileImage}
        stats={stats}
        onUploadImage={handleUploadImage}
        onGoCategories={() => setCurrentView('categories')}
        onGoSettings={() => setCurrentView('settings')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </ProfileMainView>
    </AnimatedPage>
  );
}