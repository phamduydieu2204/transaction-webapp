// handleAddOrUpdateModal.js

export function openAddOrUpdateModal() {
    const modal = document.getElementById('addOrUpdateModal');
    modal.style.display = 'block';
  }
  
  export function closeAddOrUpdateModal() {
    const modal = document.getElementById('addOrUpdateModal');
    modal.style.display = 'none';
  }
  
  export function handleAddNewTransaction() {
    window.currentEditTransactionId = null;
    closeAddOrUpdateModal();
    window.handleAdd(); // Gọi lại handleAdd() sau khi xóa tiến trình sửa
  }
  
  export function handleUpdateTransactionFromModal() {
    closeAddOrUpdateModal();
    window.handleUpdate(); // Gọi handleUpdate() luôn
  }
  
  export function handleCancelModal() {
    closeAddOrUpdateModal();
  }
  
  // Gắn sự kiện vào nút khi DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("confirmAddNew")?.addEventListener("click", handleAddNewTransaction);
    document.getElementById("confirmUpdate")?.addEventListener("click", handleUpdateTransactionFromModal);
    document.getElementById("confirmCancel")?.addEventListener("click", handleCancelModal);
  });
  