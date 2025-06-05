// handleAddOrUpdateModal.js

export function openAddOrUpdateModal() {
    const modal = document.getElementById('addOrUpdateModal');
    modal.style.display = 'block';
  }
  
  export function closeAddOrUpdateModal() {
    const modal = document.getElementById('addOrUpdateModal');
    modal.style.display = 'none';
  }
  
  export async function handleAddNewTransaction() {
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
    
    // Reset form and set today's date
    console.log("🆕 Resetting form to clear old data");
    if (window.handleReset) {
      await window.handleReset();
    } else {
      // Fallback: manually set today's date
      const { setDefaultDates } = await import('./calculateEndDate.js');
      setDefaultDates(true);
    }
    
    console.log("🆕 Form reset complete - ready for new transaction");
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
  