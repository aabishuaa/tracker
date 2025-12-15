/**
 * MSAL.js Authentication for Microsoft Entra ID (Azure AD)
 *
 * This module handles client-side authentication using MSAL.js
 * and server-side authorization using Azure Functions
 */

// MSAL Configuration
// These values will be set from environment or hardcoded for your tenant
const msalConfig = {
    auth: {
        clientId: window.ENV?.AZURE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE', // Replace with your App Registration Client ID
        authority: window.ENV?.AZURE_AUTHORITY || 'https://login.microsoftonline.com/YOUR_TENANT_ID_HERE', // Replace with your Tenant ID
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        navigateToLoginRequestUrl: true
    },
    cache: {
        cacheLocation: 'localStorage', // sessionStorage or localStorage
        storeAuthStateInCookie: false
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                switch (level) {
                    case msal.LogLevel.Error:
                        console.error(message);
                        return;
                    case msal.LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            }
        }
    }
};

// Request configuration for login
const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'User.Read']
};

// Global MSAL instance
let msalInstance = null;
let currentAccount = null;

/**
 * Initialize MSAL instance
 */
function initializeMsal() {
    try {
        msalInstance = new msal.PublicClientApplication(msalConfig);
        return msalInstance.initialize();
    } catch (error) {
        console.error('Error initializing MSAL:', error);
        throw error;
    }
}

/**
 * Handle redirect response after login
 */
async function handleRedirectResponse() {
    try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
            currentAccount = response.account;
            return response;
        } else {
            // Check if there's already an account signed in
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                msalInstance.setActiveAccount(currentAccount);
            }
        }
        return null;
    } catch (error) {
        console.error('Error handling redirect:', error);
        throw error;
    }
}

/**
 * Sign in using popup
 */
async function signInPopup() {
    try {
        const response = await msalInstance.loginPopup(loginRequest);
        currentAccount = response.account;
        msalInstance.setActiveAccount(currentAccount);
        return response;
    } catch (error) {
        console.error('Login popup error:', error);
        throw error;
    }
}

/**
 * Sign in using redirect
 */
async function signInRedirect() {
    try {
        await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
        console.error('Login redirect error:', error);
        throw error;
    }
}

/**
 * Sign out
 */
async function signOut() {
    const account = msalInstance.getActiveAccount();
    if (account) {
        await msalInstance.logoutRedirect({
            account: account,
            postLogoutRedirectUri: window.location.origin
        });
    }
}

/**
 * Get current account
 */
function getCurrentAccount() {
    if (currentAccount) {
        return currentAccount;
    }

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        currentAccount = accounts[0];
        msalInstance.setActiveAccount(currentAccount);
        return currentAccount;
    }

    return null;
}

/**
 * Get user email from account
 */
function getUserEmail(account) {
    return account?.username || account?.idTokenClaims?.preferred_username || account?.idTokenClaims?.email || null;
}

/**
 * Get user display name from account
 */
function getUserDisplayName(account) {
    return account?.name || account?.idTokenClaims?.name || getUserEmail(account) || 'User';
}

/**
 * Check authorization with backend API
 */
