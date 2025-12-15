// ============================================
// MEETING PRESENTATION VIEW COMPONENT
// ============================================
// Full-screen presentation mode for action items during meetings

import { state } from '../core/state.js';
import { escapeHtml, formatDate, formatDateLong } from '../utils/helpers.js';

// Meeting view state
const meetingState = {
    currentFilter: 'all',
    currentPage: 1,
    itemsPerPage: 5,
    filteredItems: []
};

/**
 * Strip HTML tags from rich text content
 */
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Calculate statistics for the meeting view
 */
function calculateStats() {
    const items = state.actionItems;
    const total = items.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = items.filter(item => {
        if (item.status === 'Done') return false;
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate < today;
    }).length;

    const inProgress = items.filter(item => item.status === 'In Progress').length;
    const blocked = items.filter(item => item.status === 'Blocked').length;
    const done = items.filter(item => item.status === 'Done').length;
    const notStarted = items.filter(item => item.status === 'Not Started').length;

    return { total, overdue, inProgress, blocked, done, notStarted };
}

/**
 * Filter items based on the current filter
 */
function getFilteredItems() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let items = [...state.actionItems];

    switch (meetingState.currentFilter) {
        case 'overdue':
            items = items.filter(item => {
                if (item.status === 'Done') return false;
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate < today;
            });
            break;
        case 'in-progress':
            items = items.filter(item => item.status === 'In Progress');
            break;
        case 'blocked':
            items = items.filter(item => item.status === 'Blocked');
            break;
        case 'not-started':
            items = items.filter(item => item.status === 'Not Started');
            break;
        case 'all':
        default:
            // Sort by status priority: Overdue > Blocked > In Progress > Not Started > Done
            items.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                dateA.setHours(0, 0, 0, 0);
                dateB.setHours(0, 0, 0, 0);

                const isOverdueA = dateA < today && a.status !== 'Done';
                const isOverdueB = dateB < today && b.status !== 'Done';

                // Priority: overdue first
                if (isOverdueA && !isOverdueB) return -1;
                if (!isOverdueA && isOverdueB) return 1;

                // Then by status
                const statusPriority = {
                    'Blocked': 1,
                    'In Progress': 2,
                    'Not Started': 3,
                    'Done': 4
                };

                const priorityDiff = (statusPriority[a.status] || 5) - (statusPriority[b.status] || 5);
                if (priorityDiff !== 0) return priorityDiff;

                // Finally by date
                return dateA - dateB;
            });
            break;
    }

    return items;
}

/**
 * Render statistics
 */
function renderStats() {
    const stats = calculateStats();
    const statsContainer = document.getElementById('meetingViewStats');

    statsContainer.innerHTML = `
        <div class="meeting-stat-card">
            <div class="meeting-stat-icon-wrapper total">
                <i class="fas fa-list"></i>
            </div>
            <div class="meeting-stat-info">
                <div class="meeting-stat-value">${stats.total}</div>
                <div class="meeting-stat-label">Total Items</div>
            </div>
        </div>
        <div class="meeting-stat-card">
            <div class="meeting-stat-icon-wrapper overdue">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="meeting-stat-info">
                <div class="meeting-stat-value">${stats.overdue}</div>
                <div class="meeting-stat-label">Overdue</div>
            </div>
        </div>
        <div class="meeting-stat-card">
            <div class="meeting-stat-icon-wrapper in-progress">
                <i class="fas fa-spinner"></i>
            </div>
            <div class="meeting-stat-info">
                <div class="meeting-stat-value">${stats.inProgress}</div>
                <div class="meeting-stat-label">In Progress</div>
            </div>
        </div>
        <div class="meeting-stat-card">
            <div class="meeting-stat-icon-wrapper blocked">
                <i class="fas fa-ban"></i>
            </div>
            <div class="meeting-stat-info">
                <div class="meeting-stat-value">${stats.blocked}</div>
                <div class="meeting-stat-label">Blocked</div>
            </div>
        </div>
        <div class="meeting-stat-card">
            <div class="meeting-stat-icon-wrapper done">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="meeting-stat-info">
                <div class="meeting-stat-value">${stats.done}</div>
                <div class="meeting-stat-label">Completed</div>
            </div>
        </div>
    `;
}

