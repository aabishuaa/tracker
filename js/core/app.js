// ============================================
// MAIN APPLICATION ENTRY POINT
// ============================================

import { state, seedActionItems, seedEvents } from './state.js';
import { loadFromStorage } from '../services/storage.js';
import { initializeEditors } from '../utils/editors.js';
import { initializeViewerMode, isViewerMode } from '../utils/viewerMode.js';
import { switchTab } from '../ui/tabs.js';
import { closeModal } from '../ui/modals.js';
import {
    renderActionItems,
    renderDetailsPanel,
    initActionItemsGlobal,
    openAddItemModal,
    saveItem,
    sortActionItems,
    updateItemStatus
} from '../components/actionItems.js';
import {
    renderCalendar,
    renderEvents,
    initCalendarGlobal,
    navigateMonth,
    goToToday,
    openAddEventModal,
    saveEvent,
    exportCalendarToExcel,
    editEvent,
    deleteEvent
} from '../components/calendar.js';
import {
    initSnapshotsGlobal,
    saveSnapshot,
    exportToExcel,
    renderSnapshotVisualization
} from '../components/snapshots.js';
import {
    initReportGeneratorGlobal,
    generateReport,
    previewReport
} from '../utils/reportGenerator.js';

// ============================================
// INITIALIZATION
// ============================================

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDateBadge');
    if (dateElement) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        dateElement.innerHTML = `<i class="fas fa-calendar-day"></i> ${formattedDate}`;
    }
}

function initializeApp() {
    // Load data from localStorage or use seed data
    state.actionItems = loadFromStorage('ey-action-items', seedActionItems);
    state.calendarEvents = loadFromStorage('ey-calendar-events', seedEvents);
    state.snapshots = loadFromStorage('ey-snapshots', []);

    // Initialize rich text editors
    initializeEditors();

    // Initialize global window functions for onclick handlers
    initActionItemsGlobal();
    initCalendarGlobal();
    initSnapshotsGlobal();
    initReportGeneratorGlobal();

    // Update current date
    updateCurrentDate();

    // Render initial views
    renderActionItems();
    renderDetailsPanel();
    renderCalendar();
    renderEvents();

    // Attach event listeners
    attachEventListeners();

    // Initialize viewer mode if applicable
    initializeViewerMode();

    // Hide loading animation after everything is ready
    hideLoadingAnimation();
}

// Hide the EY loading animation
function hideLoadingAnimation() {
    const overlay = document.getElementById('eyLoadingOverlay');
    if (overlay) {
        // Wait for animation sequence to complete (about 2.5 seconds), then fade out
        setTimeout(() => {
            overlay.classList.add('fade-out');
            // Remove from DOM after fade transition
            setTimeout(() => {
                overlay.remove();
            }, 800);
        }, 2500);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function attachEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Header actions
    document.getElementById('saveSnapshotBtn').addEventListener('click', saveSnapshot);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('viewSnapshotBtn').addEventListener('click', () => {
        renderSnapshotVisualization();
        switchTab('snapshot-view');
    });
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('previewReportBtn').addEventListener('click', previewReport);

    // Action items
    document.getElementById('addItemBtn').addEventListener('click', openAddItemModal);
    document.getElementById('searchBox').addEventListener('input', renderActionItems);
    document.getElementById('statusFilter').addEventListener('change', renderActionItems);

    // Action items modal
    document.getElementById('saveItemBtn').addEventListener('click', saveItem);
    document.getElementById('cancelItemBtn').addEventListener('click', () => closeModal('itemModal'));
    document.getElementById('closeItemModal').addEventListener('click', () => closeModal('itemModal'));

    // Events
    document.getElementById('addEventBtn').addEventListener('click', openAddEventModal);
    document.getElementById('saveEventBtn').addEventListener('click', saveEvent);
    document.getElementById('cancelEventBtn').addEventListener('click', () => closeModal('eventModal'));
    document.getElementById('closeEventModal').addEventListener('click', () => closeModal('eventModal'));
    document.getElementById('exportCalendarBtn').addEventListener('click', exportCalendarToExcel);

    // Event poster upload
    document.getElementById('eventPoster').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.currentEventPoster = event.target.result;
                document.getElementById('eventPosterImage').src = event.target.result;
                document.getElementById('eventPosterPreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove poster button
    document.getElementById('removePosterBtn').addEventListener('click', () => {
        state.currentEventPoster = null;
        document.getElementById('eventPoster').value = '';
        document.getElementById('eventPosterPreview').style.display = 'none';
    });

    // Calendar navigation
    document.getElementById('prevMonthBtn').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('nextMonthBtn').addEventListener('click', () => navigateMonth(1));
    document.getElementById('todayBtn').addEventListener('click', goToToday);

    // Delete modal
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (state.deleteCallback) state.deleteCallback();
    });
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('closeDeleteModal').addEventListener('click', () => closeModal('deleteModal'));

    // Item details modal
    document.getElementById('closeItemDetailsModal').addEventListener('click', () => {
        closeModal('itemDetailsModal');
        state.selectedItemId = null;
        renderActionItems();
    });

    // Event details modal
    document.getElementById('closeEventDetailsModal').addEventListener('click', () => {
        closeModal('eventDetailsModal');
        state.currentEventDetailsId = null;
    });

    document.getElementById('editEventDetailsBtn').addEventListener('click', () => {
        if (state.currentEventDetailsId) {
            closeModal('eventDetailsModal');
            editEvent(state.currentEventDetailsId);
        }
    });

    document.getElementById('deleteEventDetailsBtn').addEventListener('click', () => {
        if (state.currentEventDetailsId) {
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(state.currentEventDetailsId);
                closeModal('eventDetailsModal');
                state.currentEventDetailsId = null;
            }
        }
    });

    // Table sorting
    document.querySelectorAll('.action-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            sortActionItems(th.dataset.sort);
        });
    });

    // Status menu items
    document.querySelectorAll('.status-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const statusText = e.currentTarget.textContent.trim();
            updateItemStatus(statusText);
        });
    });

    // Close modals on background click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

// ============================================
// START APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', initializeApp);
