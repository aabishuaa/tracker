# EY AI Taskforce Tracker

A sophisticated, enterprise-grade project management tracker built as a single-page React application.

## Features

### ✨ Core Functionality
- **Action Items Management**: Track tasks with owners, taskforces, dates, statuses, and progress
- **Inline Editing**: Click any cell to edit in place with auto-save
- **Status Management**: Color-coded status pills (Not Started, In Progress, Blocked, Done)
- **Progress Tracking**: Visual progress bars that update based on status
- **Calendar & Events**: Mini calendar with upcoming events sidebar
- **CSV Export**: One-click export to CSV with auto-generated filename
- **Snapshot System**: Save and view historical snapshots of your tracker
- **LocalStorage Persistence**: All data automatically saved to browser storage

### 🎨 Design Features
- **EY Brand Colors**: Featuring EY Yellow (#FFE600) throughout
- **Garamond Typography**: Professional serif font (EB Garamond)
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessible**: Keyboard navigation and proper ARIA labels

### 🚀 Quick Start

1. **Open the tracker**: Simply open `index.html` in any modern web browser
2. **Start tracking**: Click any cell to edit, add new items with "+ Add Item"
3. **Manage events**: Use the calendar sidebar to add and view upcoming events
4. **Save snapshots**: Click "Save Snapshot" to preserve the current state
5. **Export data**: Click "Export CSV" to download all action items

### 📊 Usage Guide

#### Managing Action Items
- **Add Item**: Click "+ Add Item" button at bottom of table
- **Edit Field**: Click any cell to edit inline (auto-saves on blur)
- **Change Status**: Click status pill to open dropdown
- **Update Progress**: Edit any field to automatically update "last updated" timestamp
- **Group by Section**: Items are grouped by section (Planning, Execution, etc.)
- **Priority Colors**: Left border shows priority (Red=High, Orange=Medium, Green=Low)

#### Calendar & Events
- **Navigate Calendar**: Use arrows to move between months
- **Add Event**: Click "+ Add Event" button
- **Event Categories**: Meeting, Deadline, Review, Workshop
- **View Events**: Upcoming events displayed below calendar

#### Snapshots & History
- **Save Snapshot**: Creates timestamped copy of current state
- **View History**: Click "View History" to see all snapshots
- **Restore**: Click snapshot card to view details

#### Data Export
- **CSV Export**: Downloads file named `EY-AI-Taskforce-[Date].csv`
- **Includes**: All action items with task name, owner, taskforce, date, status, priority, section, progress, and notes

### 🎯 Sample Data

The tracker comes pre-loaded with sample data to demonstrate features:
- 3 action items across Planning and Execution sections
- 2 calendar events (meeting and deadline)

You can edit or delete these to start fresh.

### 💾 Data Persistence

All data is automatically saved to browser localStorage:
- Action items
- Calendar events
- Snapshots

**Note**: Data is stored locally in your browser. Clear browser data will erase all tracker data.

### 🌐 Browser Compatibility

Works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 📱 Responsive Breakpoints

- **Desktop** (1440px+): Full two-column layout
- **Tablet** (768px-1024px): Stacked columns
- **Mobile** (<768px): Single column, simplified view

### 🎨 Color Reference

- **EY Yellow**: #FFE600 (brand accent, buttons, highlights)
- **Primary Dark**: #2D3748 (text, UI elements)
- **Status Colors**:
  - Green (#48BB78): Done/Complete
  - Orange (#ED8936): In Progress
  - Red (#F56565): Blocked
  - Gray (#A0AEC0): Not Started

### 🔧 Technical Details

- **Framework**: React 18 (via CDN)
- **Styling**: Tailwind CSS + Custom CSS
- **Font**: EB Garamond (Google Fonts)
- **Icons**: Lucide Icons
- **Storage**: Browser localStorage
- **File Size**: ~43KB (single file)

### 📝 Notes

- No server or build process required
- All dependencies loaded via CDN
- Works offline after initial load
- Print-friendly styles included

---

**Created for EY AI Taskforce**
*Professional project management made simple*
