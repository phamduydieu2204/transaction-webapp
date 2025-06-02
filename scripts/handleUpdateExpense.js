import { getConstants } from './constants.js';
import { determineAccountingType } from './accountingTypeManager.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { showResultModal } from './showResultModal.js';

export async function handleUpdateExpense() {
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  // Prepare expense data for accounting type
  const expenseData = {
    expenseCategory: getValue("expenseCategory"),
    expenseSubCategory: getValue("expenseSubCategory"),
    expenseProduct: getValue("expenseProduct"),
    expensePackage: getValue("expensePackage")
  };
  
  // Determine accounting type
  const accountingType = await determineAccountingType(expenseData);

  const data = {
    action: "updateExpense",
    expenseId: getValue("expenseId"), // ✅ Bạn cần có 1 input ẩn hoặc field nào chứa mã chi phí gốc để cập nhật
    expenseDate: getValue("expenseDate"),
    accountingType: accountingType, // New field
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

  showProcessingModal("Đang cập nhật chi phí...");

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    closeProcessingModal();
    
    if (result.status === "success") {
      showResultModal("Đã cập nhật chi phí thành công!", true);
      document.getElementById("expenseForm").reset();
      document.getElementById("expenseDate").value = window.todayFormatted;
    } else {
      showResultModal(`Không thể cập nhật chi phí: ${result.message}`, false);
    }
  } catch (err) {
    closeProcessingModal();
    showResultModal(`Lỗi kết nối: ${err.message}`, false);
  }
}
