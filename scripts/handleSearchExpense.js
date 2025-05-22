import { getConstants } from './constants.js';
import { renderExpenseStats } from './renderExpenseStats.js';

export async function handleSearchExpense() {
  const { BACKEND_URL } = getConstants();
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  const conditions = {
    expenseDate: getValue("expenseDate"),
    expenseCategory: getValue("expenseCategory"),
    expenseSubCategory: getValue("expenseSubCategory"),
    expenseProduct: getValue("expenseProduct"),
    expensePackage: getValue("expensePackage"),
    expenseCurrency: getValue("expenseCurrency"),
    expenseBank: getValue("expenseBank"),
    expenseCard: getValue("expenseCard"),
    expenseRecurring: getValue("expenseRecurring"),
    expenseRenewDate: getValue("expenseRenewDate"),
    expenseSupplier: getValue("expenseSupplier"),
    expenseStatus: getValue("expenseStatus"),
    expenseNote: getValue("expenseNote")
  };

  const data = {
    action: "searchExpenses",
    maNhanVien: window.userInfo?.maNhanVien || "",
    conditions
  };

  console.log("📤 Tìm kiếm chi phí với điều kiện:", data);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    window.currentExpensePage = 1;
    window.expenseList = result.data || [];
    renderExpenseStats(); // dùng lại để hiển thị bảng
  } catch (err) {
    alert("❌ Lỗi khi tìm kiếm chi phí: " + err.message);
  }
}