/**
 * Render action items for the current page
 */
function renderItems() {
    meetingState.filteredItems = getFilteredItems();
    const totalPages = Math.ceil(meetingState.filteredItems.length / meetingState.itemsPerPage);

    // Ensure current page is valid
    if (meetingState.currentPage > totalPages && totalPages > 0) {
        meetingState.currentPage = totalPages;
    }
    if (meetingState.currentPage < 1) {
        meetingState.currentPage = 1;
    }

    const startIndex = (meetingState.currentPage - 1) * meetingState.itemsPerPage;
    const endIndex = startIndex + meetingState.itemsPerPage;
    const pageItems = meetingState.filteredItems.slice(startIndex, endIndex);

    const contentContainer = document.getElementById('meetingViewContent');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pageItems.length === 0) {
        contentContainer.innerHTML = `
            <div class="meeting-empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Items Found</h3>
                <p>There are no action items matching the selected filter.</p>
            </div>
        `;
    } else {
        contentContainer.innerHTML = pageItems.map((item, index) => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            const isOverdue = itemDate < today && item.status !== 'Done';
            const daysUntilDue = Math.ceil((itemDate - today) / (1000 * 60 * 60 * 24));

            let itemClass = 'meeting-item-card';
            let priorityBadge = '';

            if (isOverdue) {
                itemClass += ' overdue';
                priorityBadge = `<div class="meeting-priority-badge overdue">
                    <i class="fas fa-exclamation-circle"></i>
                    ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue
                </div>`;
            } else if (item.status === 'Blocked') {
                itemClass += ' blocked';
                priorityBadge = `<div class="meeting-priority-badge blocked">
                    <i class="fas fa-ban"></i>
                    Blocked
                </div>`;
            } else if (item.status === 'In Progress') {
                itemClass += ' in-progress';
            } else if (item.status === 'Done') {
                itemClass += ' done';
            }

            const notes = item.notes ? stripHtml(item.notes) : '';
            const statusClass = item.status.toLowerCase().replace(' ', '-');
            const itemNumber = startIndex + index + 1;

            return `
                <div class="${itemClass}">
                    <div class="meeting-item-header-row">
                        <div class="meeting-item-number-badge">#${itemNumber}</div>
                        <div class="meeting-item-status-badge ${statusClass}">
                            ${item.status === 'Not Started' ? '<i class="fas fa-circle"></i>' : ''}
                            ${item.status === 'In Progress' ? '<i class="fas fa-spinner"></i>' : ''}
                            ${item.status === 'Blocked' ? '<i class="fas fa-ban"></i>' : ''}
                            ${item.status === 'Done' ? '<i class="fas fa-check-circle"></i>' : ''}
                            ${item.status}
                        </div>
                        ${priorityBadge}
                    </div>

                    <div class="meeting-item-title">${escapeHtml(item.description)}</div>

                    <div class="meeting-item-details-grid">
                        <div class="meeting-item-detail">
                            <div class="meeting-item-detail-label">
                                <i class="fas fa-user"></i> Owner
                            </div>
                            <div class="meeting-item-detail-value">${escapeHtml(item.owner)}</div>
                        </div>

                        ${item.taskforce ? `
                        <div class="meeting-item-detail">
                            <div class="meeting-item-detail-label">
                                <i class="fas fa-users"></i> Taskforce
                            </div>
                            <div class="meeting-item-detail-value">${escapeHtml(item.taskforce)}</div>
                        </div>
                        ` : ''}

                        <div class="meeting-item-detail">
                            <div class="meeting-item-detail-label">
                                <i class="fas fa-calendar"></i> Due Date
                            </div>
                            <div class="meeting-item-detail-value ${isOverdue ? 'overdue-text' : ''}">
                                ${formatDateLong(item.date)}
                            </div>
                        </div>
                    </div>

                    ${notes ? `
                    <div class="meeting-item-notes-section">
                        <div class="meeting-item-notes-label">
                            <i class="fas fa-sticky-note"></i> Notes
                        </div>
                        <div class="meeting-item-notes-content">${escapeHtml(notes)}</div>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Update pagination
    document.getElementById('meetingCurrentPage').textContent = totalPages > 0 ? meetingState.currentPage : 0;
    document.getElementById('meetingTotalPages').textContent = totalPages;

    // Update showing info
    const showingStart = totalPages > 0 ? startIndex + 1 : 0;
    const showingEnd = Math.min(endIndex, meetingState.filteredItems.length);
    const showingInfo = document.getElementById('meetingShowingInfo');
    if (showingInfo) {
        showingInfo.textContent = `Showing ${showingStart}-${showingEnd} of ${meetingState.filteredItems.length}`;
    }

    // Update navigation buttons
    document.getElementById('meetingPrevBtn').disabled = meetingState.currentPage <= 1;
    document.getElementById('meetingNextBtn').disabled = meetingState.currentPage >= totalPages;
}

/**
 * Set active filter
 */
function setFilter(filter) {
    meetingState.currentFilter = filter;
    meetingState.currentPage = 1;

    // Update filter buttons
    document.querySelectorAll('.meeting-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderItems();
}

/**
 * Navigate to a specific page
 */
function navigateToPage(page) {
    const totalPages = Math.ceil(meetingState.filteredItems.length / meetingState.itemsPerPage);

    if (page >= 1 && page <= totalPages) {
        meetingState.currentPage = page;
        renderItems();
    }
}

/**
 * Open the meeting view
 */
export function openMeetingView() {
    const overlay = document.getElementById('meetingViewOverlay');

    // Set current date
    const dateElement = document.getElementById('meetingViewDate');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    dateElement.innerHTML = `<i class="fas fa-calendar-day"></i> ${formattedDate}`;

    // Update meeting info section with calendar events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysEvents = state.calendarEvents.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
    });

    const subtitleElement = document.getElementById('meetingInfoSubtitle');
    if (todaysEvents.length > 0) {
        const eventTitles = todaysEvents.map(e => e.title).join(', ');
        subtitleElement.textContent = `Today's Events: ${eventTitles}`;
    } else {
        subtitleElement.textContent = 'Review action items and track progress';
    }

    // Reset state
    meetingState.currentFilter = 'all';
    meetingState.currentPage = 1;

    // Reset filter buttons
    document.querySelectorAll('.meeting-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });

    // Render content
    renderStats();
    renderItems();

    // Show overlay
    overlay.classList.add('active');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Close the meeting view
 */
export function closeMeetingView() {
    const overlay = document.getElementById('meetingViewOverlay');
    overlay.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * Initialize event listeners
 */
export function initMeetingView() {
    // Close button
    document.getElementById('closeMeetingView').addEventListener('click', closeMeetingView);

    // Filter buttons
    document.querySelectorAll('.meeting-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // Navigation buttons
    document.getElementById('meetingPrevBtn').addEventListener('click', () => {
        navigateToPage(meetingState.currentPage - 1);
    });

    document.getElementById('meetingNextBtn').addEventListener('click', () => {
        navigateToPage(meetingState.currentPage + 1);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('meetingViewOverlay');
            if (overlay.classList.contains('active')) {
                closeMeetingView();
            }
        }
    });

    // Keyboard navigation (arrow keys for pagination)
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('meetingViewOverlay');
        if (overlay.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                navigateToPage(meetingState.currentPage - 1);
            } else if (e.key === 'ArrowRight') {
                navigateToPage(meetingState.currentPage + 1);
            }
        }
    });
}

/**
 * Export for window (onclick handlers)
 */
export function initMeetingViewGlobal() {
    window.meetingView = {
        open: openMeetingView,
        close: closeMeetingView
    };
}
