import { getConstants } from './constants.js';
import { renderExpenseStats } from './renderExpenseStats.js';
import { refreshExpenseTable } from './updateExpenseTable.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { cacheManager } from './core/cacheManager.js';
import { uiBlocker } from './uiBlocker.js';

export async function handleAddExpense() {
  // Khóa UI ngay khi bắt đầu xử lý
  uiBlocker.block();
  
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

  // Không cần gọi showProcessingModal vì đã có uiBlocker

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)

    const result = await response.json();
    // Không cần closeProcessingModal vì dùng uiBlocker
    
    if (result.status === "success") {
      showResultModal(`Chi phí đã được lưu! Mã chi phí: ${result.chiPhiId}`, true);
      document.getElementById("expenseForm").reset();
      
      // Set default values after reset
      document.getElementById("expenseDate").value = window.todayFormatted;
      document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";
      document.getElementById("expenseCurrency").value = "VND";
      document.getElementById("expenseRecurring").value = "Chi một lần";
      document.getElementById("expenseStatus").value = "Đã thanh toán";
      
      // ✅ Clear cache để đảm bảo lấy data mới nhất
      cacheManager.clearExpenseCaches();
      
      // ✅ Refresh danh sách chi phí từ server để lấy data mới nhất
      await renderExpenseStats();
      
      // ✅ Sau khi có data mới, refresh table
      refreshExpenseTable();
    } else {
      showResultModal(`Không thể lưu chi phí: ${result.message}`, false);
    }
  } catch (err) {
    // Không cần closeProcessingModal vì dùng uiBlocker
    showResultModal(`Lỗi khi gửi dữ liệu: ${err.message}`, false);
  } finally {
    // Luôn mở khóa UI khi kết thúc
    uiBlocker.unblock();
  }
}