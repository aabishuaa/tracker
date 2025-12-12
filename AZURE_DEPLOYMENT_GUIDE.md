# EY AI Taskforce Tracker - Azure Deployment Guide

This guide will walk you through deploying the EY AI Taskforce Tracker to Microsoft Azure using **Azure Static Web Apps** (Free Tier).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start)
3. [Detailed Step-by-Step Guide](#detailed-step-by-step-guide)
4. [Sharing with Team Members](#sharing-with-team-members)
5. [Viewer Mode (Read-Only Access)](#viewer-mode-read-only-access)
6. [Updating Your Deployment](#updating-your-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Cost Information](#cost-information)

---

## 🎯 Prerequisites

Before you begin, make sure you have:

- ✅ A GitHub account (free) - [Sign up here](https://github.com/join)
- ✅ A Microsoft Azure account (free) - [Sign up here](https://azure.microsoft.com/free/)
- ✅ This repository pushed to your GitHub account
- ✅ 10 minutes of your time

---

## 🚀 Quick Start

### Option 1: Deploy via Azure Portal (Easiest - Recommended)

1. **Push this code to GitHub**
   ```bash
   git add .
   git commit -m "Add EY AI Taskforce Tracker"
   git push origin main
   ```

2. **Go to Azure Portal**
   - Visit [portal.azure.com](https://portal.azure.com)
   - Sign in with your Microsoft account

3. **Create Static Web App**
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"

4. **Fill in the details**
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new (e.g., "ey-taskforce-rg")
   - **Name**: Choose a unique name (e.g., "ey-ai-taskforce-tracker")
   - **Plan type**: Select "Free"
   - **Region**: Choose closest to you (e.g., "East US")
   - **Deployment source**: Select "GitHub"

5. **Connect to GitHub**
   - Click "Sign in with GitHub"
   - Authorize Azure to access your repositories
   - Select your organization and repository
   - Select the branch (usually "main" or "master")

6. **Build Details**
   - **Build Presets**: Select "Custom"
   - **App location**: `/` (root)
   - **Api location**: Leave empty
   - **Output location**: Leave empty

7. **Review + Create**
   - Click "Review + create"
   - Click "Create"

8. **Wait for Deployment** (2-5 minutes)
   - Azure will automatically deploy your app
   - Once complete, click "Go to resource"
   - You'll see your live URL (e.g., `https://your-app-name.azurestaticapps.net`)

---

## 📖 Detailed Step-by-Step Guide

### Step 1: Prepare Your Repository

1. Make sure all files are committed to your GitHub repository:
   ```bash
   git status
   git add .
   git commit -m "Prepare for Azure deployment"
   git push origin main
   ```

### Step 2: Create Azure Static Web App

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Microsoft account

2. **Create Resource**
   - Click the hamburger menu (☰) in the top-left
   - Click "Create a resource"
   - In the search box, type "Static Web App"
   - Click on "Static Web App" from the results
   - Click "Create"

3. **Configure Basic Settings**

   **Project Details:**
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Click "Create new" and name it `ey-taskforce-rg`

   **Static Web App Details:**
   - **Name**: `ey-ai-taskforce-tracker` (or your preferred name)
   - **Plan type**: **Free** (This is important for $0 cost)
   - **Region for Azure Functions and staging environments**: Choose the closest region
     - US: East US, West US, Central US
     - Europe: West Europe, North Europe
     - Asia: East Asia, Southeast Asia

4. **Configure GitHub Deployment**

   **Deployment details:**
   - Click "Sign in with GitHub"
   - A popup will appear - sign in to GitHub
   - Click "Authorize Azure-App-Service-Static-Web-Apps"

   **Build Details:**
   - **Organization**: Select your GitHub username/organization
   - **Repository**: Select your repository name
   - **Branch**: Select `main` (or `master` if that's your default branch)

5. **Build Configuration**

   - **Build Presets**: Select "Custom"
   - **App location**: `/` (forward slash)
   - **Api location**: Leave empty (no API)
   - **Output location**: Leave empty

6. **Review and Create**
   - Click "Review + create" at the bottom
   - Review your settings
   - Click "Create"

### Step 3: Monitor Deployment

1. **Wait for Deployment**
   - Deployment typically takes 2-5 minutes
   - You'll see "Deployment is in progress"
   - When complete, you'll see "Your deployment is complete"

2. **View Your App**
   - Click "Go to resource"
   - On the Overview page, you'll see your URL
   - Click the URL to open your live app
   - Example: `https://ey-ai-taskforce-tracker.azurestaticapps.net`

### Step 4: Verify GitHub Action

1. **Check GitHub Actions**
   - Go to your GitHub repository
   - Click the "Actions" tab
   - You should see a workflow run (green checkmark = success)
   - This workflow was automatically created by Azure

---

## 👥 Sharing with Team Members

### For Full Access (You - The Admin)

Use the main URL:
```
https://your-app-name.azurestaticapps.net
```

You can:
- ✅ Add action items
- ✅ Edit action items
- ✅ Delete action items
- ✅ Save snapshots
- ✅ Export to Excel

### For Read-Only Access (Your Team - Viewers)

Share this URL with your team members:
```
https://your-app-name.azurestaticapps.net?mode=view
```

They can:
- ✅ View all action items
- ✅ Search and filter items
- ✅ View calendar and events
- ✅ View snapshots
- ❌ Cannot add, edit, or delete items
- ❌ Cannot save snapshots or export

### Alternative Viewer URLs

You can also use these URL formats:
- `https://your-app-name.azurestaticapps.net?readonly=true`
- `https://your-app-name.azurestaticapps.net?viewer=true`

---

## 🔒 Viewer Mode (Read-Only Access)

### What is Viewer Mode?

Viewer mode is a read-only version of the tracker that allows team members to see all your updates without being able to make changes.

### How to Enable Viewer Mode

Simply add `?mode=view` to your URL:
```
https://your-app-name.azurestaticapps.net?mode=view
```

### What Viewers See

1. **Blue Banner**: A blue banner at the top indicating "Viewer Mode"
2. **All Data**: Complete view of all action items, calendar events, and snapshots
3. **Search & Filter**: Full search and filter capabilities
4. **No Edit Controls**: All add, edit, delete, and save buttons are hidden

### Best Practices for Sharing

1. **Keep Your Admin URL Private**
   - Only use `https://your-app-name.azurestaticapps.net` yourself
   - Don't share this with team members

2. **Share Viewer URL with Team**
   - Always share `https://your-app-name.azurestaticapps.net?mode=view`
   - Add to bookmarks or team documentation

3. **Create Short Links** (Optional)
   - Use [bit.ly](https://bitly.com) or [tinyurl.com](https://tinyurl.com)
   - Create a memorable short link for your team
   - Example: `bit.ly/ey-taskforce-view`

---

## 🔄 Updating Your Deployment

### Automatic Updates (Recommended)

Every time you push to GitHub, Azure automatically redeploys:

```bash
# Make your changes locally
# Edit files, add features, update data

# Commit and push
git add .
git commit -m "Update tracker with new items"
git push origin main

# Azure automatically deploys in 2-3 minutes
```

### Manual Updates via Azure Portal

1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to your Static Web App resource
3. Click "Deployment" in the left menu
4. View deployment history
5. Click "Redeploy" if needed

### Viewing Deployment Logs

1. Go to your GitHub repository
2. Click "Actions" tab
3. Click on the latest workflow run
4. View detailed logs of the deployment

---

## 🛠 Troubleshooting

### Issue: "Page Not Found" or 404 Error

**Solution:**
1. Check that `staticwebapp.config.json` exists in your repository root
2. Verify the build completed successfully in GitHub Actions
3. Wait 2-3 minutes after deployment
4. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: "Styles Not Loading" or Broken Layout

**Solution:**
1. Check that all files are in the correct directory structure
2. Verify in Azure Portal → Configuration → Path mappings
3. Check the browser console for errors (F12)
4. Ensure all paths in `index.html` are relative (not absolute)

### Issue: GitHub Action Failing

**Solution:**
1. Go to GitHub → Actions tab
2. Click on the failed workflow
3. Review error messages
4. Common fixes:
   - Make sure `azure_static_web_apps_api_token` secret is set
   - Check that branch name matches in workflow file
   - Verify `staticwebapp.config.json` is valid JSON

### Issue: Updates Not Showing

**Solution:**
1. Wait 2-3 minutes for deployment to complete
2. Check GitHub Actions to confirm deployment succeeded
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache
5. Try incognito/private browsing mode

### Issue: Data Not Persisting

**Important:** This app uses browser localStorage, which means:
- Data is stored locally in each user's browser
- Data is NOT shared between users automatically
- Each user has their own copy of data

**For Shared Data:**
- You would need to implement a backend database (not covered in free tier)
- Consider using Azure Cosmos DB (has free tier)
- Or implement a simple Azure Functions + Storage solution

### Issue: Viewer Mode Not Working

**Solution:**
1. Verify the URL includes `?mode=view`
2. Check that `viewerMode.js` is being loaded
3. Open browser console (F12) and look for errors
4. Clear browser cache and cookies

---

## 💰 Cost Information

### Azure Static Web Apps - Free Tier Includes:

✅ **Completely Free:**
- 100 GB bandwidth per month
- 0.5 GB storage
- Custom domain support
- Free SSL certificate
- Unlimited environments (for staging)

✅ **No Credit Card Required** (for free tier)

✅ **No Automatic Charges** (unless you upgrade)

### Staying Within Free Tier

**Usage Guidelines:**
- **Bandwidth**: 100 GB/month is enough for ~100,000 page views
- **Storage**: 0.5 GB is plenty for this simple app
- **Users**: Unlimited users can access your app

**Tips to Avoid Charges:**
1. Always select "Free" plan when creating resources
2. Set up billing alerts in Azure Portal
3. Regularly check Azure Cost Management
4. Delete unused resources

### Setting Up Billing Alerts

1. Go to [portal.azure.com](https://portal.azure.com)
2. Search for "Cost Management + Billing"
3. Click "Cost alerts"
4. Click "Add" → "Budget"
5. Set budget to $1 (or any small amount)
6. Get email alerts if costs approach limit

---

## 🎨 Features Overview

### ✨ New Features in This Deployment

1. **EY Branded Opening Animation**
   - Eye-catching yellow animation on page load
   - Professional EY branding
   - "AI Taskforce" tagline

2. **Viewer Mode**
   - Read-only access for team members
   - URL-based access control
   - Clean viewer interface

3. **Azure Deployment Ready**
   - Optimized for Azure Static Web Apps
   - Automatic CI/CD with GitHub Actions
   - Free tier compatible

### 📱 Application Features

- ✅ Action items tracking
- ✅ Calendar and events
- ✅ Project snapshots
- ✅ Excel export
- ✅ Rich text editing
- ✅ Search and filtering
- ✅ Responsive design
- ✅ Offline capable (localStorage)

---

## 📞 Support and Resources

### Azure Resources
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Free Services](https://azure.microsoft.com/free/)
- [Azure Support](https://azure.microsoft.com/support/options/)

### Community
- [Azure Static Web Apps GitHub](https://github.com/Azure/static-web-apps)
- [Stack Overflow - Azure Tag](https://stackoverflow.com/questions/tagged/azure-static-web-apps)

### Quick Links
- [Azure Portal](https://portal.azure.com)
- [GitHub Actions](https://github.com/features/actions)
- [Azure Status](https://status.azure.com/)

---

## 🎯 Next Steps

After deploying:

1. ✅ Share the viewer URL with your team
2. ✅ Bookmark your admin URL for yourself
3. ✅ Set up billing alerts
4. ✅ Test viewer mode functionality
5. ✅ Start tracking your action items!

---

## 📝 Notes

- **Data Privacy**: All data is stored in browser localStorage (client-side only)
- **No Backend**: This is a static app with no server-side processing
- **No Authentication**: URLs are public (use strong naming for security through obscurity)
- **For True Security**: Consider implementing Azure AD authentication (requires paid tier)

---

**Happy Tracking! 🚀**

If you encounter any issues, refer to the troubleshooting section or check the Azure documentation.
