import React, { useState } from 'react';
import type { CalendarEvent } from '../../types';

interface MiniCalendarProps {
  events: CalendarEvent[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const hasEvent = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    return events.some((event) => event.date === dateStr);
  };

  const days: JSX.Element[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-date"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <div
        key={day}
        className={`calendar-date ${isToday(day) ? 'today' : ''} ${
          hasEvent(day) ? 'has-event' : ''
        }`}
      >
        {day}
      </div>
    );
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          className="text-gray-600 hover:text-gray-900 p-1 text-lg"
        >
          ←
        </button>
        <h3 className="font-bold text-lg">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          className="text-gray-600 hover:text-gray-900 p-1 text-lg"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">{days}</div>
    </div>
  );
};
