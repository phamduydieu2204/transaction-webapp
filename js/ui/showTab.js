// Chuyển tab
export function showTab(tabId) {
    document.querySelectorAll('#main-page > div').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}
