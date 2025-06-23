import { getConstants } from './constants.js';
import { renderExpenseStats } from './renderExpenseStats.js';
import { cacheManager } from './core/cacheManager.js';

export async function handleDeleteExpense(expenseId) {
  if (!confirm("❗ Bạn có chắc chắn muốn xoá chi phí này?")) return;

  const { BACKEND_URL } = getConstants();
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteExpense",
        expenseId,
        maNhanVien: window.userInfo?.maNhanVien || ""
    });

    const result = await res.json();
    if (result.status === "success") {
      alert("✅ Đã xoá chi phí.");
      
      // Clear cache để đảm bảo load data mới
      cacheManager.clearExpenseCaches();
      
      await renderExpenseStats(); // reload danh sách
    } else {
      alert("❌ Không thể xoá chi phí: " + result.message);
    }
  } catch (err) {
    alert("❌ Lỗi khi xoá chi phí: " + err.message);
  }
}
