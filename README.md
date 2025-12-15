# AI Taskforce Tracker

Enterprise project management tracker built with **vanilla HTML, CSS, and JavaScript**. No frameworks, no build tools, no dependencies.

![Yellow](https://img.shields.io/badge/Yellow-FFE600?style=for-the-badge)
![Azure](https://img.shields.io/badge/Azure-Ready-0089D6?style=for-the-badge&logo=microsoft-azure)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

## ✨ New Features

- 🎬 **EY Branded Opening Animation** - Eye-catching yellow animation with "AI Taskforce" branding
- 🔒 **Microsoft Entra ID Authentication (MSAL.js)** - Enterprise-grade auth with tenant restriction and allowlist (see [ENTRA_ID_SETUP.md](ENTRA_ID_SETUP.md))
- 👁️ **Viewer Mode** - Read-only access for team members (add `?mode=view` to URL)
- ☁️ **Azure Deployment Ready** - Optimized for Azure Static Web Apps (Free tier)
- 🔄 **Auto-Deploy with GitHub Actions** - Automatic deployment on git push
- 🛡️ **Server-Side Authorization** - Azure Function validates user access via allowlist

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

### Microsoft Entra ID Authentication (MSAL.js) - **Recommended**

Protect your deployment with enterprise-grade authentication using MSAL.js:

**👉 See [ENTRA_ID_SETUP.md](ENTRA_ID_SETUP.md) for complete setup**

**What you get:**
- ✅ Secure "Sign in with Microsoft" button
- ✅ Tenant-specific authentication (only @ey.com users)
- ✅ Server-side authorization with allowlist
- ✅ No secrets exposed to client
- ✅ Professional sign-in/access-denied screens
- ✅ Azure Function for access control

**Quick setup:**
1. Create Entra ID App Registration (tenant-specific)
2. Configure Client ID and Tenant ID in `js/utils/auth.js`
3. Set allowlist in Azure Static Web App configuration
4. Deploy!

**Legacy Option:** The previous Azure Static Web Apps built-in auth is documented in [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) (not recommended for new deployments).

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
├── staticwebapp.config.json           # Azure Static Web Apps configuration
├── README.md                          # This file
├── ENTRA_ID_SETUP.md                  # Entra ID (MSAL.js) auth setup guide
├── AZURE_DEPLOYMENT_GUIDE.md          # Deployment guide
├── AUTHENTICATION_GUIDE.md            # Legacy auth guide (SWA built-in)
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # Auto-deployment workflow
├── api/                               # Azure Functions API
│   ├── host.json                      # Functions runtime config
│   ├── package.json                   # API dependencies
│   └── authorize/
│       ├── function.json              # Function binding config
│       └── index.js                   # Authorization logic
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
        ├── auth.js                    # MSAL.js authentication
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
