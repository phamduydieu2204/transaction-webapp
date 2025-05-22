import { getConstants } from './constants.js';

export async function handleUpdateExpense() {
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  const data = {
    action: "updateExpense",
    expenseId: getValue("expenseId"), // ✅ Bạn cần có 1 input ẩn hoặc field nào chứa mã chi phí gốc để cập nhật
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

  const { BACKEND_URL } = getConstants();

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("✅ Đã cập nhật chi phí thành công!");
      document.getElementById("expenseForm").reset();
      document.getElementById("expenseDate").value = window.todayFormatted;
    } else {
      alert("❌ Không thể cập nhật chi phí: " + result.message);
    }
  } catch (err) {
    alert("❌ Lỗi kết nối: " + err.message);
  }
}
