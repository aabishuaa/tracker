# EY AI Taskforce Tracker

Enterprise project management tracker built with **vanilla HTML, CSS, and JavaScript**. No frameworks, no build tools, no dependencies.

## Features

- **Action Items Management**: Create, edit, and track tasks with full details
- **Calendar Events**: Schedule and view upcoming events with mini calendar
- **Snapshot History**: Save and view historical states of your project
- **CSV Export**: Export action items to CSV format
- **Local Storage**: All data persists in browser localStorage
- **Sorting**: Sort table columns by clicking headers
- **Inline Editing**: Edit any field directly in the table
- **Responsive Design**: Works on desktop and mobile devices

## How to Run

### Option 1: Python HTTP Server (Recommended)
```bash
npm run dev
# or
python3 -m http.server 8080
```

Then open your browser to: http://localhost:8080

### Option 2: Direct File Access
Simply open `index.html` in your browser (some features may be limited)

### Option 3: Any HTTP Server
Use any static file server of your choice:
```bash
# Using Node's http-server (npm install -g http-server)
http-server -p 8080

# Using PHP
php -S localhost:8080
```

## Project Structure

```
tracker/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── app.js          # Application logic
├── package.json    # Project metadata
└── README.md       # This file
```

Simple. Clean. Just three files.

## Usage

### Action Items
- Click **"+ Add Item"** to create a new task
- Edit any field directly in the table (description, owner, date, status, priority, section, progress, notes)
- Click column headers to **sort** by that column
- Track progress with the progress bar and percentage input
- Delete items with the **Delete** button
- All changes are **automatically saved** to localStorage

### Calendar Events
- Click **"+ Add Event"** to create a new calendar event
- Fill in title, date, description, category, and color
- View events in chronological order in the sidebar
- Mini calendar shows current month with dots on days that have events
- Events are color-coded by category

### Snapshots
- Click **"Save Snapshot"** to capture current state
- View history by clicking **"History"** button
- Each snapshot includes all action items and calendar events
- Snapshots are stored locally in your browser

### Export
- Click **"Export CSV"** to download action items as CSV
- Opens with Excel, Google Sheets, or any CSV reader
- File format: `ey-action-items-YYYY-MM-DD.csv`

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Data Storage

All data is stored in browser localStorage:
- `ey-action-items`: Action items data
- `ey-calendar-events`: Calendar events data
- `ey-snapshots`: Snapshot history

**Note**: Data is stored locally in your browser. Clearing browser data will delete all stored information.

## No Build Required ⚡

This application uses **zero dependencies** and requires **no build process**. It's pure HTML, CSS, and JavaScript that runs directly in the browser.

- No Node.js required (except for dev server)
- No npm install needed
- No compilation or transpilation
- No framework overhead
- No complex tooling
- Just open and run

## Why Vanilla?

- **Performance**: No framework overhead, instant load times
- **Simplicity**: Easy to understand, modify, and maintain
- **Portability**: Works anywhere with a browser
- **Zero Dependencies**: No security vulnerabilities from packages
- **Future-Proof**: No framework migrations needed
- **Learning**: Great for understanding web fundamentals

## License

Copyright EY. All rights reserved.
