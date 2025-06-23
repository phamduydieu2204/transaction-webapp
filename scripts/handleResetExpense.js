import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { initExpenseDropdowns } from './initExpenseDropdowns.js';
import { getConstants } from './constants.js';

export async function handleResetExpense() {
  showProcessingModal("Đang làm mới form và tải lại dữ liệu...");
  
  try {
    // Reset form về trạng thái ban đầu
    document.getElementById("expenseForm").reset();
    
    // Set default values giống như khi tải trang
    document.getElementById("expenseDate").value = window.todayFormatted || "";
    document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";
    
    // Set default dropdown values
    document.getElementById("expenseCurrency").value = "VND";
    document.getElementById("expenseRecurring").value = "Chi một lần";
    document.getElementById("expenseStatus").value = "Đã thanh toán";
    
    // Re-initialize dropdowns
    initExpenseDropdowns();
    
    // Clear any expense ID if in edit mode
    const expenseIdField = document.getElementById("expenseId");
    if (expenseIdField) {
      expenseIdField.value = "";
    }
    
    // Reset search state
    window.isExpenseSearching = false;
    window.currentExpensePage = 1;
    
    // Reload all expenses như khi tải trang ban đầu
    await loadAllExpenses();
    
    closeProcessingModal();
    showResultModal("Form và dữ liệu đã được làm mới!", true);
  } catch (err) {
    closeProcessingModal();
    showResultModal(`Lỗi khi làm mới: ${err.message}`, false);
  }
}

/**
 * Load all expenses like when page first loads
 */
async function loadAllExpenses() {
  const { BACKEND_URL } = getConstants();
  
  if (!window.userInfo) {
    console.warn('⚠️ No user info found');
    return;
  }
  
  const data = {
    action: 'searchExpenses',
    maNhanVien: window.userInfo.maNhanVien,
    conditions: {} // Empty conditions to get all expenses
  };
  
  try {
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Store expenses globally
      window.expenseList = result.data || [];
      window.currentExpensePage = 1;
      window.isExpenseSearching = false;
      
      
      // Update table immediately
      if (typeof window.updateExpenseTable === 'function') {
        window.updateExpenseTable();
      }
      
      // Update stats if available
      if (typeof window.renderExpenseStats === 'function') {
        window.renderExpenseStats();
      }
      
    } else {
      console.error('❌ Error loading expenses:', result.message);
      window.expenseList = [];
    }
    
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
    window.expenseList = [];
    throw error;
  }
}