// ============================================
// DATA PERSISTENCE SERVICE
// ============================================

import { showToast } from '../ui/toast.js';

export function loadFromStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.error('Error loading from storage:', e);
        return defaultValue;
    }
}

export function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to storage:', e);
        showToast('Error saving data', 'error');
    }
}