async function checkAuthorization() {
    try {
        const account = getCurrentAccount();
        if (!account) {
            return { allowed: false, reason: 'Not authenticated' };
        }

        const email = getUserEmail(account);
        const name = getUserDisplayName(account);

        // Call the Azure Function API to check authorization
        const response = await fetch('/api/authorize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                name: name,
                tenantId: account.tenantId
            })
        });

        if (!response.ok) {
            throw new Error(`Authorization check failed: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Authorization check error:', error);
        return {
            allowed: false,
            reason: 'Unable to verify access. Please try again later.',
            error: error.message
        };
    }
}

/**
 * Show signed-out screen
 */
function showSignedOutScreen() {
    const appContainer = document.querySelector('.main-content');
    const header = document.querySelector('.header');
    const tabBar = document.querySelector('.tab-bar');

    if (appContainer) appContainer.style.display = 'none';
    if (tabBar) tabBar.style.display = 'none';

    // Show sign-in screen
    let signInScreen = document.getElementById('signInScreen');
    if (!signInScreen) {
        signInScreen = document.createElement('div');
        signInScreen.id = 'signInScreen';
        signInScreen.className = 'auth-screen';
        document.body.appendChild(signInScreen);
    }

    signInScreen.innerHTML = `
        <div class="auth-screen-content">
            <div class="auth-logo">
                <div class="ey-logo">
                    <div class="ey-letter">E</div>
                    <div class="ey-letter">Y</div>
                </div>
                <div class="ey-yellow-bar"></div>
            </div>
            <h1 class="auth-title">AI Taskforce Tracker</h1>
            <p class="auth-subtitle">Action Items & Initiative Management</p>
            <div class="auth-message">
                <i class="fas fa-lock"></i>
                <p>Sign in with your Microsoft account to access the application</p>
            </div>
            <button class="btn btn-primary btn-sign-in" id="signInBtn">
                <i class="fab fa-microsoft"></i>
                Sign in with Microsoft
            </button>
        </div>
    `;

    signInScreen.style.display = 'flex';

    // Add event listener for sign-in button
    document.getElementById('signInBtn').addEventListener('click', async () => {
        try {
            await signInRedirect(); // Using redirect for better compatibility
        } catch (error) {
            alert('Sign-in failed. Please try again.');
            console.error('Sign-in error:', error);
        }
    });

    // Update header for signed-out state
    updateHeaderAuth(null, false);
}

/**
 * Show access denied screen
 */
function showAccessDeniedScreen(email, reason) {
    const appContainer = document.querySelector('.main-content');
    const tabBar = document.querySelector('.tab-bar');

    if (appContainer) appContainer.style.display = 'none';
    if (tabBar) tabBar.style.display = 'none';

    // Show access denied screen
    let deniedScreen = document.getElementById('accessDeniedScreen');
    if (!deniedScreen) {
        deniedScreen = document.createElement('div');
        deniedScreen.id = 'accessDeniedScreen';
        deniedScreen.className = 'auth-screen';
        document.body.appendChild(deniedScreen);
    }

    deniedScreen.innerHTML = `
        <div class="auth-screen-content">
            <div class="auth-denied-icon">
                <i class="fas fa-user-lock"></i>
            </div>
            <h1 class="auth-title">Access Not Granted</h1>
            <div class="auth-denied-info">
                <p><strong>Account:</strong> ${email}</p>
                ${reason ? `<p class="auth-denied-reason">${reason}</p>` : ''}
            </div>
            <div class="auth-message">
                <i class="fas fa-info-circle"></i>
                <p>Your account is not authorized to access this application. Please contact your administrator to request access.</p>
            </div>
            <div class="auth-actions">
                <button class="btn btn-secondary" id="signOutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    Sign Out
                </button>
                <button class="btn btn-primary" id="requestAccessBtn">
                    <i class="fas fa-envelope"></i>
                    Request Access
                </button>
            </div>
        </div>
    `;

    deniedScreen.style.display = 'flex';

    // Add event listeners
    document.getElementById('signOutBtn').addEventListener('click', () => signOut());
    document.getElementById('requestAccessBtn').addEventListener('click', () => {
        // You can customize this to send an email or open a form
        alert('Please contact your administrator to request access.\n\nYour email: ' + email);
    });

    // Update header for denied state
    updateHeaderAuth(email, false);
}

/**
 * Show main application
 */
function showMainApplication() {
    const appContainer = document.querySelector('.main-content');
    const tabBar = document.querySelector('.tab-bar');

    if (appContainer) appContainer.style.display = 'block';
    if (tabBar) tabBar.style.display = 'block';

    // Hide auth screens
    const signInScreen = document.getElementById('signInScreen');
    const deniedScreen = document.getElementById('accessDeniedScreen');

    if (signInScreen) signInScreen.style.display = 'none';
    if (deniedScreen) deniedScreen.style.display = 'none';
}

/**
 * Update header authentication UI
 */
function updateHeaderAuth(email, isAuthorized) {
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return;

    // Remove existing auth container
    const existingAuthContainer = headerContent.querySelector('.auth-container');
    if (existingAuthContainer) {
        existingAuthContainer.remove();
    }

    // Create new auth container
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';

    if (email && isAuthorized) {
        // User is signed in and authorized
        authContainer.innerHTML = `
            <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <span class="user-email">${email}</span>
            </div>
            <button class="btn btn-secondary btn-sm btn-sign-out-header" id="headerSignOutBtn">
                <i class="fas fa-sign-out-alt"></i>
                Sign Out
            </button>
        `;

        setTimeout(() => {
            const signOutBtn = document.getElementById('headerSignOutBtn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', () => signOut());
            }
        }, 0);
    } else if (email && !isAuthorized) {
        // User is signed in but not authorized
        authContainer.innerHTML = `
            <div class="user-info user-info-denied">
                <i class="fas fa-user-slash"></i>
                <span class="user-email">${email}</span>
                <span class="access-denied-badge">Access Denied</span>
            </div>
        `;
    } else {
        // User is not signed in
        authContainer.innerHTML = `
            <button class="btn btn-primary btn-sm" id="headerSignInBtn">
                <i class="fab fa-microsoft"></i>
                Sign in with Microsoft
            </button>
        `;

        setTimeout(() => {
            const signInBtn = document.getElementById('headerSignInBtn');
            if (signInBtn) {
                signInBtn.addEventListener('click', () => signInRedirect());
            }
        }, 0);
    }

    headerContent.appendChild(authContainer);
}

/**
 * Initialize authentication and check access
 */
async function initAuth() {
    try {
        // Initialize MSAL
        await initializeMsal();

        // Handle redirect response (if coming back from login)
        await handleRedirectResponse();

        // Get current account
        const account = getCurrentAccount();

        if (!account) {
            // User is not signed in
            showSignedOutScreen();
            return;
        }

        // User is signed in, check authorization
        const email = getUserEmail(account);
        const authResult = await checkAuthorization();

        if (authResult.allowed) {
            // User is authorized
            showMainApplication();
            updateHeaderAuth(email, true);
        } else {
            // User is not authorized
            showAccessDeniedScreen(email, authResult.reason);
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        // Show error message
        alert('Authentication error. Please refresh the page and try again.');
        showSignedOutScreen();
    }
}

// Initialize authentication when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    // DOM is already ready, check if MSAL library is loaded
    if (typeof msal !== 'undefined') {
        initAuth();
    } else {
        // Wait for MSAL library to load
        window.addEventListener('load', initAuth);
    }
}

// Export functions for use in other modules if needed
export {
    initAuth,
    signInPopup,
    signInRedirect,
    signOut,
    getCurrentAccount,
    getUserEmail,
    getUserDisplayName,
    checkAuthorization
};
