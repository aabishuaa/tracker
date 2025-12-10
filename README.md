# EY AI Taskforce Tracker

A production-quality single-page React application for tracking action items and events for the EY AI Taskforce. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Action Items Table**: Manage tasks with inline editing, priority levels, status tracking, and progress bars
- **Calendar Sidebar**: View and manage upcoming events with a mini calendar
- **Snapshot System**: Save and view historical snapshots of your data
- **CSV Export**: Export action items to CSV for reporting
- **LocalStorage Persistence**: All data is automatically saved to browser storage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

### Action Items

- Click any cell in the table to edit inline
- Click the status pill to change status
- Use the "+ Add Item" button to create new action items
- Items are automatically grouped by section (Planning, Execution, Discovery, Wrap-up)
- Priority is indicated by a colored left border (Red: High, Orange: Medium, Green: Low)

### Calendar Events

- View upcoming events in the sidebar
- Click "+ Add Event" to create new events
- Events are displayed with colored dots on the mini calendar
- Categories: Meeting, Deadline, Review, Workshop

### Snapshots

- Click "Save Snapshot" to save the current state
- Click "View History" to see all saved snapshots
- Snapshots include both action items and calendar events

### Export

- Click "Export CSV" to download action items as a CSV file
- File name format: `EY-AI-Taskforce-YYYY-MM-DD.csv`

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **LocalStorage API** - Data persistence

## Project Structure

```
src/
  components/
    ActionItemsTable/
      ActionItemsTable.tsx
      TableHeader.tsx
      TableRow.tsx
    CalendarSidebar/
      CalendarSidebar.tsx
      MiniCalendar.tsx
      EventCard.tsx
      AddEventModal.tsx
    SnapshotHistory/
      SnapshotHistoryPanel.tsx
    Header.tsx
    Toast.tsx
  hooks/
    useLocalStorage.ts
  types/
    index.ts
  utils/
    dateUtils.ts
    snapshotUtils.ts
    csvExport.ts
  styles/
    index.css
  App.tsx
  main.tsx
```

## Design Principles

- **EY Brand Colors**: Yellow (#FFE600) as primary accent
- **Enterprise UI**: Professional, clean design suitable for executive use
- **System Font**: Uses system-ui font stack for optimal performance
- **Accessibility**: Keyboard navigable, semantic HTML, ARIA labels
- **Micro-interactions**: Smooth transitions and hover effects

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright EY. All rights reserved.
