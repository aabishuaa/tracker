// ============================================
// RICH TEXT EDITORS
// ============================================

import { state } from '../core/state.js';

export function initializeEditors() {
    // Initialize Quill editor for action item notes
    state.itemNotesEditor = new Quill('#itemNotesEditor', {
        theme: 'snow',
        placeholder: 'Add notes with rich formatting...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ]
        }
    });

    // Initialize Quill editor for event description
    state.eventDescriptionEditor = new Quill('#eventDescriptionEditor', {
        theme: 'snow',
        placeholder: 'Add event description...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['clean']
            ]
        }
    });
}
