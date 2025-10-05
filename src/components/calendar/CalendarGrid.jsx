import React from 'react';
import DayCell from './DayCell';
import { isWithinInterval, parseISO } from 'date-fns';

export default function CalendarGrid({
  currentDate,
  selectedDate,
  activities,
  trips = [],
  onDateClick,
  onLongPressStart,
  onLongPressEnd,
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const cells = [];

  // Empty cells for days before month start
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-${i}`} className="h-12 md:h-16" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDate(date);
    
    // Check if day has activities
    const dayActivities = activities[dateKey] || [];
    const hasWorn = dayActivities.some(act => act.status === 'worn');
    const hasPlanned = dayActivities.some(act => act.status === 'planned');
    const activityCount = dayActivities.length;
    
    // Check if day is within a trip
    const isTrip = trips.some(trip => {
      try {
        return isWithinInterval(date, { 
          start: parseISO(trip.startDate), 
          end: parseISO(trip.endDate) 
        });
      } catch {
        return false;
      }
    });

    cells.push(
      <DayCell
        key={day}
        date={date}
        isSelected={date.toDateString() === selectedDate.toDateString()}
        isToday={date.toDateString() === new Date().toDateString()}
        hasWorn={hasWorn}
        hasPlanned={hasPlanned}
        isTrip={isTrip}
        activityCount={activityCount}
        onClick={onDateClick}
        onLongPressStart={onLongPressStart}
        onLongPressEnd={onLongPressEnd}
      />
    );
  }

  return <div className="grid grid-cols-7 gap-1">{cells}</div>;
}
