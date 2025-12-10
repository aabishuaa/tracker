// ============================================
// TAB NAVIGATION
// ============================================

import { renderCalendar, renderEvents } from '../components/calendar.js';

export function switchTab(tabId) {
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
