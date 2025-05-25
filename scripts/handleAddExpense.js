import { getConstants } from './constants.js';
import { renderExpenseStats } from './renderExpenseStats.js';

export async function handleAddExpense() {
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  const data = {
    action: "addExpense",
    expenseDate: getValue("expenseDate"),
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

  console.log("📤 Dữ liệu thêm chi phí:", data);

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
      
      // ✅ Reset form sau khi thêm thành công
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
    console.error("Lỗi handleAddExpense:", err);
  }
}