import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  ArrowLeft,
  Shield,
  HelpCircle,
  Camera,
  Edit3,
  Shirt,
  Layers,
  Grid3x3,
  Plus,
  Trash2,
  Activity,
  Filter,
  X
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import SettingsView from '../components/Profile/SettingsView';
import ClothesTabContent from '../components/Profile/ClothesTabContent';
import OutfitsTabContent from '../components/Profile/OutfitsTabContent';
import ActivityTabContent from '../components/Profile/ActivityTabContent';
import ProfileMainView from '../components/Profile/ProfileMainView';
import CategoriesView from '../components/Profile/CategoriesView';

export default function Profile() {
  const [currentView, setCurrentView] = useState('profile'); // 'profile', 'settings', 'categories'
  const [activeTab, setActiveTab] = useState('clothes'); // 'clothes', 'outfits', 'activity'
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData')) || {
    name: 'Hey User',
    email: 'user@clothcare.com',
    joinDate: 'January 1, 2022'
  });
  const [categories, setCategories] = useState(JSON.parse(localStorage.getItem('categories')) || ['Tops', 'Bottoms', 'Outerwear', 'Dresses']);
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('clothes', JSON.stringify(clothes));
    localStorage.setItem('outfits', JSON.stringify(outfits));
    localStorage.setItem('activity', JSON.stringify(activity));
  }, [userData, categories, clothes, outfits, activity]);

  const addClothes = (cloth) => {
    setClothes((prevClothes) => [...prevClothes, cloth]);
  };

  const updateClothes = (id, updatedCloth) => {
    setClothes((prevClothes) => prevClothes.map((cloth) => cloth.id === id ? updatedCloth : cloth));
  };

  const deleteClothes = (id) => {
    setClothes((prevClothes) => prevClothes.filter((cloth) => cloth.id !== id));
  };

  const addOutfits = (outfit) => {
    setOutfits((prevOutfits) => [...prevOutfits, outfit]);
  };

  const updateOutfits = (id, updatedOutfit) => {
    setOutfits((prevOutfits) => prevOutfits.map((outfit) => outfit.id === id ? updatedOutfit : outfit));
  };

  const deleteOutfits = (id) => {
    setOutfits((prevOutfits) => prevOutfits.filter((outfit) => outfit.id !== id));
  };

  const addActivity = (activityItem) => {
    setActivity((prevActivity) => [...prevActivity, activityItem]);
  };

  const updateActivity = (id, updatedActivityItem) => {
    setActivity((prevActivity) => prevActivity.map((item) => item.id === id ? updatedActivityItem : item));
  };

  const deleteActivity = (id) => {
    setActivity((prevActivity) => prevActivity.filter((item) => item.id !== id));
  };

  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const filteredClothes = selectedFilter === 'all'
    ? clothes
    : clothes.filter(cloth => cloth.category === selectedFilter);

  const addCategory = () => {
    const name = prompt('Enter category name:');
    if (name) {
      const newCategory = {
        id: Date.now().toString(),
        name,
        subcategories: [],
        wearCycle: 2
      };
      setCategories((prevCategories) => {
        const newCategories = [...prevCategories, newCategory];
        localStorage.setItem('categories', JSON.stringify(newCategories));
        return newCategories;
      });
    }
  };

  const deleteCategory = (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories((prevCategories) => {
        const newCategories = prevCategories.filter(cat => cat.id !== id);
        localStorage.setItem('categories', JSON.stringify(newCategories));
        return newCategories;
      });
    }
  };

  const addSubcategory = (categoryId) => {
    const name = prompt('Enter subcategory name:');
    if (name) {
      setCategories((prevCategories) => {
        const newCategories = prevCategories.map(cat =>
          cat.id === categoryId
            ? { ...cat, subcategories: [...cat.subcategories, name] }
            : cat
        );
        localStorage.setItem('categories', JSON.stringify(newCategories));
        return newCategories;
      });
    }
  };

  const updateWearCycle = (categoryId, newCycle) => {
    setCategories((prevCategories) => {
      const newCategories = prevCategories.map(cat =>
        cat.id === categoryId
          ? { ...cat, wearCycle: parseInt(newCycle) }
          : cat
      );
      localStorage.setItem('categories', JSON.stringify(newCategories));
      return newCategories;
    });
  };

  return (
    <AnimatedPage>
      {currentView === 'settings' && (
        <SettingsView onBack={() => setCurrentView('profile')} />
      )}

      {currentView === 'categories' && (
        <CategoriesView
          onBack={() => setCurrentView('profile')}
          categories={categories}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
          addSubcategory={addSubcategory}
          updateWearCycle={updateWearCycle}
        />
      )}

      {currentView === 'profile' && (
        <ProfileMainView
          userData={userData}
          profileImage={profileImage}
          onUploadImage={handleUploadImage}
          onGoCategories={() => setCurrentView('categories')}
          onGoSettings={() => setCurrentView('settings')}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredClothes={filteredClothes}
          categories={categories}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          mockOutfits={outfits}
          mockActivity={activity}
        />
      )}
    </AnimatedPage>
  );
}