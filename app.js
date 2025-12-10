// ============================================
// JAVASCRIPT - EY AI Taskforce Tracker
// ============================================

// Application State
let actionItems = [];
let calendarEvents = [];
let snapshots = [];
let currentSort = { field: null, direction: 'asc' };
let currentMonth = new Date();
let editingItemId = null;
let deleteCallback = null;
let selectedItemId = null;

// Initial seed data (professional and realistic) - NO CALENDAR EVENTS
const seedActionItems = [
    {
        id: 'item-1',
        description: 'Define AI implementation roadmap for Q1 2026',
        owner: 'Sarah Chen',
        taskforce: 'Sarah Chen, Michael Brooks',
        date: '2025-12-20',
        status: 'In Progress',
        notes: 'Stakeholder alignment meeting scheduled for next week. Draft roadmap under review.',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'item-2',
        description: 'Complete vendor evaluation for AI platform selection',
        owner: 'Michael Brooks',
        taskforce: 'Michael Brooks, Emily Watson',
        date: '2025-12-18',
        status: 'Done',
        notes: 'Final report submitted. Recommendation: Azure OpenAI for initial POC.',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'item-3',
        description: 'Develop proof of concept for document automation',
        owner: 'Emily Watson',
        taskforce: 'Emily Watson, David Lee, Sarah Chen',
        date: '2026-01-15',
        status: 'Not Started',
        notes: 'Pending approval from steering committee. Budget allocated.',
        lastUpdated: new Date().toISOString()
    }
];

// NO SEED EVENTS - empty array
const seedEvents = [];

// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
    // Load data from localStorage or use seed data
    actionItems = loadFromStorage('ey-action-items', seedActionItems);
    calendarEvents = loadFromStorage('ey-calendar-events', seedEvents);
    snapshots = loadFromStorage('ey-snapshots', []);

    // Render initial views
    renderActionItems();
    renderDetailsPanel();
    renderCalendar();
    renderEvents();

    // Attach event listeners
    attachEventListeners();
}

// ============================================
// DATA PERSISTENCE
// ============================================

function loadFromStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.error('Error loading from storage:', e);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to storage:', e);
        showToast('Error saving data', 'error');
    }
}

// ============================================
// TAB NAVIGATION
// ============================================

function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    // Re-render calendar if switching to that tab
    if (tabId === 'calendar-events') {
        renderCalendar();
        renderEvents();
    }
}

// ============================================
// ACTION ITEMS - RENDERING
// ============================================

