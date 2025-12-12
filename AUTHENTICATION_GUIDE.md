# Azure AD Authentication Setup Guide

This guide explains how to set up Azure Active Directory authentication for your EY AI Taskforce Tracker deployment.

---

## 🔒 What's Included

With Azure AD authentication enabled:
- ✅ **Only authenticated users can access** your app
- ✅ **Enterprise email login** (e.g., yourname@ey.com)
- ✅ **Optional email allowlist** - restrict to specific users
- ✅ **Optional domain allowlist** - allow anyone from your organization
- ✅ **Login/Logout UI** - professional authentication interface
- ✅ **User info display** - shows who's logged in
- ✅ **Free tier compatible** - works on Azure Static Web Apps free tier

---

## 📋 Prerequisites

Before you begin:
- ✅ Your app is already deployed to Azure Static Web Apps
- ✅ You have access to the Azure Portal
- ✅ You have permissions to create App Registrations in Azure AD

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Azure AD App Registration

1. **Go to Azure Portal**
   - Visit [portal.azure.com](https://portal.azure.com)
   - Sign in with your Microsoft account

2. **Navigate to Azure Active Directory**
   - Click the hamburger menu (☰)
   - Select "Azure Active Directory"

3. **Create App Registration**
   - Click "App registrations" in the left menu
   - Click "+ New registration"

4. **Fill in the details**
   - **Name**: `EY AI Taskforce Tracker` (or your preferred name)
   - **Supported account types**: Select one of:
     - "Accounts in this organizational directory only" (Single tenant - **Recommended** for enterprise)
     - "Accounts in any organizational directory" (Multi-tenant)
   - **Redirect URI**:
     - Type: `Web`
     - URI: `https://YOUR-APP-NAME.azurestaticapps.net/.auth/login/aad/callback`
     - Replace `YOUR-APP-NAME` with your actual Static Web App name
   - Click "Register"

5. **Note Important Values**
   After registration, you'll see:
   - **Application (client) ID** - Copy this value
   - **Directory (tenant) ID** - Copy this value

### Step 2: Create Client Secret

1. **In your App Registration**
   - Click "Certificates & secrets" in the left menu
   - Click "+ New client secret"

2. **Add Secret**
   - **Description**: `Static Web App Auth`
   - **Expires**: `24 months` (recommended)
   - Click "Add"

3. **Copy the Secret Value**
   - ⚠️ **IMPORTANT**: Copy the secret **VALUE** immediately
   - You won't be able to see it again!
   - Store it securely

### Step 3: Configure API Permissions (Optional but Recommended)

1. **In your App Registration**
   - Click "API permissions" in the left menu
   - By default, you have `User.Read` permission

2. **For email access** (if not already present)
   - Click "+ Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Check `User.Read` and `email`
   - Click "Add permissions"
   - Click "Grant admin consent" (if you have permission)

### Step 4: Add Secrets to Azure Static Web App

1. **Go to your Static Web App**
   - Navigate to your Static Web App in Azure Portal
   - Click "Configuration" in the left menu

2. **Add Application Settings**
   Click "+ Add" and create these two settings:

   **Setting 1:**
   - **Name**: `AZURE_AD_CLIENT_ID`
   - **Value**: Paste the Application (client) ID from Step 1

   **Setting 2:**
   - **Name**: `AZURE_AD_CLIENT_SECRET`
   - **Value**: Paste the secret value from Step 2

3. **Save**
   - Click "Save" at the top
   - Wait for the configuration to update (30-60 seconds)

### Step 5: Deploy Your Changes

Your code already has authentication configured! Just push to your repository:

```bash
git add .
git commit -m "Add Azure AD authentication"
git push origin YOUR-BRANCH-NAME
```

Wait 2-3 minutes for the GitHub Action to deploy.

---

## 🎯 Restricting Access to Specific Users

You can control who can access your app by editing `/js/utils/auth.js`.

### Option A: Allow Specific Email Addresses (Recommended)

Edit `js/utils/auth.js` and add emails to the allowlist:

```javascript
const AUTHORIZED_EMAILS = [
    'john.doe@ey.com',
    'jane.smith@ey.com',
    'admin@ey.com',
];
```

**How it works:**
- Only users with these exact email addresses can access the app
- Others will see "Access Denied" even after logging in
- Easy to manage for small teams

### Option B: Allow Entire Domain

Edit `js/utils/auth.js`:

```javascript
const ALLOW_DOMAIN_MODE = true;
const ALLOWED_DOMAINS = [
    'ey.com',
];
```

**How it works:**
- Anyone with an @ey.com email can access
- Great for larger organizations
- Less maintenance required

### Option C: Allow All Authenticated Users (Default)

Leave both arrays empty:

```javascript
const AUTHORIZED_EMAILS = [];
const ALLOW_DOMAIN_MODE = false;
```

**How it works:**
- Any user who can authenticate with Azure AD gets access
- No additional restrictions
- Simplest configuration

---

## 🔧 Advanced Configuration

### Using Your Organization's Specific Tenant

By default, the configuration uses `https://login.microsoftonline.com/common`, which allows any Microsoft account.

To restrict to **only your organization's Azure AD tenant**:

1. Edit `staticwebapp.config.json`
2. Find the `openIdIssuer` line
3. Replace `common` with your **Tenant ID**:

```json
"openIdIssuer": "https://login.microsoftonline.com/YOUR-TENANT-ID"
```

Example:
```json
"openIdIssuer": "https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012"
```

**Benefits:**
- Only users from your specific Azure AD tenant can authenticate
- Prevents personal Microsoft accounts from accessing
- More secure for enterprise environments

---

## ✅ Testing Your Authentication

### Test 1: Unauthenticated Access

1. Open your app URL in an **incognito/private window**
2. You should be **immediately redirected** to Microsoft login
3. If not, check your `staticwebapp.config.json` routes

### Test 2: Authorized User

1. Log in with an email from your allowlist
2. You should see:
   - Your email displayed in the header
   - A "Logout" button
   - Full access to all features

### Test 3: Unauthorized User (if using allowlist)

1. Log in with an email NOT in your allowlist
2. You should see:
   - "Access Denied" message
   - Your email displayed
   - "Logout and try another account" button
   - No access to the app features

---

## 🛠 Troubleshooting

### Issue: "AADSTS50011: The redirect URI specified does not match"

**Solution:**
- Go to your App Registration in Azure AD
- Click "Authentication"
- Verify the Redirect URI exactly matches: `https://YOUR-APP-NAME.azurestaticapps.net/.auth/login/aad/callback`
- Make sure there are no trailing slashes or typos

### Issue: "Configuration error" or "Invalid client secret"

**Solution:**
- Go to Azure Portal → Your Static Web App → Configuration
- Verify `AZURE_AD_CLIENT_ID` and `AZURE_AD_CLIENT_SECRET` are set correctly
- Make sure you copied the secret **VALUE**, not the ID
- If secret expired, create a new one and update the configuration

### Issue: Infinite redirect loop

**Solution:**
- Clear your browser cookies and cache
- Try in incognito/private mode
- Check that your `staticwebapp.config.json` has the correct route configuration
- Verify the App Registration redirect URI is correct

### Issue: "Access Denied" for authorized users

**Solution:**
- Check the email in `js/utils/auth.js` matches exactly (case-insensitive)
- Make sure you pushed the latest code with updated allowlist
- Check browser console (F12) for error messages
- Verify the user's email claim is being returned by Azure AD

### Issue: Personal Microsoft accounts can access

**Solution:**
- Update `openIdIssuer` to use your specific tenant ID instead of `common`
- In App Registration, change "Supported account types" to "Single tenant"

---

## 🔐 Security Best Practices

### 1. Use Specific Tenant ID
Replace `common` with your organization's tenant ID to prevent personal accounts.

### 2. Implement Email Allowlist
For sensitive data, use the email allowlist feature in `auth.js`.

### 3. Rotate Secrets Regularly
- Create new client secrets before old ones expire
- Update Azure Static Web App configuration
- Delete old secrets after updating

### 4. Monitor Access
- Review Azure AD sign-in logs regularly
- Check who's accessing your app
- Look for suspicious activity

### 5. Use Conditional Access Policies (Enterprise)
- Require MFA for access
- Limit access by location
- Enforce device compliance

---

## 📊 How Authentication Works

1. **User visits your app** → Unauthenticated
2. **Route protection** detects no authentication → Redirects to `/.auth/login/aad`
3. **Azure AD login** → User enters credentials
4. **Authentication** → Azure validates and creates session
5. **Redirect back** → User returns to app with authentication cookie
6. **Authorization check** → `auth.js` checks if email is allowed
7. **Access granted or denied** → Based on allowlist configuration

---

## 🎨 Customizing the Auth UI

The authentication UI is defined in `/js/utils/auth.js`. You can customize:

### User Info Display
```javascript
authContainer.innerHTML = `
    <div class="user-info">
        <i class="fas fa-user-circle"></i>
        <span>${email}</span>
    </div>
    ...
`;
```

### Unauthorized Page
```javascript
unauthorizedDiv.innerHTML = `
    <h1>Access Denied</h1>
    <p>Your account ${email} is not authorized...</p>
`;
```

### Login Button (fallback)
```javascript
authContainer.innerHTML = `
    <a href="/login" class="btn-login">
        <i class="fas fa-sign-in-alt"></i> Login
    </a>
`;
```

---

## 💰 Cost Information

**Azure AD Authentication on Free Tier:**
- ✅ **Completely free** for up to 50,000 monthly active users
- ✅ Included with Azure Static Web Apps free tier
- ✅ No additional charges for basic authentication
- ✅ No hidden costs

---

## 🔄 Updating Allowed Users

To add or remove users:

1. **Edit** `js/utils/auth.js`
2. **Update** the `AUTHORIZED_EMAILS` array
3. **Commit and push** to your repository
4. **Wait** 2-3 minutes for deployment
5. **Test** - Unauthorized users will see "Access Denied" immediately

No need to redeploy or change Azure configuration!

---

## 📞 Support Resources

- [Azure Static Web Apps Authentication](https://docs.microsoft.com/azure/static-web-apps/authentication-authorization)
- [Azure AD App Registration](https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app)
- [Azure Static Web Apps Configuration](https://docs.microsoft.com/azure/static-web-apps/configuration)

---

## ✨ Next Steps

After authentication is working:

1. ✅ Test with different user accounts
2. ✅ Configure your email allowlist
3. ✅ Set up MFA (Multi-Factor Authentication) in Azure AD
4. ✅ Monitor sign-in logs in Azure AD
5. ✅ Document your allowed users
6. ✅ Share the app URL with your team

---

**🔒 Your app is now secure with enterprise-grade authentication!**

For questions or issues, refer to the troubleshooting section or check the Azure documentation.
