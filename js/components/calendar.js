// ============================================
// CALENDAR & EVENTS COMPONENT
// ============================================

import { state } from '../core/state.js';
import { saveToStorage } from '../services/storage.js';
import { escapeHtml, formatDateISO, formatDateLong, parseDateLocal } from '../utils/helpers.js';
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
// EVENTS RENDERING WITH PAGINATION
// ============================================

export function renderEvents() {
    const eventsList = document.getElementById('eventsList');

    if (state.calendarEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No upcoming events scheduled</div>';
        updatePaginationControls(0, 0);
        return;
    }

    // Group and sort events by sections
    const groupedEvents = groupEventsBySections();

    // Flatten grouped events for pagination
    const allSectionedEvents = [];
    Object.entries(groupedEvents).forEach(([section, events]) => {
        if (events.length > 0) {
            allSectionedEvents.push({ type: 'section', title: section });
            events.forEach(event => allSectionedEvents.push({ type: 'event', data: event }));
        }
    });

    if (allSectionedEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No upcoming events scheduled</div>';
        updatePaginationControls(0, 0);
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(allSectionedEvents.length / state.eventsPerPage);
    const startIndex = state.currentEventsPage * state.eventsPerPage;
    const endIndex = startIndex + state.eventsPerPage;
    const pageItems = allSectionedEvents.slice(startIndex, endIndex);

    // Render events
    eventsList.innerHTML = '';

    pageItems.forEach(item => {
        if (item.type === 'section') {
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'events-section-header';
            sectionHeader.innerHTML = `<h4>${item.title}</h4>`;
            eventsList.appendChild(sectionHeader);
        } else {
            const event = item.data;
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.style.cursor = 'pointer';

            const iconClass = getEventIconClass(event.category);
            const posterHtml = event.poster ? `<img src="${event.poster}" alt="${escapeHtml(event.title)}" class="event-card-poster">` : '';

            eventCard.innerHTML = `
                ${posterHtml}
                <div class="event-card-content">
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
                        <div class="event-actions" onclick="event.stopPropagation()">
                            <button class="btn btn-secondary btn-sm" onclick="window.calendar.editEvent('${event.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window.calendar.deleteEvent('${event.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add click handler to view details
            eventCard.addEventListener('click', () => viewEventDetails(event.id));

            eventsList.appendChild(eventCard);
        }
    });

    updatePaginationControls(state.currentEventsPage + 1, totalPages);
}

function groupEventsBySections() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    const sections = {
        'Today': [],
        'This Week': [],
        'This Month': [],
        'Later': []
    };

    // Sort events by date
    const sortedEvents = [...state.calendarEvents].sort((a, b) =>
        parseDateLocal(a.date) - parseDateLocal(b.date)
    );

    sortedEvents.forEach(event => {
        const eventDate = parseDateLocal(event.date);

        if (eventDate.toDateString() === today.toDateString()) {
            sections['Today'].push(event);
        } else if (eventDate >= tomorrow && eventDate < weekFromNow) {
            sections['This Week'].push(event);
        } else if (eventDate >= weekFromNow && eventDate < monthFromNow) {
            sections['This Month'].push(event);
        } else {
            sections['Later'].push(event);
        }
    });

    return sections;
}

function updatePaginationControls(currentPage, totalPages) {
    const prevBtn = document.getElementById('eventsPrevBtn');
    const nextBtn = document.getElementById('eventsNextBtn');
    const pageInfo = document.getElementById('eventsPageInfo');

    if (!prevBtn || !nextBtn || !pageInfo) return;

    pageInfo.textContent = totalPages > 0 ? `${currentPage} / ${totalPages}` : '0 / 0';

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

export function navigateEventsPage(direction) {
    const groupedEvents = groupEventsBySections();
    const allSectionedEvents = [];

    Object.entries(groupedEvents).forEach(([section, events]) => {
        if (events.length > 0) {
            allSectionedEvents.push({ type: 'section', title: section });
            events.forEach(event => allSectionedEvents.push({ type: 'event', data: event }));
        }
    });

    const totalPages = Math.ceil(allSectionedEvents.length / state.eventsPerPage);

    state.currentEventsPage += direction;

    if (state.currentEventsPage < 0) {
        state.currentEventsPage = 0;
    } else if (state.currentEventsPage >= totalPages) {
        state.currentEventsPage = totalPages - 1;
    }

    renderEvents();
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
    state.currentEventPoster = null;
    document.getElementById('eventForm').reset();
    document.getElementById('eventDate').valueAsDate = new Date();
    state.eventDescriptionEditor.setContents([]);
    document.getElementById('eventPosterPreview').style.display = 'none';
    document.querySelector('#eventModal .modal-title').textContent = 'Add Calendar Event';
    document.getElementById('saveEventBtn').textContent = 'Add Event';
    openModal('eventModal');
}

export function editEvent(id) {
    const event = state.calendarEvents.find(e => e.id === id);
    if (!event) return;

    state.editingEventId = id;
    state.currentEventPoster = event.poster || null;
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

    // Show poster preview if exists
    if (event.poster) {
        document.getElementById('eventPosterImage').src = event.poster;
        document.getElementById('eventPosterPreview').style.display = 'block';
    } else {
        document.getElementById('eventPosterPreview').style.display = 'none';
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
    const poster = state.currentEventPoster || null;

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
                description,
                poster
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
            description,
            poster
        };
        state.calendarEvents.push(newEvent);
        showToast('Event added successfully');
    }

    saveToStorage('ey-calendar-events', state.calendarEvents);
    state.currentEventsPage = 0; // Reset pagination
    renderCalendar();
    renderEvents();
    closeModal('eventModal');
}

export function deleteEvent(id) {
    state.calendarEvents = state.calendarEvents.filter(e => e.id !== id);
    saveToStorage('ey-calendar-events', state.calendarEvents);
    state.currentEventsPage = 0; // Reset pagination
    renderCalendar();
    renderEvents();
    showToast('Event deleted');
}

// ============================================
// CALENDAR EVENTS EXCEL EXPORT
// ============================================

export function exportCalendarToExcel() {
    if (state.calendarEvents.length === 0) {
        showToast('No calendar events to export', 'error');
        return;
    }

    // Create summary statistics
    const totalEvents = state.calendarEvents.length;
    const eventsByCategory = {};

    state.calendarEvents.forEach(event => {
        eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    });

    // Sort events by date
    const sortedEvents = [...state.calendarEvents].sort((a, b) =>
        parseDateLocal(a.date) - parseDateLocal(b.date)
    );

    // Create workbook
    const wb = XLSX.utils.book_new();

    // ===== DASHBOARD SHEET =====
    const dashboardData = [
        ['EY AI Taskforce - Calendar Events Dashboard'],
        ['Generated:', new Date().toLocaleString()],
        [],
        ['SUMMARY STATISTICS'],
        ['Total Events', totalEvents],
        [],
        ['EVENTS BY CATEGORY'],
        ...Object.entries(eventsByCategory).map(([category, count]) => [category, count]),
        [],
        ['UPCOMING EVENTS (Next 7 Days)'],
    ];

    // Add upcoming events
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const upcomingEvents = sortedEvents.filter(event => {
        const eventDate = parseDateLocal(event.date);
        return eventDate >= today && eventDate <= weekFromNow;
    });

    dashboardData.push(['Event', 'Date', 'Category']);
    upcomingEvents.forEach(event => {
        dashboardData.push([event.title, formatDateLong(event.date), event.category]);
    });

    const dashboardWS = XLSX.utils.aoa_to_sheet(dashboardData);

    // Style dashboard title
    dashboardWS['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: '000000' } },
        fill: { fgColor: { rgb: 'FFE600' } },
        alignment: { horizontal: 'left', vertical: 'center' }
    };

    // Set column widths for dashboard
    dashboardWS['!cols'] = [
        { wch: 40 },
        { wch: 25 },
        { wch: 20 }
    ];

    // Merge title cell
    dashboardWS['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

    XLSX.utils.book_append_sheet(wb, dashboardWS, 'Dashboard');

    // ===== ALL EVENTS SHEET =====
    const eventsHeaders = ['Title', 'Date', 'Category', 'Description'];
    const eventsData = [eventsHeaders];

    sortedEvents.forEach(event => {
        // Strip HTML from description
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = event.description || '';
        const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

        eventsData.push([
            event.title,
            formatDateLong(event.date),
            event.category,
            plainDescription
        ]);
    });

    const eventsWS = XLSX.utils.aoa_to_sheet(eventsData);

    // Set column widths
    eventsWS['!cols'] = [
        { wch: 40 },  // Title
        { wch: 20 },  // Date
        { wch: 15 },  // Category
        { wch: 60 }   // Description
    ];

    // Style header row
    const range = XLSX.utils.decode_range(eventsWS['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!eventsWS[cellAddress]) continue;

        eventsWS[cellAddress].s = {
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

    // Style data rows
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!eventsWS[cellAddress]) continue;

            eventsWS[cellAddress].s = {
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

    XLSX.utils.book_append_sheet(wb, eventsWS, 'All Events');

    // ===== BY CATEGORY SHEETS =====
    Object.keys(eventsByCategory).forEach(category => {
        const categoryEvents = sortedEvents.filter(e => e.category === category);
        const categoryData = [eventsHeaders];

        categoryEvents.forEach(event => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = event.description || '';
            const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

            categoryData.push([
                event.title,
                formatDateLong(event.date),
                event.category,
                plainDescription
            ]);
        });

        const categoryWS = XLSX.utils.aoa_to_sheet(categoryData);
        categoryWS['!cols'] = [
            { wch: 40 },
            { wch: 20 },
            { wch: 15 },
            { wch: 60 }
        ];

        // Style header
        const catRange = XLSX.utils.decode_range(categoryWS['!ref']);
        for (let col = catRange.s.c; col <= catRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!categoryWS[cellAddress]) continue;

            categoryWS[cellAddress].s = {
                fill: { fgColor: { rgb: 'FFE600' } },
                font: { bold: true, name: 'Aptos', sz: 12, color: { rgb: '000000' } },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
            };
        }

        XLSX.utils.book_append_sheet(wb, categoryWS, category.substring(0, 31));
    });

    // Add metadata
    wb.Props = {
        Title: 'EY AI Taskforce Calendar Events',
        Subject: 'Calendar Events Dashboard',
        Author: 'EY AI Taskforce',
        CreatedDate: new Date()
    };

    // Generate filename
    const filename = `EY-Calendar-Events-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    showToast('Calendar events exported to Excel successfully');
}

// ============================================
// EVENT DETAILS MODAL
// ============================================

export function viewEventDetails(id) {
    const event = state.calendarEvents.find(e => e.id === id);
    if (!event) return;

    const modal = document.getElementById('eventDetailsModal');
    const content = document.getElementById('eventDetailsContent');

    const iconClass = getEventIconClass(event.category);
    const posterHtml = event.poster
        ? `<div class="event-detail-poster">
             <img src="${event.poster}" alt="${escapeHtml(event.title)}">
           </div>`
        : '';

    content.innerHTML = `
        ${posterHtml}
        <div class="event-detail-header">
            <div class="event-detail-icon">
                <i class="${iconClass}"></i>
            </div>
            <div>
                <h3 class="event-detail-title">${escapeHtml(event.title)}</h3>
                <p class="event-detail-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDateLong(event.date)}
                </p>
            </div>
        </div>

        <div class="event-detail-section">
            <div class="event-detail-label">
                <i class="fas fa-tag"></i>
                Category
            </div>
            <span class="event-category">${event.category}</span>
        </div>

        <div class="event-detail-section">
            <div class="event-detail-label">
                <i class="fas fa-align-left"></i>
                Description
            </div>
            <div class="event-detail-description">
                ${event.description || '<em style="color: #A0AEC0;">No description provided</em>'}
            </div>
        </div>
    `;

    // Store current event ID for edit/delete actions
    state.currentEventDetailsId = id;

    openModal('eventDetailsModal');
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
        deleteEvent,
        navigateEventsPage,
        exportCalendarToExcel,
        viewEventDetails
    };
}
