import React from 'react';
import type { CalendarEvent } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface EventCardProps {
  event: CalendarEvent;
}

const categoryColors: Record<string, string> = {
  Meeting: '#4299E1',
  Deadline: '#F56565',
  Review: '#9F7AEA',
  Workshop: '#48BB78',
};

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const color = event.color || categoryColors[event.category] || '#A0AEC0';

  return (
    <div
      className="event-card bg-white rounded-lg p-4 mb-3 border border-gray-200"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: color }}
        ></div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 mb-1 truncate">{event.title}</h4>
          <div className="text-sm text-gray-600 mb-2">
            {formatDate(event.date)}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {event.description}
          </p>
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {event.category}
          </span>
        </div>
      </div>
    </div>
  );
};
