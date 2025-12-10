// ============================================
// TOAST NOTIFICATIONS
// ============================================

export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = document.getElementById('toastMessage');

    messageEl.textContent = message;

    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle toast-icon';
    } else {
        icon.className = 'fas fa-check-circle toast-icon';
    }

    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
