// updateTotalDisplay.js - Quản lý hiển thị tổng doanh thu và chi phí

/**
 * Hàm cập nhật hiển thị tổng doanh thu và chi phí
 * Hiển thị ở header: doanh thu ở trên (xanh), chi phí ở dưới (đỏ)
 */
export function updateTotalDisplay() {
  // Không làm gì cả - đã xóa totals display
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
  
}