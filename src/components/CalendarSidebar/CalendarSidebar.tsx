import React from 'react';
import type { CalendarEvent } from '../../types';
import { MiniCalendar } from './MiniCalendar';
import { EventCard } from './EventCard';

interface CalendarSidebarProps {
  events: CalendarEvent[];
  onAddEvent: () => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  events,
  onAddEvent,
}) => {
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Upcoming Events
        </h2>
        <MiniCalendar events={events} />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="text-center py-8 text-gray-500">
            No upcoming events
          </div>
        )}
      </div>

      <button
        onClick={onAddEvent}
        className="button-hover w-full py-3 bg-ey-yellow text-gray-900 font-bold rounded-lg flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span>
        Add Event
      </button>
    </div>
  );
};
