// ============================================
// UTILITY FUNCTIONS
// ============================================

export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Parse date string in local timezone to avoid off-by-one errors
export function parseDateLocal(dateStr) {
    // If dateStr is already a Date object, return it
    if (dateStr instanceof Date) return dateStr;

    // Parse YYYY-MM-DD format in local timezone
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        // Month is 0-indexed in JavaScript Date
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    // Fallback to default Date parsing
    return new Date(dateStr);
}

export function formatDate(dateStr) {
    const date = parseDateLocal(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export function formatDateLong(dateStr) {
    const date = parseDateLocal(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

export function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}

export function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function fuzzyMatch(text, search) {
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

export function highlightText(text, search) {
    if (!text || !search) return escapeHtml(text);

    const textLower = text.toLowerCase();
    const searchLower = search.toLowerCase();

    // Try direct substring match first (case-insensitive)
    const index = textLower.indexOf(searchLower);
    if (index !== -1) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + searchLower.length);
        const after = text.substring(index + searchLower.length);
        return `${escapeHtml(before)}<mark class="search-highlight">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
    }

    // Try regex match (more flexible)
    try {
        // Escape special regex characters
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSearch})`, 'gi');
        const escaped = escapeHtml(text);
        return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
    } catch (e) {
        // If regex fails, just return escaped text
        return escapeHtml(text);
    }
}
