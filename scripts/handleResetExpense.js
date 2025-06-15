import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { initExpenseDropdowns } from './initExpenseDropdowns.js';

export function handleResetExpense() {
  showProcessingModal("Đang làm mới form...");
  
  try {
    // Reset form
    document.getElementById("expenseForm").reset();
    
    // Set default values
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
    
    closeProcessingModal();
    showResultModal("Form đã được làm mới!", true);
  } catch (err) {
    closeProcessingModal();
    showResultModal(`Lỗi khi làm mới form: ${err.message}`, false);
  }
}