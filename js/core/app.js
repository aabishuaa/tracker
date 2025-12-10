// ============================================
// MAIN APPLICATION ENTRY POINT
// ============================================

import { state, seedActionItems, seedEvents } from './state.js';
import { loadFromStorage } from '../services/storage.js';
import { initializeEditors } from '../utils/editors.js';
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
    saveEvent
} from '../components/calendar.js';
import {
    initSnapshotsGlobal,
    saveSnapshot,
    exportToExcel,
    renderSnapshotVisualization
} from '../components/snapshots.js';

// ============================================
// INITIALIZATION
// ============================================

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

    // Render initial views
    renderActionItems();
    renderDetailsPanel();
    renderCalendar();
    renderEvents();

    // Attach event listeners
    attachEventListeners();
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
