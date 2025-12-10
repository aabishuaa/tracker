import { useState } from 'react';
import type { ActionItem, CalendarEvent, Snapshot } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createSnapshot } from './utils/snapshotUtils';
import { exportToCSV } from './utils/csvExport';
import { Header } from './components/Header';
import { ActionItemsTable } from './components/ActionItemsTable/ActionItemsTable';
import { CalendarSidebar } from './components/CalendarSidebar/CalendarSidebar';
import { AddEventModal } from './components/CalendarSidebar/AddEventModal';
import { SnapshotHistoryPanel } from './components/SnapshotHistory/SnapshotHistoryPanel';
import { Toast } from './components/Toast';

const initialActionItems: ActionItem[] = [
  {
    id: '1',
    description: 'Define AI strategy roadmap',
    owner: 'Sarah Chen',
    taskforce: ['Sarah Chen', 'John Doe'],
    date: '2025-12-15',
    status: 'In Progress',
    priority: 'High',
    section: 'Planning',
    progress: 65,
    notes: 'Waiting on stakeholder feedback',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    description: 'Research AI tools and platforms',
    owner: 'Michael Brooks',
    taskforce: ['Michael Brooks'],
    date: '2025-12-20',
    status: 'Done',
    priority: 'Medium',
    section: 'Planning',
    progress: 100,
    notes: 'Completed analysis report',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    description: 'Develop proof of concept',
    owner: 'Emily Watson',
    taskforce: ['Emily Watson', 'David Lee'],
    date: '2025-12-25',
    status: 'Not Started',
    priority: 'High',
    section: 'Execution',
    progress: 0,
    notes: '',
    lastUpdated: new Date().toISOString(),
  },
];

const initialCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'AI Strategy Review',
    date: '2025-12-15',
    description: 'Quarterly review of AI initiatives and progress',
    category: 'Meeting',
    color: '#4299E1',
  },
  {
    id: '2',
    title: 'POC Presentation Deadline',
    date: '2025-12-25',
    description: 'Final deadline for proof of concept presentation',
    category: 'Deadline',
    color: '#F56565',
  },
];

function App() {
  const [actionItems, setActionItems] = useLocalStorage<ActionItem[]>(
    'ey-action-items',
    initialActionItems
  );
  const [calendarEvents, setCalendarEvents] = useLocalStorage<CalendarEvent[]>(
    'ey-calendar-events',
    initialCalendarEvents
  );
  const [snapshots, setSnapshots] = useLocalStorage<Snapshot[]>('ey-snapshots', []);

  const [showHistory, setShowHistory] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleUpdateItem = (id: string, updatedItem: ActionItem) => {
    setActionItems((items) =>
      items.map((item) => (item.id === id ? updatedItem : item))
    );
  };

  const handleAddItem = () => {
    const newItem: ActionItem = {
      id: `item-${Date.now()}`,
      description: 'New task',
      owner: 'Unassigned',
      taskforce: ['Unassigned'],
      date: new Date().toISOString().split('T')[0],
      status: 'Not Started',
      priority: 'Medium',
      section: 'Planning',
      progress: 0,
      notes: '',
      lastUpdated: new Date().toISOString(),
    };
    setActionItems([...actionItems, newItem]);
    setToast('New item added');
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...event,
    };
    setCalendarEvents([...calendarEvents, newEvent]);
    setToast('Event added successfully');
  };

  const handleSaveSnapshot = () => {
    const snapshot = createSnapshot(actionItems, calendarEvents);
    setSnapshots([snapshot, ...snapshots]);
    setToast('Snapshot saved successfully');
  };

  const handleExportCSV = () => {
    exportToCSV(actionItems);
    setToast('Exported to CSV');
  };

  const handleViewSnapshot = (snapshot: Snapshot) => {
    alert(
      `Snapshot: ${snapshot.name}\n\nItems: ${snapshot.actionItems.length}\nEvents: ${snapshot.calendarEvents.length}\n\nNote: This is a read-only preview. Use "Restore" feature for full implementation.`
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header
        onSaveSnapshot={handleSaveSnapshot}
        onExportCSV={handleExportCSV}
        onViewHistory={() => setShowHistory(!showHistory)}
      />

      {showHistory && (
        <SnapshotHistoryPanel
          snapshots={snapshots}
          onView={handleViewSnapshot}
          onClose={() => setShowHistory(false)}
        />
      )}

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActionItemsTable
              items={actionItems}
              onUpdate={handleUpdateItem}
              onAdd={handleAddItem}
            />
          </div>

          <div>
            <CalendarSidebar
              events={calendarEvents}
              onAddEvent={() => setShowAddEvent(true)}
            />
          </div>
        </div>
      </main>

      {showAddEvent && (
        <AddEventModal
          onClose={() => setShowAddEvent(false)}
          onAdd={handleAddEvent}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
