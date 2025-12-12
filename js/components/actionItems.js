// ============================================
// ACTION ITEMS COMPONENT
// ============================================

import { state } from '../core/state.js';
import { saveToStorage } from '../services/storage.js';
import { escapeHtml, formatDate, formatDateTime, formatDateLong, fuzzyMatch } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { showToast } from '../ui/toast.js';

// ============================================
// RENDERING
// ============================================

export function renderActionItems() {
    const tbody = document.getElementById('actionTableBody');
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    // Filter items with improved fuzzy search
    let filteredItems = state.actionItems.filter(item => {
        const matchesSearch = !searchTerm ||
            fuzzyMatch(item.description, searchTerm) ||
            fuzzyMatch(item.owner, searchTerm) ||
            fuzzyMatch(item.taskforce, searchTerm) ||
            fuzzyMatch(item.notes, searchTerm);
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Clear table
    tbody.innerHTML = '';

    if (filteredItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #A0AEC0; font-style: italic;">
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

        row.innerHTML = `
            <td>
                <div style="font-weight: 600;" class="text-wrap">${escapeHtml(item.description)}</div>
            </td>
            <td class="text-wrap">${escapeHtml(item.owner)}</td>
            <td class="text-wrap">${escapeHtml(item.taskforce)}</td>
            <td style="white-space: nowrap;">${formatDate(item.date)}</td>
            <td>
                <span class="status-pill status-${item.status.toLowerCase().replace(' ', '-')}"
                      onclick="window.actionItems.openStatusMenu('${item.id}', event)">
                    ${item.status}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="window.actionItems.viewItemDetails('${item.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="window.actionItems.editItem('${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.actionItems.deleteItem('${item.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
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

    panel.innerHTML = `
        <div class="details-panel-empty">
            <i class="fas fa-file-alt"></i>
            <p>Select an action item to view details</p>
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

    contentDiv.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Task Name / Description</div>
            <div class="detail-value large">${escapeHtml(item.description)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Owner</div>
            <div class="detail-value">${escapeHtml(item.owner)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Taskforce Members</div>
            <div class="detail-value">${escapeHtml(item.taskforce)}</div>
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
            <div class="detail-label">Notes</div>
            <div class="detail-value">${item.notes || '<em style="color: #A0AEC0;">No notes added yet</em>'}</div>
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
    document.getElementById('itemOwner').value = item.owner;
    document.getElementById('itemTaskforce').value = item.taskforce;
    document.getElementById('itemDate').value = item.date;
    document.getElementById('itemStatus').value = item.status;

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
    const owner = document.getElementById('itemOwner').value.trim();
    const taskforce = document.getElementById('itemTaskforce').value.trim();
    const date = document.getElementById('itemDate').value;
    const status = document.getElementById('itemStatus').value;
    const notes = state.itemNotesEditor.root.innerHTML.trim();

    if (!description || !owner || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (state.editingItemId) {
        // Update existing item
        const index = state.actionItems.findIndex(i => i.id === state.editingItemId);
        if (index !== -1) {
            state.actionItems[index] = {
                ...state.actionItems[index],
                description,
                owner,
                taskforce,
                date,
                status,
                notes,
                lastUpdated: new Date().toISOString()
            };
            showToast('Action item updated successfully');

            // If this item is currently selected, re-render details
            if (state.selectedItemId === state.editingItemId) {
                renderDetailsPanel();
            }
        }
    } else {
        // Add new item
        const newItem = {
            id: `item-${Date.now()}`,
            description,
            owner,
            taskforce,
            date,
            status,
            notes,
            lastUpdated: new Date().toISOString()
        };
        state.actionItems.unshift(newItem);
        showToast('Action item added successfully');
    }

    saveToStorage('ey-action-items', state.actionItems);
    renderActionItems();
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

        // Clear selection if deleted item was selected
        if (state.selectedItemId === id) {
            state.selectedItemId = null;
        }

        renderActionItems();
        renderDetailsPanel();
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

        // Update details panel if this item is selected
        if (state.selectedItemId === state.statusMenuItemId) {
            renderDetailsPanel();
        }

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
