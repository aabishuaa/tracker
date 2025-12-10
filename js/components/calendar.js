// ============================================
// CALENDAR & EVENTS COMPONENT
// ============================================

import { state } from '../core/state.js';
import { saveToStorage } from '../services/storage.js';
import { escapeHtml, formatDateISO, formatDateLong } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { showToast } from '../ui/toast.js';

// ============================================
// CALENDAR RENDERING
// ============================================

export function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth();

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

        const hasEvents = state.calendarEvents.some(e => e.date === dateStr);
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

export function navigateMonth(direction) {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + direction, 1);
    renderCalendar();
}

export function goToToday() {
    state.currentMonth = new Date();
    renderCalendar();
}

// ============================================
// EVENTS RENDERING
// ============================================

export function renderEvents() {
    const eventsList = document.getElementById('eventsList');

    if (state.calendarEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No upcoming events scheduled</div>';
        return;
    }

    // Sort events by date
    const sortedEvents = [...state.calendarEvents].sort((a, b) =>
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
            <div class="event-description">${event.description}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="event-category">${event.category}</span>
                <div class="event-actions">
                    <button class="btn btn-secondary btn-sm" onclick="window.calendar.editEvent('${event.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.calendar.deleteEvent('${event.id}')" title="Delete">
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
// EVENTS ADD/EDIT/DELETE
// ============================================

export function openAddEventModal() {
    state.editingEventId = null;
    document.getElementById('eventForm').reset();
    document.getElementById('eventDate').valueAsDate = new Date();
    state.eventDescriptionEditor.setContents([]);
    document.querySelector('#eventModal .modal-title').textContent = 'Add Calendar Event';
    document.getElementById('saveEventBtn').textContent = 'Add Event';
    openModal('eventModal');
}

export function editEvent(id) {
    const event = state.calendarEvents.find(e => e.id === id);
    if (!event) return;

    state.editingEventId = id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventCategory').value = event.category;

    // Set editor content - handle both HTML and plain text
    if (event.description) {
        if (event.description.startsWith('<')) {
            state.eventDescriptionEditor.root.innerHTML = event.description;
        } else {
            state.eventDescriptionEditor.setText(event.description);
        }
    } else {
        state.eventDescriptionEditor.setContents([]);
    }

    document.querySelector('#eventModal .modal-title').textContent = 'Edit Calendar Event';
    document.getElementById('saveEventBtn').textContent = 'Save Changes';
    openModal('eventModal');
}

export function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const category = document.getElementById('eventCategory').value;
    const description = state.eventDescriptionEditor.root.innerHTML.trim();

    if (!title || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (state.editingEventId) {
        // Update existing event
        const index = state.calendarEvents.findIndex(e => e.id === state.editingEventId);
        if (index !== -1) {
            state.calendarEvents[index] = {
                ...state.calendarEvents[index],
                title,
                date,
                category,
                description
            };
            showToast('Event updated successfully');
        }
    } else {
        // Add new event
        const newEvent = {
            id: `event-${Date.now()}`,
            title,
            date,
            category,
            description
        };
        state.calendarEvents.push(newEvent);
        showToast('Event added successfully');
    }

    saveToStorage('ey-calendar-events', state.calendarEvents);
    renderCalendar();
    renderEvents();
    closeModal('eventModal');
}

export function deleteEvent(id) {
    state.calendarEvents = state.calendarEvents.filter(e => e.id !== id);
    saveToStorage('ey-calendar-events', state.calendarEvents);
    renderCalendar();
    renderEvents();
    showToast('Event deleted');
}

// ============================================
// EXPORTS FOR WINDOW (onclick handlers)
// ============================================

export function initCalendarGlobal() {
    window.calendar = {
        navigateMonth,
        goToToday,
        openAddEventModal,
        editEvent,
        saveEvent,
        deleteEvent
    };
}