function renderActionItems() {
    const tbody = document.getElementById('actionTableBody');
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    // Filter items with improved fuzzy search
    let filteredItems = actionItems.filter(item => {
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
        const isSelected = selectedItemId === item.id;
        if (isSelected) {
            row.style.backgroundColor = '#FFFEF0';
        }

        row.innerHTML = `
            <td>
                <div style="font-weight: 600; max-width: 300px;" class="text-truncate">${escapeHtml(item.description)}</div>
            </td>
            <td>${escapeHtml(item.owner)}</td>
            <td>${escapeHtml(item.taskforce)}</td>
            <td style="white-space: nowrap;">${formatDate(item.date)}</td>
            <td>
                <span class="status-pill status-${item.status.toLowerCase().replace(' ', '-')}"
                      onclick="openStatusMenu('${item.id}', event)">
                    ${item.status}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm" onclick="viewItemDetails('${item.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editItem('${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Improved fuzzy matching function
function fuzzyMatch(text, search) {
    if (!text) return false;
    const textLower = text.toLowerCase();
    const searchLower = search.toLowerCase();

    // Direct substring match
    if (textLower.includes(searchLower)) return true;

    // Fuzzy match - allows for typos and partial matches
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
        if (textLower[i] === searchLower[searchIndex]) {
            searchIndex++;
        }
    }
    return searchIndex === searchLower.length;
}

// ============================================
// ACTION ITEMS - DETAILS PANEL
// ============================================

function viewItemDetails(id) {
    selectedItemId = id;
    renderActionItems();
    renderDetailsPanel();

    // Scroll details panel into view on mobile
    const detailsPanel = document.getElementById('detailsPanel');
    if (window.innerWidth <= 1400) {
        detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function closeDetailsPanel() {
    selectedItemId = null;
    renderActionItems();
    renderDetailsPanel();
}

function renderDetailsPanel() {
    const panel = document.getElementById('detailsPanel');

    if (!selectedItemId) {
        panel.innerHTML = `
            <div class="details-panel-empty">
                <i class="fas fa-file-alt"></i>
                <p>Select an action item to view details</p>
            </div>
        `;
        return;
    }

    const item = actionItems.find(i => i.id === selectedItemId);
    if (!item) {
        closeDetailsPanel();
        return;
    }

    panel.innerHTML = `
        <div class="details-header">
            <h3 class="details-title">Item Details</h3>
            <button class="details-close" onclick="closeDetailsPanel()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="details-content">
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
                <div class="detail-value">${escapeHtml(item.notes) || '<em style="color: #A0AEC0;">No notes added yet</em>'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">${formatDateTime(item.lastUpdated)}</div>
            </div>
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="editItem('${item.id}')">
                    <i class="fas fa-edit"></i>
                    Edit Item
                </button>
                <button class="btn btn-danger" onclick="deleteItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
}

// ============================================
// ACTION ITEMS - ADD/EDIT
// ============================================

function openAddItemModal() {
    editingItemId = null;
    document.getElementById('itemModalTitle').textContent = 'Add Action Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemDate').valueAsDate = new Date();
    openModal('itemModal');
}

function editItem(id) {
    const item = actionItems.find(i => i.id === id);
    if (!item) return;

    editingItemId = id;
    document.getElementById('itemModalTitle').textContent = 'Edit Action Item';
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemOwner').value = item.owner;
    document.getElementById('itemTaskforce').value = item.taskforce;
    document.getElementById('itemDate').value = item.date;
    document.getElementById('itemStatus').value = item.status;
    document.getElementById('itemNotes').value = item.notes;
    openModal('itemModal');
}

function saveItem() {
    const description = document.getElementById('itemDescription').value.trim();
    const owner = document.getElementById('itemOwner').value.trim();
    const taskforce = document.getElementById('itemTaskforce').value.trim();
    const date = document.getElementById('itemDate').value;
    const status = document.getElementById('itemStatus').value;
    const notes = document.getElementById('itemNotes').value.trim();

    if (!description || !owner || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (editingItemId) {
        // Update existing item
        const index = actionItems.findIndex(i => i.id === editingItemId);
        if (index !== -1) {
            actionItems[index] = {
                ...actionItems[index],
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
            if (selectedItemId === editingItemId) {
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
        actionItems.unshift(newItem);
        showToast('Action item added successfully');
    }

    saveToStorage('ey-action-items', actionItems);
    renderActionItems();
    closeModal('itemModal');
}

// ============================================
// ACTION ITEMS - DELETE
// ============================================

function deleteItem(id) {
    const item = actionItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('deleteMessage').textContent =
        `Are you sure you want to delete "${item.description}"? This action cannot be undone.`;

    deleteCallback = () => {
        actionItems = actionItems.filter(i => i.id !== id);
        saveToStorage('ey-action-items', actionItems);

        // Clear selection if deleted item was selected
        if (selectedItemId === id) {
            selectedItemId = null;
        }

        renderActionItems();
        renderDetailsPanel();
        showToast('Action item deleted');
        closeModal('deleteModal');
    };

    openModal('deleteModal');
}

// ============================================
// ACTION ITEMS - SORTING
// ============================================

function sortActionItems(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }

    actionItems.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    updateSortIcons();
    renderActionItems();
}

function updateSortIcons() {
    document.querySelectorAll('.action-table th[data-sort]').forEach(th => {
        th.classList.remove('sorted');
        const icon = th.querySelector('i');
        icon.className = 'fas fa-sort';
    });

    if (currentSort.field) {
        const sortedTh = document.querySelector(`th[data-sort="${currentSort.field}"]`);
        if (sortedTh) {
            sortedTh.classList.add('sorted');
            const icon = sortedTh.querySelector('i');
            icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    }
}

// ============================================
// CALENDAR - RENDERING
// ============================================

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Update month title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonthTitle').textContent = `${monthNames[month]} ${year}`;

    // Clear grid
    grid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Calculate calendar days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const todayStr = formatDateISO(today);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = day;
        grid.appendChild(dayEl);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateISO(date);
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';

        if (dateStr === todayStr) {
            dayEl.classList.add('today');
        }

        const hasEvents = calendarEvents.some(e => e.date === dateStr);
        if (hasEvents) {
            dayEl.classList.add('has-events');
        }

        dayEl.textContent = day;
        grid.appendChild(dayEl);
    }

    // Next month days
    const totalCells = grid.children.length - 7; // Subtract day headers
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = day;
        grid.appendChild(dayEl);
    }
}

function navigateMonth(direction) {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    renderCalendar();
}

function goToToday() {
    currentMonth = new Date();
    renderCalendar();
}

// ============================================
// EVENTS - RENDERING
// ============================================

function renderEvents() {
    const eventsList = document.getElementById('eventsList');

    if (calendarEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No upcoming events scheduled</div>';
        return;
    }

    // Sort events by date
    const sortedEvents = [...calendarEvents].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    eventsList.innerHTML = '';

    sortedEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';

        const iconClass = getEventIconClass(event.category);

        eventCard.innerHTML = `
            <div class="event-card-header">
                <div class="event-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="event-details">
                    <div class="event-title">${escapeHtml(event.title)}</div>
                    <div class="event-date">${formatDateLong(event.date)}</div>
                </div>
            </div>
            <div class="event-description">${escapeHtml(event.description)}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="event-category">${event.category}</span>
                <div class="event-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        eventsList.appendChild(eventCard);
    });
}

function getEventIconClass(category) {
    const iconMap = {
        'Meeting': 'fas fa-users',
        'Deadline': 'fas fa-flag-checkered',
        'Review': 'fas fa-clipboard-check',
        'Workshop': 'fas fa-chalkboard-teacher',
        'Other': 'fas fa-calendar'
    };
    return iconMap[category] || 'fas fa-calendar';
}

// ============================================
// EVENTS - ADD/DELETE
// ============================================

function openAddEventModal() {
    document.getElementById('eventForm').reset();
    document.getElementById('eventDate').valueAsDate = new Date();
    openModal('eventModal');
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const category = document.getElementById('eventCategory').value;
    const description = document.getElementById('eventDescription').value.trim();

    if (!title || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const newEvent = {
        id: `event-${Date.now()}`,
        title,
        date,
        category,
        description
    };

    calendarEvents.push(newEvent);
    saveToStorage('ey-calendar-events', calendarEvents);
    renderCalendar();
    renderEvents();
    showToast('Event added successfully');
    closeModal('eventModal');
}

function deleteEvent(id) {
    calendarEvents = calendarEvents.filter(e => e.id !== id);
    saveToStorage('ey-calendar-events', calendarEvents);
    renderCalendar();
    renderEvents();
    showToast('Event deleted');
}

// ============================================
// SNAPSHOTS & VISUALIZATION
// ============================================

function saveSnapshot() {
    const timestamp = new Date();
    const snapshot = {
        id: `snapshot-${Date.now()}`,
        name: `Snapshot – ${timestamp.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })}`,
        timestamp: timestamp.toISOString(),
        itemsCount: actionItems.length,
        eventsCount: calendarEvents.length,
        actionItems: JSON.parse(JSON.stringify(actionItems)),
        calendarEvents: JSON.parse(JSON.stringify(calendarEvents))
    };

    snapshots.unshift(snapshot);
    saveToStorage('ey-snapshots', snapshots);
    showToast('Snapshot saved successfully');
}

function renderSnapshotVisualization() {
    // Calculate statistics
    const totalItems = actionItems.length;
    const statusCounts = {
        'Not Started': 0,
        'In Progress': 0,
        'Blocked': 0,
        'Done': 0
    };

    actionItems.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    const completionRate = totalItems > 0 ? Math.round((statusCounts['Done'] / totalItems) * 100) : 0;
    const overdueCount = actionItems.filter(item => {
        const dueDate = new Date(item.date);
        const today = new Date();
        return item.status !== 'Done' && dueDate < today;
    }).length;

    const container = document.getElementById('snapshotVizContainer');

    container.innerHTML = `
        <div class="snapshot-viz-header">
            <h2 class="snapshot-viz-title">Project Snapshot</h2>
            <div style="font-size: 0.9rem; color: #718096;">
                <i class="fas fa-clock"></i> ${formatDateTime(new Date().toISOString())}
            </div>
        </div>

        <div class="snapshot-stats">
            <div class="stat-card">
                <div class="stat-label">Total Items</div>
                <div class="stat-value">${totalItems}</div>
                <div class="stat-subtext">Action items tracked</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Completion Rate</div>
                <div class="stat-value">${completionRate}%</div>
                <div class="stat-subtext">${statusCounts['Done']} of ${totalItems} completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">In Progress</div>
                <div class="stat-value">${statusCounts['In Progress']}</div>
                <div class="stat-subtext">Currently active</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Overdue Items</div>
                <div class="stat-value">${overdueCount}</div>
                <div class="stat-subtext">Require attention</div>
            </div>
        </div>

        <div class="snapshot-chart">
            <h3 class="chart-title">Status Distribution</h3>
            <div class="chart-bars">
                ${Object.entries(statusCounts).map(([status, count]) => {
                    const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
                    return `
                        <div class="chart-bar-item">
                            <div class="chart-bar-label">${status}</div>
                            <div class="chart-bar-track">
                                <div class="chart-bar-fill" style="width: ${percentage}%">
                                    ${count} (${Math.round(percentage)}%)
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ============================================
// EXCEL EXPORT (ENHANCED)
// ============================================

function exportToExcel() {
    // Prepare header with styling
    const headers = ['Task Name / Description', 'Owner', 'Taskforce', 'Due Date', 'Status', 'Notes'];

    // Prepare data
    const data = [headers];

    actionItems.forEach(item => {
        data.push([
            item.description,
            item.owner,
            item.taskforce,
            formatDate(item.date),
            item.status,
            item.notes || ''
        ]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths for better readability
    ws['!cols'] = [
        { wch: 45 },  // Task Name
        { wch: 20 },  // Owner
        { wch: 30 },  // Taskforce
        { wch: 15 },  // Date
        { wch: 15 },  // Status
        { wch: 50 }   // Notes
    ];

    // Apply professional styling to header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
            fill: { fgColor: { rgb: 'FFE600' } },
            font: { bold: true, name: 'Aptos', sz: 12, color: { rgb: '000000' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };
    }

    // Apply styling to data rows
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!ws[cellAddress]) continue;

            ws[cellAddress].s = {
                font: { name: 'Aptos', sz: 11 },
                alignment: { vertical: 'top', wrapText: true },
                border: {
                    top: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    left: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    right: { style: 'thin', color: { rgb: 'E2E8F0' } }
                }
            };
        }
    }

    // Set row heights
    ws['!rows'] = [{ hpt: 25 }]; // Header row height

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Action Items');

    // Add metadata
    wb.Props = {
        Title: 'EY AI Taskforce Action Items',
        Subject: 'Action Items Tracker',
        Author: 'EY AI Taskforce',
        CreatedDate: new Date()
    };

    // Generate filename with current date
    const today = new Date();
    const filename = `EY-AI-Taskforce-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    showToast('Excel exported successfully');
}

// ============================================
// MODAL MANAGEMENT
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');

    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = document.getElementById('toastMessage');

    messageEl.textContent = message;

    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle toast-icon';
    } else {
        icon.className = 'fas fa-check-circle toast-icon';
    }

    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
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
        if (deleteCallback) deleteCallback();
    });
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('closeDeleteModal').addEventListener('click', () => closeModal('deleteModal'));

    // Table sorting
    document.querySelectorAll('.action-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            sortActionItems(th.dataset.sort);
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
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateLong(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// INITIALIZE APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', initializeApp);
