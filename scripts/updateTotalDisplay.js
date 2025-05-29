// updateTotalDisplay.js - Quản lý hiển thị tổng doanh thu và chi phí

/**
 * Hàm cập nhật hiển thị tổng doanh thu và chi phí
 * Hiển thị ở header: doanh thu ở trên (xanh), chi phí ở dưới (đỏ)
 */
export function updateTotalDisplay() {
  const revenueEl = document.getElementById("todayRevenue");
  const expenseEl = document.getElementById("todayExpenseTotal");
  
  // Kiểm tra admin
  const isAdmin = window.userInfo && window.userInfo.vaiTro && window.userInfo.vaiTro.toLowerCase() === "admin";
  
  console.log("🔄 updateTotalDisplay - isAdmin:", isAdmin);
  console.log("🔄 totalRevenue:", window.totalRevenue);
  console.log("🔄 totalExpense:", window.totalExpense);
  
  if (!isAdmin) {
    if (revenueEl) revenueEl.textContent = "";
    if (expenseEl) expenseEl.textContent = "";
    return;
  }
  
  // Hiển thị doanh thu
  if (revenueEl && window.totalRevenue !== undefined) {
    const revenueText = window.isSearching 
      ? `Tổng doanh thu (tìm kiếm): ${window.totalRevenue.toLocaleString()} VNĐ`
      : `Tổng doanh thu hôm nay: ${window.totalRevenue.toLocaleString()} VNĐ`;
    revenueEl.textContent = revenueText;
    console.log("💰 Hiển thị doanh thu:", revenueText);
  }
  
  // Hiển thị chi phí  
  if (expenseEl && window.totalExpense !== undefined) {
    const expenseText = window.isExpenseSearching 
      ? `Tổng chi phí (tìm kiếm): ${window.totalExpense.toLocaleString()} VNĐ`
      : `Tổng chi phí hôm nay: ${window.totalExpense.toLocaleString()} VNĐ`;
    expenseEl.textContent = expenseText;
    console.log("💸 Hiển thị chi phí:", expenseText);
  }
}

/**
 * Khởi tạo biến global và gán hàm vào window
 */
export function initTotalDisplay() {
  // Khởi tạo biến global
  if (window.totalRevenue === undefined) window.totalRevenue = 0;
  if (window.totalExpense === undefined) window.totalExpense = 0;
  
  // Gán hàm vào window để các file khác có thể gọi
  window.updateTotalDisplay = updateTotalDisplay;
  
  console.log("✅ Đã khởi tạo updateTotalDisplay");
}