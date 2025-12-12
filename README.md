# AI Taskforce Tracker

Enterprise project management tracker built with **vanilla HTML, CSS, and JavaScript**. No frameworks, no build tools, no dependencies.

![Yellow](https://img.shields.io/badge/Yellow-FFE600?style=for-the-badge)
![Azure](https://img.shields.io/badge/Azure-Ready-0089D6?style=for-the-badge&logo=microsoft-azure)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

## ✨ New Features

- 🎬 **EY Branded Opening Animation** - Eye-catching yellow animation with "AI Taskforce" branding
- 🔒 **Azure AD Authentication** - Secure access with enterprise email login (see [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md))
- 👁️ **Viewer Mode** - Read-only access for team members (add `?mode=view` to URL)
- ☁️ **Azure Deployment Ready** - Optimized for Azure Static Web Apps (Free tier)
- 🔄 **Auto-Deploy with GitHub Actions** - Automatic deployment on git push

## Features

- **Action Items Management**: Create, edit, and track tasks with full details
- **Calendar Events**: Schedule and view upcoming events with mini calendar
- **Snapshot History**: Save and view historical states of your project
- **Excel Export**: Export action items to Excel format
- **Local Storage**: All data persists in browser localStorage
- **Sorting**: Sort table columns by clicking headers
- **Rich Text Editing**: Full-featured text editor for notes
- **Responsive Design**: Works on desktop and mobile devices
- **Search & Filter**: Quickly find specific action items

## 🚀 Quick Start

### For Azure Deployment (Recommended for Team Use)

**👉 See [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md) for complete deployment instructions**

Deploy to Azure in 5 minutes:
1. Push this code to GitHub
2. Create Azure Static Web App (Free tier)
3. Connect to your repository
4. Share the viewer URL with your team!

**Benefits:**
- ✅ Free hosting (Azure Free tier)
- ✅ Automatic updates on git push
- ✅ Team can view via shared link
- ✅ Professional deployment

### For Local Development

#### Option 1: Python HTTP Server (Recommended)
```bash
python3 -m http.server 8080
```

Then open your browser to: http://localhost:8080

#### Option 2: Direct File Access
Simply open `index.html` in your browser (some features may be limited)

#### Option 3: Any HTTP Server
Use any static file server of your choice:
```bash
# Using Node's http-server (npm install -g http-server)
http-server -p 8080

# Using PHP
php -S localhost:8080
```

## 🔒 Authentication & Security

### Azure AD Authentication (Optional but Recommended)

Protect your deployment with enterprise-grade authentication:

**👉 See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for complete setup**

**What you get:**
- ✅ Secure login with Microsoft/work email
- ✅ Restrict access to specific users or domains
- ✅ Free tier compatible (no additional costs)
- ✅ Professional authentication UI
- ✅ Login/logout functionality

**Quick setup:**
1. Create Azure AD App Registration
2. Add secrets to your Static Web App
3. Configure allowed users in `js/utils/auth.js`
4. Deploy!

Without authentication, anyone with your URL can access the app.

---

## 👥 Team Collaboration

### For Admins (You)
Use the main URL to manage the tracker:
```
https://your-app-name.azurestaticapps.net
```

### For Team Members (Viewers)
Share the viewer URL with your team:
```
https://your-app-name.azurestaticapps.net?mode=view
```
They can view all data but cannot make changes.

**Viewer mode features:**
- ✅ View all action items, calendar, and snapshots
- ✅ Search and filter
- ✅ Blue banner indicates read-only mode
- ❌ Cannot add, edit, or delete items

**Note:** When authentication is enabled, all users (including viewers) must log in first.

## Project Structure

```
tracker/
├── index.html                          # Main HTML structure
├── styles.css                          # All styling including animations
├── staticwebapp.config.json           # Azure configuration (includes auth)
├── README.md                          # This file
├── AZURE_DEPLOYMENT_GUIDE.md          # Deployment guide
├── AUTHENTICATION_GUIDE.md            # Authentication setup guide
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # Auto-deployment workflow
└── js/
    ├── core/
    │   ├── app.js                     # Main application logic
    │   └── state.js                   # State management
    ├── components/
    │   ├── actionItems.js             # Action items functionality
    │   ├── calendar.js                # Calendar functionality
    │   └── snapshots.js               # Snapshot functionality
    ├── services/
    │   └── storage.js                 # LocalStorage management
    ├── ui/
    │   ├── modals.js                  # Modal dialogs
    │   ├── tabs.js                    # Tab navigation
    │   └── toast.js                   # Toast notifications
    └── utils/
        ├── auth.js                    # Azure AD authentication & authorization
        ├── editors.js                 # Rich text editor setup
        ├── helpers.js                 # Helper functions
        └── viewerMode.js              # Viewer mode functionality
```

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
- Click **"Export to Excel"** to download action items
- Opens with Excel, Google Sheets, or any spreadsheet application
- Full formatting and styling preserved

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

## 🎨 EY Branding

The application features:
- **EY Yellow (#FFE600)** as the primary accent color
- Professional opening animation with EY branding
- "AI Taskforce" tagline and branding throughout

## 💰 Azure Deployment Cost

**Azure Static Web Apps - Free Tier:**
- ✅ $0/month for up to 100GB bandwidth
- ✅ No credit card required
- ✅ Free SSL certificate
- ✅ Perfect for team collaboration

See [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md) for details.

## 🛠 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Styling**: Custom CSS with animations
- **Rich Text**: Quill.js
- **Charts**: Chart.js
- **Excel Export**: SheetJS
- **Hosting**: Azure Static Web Apps (optional)
- **CI/CD**: GitHub Actions (optional)

## 📞 Support

For deployment help, see:
- [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)

## License

Copyright EY. All rights reserved.

---

**🚀 Ready to deploy? See [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md) to get started!**
