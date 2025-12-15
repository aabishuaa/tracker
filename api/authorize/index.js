/**
 * Azure Function: Authorization Check
 *
 * This function validates whether a user is authorized to access the application
 * based on an allowlist of emails or domains.
 *
 * Environment Variables:
 * - ALLOWED_EMAILS: Comma-separated list of allowed emails (e.g., "user1@ey.com,user2@ey.com")
 * - ALLOWED_DOMAINS: Comma-separated list of allowed domains (e.g., "ey.com,company.com")
 * - REQUIRE_TENANT_ID: Optional specific tenant ID to enforce (leave empty to allow any tenant)
 */

module.exports = async function (context, req) {
    context.log('Authorization check initiated');

    // CORS headers for local development and SWA
    context.res = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        context.res.body = {};
        return;
    }

    try {
        // Get user info from request body
        const { email, name, tenantId } = req.body || {};

        if (!email) {
            context.res.status = 400;
            context.res.body = {
                allowed: false,
                reason: 'Email is required',
                error: 'Missing email in request'
            };
            return;
        }

        context.log(`Checking authorization for: ${email}`);

        // Get configuration from environment variables
        const allowedEmailsEnv = process.env.ALLOWED_EMAILS || '';
        const allowedDomainsEnv = process.env.ALLOWED_DOMAINS || '';
        const requiredTenantId = process.env.REQUIRE_TENANT_ID || '';

        // Parse allowed emails (comma-separated)
        const allowedEmails = allowedEmailsEnv
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(e => e.length > 0);

        // Parse allowed domains (comma-separated)
        const allowedDomains = allowedDomainsEnv
            .split(',')
            .map(d => d.trim().toLowerCase())
            .filter(d => d.length > 0);

        const emailLower = email.toLowerCase();
        const emailDomain = emailLower.split('@')[1];

        // Check tenant restriction if configured
        if (requiredTenantId && tenantId !== requiredTenantId) {
            context.log(`Tenant mismatch: ${tenantId} vs required ${requiredTenantId}`);
            context.res.status = 200;
            context.res.body = {
                allowed: false,
                reason: 'Your account is from a different organization',
                user: { email, name }
            };
            return;
        }

        // If no restrictions are configured, allow all authenticated users
        if (allowedEmails.length === 0 && allowedDomains.length === 0) {
            context.log('No restrictions configured - allowing all authenticated users');
            context.res.status = 200;
            context.res.body = {
                allowed: true,
                user: { email, name },
                message: 'Access granted (no restrictions configured)'
            };
            return;
        }

        // Check specific email allowlist
        if (allowedEmails.length > 0 && allowedEmails.includes(emailLower)) {
            context.log(`Email found in allowlist: ${email}`);
            context.res.status = 200;
            context.res.body = {
                allowed: true,
                user: { email, name },
                message: 'Access granted via email allowlist'
            };
            return;
        }

        // Check domain allowlist
        if (allowedDomains.length > 0 && emailDomain && allowedDomains.includes(emailDomain)) {
            context.log(`Domain allowed: ${emailDomain}`);
            context.res.status = 200;
            context.res.body = {
                allowed: true,
                user: { email, name },
                message: 'Access granted via domain allowlist'
            };
            return;
        }

        // User is not authorized
        context.log(`Access denied for: ${email}`);
        context.res.status = 200;
        context.res.body = {
            allowed: false,
            reason: `Your email (${email}) is not on the approved list`,
            user: { email, name }
        };

    } catch (error) {
        context.log.error('Authorization error:', error);
        context.res.status = 500;
        context.res.body = {
            allowed: false,
            reason: 'Server error during authorization check',
            error: error.message
        };
    }
};
