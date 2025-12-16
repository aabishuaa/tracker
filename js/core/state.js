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
        owners: ['Sarah Chen', 'Michael Brooks'],
        date: '2025-12-20',
        status: 'In Progress',
        notes: 'Stakeholder alignment meeting scheduled for next week. Draft roadmap under review.',
        latestUpdate: 'Completed initial stakeholder interviews and gathered requirements.',
        nextSteps: 'Finalize roadmap document and schedule review meeting with leadership team.',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'item-2',
        description: 'Complete vendor evaluation for AI platform selection',
        owners: ['Michael Brooks', 'Emily Watson'],
        date: '2025-12-18',
        status: 'Done',
        notes: 'Final report submitted. Recommendation: Azure OpenAI for initial POC.',
        latestUpdate: 'Submitted final evaluation report with vendor recommendations.',
        nextSteps: 'Await approval from procurement team to proceed with selected vendor.',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'item-3',
        description: 'Develop proof of concept for document automation',
        owners: ['Emily Watson', 'David Lee', 'Sarah Chen'],
        date: '2026-01-15',
        status: 'Not Started',
        notes: 'Pending approval from steering committee. Budget allocated.',
        latestUpdate: 'Budget allocation approved, awaiting final steering committee sign-off.',
        nextSteps: 'Set up development environment and begin initial architecture design.',
        lastUpdated: new Date().toISOString()
    }
];

export const seedEvents = [];
