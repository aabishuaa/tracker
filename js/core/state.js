// ============================================
// APPLICATION STATE
// ============================================

export const state = {
    actionItems: [],
    calendarEvents: [],
    snapshots: [],
    currentSort: { field: null, direction: 'asc' },
    currentMonth: new Date(),
    editingItemId: null,
    editingEventId: null,
    deleteCallback: null,
    selectedItemId: null,
    statusMenuItemId: null,
    currentEventPoster: null,
    currentEventDetailsId: null,

    // Events Pagination
    currentEventsPage: 0,
    eventsPerPage: 5,

    // Rich Text Editors
    itemNotesEditor: null,
    eventDescriptionEditor: null,

    // Charts
    statusBarChart: null,
    statusPieChart: null
};

// Initial seed data
export const seedActionItems = [
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

export const seedEvents = [];
