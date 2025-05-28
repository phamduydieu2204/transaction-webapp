import { getConstants } from './constants.js';
import { renderExpenseStats } from './renderExpenseStats.js';
import { determineAccountingType } from './accountingTypeManager.js';

export async function handleAddExpense() {
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  // Prepare expense data
  const expenseData = {
    expenseCategory: getValue("expenseCategory"),
    expenseSubCategory: getValue("expenseSubCategory"),
    expenseProduct: getValue("expenseProduct"),
    expensePackage: getValue("expensePackage")
  };
  
  // Determine accounting type
  const accountingType = await determineAccountingType(expenseData);
  console.log("📊 Determined accounting type:", accountingType);

  const data = {
    action: "addExpense",
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

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("✅ Chi phí đã được lưu! Mã chi phí: " + result.chiPhiId);
      document.getElementById("expenseForm").reset();
      document.getElementById("expenseDate").value = window.todayFormatted;
      document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";
      
      // ✅ Refresh danh sách và tổng chi phí sau khi thêm thành công
      renderExpenseStats();
    } else {
      alert("❌ Không thể lưu chi phí: " + result.message);
    }
  } catch (err) {
    alert("❌ Lỗi khi gửi dữ liệu: " + err.message);
  }
}