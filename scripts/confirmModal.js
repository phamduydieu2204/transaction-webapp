export function openConfirmModal(message, callback) {
    console.log("Mở modal xác nhận:", message);
    const modal = document.getElementById("confirmDeleteModal");
    const messageEl = document.getElementById("confirmMessage");
    messageEl.textContent = message;
    window.confirmCallback = callback;
    modal.style.display = "block";
  }
  
  export function closeConfirmModal() {
    console.log("Đóng modal xác nhận");
    const modal = document.getElementById("confirmDeleteModal");
    modal.style.display = "none";
    window.confirmCallback = null;
  }
  
  export function confirmDelete(result) {
    console.log("Kết quả xác nhận:", result);
    if (window.confirmCallback) {
      window.confirmCallback(result);
    }
    closeConfirmModal();
  }