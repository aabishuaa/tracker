# Microsoft Entra ID (Azure AD) Authentication Setup Guide

Complete guide for implementing MSAL.js authentication with Azure Static Web Apps and Azure Functions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Azure Setup](#azure-setup)
5. [Local Development](#local-development)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This application uses:
- **MSAL.js 2.x** (Microsoft Authentication Library) for client-side authentication
- **Azure Functions** for server-side authorization (allowlist checking)
- **Tenant-specific authority** to restrict login to your organization only
- **Simple allowlist** stored as environment variables (can be upgraded to Azure Table Storage)

### What This Gives You

✅ **Sign in with Microsoft** button on the UI
✅ **Tenant restriction** - only users from @ey.com (or your domain) can sign in
✅ **Authorization allowlist** - only approved users can access the app
✅ **Access denied screen** for unauthorized users
✅ **No secrets in client code** - allowlist stored server-side

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │────────▶│   MSAL.js    │────────▶│  Entra ID   │
│  (User)     │         │ (Frontend)   │         │ (Azure AD)  │
└─────────────┘         └──────────────┘         └─────────────┘
       │                                                 │
       │ 1. Get ID token                                │
       │◀────────────────────────────────────────────────┘
       │
       │ 2. Call /api/authorize with email
       │
       ▼
┌─────────────────────────────────────┐
│   Azure Function                    │
│   GET /api/authorize                │
│   - Validates email against list    │
│   - Returns allowed: true/false     │
└─────────────────────────────────────┘
       │
       │ 3. Returns authorization result
       │
       ▼
┌─────────────┐
│   App UI    │ ─▶ Show Main App or Access Denied
└─────────────┘
```

---

## Prerequisites

Before you begin, ensure you have:

- [ ] Azure subscription (free tier works fine)
- [ ] Permission to create App Registrations in Azure AD
- [ ] GitHub account (for deployment)
- [ ] Node.js 18+ and npm (for local development only)
- [ ] Azure Functions Core Tools (for local API testing)

---

## Azure Setup

### Step 1: Create Entra ID App Registration

1. **Go to Azure Portal**
   - Navigate to [portal.azure.com](https://portal.azure.com)
   - Search for "Azure Active Directory" or "Microsoft Entra ID"

2. **Create New App Registration**
   - Click **App registrations** → **+ New registration**
   - **Name**: `EY AI Taskforce Tracker` (or your preferred name)
   - **Supported account types**:
     - Choose **"Accounts in this organizational directory only (Single tenant)"**
     - This restricts to your organization (@ey.com users only)
   - **Redirect URI**:
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:4280` (for local dev)
     - Click **+ Add URI** and add: `https://YOUR-APP-NAME.azurestaticapps.net` (for production)
   - Click **Register**

3. **Note Important Values**

   After registration, copy these values (you'll need them later):

   - **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

4. **Configure Authentication**

   - Click **Authentication** in the left menu
   - Under **Implicit grant and hybrid flows**:
     - ✅ Check **Access tokens (used for implicit flows)**
     - ✅ Check **ID tokens (used for implicit and hybrid flows)**
   - Under **Advanced settings**:
     - Allow public client flows: **No**
   - Click **Save**

5. **Configure API Permissions**

   - Click **API permissions** in the left menu
   - You should see **Microsoft Graph - User.Read** (already added)
   - Click **+ Add a permission** → **Microsoft Graph** → **Delegated permissions**
   - Add these permissions:
     - ✅ `openid`
     - ✅ `profile`
     - ✅ `email`
     - ✅ `User.Read`
   - Click **Add permissions**
   - (Optional) Click **Grant admin consent** if you have permission

---

### Step 2: Create Azure Static Web App

1. **Create Resource**
   - In Azure Portal, click **+ Create a resource**
   - Search for **Static Web App**
   - Click **Create**

2. **Configure Basic Settings**
   - **Subscription**: Select your subscription
   - **Resource group**: Create new or use existing
   - **Name**: `ey-tracker` (or your preferred name)
   - **Plan type**: **Free** (perfect for this app)
   - **Region**: Choose closest to you (e.g., East US, West Europe)
   - **Source**: **GitHub** (sign in if prompted)

3. **Configure Build**
   - **Organization**: Your GitHub username/org
   - **Repository**: Select your forked repository
   - **Branch**: `main` or your deployment branch
   - **Build Presets**: **Custom**
   - **App location**: `/` (root)
   - **Api location**: `/api`
   - **Output location**: `/` (leave empty or use `/`)

4. **Review and Create**
   - Click **Review + create**
   - Click **Create**
   - Wait ~2 minutes for deployment

5. **Get Your URL**
   - After deployment, go to **Overview**
   - Copy the **URL**: `https://ey-tracker-xyz123.azurestaticapps.net`

---

### Step 3: Configure Application Settings (Azure Function Variables)

1. **Go to Your Static Web App**
   - In Azure Portal, navigate to your Static Web App
   - Click **Configuration** in the left menu

2. **Add Application Settings**

   Click **+ Add** and create these settings:

   | Name | Value | Description |
   |------|-------|-------------|
   | `ALLOWED_EMAILS` | `user1@ey.com,user2@ey.com` | Comma-separated list of allowed emails |
   | `ALLOWED_DOMAINS` | `ey.com` | (Optional) Allow all @ey.com users |
   | `REQUIRE_TENANT_ID` | `your-tenant-id-here` | (Optional) Enforce specific tenant |

   **Example configurations:**

   **Option A: Specific Users Only**
   ```
   ALLOWED_EMAILS = john.doe@ey.com,jane.smith@ey.com,admin@ey.com
   ALLOWED_DOMAINS = (leave empty)
   ```

   **Option B: All Users from Domain**
   ```
   ALLOWED_EMAILS = (leave empty)
   ALLOWED_DOMAINS = ey.com
   ```

   **Option C: Mixed (Specific + Domain)**
   ```
   ALLOWED_EMAILS = external.user@partner.com
   ALLOWED_DOMAINS = ey.com
   ```

3. **Save Configuration**
   - Click **Save** at the top
   - Wait ~30 seconds for settings to propagate

---

### Step 4: Update Frontend Configuration

1. **Edit `js/utils/auth.js`**

   Find this section near the top:

   ```javascript
   const msalConfig = {
       auth: {
           clientId: 'YOUR_CLIENT_ID_HERE',  // ← Replace this
           authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID_HERE',  // ← Replace this
           ...
       }
   };
   ```

2. **Replace with Your Values**

   ```javascript
   const msalConfig = {
       auth: {
           clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  // Your Application (client) ID
           authority: 'https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  // Your Directory (tenant) ID
           redirectUri: window.location.origin,
           postLogoutRedirectUri: window.location.origin,
           navigateToLoginRequestUrl: true
       },
       ...
   };
   ```

3. **Alternative: Use Environment Variables (Recommended)**

   For better security and flexibility, you can inject these values at build time or runtime using a config file:

   Create `public/config.js`:
   ```javascript
   window.ENV = {
       AZURE_CLIENT_ID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
       AZURE_AUTHORITY: 'https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
   };
   ```

   Add to `index.html` before MSAL.js:
   ```html
   <script src="/config.js"></script>
   ```

---

## Local Development

### Setup Local Environment

1. **Install Dependencies**

   ```bash
   # Install Azure Static Web Apps CLI
   npm install -g @azure/static-web-apps-cli

   # Install Azure Functions Core Tools (if not installed)
   # macOS:
   brew tap azure/functions
   brew install azure-functions-core-tools@4

   # Windows:
   npm install -g azure-functions-core-tools@4
   ```

2. **Create Local Settings**

   Create `api/local.settings.json`:

   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "ALLOWED_EMAILS": "your.email@ey.com,test.user@ey.com",
       "ALLOWED_DOMAINS": "ey.com",
       "REQUIRE_TENANT_ID": ""
     }
   }
   ```

3. **Update `auth.js` for Local Development**

   Make sure redirectUri points to localhost:
   ```javascript
   clientId: window.ENV?.AZURE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
   authority: window.ENV?.AZURE_AUTHORITY || 'https://login.microsoftonline.com/YOUR_TENANT_ID_HERE',
   ```

4. **Run Locally**

   ```bash
   # Start SWA CLI (serves frontend + API)
   swa start . --api-location ./api
   ```

   This will:
   - Serve frontend at `http://localhost:4280`
   - Serve API at `http://localhost:7071/api`
   - Proxy API calls from frontend to function

5. **Test Authentication**

   - Open `http://localhost:4280`
   - Click "Sign in with Microsoft"
   - Sign in with your @ey.com account
   - You should see the main app if you're on the allowlist

---

## Configuration

### Authorization Options

The `/api/authorize` function supports multiple authorization strategies:

#### Option 1: Email Allowlist (Recommended for Small Teams)

```bash
# In Azure Portal → Static Web App → Configuration
ALLOWED_EMAILS = john.doe@ey.com,jane.smith@ey.com,admin@ey.com
```

**Best for**: Teams with < 20 users

#### Option 2: Domain Allowlist (Recommended for Organizations)

```bash
ALLOWED_DOMAINS = ey.com,partner-company.com
```

**Best for**: Allowing all users from your organization

#### Option 3: Combined

```bash
ALLOWED_EMAILS = external.consultant@company.com
ALLOWED_DOMAINS = ey.com
```

**Best for**: Mix of internal + external users

#### Option 4: Open Access (No Restrictions)

Leave both empty:
```bash
ALLOWED_EMAILS =
ALLOWED_DOMAINS =
```

**Best for**: Public apps (anyone with Azure AD can access)

### Tenant Enforcement

To prevent personal Microsoft accounts from accessing:

```bash
REQUIRE_TENANT_ID = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

This ensures only users from your specific Azure AD tenant can authenticate.

---

## Deployment

### Automatic Deployment (GitHub Actions)

The app auto-deploys when you push to your configured branch:

```bash
git add .
git commit -m "Configure Entra ID authentication"
git push origin main
```

GitHub Actions will:
1. Build the frontend
2. Deploy to Azure Static Web Apps
3. Deploy the API functions
4. Deploy completes in ~2-3 minutes

### Manual Deployment

If needed, deploy manually:

```bash
# Install SWA CLI if not installed
npm install -g @azure/static-web-apps-cli

# Deploy (you'll be prompted to sign in)
swa deploy --app-location . --api-location api --deployment-token YOUR_DEPLOYMENT_TOKEN
```

Get deployment token from: Azure Portal → Static Web App → Manage deployment token

---

## Testing

### Test Checklist

- [ ] **Unauthenticated Access**
  - Open app in incognito window
  - Should show "Sign in with Microsoft" screen

- [ ] **Authorized User Login**
  - Sign in with email on allowlist
  - Should see main application
  - User email shown in top-right header

- [ ] **Unauthorized User Login**
  - Sign in with email NOT on allowlist
  - Should see "Access Not Granted" screen
  - Should show user's email and denial message

- [ ] **Sign Out**
  - Click "Sign Out" button
  - Should return to sign-in screen
  - User should be logged out of Microsoft

- [ ] **Tenant Restriction** (if configured)
  - Try signing in with personal Microsoft account
  - Should be rejected at login (not app level)

### Testing API Locally

Test the authorize function directly:

```bash
# Start functions
cd api
func start

# Test in another terminal
curl -X POST http://localhost:7071/api/authorize \
  -H "Content-Type: application/json" \
  -d '{"email": "test.user@ey.com", "name": "Test User", "tenantId": "your-tenant-id"}'
```

Expected response:
```json
{
  "allowed": true,
  "user": {
    "email": "test.user@ey.com",
    "name": "Test User"
  },
  "message": "Access granted via email allowlist"
}
```

---

## Troubleshooting

### Issue: "AADSTS50011: Redirect URI mismatch"

**Cause**: Redirect URI in App Registration doesn't match your app URL

**Solution**:
1. Go to Azure Portal → App Registrations → Your App
2. Click **Authentication**
3. Under **Single-page application**, add:
   - `http://localhost:4280` (for local dev)
   - `https://YOUR-APP-NAME.azurestaticapps.net` (for production)
4. Click **Save**

### Issue: "User signed in but sees Access Denied immediately"

**Cause**: Email not in allowlist or domain not configured

**Solution**:
1. Check Azure Portal → Static Web App → Configuration
2. Verify `ALLOWED_EMAILS` or `ALLOWED_DOMAINS` includes the user
3. Check API logs: Static Web App → Functions → authorize → Invocations
4. Look for authorization check logs

### Issue: "CORS error when calling /api/authorize"

**Cause**: API not allowing requests from frontend

**Solution**:
- The function already includes CORS headers
- If using SWA, CORS is handled automatically
- For local dev, make sure you're using `swa start` (not separate servers)

### Issue: "User can't sign in - gets error at Microsoft login"

**Cause**: App Registration not configured correctly or tenant restriction

**Solution**:
1. Verify App Registration exists
2. Check **Supported account types** is set correctly
3. If tenant-restricted, make sure user is from correct tenant
4. Check API permissions are granted

### Issue: "API returns 500 error"

**Cause**: Missing environment variables or syntax error

**Solution**:
1. Check Azure Portal → Static Web App → Configuration
2. Verify all required settings exist
3. Check Function logs in Azure Portal
4. Test locally with `api/local.settings.json`

### Issue: "Changes not taking effect"

**Cause**: Browser cache or deployment not complete

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Check GitHub Actions for deployment status
4. Wait 2-3 minutes after config changes

### Issue: "Personal Microsoft accounts can still sign in"

**Cause**: Authority uses `/common` or multi-tenant app registration

**Solution**:
1. Update `authority` in `auth.js` to use your tenant ID:
   ```javascript
   authority: 'https://login.microsoftonline.com/YOUR-TENANT-ID-HERE'
   ```
2. In App Registration, change to **Single tenant** under **Authentication**

---

## Security Best Practices

1. **Use Tenant-Specific Authority**
   - Always use your tenant ID, not `/common`
   - Prevents personal Microsoft accounts

2. **Implement Allowlist**
   - Even with tenant restriction, use email/domain allowlist
   - Defense in depth

3. **Rotate Secrets** (if you add any in future)
   - Set expiration dates
   - Rotate before expiry
   - Use Azure Key Vault for sensitive data

4. **Monitor Access**
   - Review Function logs regularly
   - Check who's accessing via Azure AD sign-in logs
   - Set up alerts for unusual activity

5. **Use Azure Table Storage for Allowlist** (Optional Enhancement)
   - For large teams (>50 users)
   - Easier to manage than environment variables
   - Can add UI for admins to manage

---

## Next Steps

After successful setup:

1. ✅ Test with multiple users
2. ✅ Add more users to allowlist as needed
3. ✅ Monitor Function logs for unauthorized attempts
4. ✅ Consider implementing Azure Table Storage for allowlist
5. ✅ Set up Application Insights for monitoring
6. ✅ Configure MFA requirements in Azure AD (optional but recommended)

---

## Additional Resources

- [MSAL.js Documentation](https://learn.microsoft.com/entra/identity-platform/msal-overview)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure Functions JavaScript Guide](https://learn.microsoft.com/azure/azure-functions/functions-reference-node)
- [Microsoft Entra ID Documentation](https://learn.microsoft.com/entra/identity/)

---

**Your app is now secured with enterprise-grade Microsoft Entra ID authentication! 🔒**

For questions or issues, refer to the troubleshooting section or create an issue in the repository.
