// Application State
let actionItems = [];
let calendarEvents = [];
let snapshots = [];
let currentSort = { field: null, direction: 'asc' };

// Initial Data
const initialActionItems = [
    {
        id: '1',
        description: 'Define AI strategy roadmap',
        owner: 'Sarah Chen',
        taskforce: ['Sarah Chen', 'John Doe'],
        date: '2025-12-15',
        status: 'In Progress',
        priority: 'High',
        section: 'Planning',
        progress: 65,
        notes: 'Waiting on stakeholder feedback',
        lastUpdated: new Date().toISOString()
    },
    {
        id: '2',
        description: 'Research AI tools and platforms',
        owner: 'Michael Brooks',
        taskforce: ['Michael Brooks'],
        date: '2025-12-20',
        status: 'Done',
        priority: 'Medium',
        section: 'Planning',
        progress: 100,
        notes: 'Completed analysis report',
        lastUpdated: new Date().toISOString()
    },
    {
        id: '3',
        description: 'Develop proof of concept',
        owner: 'Emily Watson',
        taskforce: ['Emily Watson', 'David Lee'],
        date: '2025-12-25',
        status: 'Not Started',
        priority: 'High',
        section: 'Execution',
        progress: 0,
        notes: '',
        lastUpdated: new Date().toISOString()
    }
];

const initialCalendarEvents = [
    {
        id: '1',
        title: 'AI Strategy Review',
        date: '2025-12-15',
        description: 'Quarterly review of AI initiatives and progress',
        category: 'Meeting',
        color: '#4299E1'
    },
    {
        id: '2',
        title: 'POC Presentation Deadline',
        date: '2025-12-25',
        description: 'Final deadline for proof of concept presentation',
        category: 'Deadline',
        color: '#F56565'
    }
];

// LocalStorage Functions
function loadFromStorage(key, defaultValue) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Initialize App
function initApp() {
    actionItems = loadFromStorage('ey-action-items', initialActionItems);
    calendarEvents = loadFromStorage('ey-calendar-events', initialCalendarEvents);
    snapshots = loadFromStorage('ey-snapshots', []);

    renderActionItems();
    renderCalendar();
    renderEvents();
    attachEventListeners();
}

// Render Action Items Table
function renderActionItems() {
    const tbody = document.getElementById('actionTableBody');
    tbody.innerHTML = '';

    actionItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" value="${item.description}"
                    onchange="updateItem('${item.id}', 'description', this.value)">
            </td>
            <td>
                <input type="text" value="${item.owner}"
                    onchange="updateItem('${item.id}', 'owner', this.value)">
            </td>
            <td>
                <input type="date" value="${item.date}"
                    onchange="updateItem('${item.id}', 'date', this.value)">
            </td>
            <td>
                <select onchange="updateItem('${item.id}', 'status', this.value)">
                    <option value="Not Started" ${item.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option value="In Progress" ${item.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Blocked" ${item.status === 'Blocked' ? 'selected' : ''}>Blocked</option>
                    <option value="Done" ${item.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
            </td>
            <td>
                <select onchange="updateItem('${item.id}', 'priority', this.value)">
                    <option value="High" ${item.priority === 'High' ? 'selected' : ''}>High</option>
                    <option value="Medium" ${item.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="Low" ${item.priority === 'Low' ? 'selected' : ''}>Low</option>
                </select>
            </td>
            <td>
                <select onchange="updateItem('${item.id}', 'section', this.value)">
                    <option value="Planning" ${item.section === 'Planning' ? 'selected' : ''}>Planning</option>
                    <option value="Execution" ${item.section === 'Execution' ? 'selected' : ''}>Execution</option>
                    <option value="Discovery" ${item.section === 'Discovery' ? 'selected' : ''}>Discovery</option>
                    <option value="Wrap-up" ${item.section === 'Wrap-up' ? 'selected' : ''}>Wrap-up</option>
                </select>
            </td>
            <td>
                <input type="number" min="0" max="100" value="${item.progress}"
                    style="width: 60px;" onchange="updateItem('${item.id}', 'progress', parseInt(this.value))">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.progress}%"></div>
                </div>
            </td>
            <td>
                <textarea onchange="updateItem('${item.id}', 'notes', this.value)">${item.notes}</textarea>
            </td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update Item
function updateItem(id, field, value) {
    const index = actionItems.findIndex(item => item.id === id);
    if (index !== -1) {
        actionItems[index][field] = value;
        actionItems[index].lastUpdated = new Date().toISOString();
        saveToStorage('ey-action-items', actionItems);
        renderActionItems();
        showToast('Item updated');
    }
}

// Add Item
function addItem() {
    const newItem = {
        id: `item-${Date.now()}`,
        description: 'New task',
        owner: 'Unassigned',
        taskforce: ['Unassigned'],
        date: new Date().toISOString().split('T')[0],
        status: 'Not Started',
        priority: 'Medium',
        section: 'Planning',
        progress: 0,
        notes: '',
        lastUpdated: new Date().toISOString()
    };
    actionItems.push(newItem);
    saveToStorage('ey-action-items', actionItems);
    renderActionItems();
    showToast('New item added');
}

// Delete Item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        actionItems = actionItems.filter(item => item.id !== id);
        saveToStorage('ey-action-items', actionItems);
        renderActionItems();
        showToast('Item deleted');
    }
}

// Sort Table
function sortTable(field) {
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

    renderActionItems();
    updateSortIcons();
}

// Update Sort Icons
function updateSortIcons() {
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('sorted');
        const icon = th.querySelector('.sort-icon');
        icon.textContent = '↕';
    });

    if (currentSort.field) {
        const sortedTh = document.querySelector(`[data-sort="${currentSort.field}"]`);
        if (sortedTh) {
            sortedTh.classList.add('sorted');
            const icon = sortedTh.querySelector('.sort-icon');
            icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
        }
    }
}

