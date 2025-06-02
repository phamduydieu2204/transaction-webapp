import { getConstants } from './constants.js';
import { renderExpenseStats } from './renderExpenseStats.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { showResultModal } from './showResultModal.js';

export async function handleAddExpense() {
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  const data = {
    action: "addExpense",
    expenseDate: getValue("expenseDate"),
    // Loại kế toán sẽ được tự động xác định ở backend dựa vào danh mục
    expenseCategory: getValue("expenseCategory"),
    expenseSubCategory: getValue("expenseSubCategory"),
    expenseProduct: getValue("expenseProduct"),
    expensePackage: getValue("expensePackage"),
    expenseAmount: parseFloat(getValue("expenseAmount")) || 0,
    expenseCurrency: getValue("expenseCurrency"),
    expenseBank: getValue("expenseBank"),
    expenseCard: getValue("expenseCard"),
    expenseRecurring: getValue("expenseRecurring"),
    expenseRenewDate: getValue("expenseRenewDate"),
    expenseSupplier: getValue("expenseSupplier"),
    expenseStatus: getValue("expenseStatus"),
    expenseNote: getValue("expenseNote"),
    tenNhanVien: window.userInfo?.tenNhanVien || "",
    maNhanVien: window.userInfo?.maNhanVien || ""
  };

  const { BACKEND_URL } = getConstants();

  showProcessingModal("Đang lưu chi phí...");

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    closeProcessingModal();
    
    if (result.status === "success") {
      showResultModal(`Chi phí đã được lưu! Mã chi phí: ${result.chiPhiId}`, true);
      document.getElementById("expenseForm").reset();
      document.getElementById("expenseDate").value = window.todayFormatted;
      document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";
      
      // ✅ Refresh danh sách và tổng chi phí sau khi thêm thành công
      renderExpenseStats();
    } else {
      showResultModal(`Không thể lưu chi phí: ${result.message}`, false);
    }
  } catch (err) {
    closeProcessingModal();
    showResultModal(`Lỗi khi gửi dữ liệu: ${err.message}`, false);
  }
}