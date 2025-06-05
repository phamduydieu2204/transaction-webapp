/**
 * Update Expense Table
 * Render expense data to table with pagination
 */

import { formatDate } from './formatDate.js';
import { formatDateTime } from './formatDateTime.js';
import { editExpenseRow } from './editExpenseRow.js';
import { viewExpenseRow } from './viewExpenseRow.js';
import { handleDeleteExpense } from './handleDeleteExpense.js';

// Make functions available globally for buttons
window.viewExpenseRow = viewExpenseRow;
window.editExpenseRow = editExpenseRow;
window.handleDeleteExpense = handleDeleteExpense;
window.updateExpenseTable = updateExpenseTable;

// Force refresh on load to show new structure
console.log('🔄 Loading new expense table structure...');
if (typeof window !== 'undefined') {
  // Schedule refresh after DOM is ready
  setTimeout(() => {
    if (window.expenseList && window.expenseList.length > 0) {
      console.log('🔄 Refreshing expense table with new columns...');
      updateExpenseTable();
    }
  }, 100);
}

/**
 * Update expense table with current data
 */
export function updateExpenseTable() {
  const table = document.querySelector('#expenseListTable');
  if (!table) {
    console.warn('⚠️ Expense table not found');
    return;
  }
  
  const tableHead = table.querySelector('thead tr');
  const tableBody = table.querySelector('tbody');
  
  if (!tableBody) {
    console.warn('⚠️ Expense table body not found');
    return;
  }
  
  // Setup table headers theo yêu cầu mới (luôn cập nhật để đảm bảo thay đổi)
  if (tableHead) {
    tableHead.innerHTML = `
      <th>Mã chi phí</th>
      <th>Ngày chi</th>
      <th>Loại kế toán</th>
      <th>Phân bổ</th>
      <th>Thông tin khoản chi</th>
      <th>Số tiền</th>
      <th>Chi tiết ngân hàng</th>
      <th>Ngày tái tục</th>
      <th>Người nhận/Nhà cung cấp</th>
      <th>Ghi chú</th>
      <th>Thao tác</th>
    `;
  }
  
  // Clear current table
  tableBody.innerHTML = '';
  
  // Check if we have data
  if (!window.expenseList || window.expenseList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Không có dữ liệu chi phí</td></tr>';
    updateExpensePagination(0, 0, 0);
    return;
  }
  
  // Calculate pagination
  const itemsPerPage = 50;
  const currentPage = window.currentExpensePage || 1;
  const totalPages = Math.ceil(window.expenseList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, window.expenseList.length);
  
  // Get paginated items
  const paginatedExpenses = window.expenseList.slice(startIndex, endIndex);
  
  // Render each expense row
  paginatedExpenses.forEach((expense, index) => {
    const row = createExpenseRow(expense, startIndex + index);
    tableBody.appendChild(row);
  });
  
  // Update pagination
  updateExpensePagination(currentPage, totalPages, window.expenseList.length);
  
  console.log(`📊 Displayed ${paginatedExpenses.length} expenses (page ${currentPage}/${totalPages})`);
}

/**
 * Create a single expense row theo cấu trúc mới
 */
function createExpenseRow(expense, index) {
  const tr = document.createElement('tr');
  
  // Format dates
  const formattedDate = formatDate(expense.date || expense.ngay);
  const formattedRenewDate = formatDate(expense.renewDate);
  
  // 1. Mã chi phí
  const expenseId = expense.expenseId || expense.id || `EXP${index + 1}`;
  
  // 2. Ngày chi
  const expenseDate = formattedDate;
  
  // 3. Loại kế toán
  const accountingType = expense.accountingType || expense.loaiKeToan || '';
  
  // 4. Phân bổ (với icon)
  const allocationHtml = (expense.periodicAllocation === 'Có' || expense.allocationPeriod) 
    ? '<span style="color: #28a745;">✓ Có</span>' 
    : '<span style="color: #6c757d;">✗ Không</span>';
  
  // 5. Thông tin khoản chi (gộp 4 trường)
  const expenseInfoParts = [
    expense.type || expense.category || expense.loai || '',
    expense.category || expense.subCategory || '',
    expense.product || expense.sanPham || '',
    expense.package || expense.goi || ''
  ].filter(part => part.trim() !== '');
  const expenseInfo = expenseInfoParts.join(' - ') || (expense.description || expense.moTa || '');
  
  // 6. Số tiền (với đơn vị)
  const currency = expense.currency || 'VND';
  const amount = `${(expense.amount || expense.soTien || 0).toLocaleString()} ${currency}`;
  
  // 7. Chi tiết ngân hàng (gộp ngân hàng + tài khoản)
  const bankDetailsParts = [
    expense.bank || expense.nganHang || '',
    expense.cardInfo || expense.accountInfo || expense.taiKhoan || ''
  ].filter(part => part.trim() !== '');
  const bankDetails = bankDetailsParts.join(' - ') || '--';
  
  // 8. Ngày tái tục
  const renewDate = formattedRenewDate || '--';
  
  // 9. Người nhận/Nhà cung cấp
  const supplier = expense.supplier || expense.nhaCC || expense.nguoiNhan || '--';
  
  // 10. Ghi chú
  const note = expense.note || expense.ghiChu || '';
  
  // Build row HTML theo thứ tự mới
  tr.innerHTML = `
    <td>${expenseId}</td>
    <td>${expenseDate}</td>
    <td>${accountingType}</td>
    <td>${allocationHtml}</td>
    <td>${expenseInfo}</td>
    <td class="text-right">${amount}</td>
    <td>${bankDetails}</td>
    <td>${renewDate}</td>
    <td>${supplier}</td>
    <td>${note}</td>
    <td>
      <button class="btn-icon" onclick="viewExpenseRow(${index})" title="Xem chi tiết">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon" onclick="editExpenseRow(${index})" title="Sửa">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-icon btn-danger" onclick="handleDeleteExpense(${index})" title="Xóa">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  
  // Thêm styling cho các trường hợp đặc biệt
  if (expense.status && expense.status.toLowerCase().includes('chưa thanh toán')) {
    tr.style.backgroundColor = '#fff9c4'; // Màu vàng nhạt cho chưa thanh toán
  }
  
  // Kiểm tra ngày tái tục đã hết hạn
  if (expense.renewDate) {
    const today = new Date();
    const parseDate = (str) => {
      const [y, m, d] = (str || '').split('/').map(Number);
      return new Date(y, m - 1, d);
    };
    const renewDateObj = parseDate(expense.renewDate);
    if (renewDateObj < today) {
      tr.classList.add('expired-row');
    }
  }
  
  return tr;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Update expense pagination info
 */
function updateExpensePagination(currentPage, totalPages, totalItems) {
  // Update page info
  const pageInfo = document.getElementById('expensePageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages} (Tổng: ${totalItems} chi phí)`;
  }
  
  // Update pagination buttons
  const prevBtn = document.querySelector('.expense-pagination .prev-btn');
  const nextBtn = document.querySelector('.expense-pagination .next-btn');
  
  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
  }
}