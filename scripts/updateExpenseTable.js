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
console.log('🚫 FORCE removing internal scroll from expense table...');
if (typeof window !== 'undefined') {
  // Schedule refresh after DOM is ready
  setTimeout(() => {
    if (window.expenseList && window.expenseList.length > 0) {
      console.log('🎨 Refreshing expense table with transaction-style UI...');
      updateExpenseTable();
    }
  }, 100);
  
  // Also schedule a longer refresh to catch late-loading data
  setTimeout(() => {
    if (window.expenseList && window.expenseList.length > 0) {
      console.log('🎨 Final refresh for expense table styling...');
      updateExpenseTable();
    }
    // FORCE: Remove any remaining scroll on containers
    forceRemoveInternalScroll();
  }, 2000);
}

/**
 * Force refresh expense table (useful after adding new expense)
 */
export function refreshExpenseTable() {
  console.log('🔄 Force refreshing expense table...');
  // Reset to first page to show newest expense
  window.currentExpensePage = 1;
  updateExpenseTable();
}

// Make refresh function available globally
window.refreshExpenseTable = refreshExpenseTable;

/**
 * Handle expense action dropdown selection
 */
function handleExpenseAction(selectElement, index) {
  const action = selectElement.value;
  if (!action) return;
  
  // Reset dropdown to default
  selectElement.value = '';
  
  // Execute action based on selection
  switch (action) {
    case 'view':
      if (typeof window.viewExpenseRow === 'function') {
        window.viewExpenseRow(index);
      }
      break;
    case 'edit':
      if (typeof window.editExpenseRow === 'function') {
        window.editExpenseRow(index);
      }
      break;
    case 'delete':
      if (typeof window.handleDeleteExpense === 'function') {
        window.handleDeleteExpense(index);
      }
      break;
  }
}

// Make dropdown handler available globally
window.handleExpenseAction = handleExpenseAction;

/**
 * Force remove internal scroll from expense table containers
 */
function forceRemoveInternalScroll() {
  console.log('🚫 FORCE: Removing internal scroll from expense containers...');
  
  // List of selectors that might have scroll
  const scrollSelectors = [
    '.expense-table-container',
    '#expenseSection', 
    '#tab-chi-phi .table-container',
    '#tab-chi-phi .expense-table-container',
    '#expenseListTable'
  ];
  
  scrollSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el) {
        el.style.overflow = 'visible';
        el.style.overflowX = 'visible';
        el.style.overflowY = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
        console.log(`🚫 Removed scroll from: ${selector}`);
      }
    });
  });
}

// Make function available globally
window.forceRemoveInternalScroll = forceRemoveInternalScroll;

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
      <th>Trạng thái</th>
      <th>Ghi chú</th>
      <th>Hành động</th>
    `;
  }
  
  // Clear current table
  tableBody.innerHTML = '';
  
  // Check if we have data
  if (!window.expenseList || window.expenseList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="12" class="text-center" style="padding: 40px; color: #6c757d; font-style: italic;">Không có dữ liệu chi phí</td></tr>';
    updateExpensePagination(0, 0, 0);
    return;
  }
  
  // Calculate pagination
  const itemsPerPage = 50;
  const currentPage = window.currentExpensePage || 1;
  const totalPages = Math.ceil(window.expenseList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, window.expenseList.length);
  
  // Sắp xếp theo thời gian từ mới nhất đến cũ nhất (dựa vào mã chi phí)
  const sortedExpenses = [...window.expenseList].sort((a, b) => {
    // Lấy timestamp từ mã chi phí (loại bỏ ký tự không phải số)
    const timestampA = (a.expenseId || a.id || '').replace(/[^0-9]/g, '');
    const timestampB = (b.expenseId || b.id || '').replace(/[^0-9]/g, '');
    
    // Sắp xếp giảm dần (mới nhất lên đầu)
    return timestampB.localeCompare(timestampA);
  });
  
  // Get paginated items từ danh sách đã sắp xếp
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex);
  
  // Render each expense row
  paginatedExpenses.forEach((expense, index) => {
    const row = createExpenseRow(expense, startIndex + index);
    tableBody.appendChild(row);
  });
  
  // Update pagination
  updateExpensePagination(currentPage, totalPages, sortedExpenses.length);
  
  console.log(`📊 Displayed ${paginatedExpenses.length} expenses (page ${currentPage}/${totalPages})`);
}

/**
 * Create a single expense row theo cấu trúc mới
 */
function createExpenseRow(expense, index) {
  const tr = document.createElement('tr');
  
  // Debug log để xem cấu trúc dữ liệu
  if (index === 0) {
    console.log('🔍 DEBUG: Sample expense data structure:', expense);
    console.log('🔍 Available keys:', Object.keys(expense));
  }
  
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
  
  // 7. Chi tiết ngân hàng = Ngân hàng/Ví - Thông tin thẻ/Tài khoản
  const bankName = expense.bank || expense.expenseBank || expense.nganHang || '';
  const cardInfo = expense.card || expense.expenseCard || expense.cardInfo || expense.accountInfo || expense.taiKhoan || '';
  
  let bankDetails = '--';
  if (bankName && cardInfo) {
    bankDetails = `${bankName} - ${cardInfo}`;
  } else if (bankName) {
    bankDetails = bankName;
  } else if (cardInfo) {
    bankDetails = cardInfo;
  }
  
  // 8. Ngày tái tục
  const renewDate = formattedRenewDate || '--';
  
  // 9. Người nhận/Nhà cung cấp
  const supplier = expense.supplier || expense.nhaCC || expense.nguoiNhan || expense.expenseSupplier || '--';
  
  // 10. Trạng thái
  const status = expense.status || expense.trangThai || expense.expenseStatus || 'Đã thanh toán';
  
  // 11. Ghi chú
  const note = expense.note || expense.ghiChu || expense.expenseNote || '';
  
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
    <td>${status}</td>
    <td>${note}</td>
    <td>
      <select class="action-select" onchange="handleExpenseAction(this, ${index})">
        <option value="">-- Chọn --</option>
        <option value="view">Xem</option>
        <option value="edit">Sửa</option>
        <option value="delete">Xóa</option>
      </select>
    </td>
  `;
  
  // Thêm styling cho các trường hợp đặc biệt
  const expenseStatus = expense.status || expense.trangThai || expense.expenseStatus || '';
  if (expenseStatus && expenseStatus.toLowerCase().includes('chưa thanh toán')) {
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