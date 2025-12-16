// ============================================
// ACTION ITEMS COMPONENT
// ============================================

import { state } from '../core/state.js';
import { saveToStorage } from '../services/storage.js';
import { escapeHtml, formatDate, formatDateTime, formatDateLong, fuzzyMatch, highlightText } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { showToast } from '../ui/toast.js';
import { renderCalendar, renderEvents } from './calendar.js';
import { isViewerMode } from '../utils/viewerMode.js';

// ============================================
// RENDERING
// ============================================

export function renderActionItems() {
    const tbody = document.getElementById('actionTableBody');
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    // Filter items with improved fuzzy search
    let filteredItems = state.actionItems.filter(item => {
        const ownersText = Array.isArray(item.owners) ? item.owners.join(', ') : '';
        const matchesSearch = !searchTerm ||
            fuzzyMatch(item.description, searchTerm) ||
            fuzzyMatch(ownersText, searchTerm) ||
            fuzzyMatch(item.notes, searchTerm) ||
            fuzzyMatch(item.latestUpdate || '', searchTerm) ||
            fuzzyMatch(item.nextSteps || '', searchTerm);
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Clear table
    tbody.innerHTML = '';

    if (filteredItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem; color: #A0AEC0; font-style: italic;">
                    No action items found. Click "Add Action Item" to get started.
                </td>
            </tr>
        `;
        return;
    }

    // Render each item
    filteredItems.forEach(item => {
        const row = document.createElement('tr');
        const isSelected = state.selectedItemId === item.id;
        if (isSelected) {
            row.style.backgroundColor = '#FFFEF0';
        }

        // Apply highlighting if search is active
        const description = searchTerm ? highlightText(item.description, searchTerm) : escapeHtml(item.description);
        const ownersText = Array.isArray(item.owners) ? item.owners.join(', ') : '';
        const owners = searchTerm ? highlightText(ownersText, searchTerm) : escapeHtml(ownersText);

        // Determine which action buttons to show based on viewer mode
        const viewerMode = isViewerMode();
        const actionButtons = viewerMode ? `
            <button class="btn btn-secondary btn-sm" onclick="window.actionItems.viewItemDetails('${item.id}')" title="View Details">
                <i class="fas fa-eye"></i>
            </button>
        ` : `
            <button class="btn btn-secondary btn-sm" onclick="window.actionItems.viewItemDetails('${item.id}')" title="View Details">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.actionItems.editItem('${item.id}')" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.actionItems.deleteItem('${item.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        `;

        row.innerHTML = `
            <td>
                <div style="font-weight: 600;" class="text-wrap">${description}</div>
            </td>
            <td class="text-wrap">${owners}</td>
            <td style="white-space: nowrap;">${formatDate(item.date)}</td>
            <td>
                <span class="status-pill status-${item.status.toLowerCase().replace(' ', '-')}"
                      ${viewerMode ? '' : `onclick="window.actionItems.openStatusMenu('${item.id}', event)"`}
                      style="${viewerMode ? 'cursor: default;' : ''}">
                    ${item.status}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${actionButtons}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ============================================
// DETAILS MODAL
// ============================================

export function viewItemDetails(id) {
    state.selectedItemId = id;
    renderActionItems();
    renderDetailsModal();
    openModal('itemDetailsModal');
}

export function closeDetailsPanel() {
    state.selectedItemId = null;
    renderActionItems();
    renderDetailsPanel();
}

export function renderDetailsPanel() {
    const panel = document.getElementById('detailsPanel');

    // Get upcoming tasks (not done, sorted by due date)
    const upcomingTasks = state.actionItems
        .filter(item => item.status !== 'Done')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 10); // Show top 10

    if (upcomingTasks.length === 0) {
        panel.innerHTML = `
            <div class="upcoming-tasks-panel">
                <div class="upcoming-tasks-header">
                    <i class="fas fa-tasks"></i>
                    <h3>Upcoming Tasks</h3>
                </div>
                <div class="upcoming-tasks-empty">
                    <i class="fas fa-inbox"></i>
                    <p>There are no tasks</p>
                </div>
            </div>
        `;
        return;
    }

    const tasksHtml = upcomingTasks.map(item => {
        const daysUntilDue = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;
        const ownersText = Array.isArray(item.owners) ? item.owners.join(', ') : '';

        return `
            <div class="upcoming-task-card ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}"
                 onclick="window.actionItems.viewItemDetails('${item.id}')">
                <div class="upcoming-task-header">
                    <span class="status-pill status-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span>
                    ${isOverdue ? '<span class="task-badge overdue-badge"><i class="fas fa-exclamation-circle"></i> Overdue</span>' : ''}
                    ${isDueSoon && !isOverdue ? '<span class="task-badge due-soon-badge"><i class="fas fa-clock"></i> Due Soon</span>' : ''}
                </div>
                <div class="upcoming-task-title">${escapeHtml(item.description)}</div>
                <div class="upcoming-task-meta">
                    <div class="upcoming-task-meta-item">
                        <i class="fas fa-users"></i>
                        <span>${escapeHtml(ownersText)}</span>
                    </div>
                    <div class="upcoming-task-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(item.date)}</span>
                        ${isOverdue ? `<span class="overdue-text">(${Math.abs(daysUntilDue)} days overdue)</span>` : ''}
                        ${isDueSoon && !isOverdue ? `<span class="due-soon-text">(${daysUntilDue} days left)</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    panel.innerHTML = `
        <div class="upcoming-tasks-panel">
            <div class="upcoming-tasks-header">
                <i class="fas fa-tasks"></i>
                <h3>Upcoming Tasks</h3>
                <span class="upcoming-tasks-count">${upcomingTasks.length}</span>
            </div>
            <div class="upcoming-tasks-list">
                ${tasksHtml}
            </div>
        </div>
    `;
}

export function renderDetailsModal() {
    const contentDiv = document.getElementById('itemDetailsContent');

    if (!state.selectedItemId) {
        contentDiv.innerHTML = '<p>No item selected</p>';
        return;
    }

    const item = state.actionItems.find(i => i.id === state.selectedItemId);
    if (!item) {
        closeModal('itemDetailsModal');
        state.selectedItemId = null;
        renderActionItems();
        return;
    }

    const ownersText = Array.isArray(item.owners) ? item.owners.join(', ') : '';

    contentDiv.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Task Name / Description</div>
            <div class="detail-value large">${escapeHtml(item.description)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Owners</div>
            <div class="detail-value">${escapeHtml(ownersText)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Due Date</div>
            <div class="detail-value">${formatDateLong(item.date)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">
                <span class="status-pill status-${item.status.toLowerCase().replace(' ', '-')}">
                    ${item.status}
                </span>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Latest Update</div>
            <div class="detail-value">${escapeHtml(item.latestUpdate || '') || '<em style="color: #A0AEC0;">No update provided</em>'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Next Steps</div>
            <div class="detail-value">${escapeHtml(item.nextSteps || '') || '<em style="color: #A0AEC0;">No next steps defined</em>'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Notes</div>
            <div class="detail-value rich-text-content">${item.notes || '<em style="color: #A0AEC0;">No notes added yet</em>'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Last Updated</div>
            <div class="detail-value">${formatDateTime(item.lastUpdated)}</div>
        </div>
    `;

    // Update button handlers
    document.getElementById('editItemDetailsBtn').onclick = () => {
        closeModal('itemDetailsModal');
        editItem(item.id);
    };

    document.getElementById('deleteItemDetailsBtn').onclick = () => {
        closeModal('itemDetailsModal');
        deleteItem(item.id);
    };
}

// ============================================
// DEADLINE EVENT HELPERS
// ============================================

function createDeadlineEvent(itemId, description, date, owners) {
    const ownersText = Array.isArray(owners) ? owners.join(', ') : '';
    const deadlineEvent = {
        id: `event-deadline-${itemId}`,
        title: `Deadline: ${description}`,
        date: date,
        category: 'Deadline',
        description: `<p><strong>Owners:</strong> ${escapeHtml(ownersText)}</p><p>Action item deadline for: ${escapeHtml(description)}</p>`,
        poster: null,
        linkedItemId: itemId
    };
    state.calendarEvents.push(deadlineEvent);
    saveToStorage('ey-calendar-events', state.calendarEvents);
    renderCalendar();
    renderEvents();
}

function updateDeadlineEvent(itemId, description, date, owners) {
    const eventId = `event-deadline-${itemId}`;
    const eventIndex = state.calendarEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        const ownersText = Array.isArray(owners) ? owners.join(', ') : '';
        state.calendarEvents[eventIndex] = {
            ...state.calendarEvents[eventIndex],
            title: `Deadline: ${description}`,
            date: date,
            description: `<p><strong>Owners:</strong> ${escapeHtml(ownersText)}</p><p>Action item deadline for: ${escapeHtml(description)}</p>`
        };
        saveToStorage('ey-calendar-events', state.calendarEvents);
        renderCalendar();
        renderEvents();
    }
}

// ============================================
// ADD/EDIT
// ============================================

export function openAddItemModal() {
    state.editingItemId = null;
    document.getElementById('itemModalTitle').textContent = 'Add Action Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemDate').valueAsDate = new Date();
    state.itemNotesEditor.setContents([]);
    openModal('itemModal');
}

export function editItem(id) {
    const item = state.actionItems.find(i => i.id === id);
    if (!item) return;

    state.editingItemId = id;
    document.getElementById('itemModalTitle').textContent = 'Edit Action Item';
    document.getElementById('itemDescription').value = item.description;

    // Handle owners array
    const ownersText = Array.isArray(item.owners) ? item.owners.join(', ') : '';
    document.getElementById('itemOwners').value = ownersText;

    document.getElementById('itemDate').value = item.date;
    document.getElementById('itemStatus').value = item.status;
    document.getElementById('itemLatestUpdate').value = item.latestUpdate || '';
    document.getElementById('itemNextSteps').value = item.nextSteps || '';

    // Set editor content - handle both HTML and plain text
    if (item.notes) {
        if (item.notes.startsWith('<')) {
            state.itemNotesEditor.root.innerHTML = item.notes;
        } else {
            state.itemNotesEditor.setText(item.notes);
        }
    } else {
        state.itemNotesEditor.setContents([]);
    }

    openModal('itemModal');
}

export function saveItem() {
    const description = document.getElementById('itemDescription').value.trim();
    const ownersInput = document.getElementById('itemOwners').value.trim();
    const date = document.getElementById('itemDate').value;
    const status = document.getElementById('itemStatus').value;
    const latestUpdate = document.getElementById('itemLatestUpdate').value.trim();
    const nextSteps = document.getElementById('itemNextSteps').value.trim();
    const notes = state.itemNotesEditor.root.innerHTML.trim();

    // Parse owners from comma-separated input
    const owners = ownersInput
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);

    if (!description || owners.length === 0 || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (state.editingItemId) {
        // Update existing item
        const index = state.actionItems.findIndex(i => i.id === state.editingItemId);
        if (index !== -1) {
            const oldDate = state.actionItems[index].date;
            state.actionItems[index] = {
                ...state.actionItems[index],
                description,
                owners,
                date,
                status,
                latestUpdate,
                nextSteps,
                notes,
                lastUpdated: new Date().toISOString()
            };

            // Update deadline event if date changed
            if (oldDate !== date) {
                updateDeadlineEvent(state.editingItemId, description, date, owners);
            }

            showToast('Action item updated successfully');
        }
    } else {
        // Add new item
        const newItem = {
            id: `item-${Date.now()}`,
            description,
            owners,
            date,
            status,
            latestUpdate,
            nextSteps,
            notes,
            lastUpdated: new Date().toISOString()
        };
        state.actionItems.unshift(newItem);

        // Create deadline event
        createDeadlineEvent(newItem.id, description, date, owners);

        showToast('Action item added successfully');
    }

    saveToStorage('ey-action-items', state.actionItems);
    renderActionItems();
    renderDetailsPanel(); // Always update sidebar
    closeModal('itemModal');
}

// ============================================
// DELETE
// ============================================

export function deleteItem(id) {
    const item = state.actionItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('deleteMessage').textContent =
        `Are you sure you want to delete "${item.description}"? This action cannot be undone.`;

    state.deleteCallback = () => {
        state.actionItems = state.actionItems.filter(i => i.id !== id);
        saveToStorage('ey-action-items', state.actionItems);

        // Delete associated deadline event
        const eventId = `event-deadline-${id}`;
        state.calendarEvents = state.calendarEvents.filter(e => e.id !== eventId);
        saveToStorage('ey-calendar-events', state.calendarEvents);

        // Clear selection if deleted item was selected
        if (state.selectedItemId === id) {
            state.selectedItemId = null;
        }

        renderActionItems();
        renderDetailsPanel();
        renderCalendar();
        renderEvents();
        showToast('Action item deleted');
        closeModal('deleteModal');
    };

    openModal('deleteModal');
}

// ============================================
// STATUS UPDATE MENU
// ============================================

export function openStatusMenu(itemId, event) {
    event.stopPropagation();
    state.statusMenuItemId = itemId;
    const menu = document.getElementById('statusMenu');
    const rect = event.target.getBoundingClientRect();

    // Position menu below the status pill
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5}px`;
    menu.classList.add('active');

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeStatusMenu);
    }, 0);
}

export function closeStatusMenu() {
    const menu = document.getElementById('statusMenu');
    menu.classList.remove('active');
    document.removeEventListener('click', closeStatusMenu);
}

export function updateItemStatus(newStatus) {
    if (!state.statusMenuItemId) return;

    const index = state.actionItems.findIndex(i => i.id === state.statusMenuItemId);
    if (index !== -1) {
        state.actionItems[index].status = newStatus;
        state.actionItems[index].lastUpdated = new Date().toISOString();
        saveToStorage('ey-action-items', state.actionItems);
        renderActionItems();
        renderDetailsPanel(); // Always update sidebar

        showToast(`Status updated to "${newStatus}"`);
    }

    closeStatusMenu();
    state.statusMenuItemId = null;
}

// ============================================
// SORTING
// ============================================

export function sortActionItems(field) {
    if (state.currentSort.field === field) {
        state.currentSort.direction = state.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        state.currentSort.field = field;
        state.currentSort.direction = 'asc';
    }

    state.actionItems.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return state.currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return state.currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    updateSortIcons();
    renderActionItems();
}

export function updateSortIcons() {
    document.querySelectorAll('.action-table th[data-sort]').forEach(th => {
        th.classList.remove('sorted');
        const icon = th.querySelector('i');
        icon.className = 'fas fa-sort';
    });

    if (state.currentSort.field) {
        const sortedTh = document.querySelector(`th[data-sort="${state.currentSort.field}"]`);
        if (sortedTh) {
            sortedTh.classList.add('sorted');
            const icon = sortedTh.querySelector('i');
            icon.className = state.currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    }
}

// ============================================
// EXPORTS FOR WINDOW (onclick handlers)
// ============================================

export function initActionItemsGlobal() {
    window.actionItems = {
        openAddItemModal,
        editItem,
        saveItem,
        deleteItem,
        viewItemDetails,
        closeDetailsPanel,
        openStatusMenu,
        closeStatusMenu,
        updateItemStatus,
        sortActionItems
    };
}
