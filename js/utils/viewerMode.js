// ============================================
// VIEWER MODE (Read-Only) FUNCTIONALITY
// ============================================
// This module handles read-only mode for team members

export function isViewerMode() {
    // Check URL parameters for viewer mode
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mode') === 'view' ||
           urlParams.get('readonly') === 'true' ||
           urlParams.get('viewer') === 'true';
}

export function initializeViewerMode() {
    if (!isViewerMode()) {
        return; // Not in viewer mode, do nothing
    }

    // Add viewer mode banner
    addViewerBanner();

    // Hide all edit/add/delete controls
    hideEditControls();

    // Disable all form inputs
    disableFormInputs();

    // Update page title
    document.title = 'EY AI Taskforce Tracker (View Only)';

    console.log('Viewer mode activated - read-only access enabled');
}

function addViewerBanner() {
    const banner = document.createElement('div');
    banner.className = 'viewer-mode-banner';
    banner.innerHTML = `
        <i class="fas fa-eye"></i>
        <span>Viewer Mode - You are viewing this tracker in read-only mode</span>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
}

function hideEditControls() {
    // Hide all buttons that modify data
    const controlsToHide = [
        '#addItemBtn',
        '#saveSnapshotBtn',
        '#exportExcelBtn',
        '#addEventBtn',
        '.btn-primary',
        '.btn-danger'
    ];

    controlsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            // Don't hide the "View Snapshot" button
            if (element.id !== 'viewSnapshotBtn' && element.id !== 'todayBtn') {
                element.style.display = 'none';
            }
        });
    });

    // Hide action buttons in tables
    const actionHeaders = Array.from(document.querySelectorAll('.action-table th'))
        .filter(th => th.textContent.trim() === 'Actions');
    actionHeaders.forEach(th => th.style.display = 'none');
}

function disableFormInputs() {
    // Disable all inputs, textareas, selects, and buttons in forms
    document.querySelectorAll('form input, form textarea, form select, form button').forEach(element => {
        element.disabled = true;
    });

    // Prevent modal forms from opening
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Export viewer mode status globally
window.isViewerMode = isViewerMode;
