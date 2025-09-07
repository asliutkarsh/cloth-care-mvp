// src/components/calendar/CalendarGrid.jsx
import React from 'react';
import DayCell from './DayCell'; // 1. Import the new component

export default function CalendarGrid({
  currentDate,
  selectedDate,
  activities,
  onDateClick,
  onLongPressStart,
  onLongPressEnd,
}) {
  // --- All calendar logic now lives inside the grid ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const formatDate = (date) => date.toISOString().split('T')[0];

  const cells = [];

  // Add blank cells for the days before the first of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-${i}`} className="h-12 md:h-16" />);
  }

  // Add a DayCell for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    cells.push(
      <DayCell
        key={day}
        date={date}
        isSelected={date.toDateString() === selectedDate.toDateString()}
        isToday={date.toDateString() === new Date().toDateString()}
        hasActivity={activities[formatDate(date)]?.length > 0}
        onClick={onDateClick}
        onLongPressStart={onLongPressStart}
        onLongPressEnd={onLongPressEnd}
      />
    );
  }

  return <div className="grid grid-cols-7 gap-1">{cells}</div>;
}