// Render Mini Calendar
function renderCalendar() {
    const calendarDiv = document.getElementById('miniCalendar');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `<div class="calendar-month">${monthNames[month]} ${year}</div>`;
    html += '<div class="calendar-grid">';

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = day === today.getDate();
        const hasEvent = calendarEvents.some(event => event.date === dateStr);

        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (hasEvent) classes += ' has-event';

        html += `<div class="${classes}">${day}</div>`;
    }

    html += '</div>';
    calendarDiv.innerHTML = html;
}

// Render Events
function renderEvents() {
    const eventsList = document.getElementById('eventsList');

    if (calendarEvents.length === 0) {
        eventsList.innerHTML = '<p style="color: #718096; text-align: center;">No events scheduled</p>';
        return;
    }

    const sortedEvents = [...calendarEvents].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    eventsList.innerHTML = sortedEvents.map(event => `
        <div class="event-card" style="border-left-color: ${event.color}">
            <div class="event-title">${event.title}</div>
            <div class="event-date">${formatDate(event.date)}</div>
            <div class="event-description">${event.description}</div>
            <span class="event-category">${event.category}</span>
        </div>
    `).join('');
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Add Event
function addEvent(event) {
    event.preventDefault();

    const newEvent = {
        id: `event-${Date.now()}`,
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        description: document.getElementById('eventDescription').value,
        category: document.getElementById('eventCategory').value,
        color: document.getElementById('eventColor').value
    };

    calendarEvents.push(newEvent);
    saveToStorage('ey-calendar-events', calendarEvents);
    renderCalendar();
    renderEvents();
    closeAddEventModal();
    showToast('Event added successfully');
}

// Show/Hide Add Event Modal
function showAddEventModal() {
    document.getElementById('addEventModal').classList.remove('hidden');
}

function closeAddEventModal() {
    document.getElementById('addEventModal').classList.add('hidden');
    document.getElementById('addEventForm').reset();
}

// Save Snapshot
function saveSnapshot() {
    const snapshot = {
        id: `snapshot-${Date.now()}`,
        timestamp: new Date().toISOString(),
        name: `Snapshot ${new Date().toLocaleString()}`,
        actionItems: JSON.parse(JSON.stringify(actionItems)),
        calendarEvents: JSON.parse(JSON.stringify(calendarEvents))
    };

    snapshots.unshift(snapshot);
    saveToStorage('ey-snapshots', snapshots);
    showToast('Snapshot saved successfully');
    renderSnapshots();
}

// Render Snapshots
function renderSnapshots() {
    const snapshotList = document.getElementById('snapshotList');

    if (snapshots.length === 0) {
        snapshotList.innerHTML = '<p style="color: #718096; text-align: center;">No snapshots yet</p>';
        return;
    }

    snapshotList.innerHTML = snapshots.map(snapshot => `
        <div class="snapshot-item">
            <div class="snapshot-name">${snapshot.name}</div>
            <div class="snapshot-meta">
                ${snapshot.actionItems.length} items • ${snapshot.calendarEvents.length} events
            </div>
            <div class="snapshot-actions">
                <button class="btn btn-sm btn-secondary" onclick="viewSnapshot('${snapshot.id}')">View</button>
            </div>
        </div>
    `).join('');
}

// View Snapshot
function viewSnapshot(id) {
    const snapshot = snapshots.find(s => s.id === id);
    if (snapshot) {
        alert(`Snapshot: ${snapshot.name}\n\nItems: ${snapshot.actionItems.length}\nEvents: ${snapshot.calendarEvents.length}\n\nNote: This is a read-only preview.`);
    }
}

// Toggle History Panel
function toggleHistoryPanel() {
    const panel = document.getElementById('snapshotPanel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        renderSnapshots();
    }
}

// Export to CSV
function exportToCSV() {
    const headers = ['Description', 'Owner', 'Due Date', 'Status', 'Priority', 'Section', 'Progress', 'Notes'];
    const rows = actionItems.map(item => [
        item.description,
        item.owner,
        item.date,
        item.status,
        item.priority,
        item.section,
        item.progress,
        item.notes
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ey-action-items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Exported to CSV');
}

// Show Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Attach Event Listeners
function attachEventListeners() {
    document.getElementById('addItemBtn').addEventListener('click', addItem);
    document.getElementById('saveSnapshotBtn').addEventListener('click', saveSnapshot);
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('viewHistoryBtn').addEventListener('click', toggleHistoryPanel);
    document.getElementById('closeSnapshotBtn').addEventListener('click', toggleHistoryPanel);

    document.getElementById('addEventBtn').addEventListener('click', showAddEventModal);
    document.getElementById('closeEventModalBtn').addEventListener('click', closeAddEventModal);
    document.getElementById('cancelEventBtn').addEventListener('click', closeAddEventModal);
    document.getElementById('addEventForm').addEventListener('submit', addEvent);

    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            sortTable(field);
        });
    });

    document.getElementById('addEventModal').addEventListener('click', (e) => {
        if (e.target.id === 'addEventModal') {
            closeAddEventModal();
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initApp);
