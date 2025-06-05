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
    console.log("🆕 handleAddNewTransaction called - clearing edit state");
    window.currentEditTransactionId = null;
    window.currentEditIndex = -1;
    
    // Update state if available
    if (window.updateState) {
      window.updateState({ 
        currentEditTransactionId: null,
        currentEditIndex: -1 
      });
    }
    
    closeAddOrUpdateModal();
    console.log("🆕 Calling handleAdd() for new transaction");
    window.handleAdd(); // Gọi lại handleAdd() sau khi xóa tiến trình sửa
  }
  
  export function handleUpdateTransactionFromModal() {
    console.log("🔄 handleUpdateTransactionFromModal called");
    closeAddOrUpdateModal();
    window.handleUpdate(); // Gọi handleUpdate() luôn
  }
  
  export function handleCancelModal() {
    console.log("❌ handleCancelModal called");
    closeAddOrUpdateModal();
  }
  
  // Gắn sự kiện vào nút khi DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("confirmAddNew")?.addEventListener("click", handleAddNewTransaction);
    document.getElementById("confirmUpdate")?.addEventListener("click", handleUpdateTransactionFromModal);
    document.getElementById("confirmCancel")?.addEventListener("click", handleCancelModal);
  });
  