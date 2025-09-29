import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import AddActivityModal from '../components/modal/AddActivityModal';
import {CalendarHeader, WeekdayHeader, CalendarGrid, ActivityLog } from '../components/calendar';
import { BookOpenCheck } from 'lucide-react';
import CalendarSkeleton from '../components/skeleton/CalendarSkeleton';

const formatDateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Calendar() {
  // --- Get data and actions from Zustand stores ---
  const {
    activities, outfits, cleanClothes, fetchAll: fetchCalendarData, addActivity,
    getActivityDetails, isCalendarInitialized
  } = useCalendarStore();
  
  // Get categories from the main wardrobe store to pass to the modal
  const categories = useWardrobeStore(state => state.categories);

  // --- Local UI state for navigation and interaction ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);

  const { date: dateFromParams } = useParams(); // For /calendar/YYYY-MM-DD
  const [searchParams, setSearchParams] = useSearchParams(); // For /calendar?openAdd=1

  // Helper to safely parse date strings and avoid timezone bugs
  const parseDateString = useCallback((dateStr) => {    
    if (!dateStr) return null;
    const parts = dateStr.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!isNaN(date.getTime())) return date;
    }
    return null;
  }, []);

  // --- Fetch initial data and handle routing effects ---
  useEffect(() => {
    fetchCalendarData();
    
    const parsedDate = parseDateString(dateFromParams);
    if (parsedDate) {
      setCurrentDate(parsedDate);
      setSelectedDate(parsedDate);
    }
    
    if (searchParams.get('openAdd') === '1') {
      const dateFromQuery = parseDateString(searchParams.get('date'));
      if (dateFromQuery) setSelectedDate(dateFromQuery);
      setShowAddModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [fetchCalendarData, dateFromParams, searchParams, setSearchParams, parseDateString]);

  const handleAddActivity = async (activityData) => {
    const parsedDate = parseDateString(activityData?.date);
    const targetDate = parsedDate || selectedDate;
    const dateKey = formatDateKey(targetDate);
    await addActivity({ ...activityData, date: dateKey });
    setShowAddModal(false);
  };
  
  const handleLongPressStart = useCallback((date) => {
    const timer = setTimeout(() => {
      setSelectedDate(date);
      setShowAddModal(true);
    }, 700); // 700ms delay
    setLongPressTimer(timer);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  if (!isCalendarInitialized) {
    return <CalendarSkeleton />;
  }

  const selectedDateKey = formatDateKey(selectedDate);
  const activitiesForSelectedDate = activities[selectedDateKey] || [];

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card p-0">
            <CalendarHeader
              monthLabel={`${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`}
              onPrev={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              onNext={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            />
            <div className="p-4">
              <WeekdayHeader />
              <CalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                activities={activities}
                onDateClick={setSelectedDate}
                onLongPressStart={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <ActivityLog
            selectedDate={selectedDate}
            activitiesForDay={activitiesForSelectedDate}
            getActivityDetails={getActivityDetails}
            onAddActivity={() => setShowAddModal(true)}
          />
        </div>
      </div>

      <AddActivityModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        date={selectedDate}
        time={null}
        outfits={outfits}
        clothes={cleanClothes}
        categories={categories}
        onSubmit={handleAddActivity}
      />
    </div>
  );
}