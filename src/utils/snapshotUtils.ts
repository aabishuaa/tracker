import type { ActionItem, CalendarEvent, Snapshot } from '../types';

export const createSnapshot = (
  actionItems: ActionItem[],
  calendarEvents: CalendarEvent[]
): Snapshot => {
  const timestamp = new Date().toISOString();
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id: `snapshot-${Date.now()}`,
    timestamp,
    name: `Snapshot - ${formattedDate}`,
    actionItems: JSON.parse(JSON.stringify(actionItems)),
    calendarEvents: JSON.parse(JSON.stringify(calendarEvents)),
  };
};
