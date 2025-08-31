import React from 'react';
import { User, Camera, Edit3, Grid3x3, Settings as SettingsIcon } from 'lucide-react';
import Button from '../common/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../common/Tabs';

export default function ProfileMainView({
  userData,
  profileImage,
  stats,
  onUploadImage,
  onGoCategories,
  onGoSettings,
  activeTab,
  setActiveTab,
  children,
}) {
  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => document.getElementById('profileImageInput').click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                >
                  <Camera size={12} />
                </button>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={onUploadImage}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{userData.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member since {userData.joinDate}</p>
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Edit3 size={16} />
              </button>
            </div>

            {/* Quick Stats - Desktop */}
            {stats && (
              <div className="hidden md:flex gap-6 ml-auto">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{stats.totalClothes}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Clothes</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{stats.totalOutfits}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Outfits</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{stats.totalActivities}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Activities</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" className="flex-1 gap-2" onClick={onGoCategories}>
              <Grid3x3 size={16} />
              <span className="text-sm">Categories</span>
            </Button>
            <Button variant="secondary" className="flex-1 gap-2" onClick={onGoSettings}>
              <SettingsIcon size={16} />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="clothes">Clothes</TabsTrigger>
            <TabsTrigger value="outfits">Outfits</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Content Area */}
          <div className="p-4">
            {children}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
