import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useWardrobeStore } from '../stores/useWardrobeStore';
import AddActivityModal from '../components/modal/AddActivityModal';
import {CalendarHeader, WeekdayHeader, CalendarGrid, ActivityLog } from '../components/calendar';
import CalendarSkeleton from '../components/skeleton/CalendarSkeleton';

const formatDateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Calendar() {
  const {
    activities, trips, // trips data is available from the store
    isCalendarInitialized, addActivity, updateActivity, getActivityDetails, fetchAll,
  } = useCalendarStore();
  
  // Get outfits and clean clothes from wardrobe store
  const { outfits, clothes } = useWardrobeStore();
  const allAvailableClothes = clothes.filter(cloth => !cloth.isArchived); 
  const categories = useWardrobeStore(state => state.categories);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  // State for Edit and Copy functionality
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [activityToCopy, setActivityToCopy] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);

  const { date: dateFromParams } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const parseDateString = useCallback((dateStr) => {    
    if (!dateStr) return null;
    const parts = dateStr.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!isNaN(date.getTime())) return date;
    }
    return null;
  }, []);

  useEffect(() => {
    if (!isCalendarInitialized) fetchAll();
    
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
  }, [fetchAll, dateFromParams, searchParams, setSearchParams, parseDateString, isCalendarInitialized]);

  const handleModalClose = () => {
    setShowAddModal(false);
    setActivityToEdit(null);
    setActivityToCopy(null);
  };

  const handleEditActivity = (activity) => {
    setActivityToEdit(activity);
    setShowAddModal(true);
  };

  const handleCopyActivity = (activity) => {
    setActivityToCopy(activity);
    setShowAddModal(true);
  };

  const handleSubmitActivity = async (activityData) => {
    if (activityToEdit) {
      // Update existing activity
      await updateActivity(activityToEdit.id, activityData);
    } else {
      // Add new activity - Preserve the status from activityData
      const parsedDate = parseDateString(activityData?.date);
      const targetDate = parsedDate || selectedDate;
      const dateKey = formatDateKey(targetDate);
      await addActivity({ 
        ...activityData, 
        date: dateKey,
        status: activityData.status // Ensure status is preserved
      });
    }
    handleModalClose();
  };
  
  
  const handleLongPressStart = useCallback((date) => {
    const timer = setTimeout(() => {
      setSelectedDate(date);
      setShowAddModal(true);
    }, 700);
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
                trips={trips} // Pass trips data for emoji display
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
            onEditActivity={handleEditActivity}
            onCopyActivity={handleCopyActivity}
          />
        </div>
      </div>

      <AddActivityModal
        open={showAddModal}
        onClose={handleModalClose}
        date={selectedDate}
        outfits={outfits}
        clothes={allAvailableClothes}
        categories={categories}
        onSubmit={handleSubmitActivity}
        activityToEdit={activityToEdit}
        activityToCopy={activityToCopy}
      />
    </div>
  );
}