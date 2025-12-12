/**
 * Authentication utilities for Azure AD integration
 */

// Allowlist of authorized email addresses
// Add or remove emails as needed
const AUTHORIZED_EMAILS = [
    // Add authorized email addresses here
    // Example: 'john.doe@ey.com',
    // Example: 'jane.smith@ey.com',
];

// Set to true to allow any email from specific domains
const ALLOW_DOMAIN_MODE = false;
const ALLOWED_DOMAINS = [
    // Example: 'ey.com',
    // Example: 'company.com',
];

/**
 * Get current user information from Azure Static Web Apps
 */
async function getUserInfo() {
    try {
        const response = await fetch('/.auth/me');
        const payload = await response.json();
        const { clientPrincipal } = payload;
        return clientPrincipal;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

/**
 * Check if user email is authorized
 */
function isEmailAuthorized(email) {
    if (!email) return false;

    // If no restrictions are set, allow all authenticated users
    if (AUTHORIZED_EMAILS.length === 0 && !ALLOW_DOMAIN_MODE) {
        return true;
    }

    // Check specific email allowlist
    if (AUTHORIZED_EMAILS.length > 0 && AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
        return true;
    }

    // Check domain allowlist
    if (ALLOW_DOMAIN_MODE && ALLOWED_DOMAINS.length > 0) {
        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (emailDomain && ALLOWED_DOMAINS.includes(emailDomain)) {
            return true;
        }
    }

    return false;
}

/**
 * Initialize authentication UI
 */
async function initAuth() {
    const userInfo = await getUserInfo();

    // Create auth container in header
    const header = document.querySelector('.header');
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    authContainer.style.cssText = 'margin-left: auto; display: flex; align-items: center; gap: 15px;';

    if (userInfo) {
        const email = userInfo.userDetails;
        const authorized = isEmailAuthorized(email);

        if (!authorized) {
            // User is authenticated but not authorized
            authContainer.innerHTML = `
                <div class="unauthorized-notice" style="background: #ff4444; color: white; padding: 8px 15px; border-radius: 6px; font-size: 14px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Access Denied: ${email}
                </div>
                <a href="/logout" class="btn-logout" style="background: #333; color: white; padding: 8px 15px; border-radius: 6px; text-decoration: none; font-size: 14px;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;

            // Hide main content and show unauthorized message
            const mainContent = document.querySelector('.container');
            if (mainContent) {
                mainContent.style.display = 'none';
            }

            // Show full-screen unauthorized message
            const unauthorizedDiv = document.createElement('div');
            unauthorizedDiv.className = 'unauthorized-page';
            unauthorizedDiv.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; padding: 40px;';
            unauthorizedDiv.innerHTML = `
                <div style="max-width: 600px;">
                    <i class="fas fa-lock" style="font-size: 80px; color: #ff4444; margin-bottom: 30px;"></i>
                    <h1 style="font-size: 32px; margin-bottom: 20px; color: #333;">Access Denied</h1>
                    <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                        Your account <strong>${email}</strong> is not authorized to access this application.
                    </p>
                    <p style="font-size: 16px; color: #888; margin-bottom: 30px;">
                        Please contact your administrator to request access.
                    </p>
                    <a href="/logout" class="btn" style="display: inline-block; background: #333; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                        <i class="fas fa-sign-out-alt"></i> Logout and try another account
                    </a>
                </div>
            `;
            document.body.appendChild(unauthorizedDiv);
        } else {
            // User is authenticated and authorized
            authContainer.innerHTML = `
                <div class="user-info" style="display: flex; align-items: center; gap: 10px; padding: 8px 15px; background: #f5f5f5; border-radius: 6px;">
                    <i class="fas fa-user-circle" style="font-size: 20px; color: #FFE600;"></i>
                    <span style="font-size: 14px; color: #333;">${email}</span>
                </div>
                <a href="/logout" class="btn-logout" style="background: #333; color: white; padding: 8px 15px; border-radius: 6px; text-decoration: none; font-size: 14px;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
        }
    } else {
        // User is not authenticated - this shouldn't happen due to route protection
        // but showing login button just in case
        authContainer.innerHTML = `
            <a href="/login" class="btn-login" style="background: #FFE600; color: #2B2B2B; padding: 8px 15px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
                <i class="fas fa-sign-in-alt"></i> Login with Microsoft
            </a>
        `;
    }

    header.appendChild(authContainer);
}

// Initialize authentication when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// Export for use in other modules
export { getUserInfo, isEmailAuthorized, AUTHORIZED_EMAILS, ALLOW_DOMAIN_MODE, ALLOWED_DOMAINS };
