// handleAddOrUpdateModal.js

export function openAddOrUpdateModal() {
    const modal = document.getElementById('addOrUpdateModal');
    if (modal) {
      modal.style.display = 'block';
    } else {
      console.warn('addOrUpdateModal not found, creating it...');
      createAddOrUpdateModal();
    }
  }
  
  export function closeAddOrUpdateModal() {
    const modal = document.getElementById('addOrUpdateModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function createAddOrUpdateModal() {
    // Create the modal if it doesn't exist
    const modalHtml = `
      <div id="addOrUpdateModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Chọn hành động</h2>
            <button class="modal-close" onclick="window.handleCancelModal()"></button>
          </div>
          
          <div class="modal-body">
            <div class="modal-icon">
              <div style="width: 80px; height: 80px; margin: 0 auto; background: var(--info-gradient, linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="white">
                  <path d="M20 8 L20 25 M20 32 L20 32" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <p style="text-align: center; margin-top: 16px;">
              Bạn đang trong tiến trình sửa giao dịch.<br>
              Vui lòng chọn hành động bạn muốn thực hiện:
            </p>
          </div>
          
          <div class="modal-buttons">
            <button id="confirmAddNew" onclick="window.handleAddNewTransaction()" class="modal-btn modal-btn-success">
              Thêm mới
            </button>
            <button id="confirmUpdate" onclick="window.handleUpdateTransactionFromModal()" class="modal-btn modal-btn-primary">
              Cập nhật
            </button>
            <button id="confirmCancel" onclick="window.handleCancelModal()" class="modal-btn modal-btn-secondary">
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show the modal
    const modal = document.getElementById('addOrUpdateModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }
  
  export async function handleAddNewTransaction() {
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
    
    // Don't reset the form - user wants to keep the data they entered
    // Just update the date to today and proceed with adding
    try {
      const { setDefaultDates } = await import('./calculateEndDate.js');
      setDefaultDates(true); // Force update dates to today
    } catch (error) {
      console.warn("Could not update dates:", error);
    }
    
    if (window.handleAdd) {
      window.handleAdd();
    } else {
      console.error("❌ window.handleAdd is not available");
    }
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
  