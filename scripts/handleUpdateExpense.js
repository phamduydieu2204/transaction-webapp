import { getConstants } from './constants.js';
import { renderExpenseStats } from './renderExpenseStats.js';

export async function handleUpdateExpense() {
  const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

  // ✅ Kiểm tra có mã chi phí để cập nhật không
  const expenseId = getValue("expenseId");
  if (!expenseId) {
    alert("❌ Không có mã chi phí để cập nhật. Vui lòng chọn một chi phí từ danh sách để sửa.");
    return;
  }

  const data = {
    action: "updateExpense",
    expenseId: expenseId,
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

  console.log("📤 Dữ liệu cập nhật chi phí:", data);

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
      
      // ✅ Reset form và reload danh sách
      document.getElementById("expenseForm").reset();
      document.getElementById("expenseDate").value = window.todayFormatted;
      document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";
      
      // ✅ Refresh danh sách chi phí
      renderExpenseStats();
    } else {
      alert("❌ Không thể cập nhật chi phí: " + result.message);
    }
  } catch (err) {
    alert("❌ Lỗi kết nối: " + err.message);
  }
}