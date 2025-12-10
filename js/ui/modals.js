// ============================================
// MODAL MANAGEMENT
// ============================================

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');

    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    }, 100);
}

export function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}
