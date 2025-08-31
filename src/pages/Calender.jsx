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

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mock data
  const [activities, setActivities] = useState({
    '2025-08-31': [
      { id: '1', type: 'outfit', name: 'Casual Friday', time: '09:00', items: ['Blue Shirt', 'Black Jeans'] },
      { id: '2', type: 'cloth', name: 'White T-Shirt', time: '14:30', items: ['White T-Shirt'] }
    ],
    '2025-08-30': [
      { id: '3', type: 'outfit', name: 'Weekend Comfort', time: '10:15', items: ['Gray Hoodie', 'Sweatpants'] }
    ],
    '2025-08-29': [
      { id: '4', type: 'cloth', name: 'Navy Blazer', time: '08:45', items: ['Navy Blazer'] }
    ]
  });

  const mockOutfits = [
    { id: '1', name: 'Casual Friday', items: ['Blue Denim Shirt', 'Black Jeans'] },
    { id: '2', name: 'Weekend Comfort', items: ['Gray Hoodie', 'Sweatpants'] },
    { id: '3', name: 'Office Look', items: ['Navy Blazer', 'White Shirt'] },
    { id: '4', name: 'Summer Vibes', items: ['Floral Dress', 'Sandals'] }
  ];

  const mockClothes = [
    { id: '1', name: 'Blue Denim Shirt', category: 'Tops', status: 'clean' },
    { id: '2', name: 'Black Jeans', category: 'Bottoms', status: 'clean' },
    { id: '3', name: 'White T-Shirt', category: 'Tops', status: 'dirty' },
    { id: '4', name: 'Gray Hoodie', category: 'Outerwear', status: 'clean' },
    { id: '5', name: 'Navy Blazer', category: 'Outerwear', status: 'needs_pressing' },
    { id: '6', name: 'Red Dress', category: 'Dresses', status: 'clean' }
  ];

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
    const effectiveDate = activityData?.date instanceof Date && !isNaN(activityData.date) ? activityData.date : selectedDate;
    // Ensure UI reflects the date used
    setSelectedDate(effectiveDate);
    const dateStr = formatDate(effectiveDate);
    const newActivity = {
      id: Date.now().toString(),
      ...activityData,
      time: new Date().toTimeString().slice(0, 5)
    };
    setActivities((prev) => ({ ...prev, [dateStr]: [...(prev[dateStr] || []), newActivity] }));
    setShowAddModal(false);
  };

  // Render calendar days (moved into dedicated component props)
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
            {/* Calendar Header */}
            <CalendarHeader
              monthLabel={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              onPrev={() => navigateMonth(-1)}
              onNext={() => navigateMonth(1)}
            />

            {/* Calendar Grid */}
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

              {/* Quick Add Button */}
              {/* <button
                onClick={() => setShowAddModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>Add Activity for {selectedDate.toLocaleDateString()}</span>
              </button> */}
            </div>
          </div>
        </div>

        {/* Activity Log Section */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
            {/* Log Header */}
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

            {/* Activity List */}
            <div className="p-4">
              {activities[formatDate(selectedDate)]?.length > 0 ? (
                <div className="space-y-3">
                  {activities[formatDate(selectedDate)].map((activity) => (
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
                          {activity.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <Clock size={12} className="inline mr-1" />
                          {activity.time}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {activity.items.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
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

          {/* Quick Stats */}
          <div className="mt-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">This Month</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Activities Logged</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Object.values(activities).flat().length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Outfits Worn</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Object.values(activities).flat().filter(a => a.type === 'outfit').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Items Worn</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Object.values(activities).flat().filter(a => a.type === 'cloth').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal (common) */}
      <AddActivityModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        date={selectedDate}
        outfits={mockOutfits}
        clothes={mockClothes}
        onSubmit={(payload) => addActivity(payload)}
      />
    </div>
  );
}