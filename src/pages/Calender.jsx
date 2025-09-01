import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Shirt,
  Layers,
  Clock,
  CalendarDays
} from 'lucide-react';
import AddActivityModal from '../components/activity/AddActivityModal';
import CalendarHeader from '../components/calendar/CalendarHeader';
import WeekdayHeader from '../components/calendar/WeekdayHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as ActivityLogService from '../services/activityLogService';
import * as OutfitService from '../services/outfitService';
import * as ClothService from '../services/clothService';


export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [activities, setActivities] = useState({});
  const [outfits, setOutfits] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      // Make sure these service methods return promises
      const [allActivities, allOutfits, cleanClothes] = await Promise.all([
        ActivityLogService.getAll(),
        OutfitService.getAll(),
        ClothService.getCleanClothes()
      ]);

      // Ensure allActivities is an array before using reduce
      const activitiesArray = Array.isArray(allActivities) ? allActivities : [];
      const groupedActivities = activitiesArray.reduce((acc, activity) => {
        if (!activity || !activity.date) return acc;
        const date = activity.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      }, {});

      setActivities(groupedActivities);
      setOutfits(Array.isArray(allOutfits) ? allOutfits : []);
      setClothes(Array.isArray(cleanClothes) ? cleanClothes : []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      // Set default empty values on error
      setActivities({});
      setOutfits([]);
      setClothes([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calendar helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDate = (date) => date.toISOString().split('T')[0];
  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
  const hasActivity = (date) => (activities[formatDate(date)]?.length ?? 0) > 0;

  const navigateMonth = (direction) =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));

  const handleDateClick = (date) => setSelectedDate(date);

  const handleLongPressStart = (date) => {
    const timer = setTimeout(() => {
      setSelectedDate(date);
      setShowAddModal(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Global event from FAB
  useEffect(() => {
    const handler = (e) => {
      const dateFromEvent = e?.detail?.date;
      if (dateFromEvent instanceof Date) setSelectedDate(dateFromEvent);
      setShowAddModal(true);
    };
    window.addEventListener('open-add-activity', handler);
    return () => window.removeEventListener('open-add-activity', handler);
  }, []);

  // Deep link support: /calender?openAdd=1&date=YYYY-MM-DD
  useEffect(() => {
    const openAdd = searchParams.get('openAdd');
    const dateStr = searchParams.get('date');
    if (openAdd === '1') {
      let parsed = new Date();
      if (dateStr) {
        const candidate = new Date(dateStr);
        if (!isNaN(candidate.getTime())) parsed = candidate;
      }
      setSelectedDate(parsed);
      setShowAddModal(true);
      // Clear params to avoid reopening on navigation
      navigate('/calender', { replace: true });
    }
  }, [searchParams, navigate]);

  const addActivity = (activityData) => {
    try {
      const effectiveDate = activityData?.date instanceof Date && !isNaN(activityData.date) ? activityData.date : selectedDate;
      
      // Ensure items is always an array
      const items = Array.isArray(activityData?.items) ? activityData.items : [];
      
      ActivityLogService.logActivity({
        ...activityData,
        items, // Use the validated items array
        date: formatDate(effectiveDate),
      });
      
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error adding activity:', error);
    } finally {
      setShowAddModal(false);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const getActivityDetails = (activity) => {
    if (!activity) {
      return { name: 'Unknown', items: [] };
    }

    if (activity.type === 'outfit') {
      const outfit = activity.outfitId ? OutfitService.getById(activity.outfitId) : null;
      const outfitClothes = activity.outfitId ? OutfitService.getClothesInOutfit(activity.outfitId) : [];
      return {
        name: outfit?.name || 'Outfit',
        items: Array.isArray(outfitClothes) 
          ? outfitClothes.map(c => c?.name).filter(Boolean) 
          : []
      };
    } else {
      const clothIds = Array.isArray(activity.clothIds) ? activity.clothIds : [];
      const firstCloth = clothIds.length > 0 ? ClothService.getById(clothIds[0]) : null;
      
      return {
        name: firstCloth?.name || 'Item',
        items: clothIds
          .map(id => {
            const cloth = ClothService.getById(id);
            return cloth?.name;
          })
          .filter(Boolean)
      };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
            <CalendarHeader
              monthLabel={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              onPrev={() => navigateMonth(-1)}
              onNext={() => navigateMonth(1)}
            />
            <div className="p-4">
              <WeekdayHeader />
              <CalendarGrid
                daysInMonth={daysInMonth}
                firstDay={firstDay}
                currentDate={currentDate}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
                onLongPressStart={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
                isToday={isToday}
                isSameDay={isSameDay}
                hasActivity={hasActivity}
              />
            </div>
          </div>
        </div>

        {/* Activity Log Section */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={20} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedDate.toLocaleDateString()}
                </h3>
              </div>
              {isToday(selectedDate) && (
                <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                  Today
                </span>
              )}
            </div>

            <div className="p-4">
              {activities[formatDate(selectedDate)]?.length > 0 ? (
                <div className="space-y-3">
                  {activities[formatDate(selectedDate)].map((activity) => {
                    const details = getActivityDetails(activity);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${activity.type === 'outfit'
                          ? 'bg-blue-200 dark:bg-blue-800'
                          : 'bg-green-200 dark:bg-green-800'
                          }`}>
                          {activity.type === 'outfit' ? (
                            <Layers size={16} className="text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Shirt size={16} className="text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {details.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <Clock size={12} className="inline mr-1" />
                            {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {details.items.join(', ')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarDays size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">No outfits logged for this date</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs">Long press on a date to add an activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddActivityModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        date={selectedDate}
        outfits={outfits}
        clothes={clothes}
        onSubmit={(payload) => addActivity(payload)}
      />
    </div>
  );
}