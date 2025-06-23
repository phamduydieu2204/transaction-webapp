/**
 * Update Expense Table
 * Render expense data to table with pagination
 */

import { formatDate } from './formatDate.js';
import { formatDateTime } from './formatDateTime.js';
import { editExpenseRow } from './editExpenseRow.js';
import { viewExpenseRow } from './viewExpenseRow.js';
import { handleDeleteExpense } from './handleDeleteExpense.js';
import { updatePagination, firstPage, prevPage, nextPage, lastPage, goToPage } from './pagination.js';

// Make functions available globally for buttons
window.viewExpenseRow = viewExpenseRow;
window.editExpenseRow = editExpenseRow;
window.handleDeleteExpense = handleDeleteExpense;
window.updateExpenseTable = updateExpenseTable;

// Force refresh on load to show new structure
if (typeof window !== 'undefined') {
  // Schedule refresh after DOM is ready
  setTimeout(() => {
    if (window.expenseList && window.expenseList.length > 0) {
      updateExpenseTable();
    }
  }, 100);
  
  // Also schedule a longer refresh to catch late-loading data
  setTimeout(() => {
    if (window.expenseList && window.expenseList.length > 0) {
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
  // Reset to first page to show newest expense
  window.currentExpensePage = 1;
  updateExpenseTable();
}

// Make refresh function available globally
window.refreshExpenseTable = refreshExpenseTable;

/**
 * Handle expense action dropdown selection
 */
function handleExpenseAction(selectElement, expenseData) {
  const action = selectElement.value;
  if (!action) return;
  
  // Reset dropdown to default
  selectElement.value = '';
  
  // Parse expense data if it's a string
  const expense = typeof expenseData === 'string' ? JSON.parse(expenseData) : expenseData;
  
  // Execute action based on selection
  switch (action) {
    case 'view':
      if (typeof window.viewExpenseRow === 'function') {
        window.viewExpenseRow(expense);
      }
      break;
    case 'edit':
      if (typeof window.editExpenseRow === 'function') {
        window.editExpenseRow(expense);
      }
      break;
    case 'delete':
      if (typeof window.handleDeleteExpense === 'function') {
        window.handleDeleteExpense(expense.expenseId);
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
      }
    });
  });
}

// Make function available globally
window.forceRemoveInternalScroll = forceRemoveInternalScroll;

/**
 * Expense Pagination Navigation Functions - Giống transaction table
 */
function expenseFirstPage() {
  window.currentExpensePage = 1;
  updateExpenseTable();
}

function expensePrevPage() {
  if (window.currentExpensePage > 1) {
    window.currentExpensePage--;
    updateExpenseTable();
  }
}

function expenseNextPage() {
  const itemsPerPage = window.itemsPerPage || 50;
  const totalPages = Math.ceil(window.expenseList.length / itemsPerPage);
  if (window.currentExpensePage < totalPages) {
    window.currentExpensePage++;
    updateExpenseTable();
  }
}

function expenseLastPage() {
  const itemsPerPage = window.itemsPerPage || 50;
  const totalPages = Math.ceil(window.expenseList.length / itemsPerPage);
  window.currentExpensePage = totalPages;
  updateExpenseTable();
}

function expenseGoToPage(page) {
  window.currentExpensePage = page;
  updateExpenseTable();
}

// Make expense pagination functions available globally
window.expenseFirstPage = expenseFirstPage;
window.expensePrevPage = expensePrevPage;
window.expenseNextPage = expenseNextPage;
window.expenseLastPage = expenseLastPage;
window.expenseGoToPage = expenseGoToPage;

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
  
  // Calculate pagination - Sử dụng chung itemsPerPage như transaction table
  const itemsPerPage = window.itemsPerPage || 50;
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
  
  // Update pagination - Sử dụng component chung như transaction table
  updateExpensePagination(totalPages, currentPage);
  
}

/**
 * Create a single expense row theo cấu trúc mới
 */
function createExpenseRow(expense, index) {
  const tr = document.createElement('tr');
  
  // Debug log để xem cấu trúc dữ liệu
  if (index === 0) {
    // Debug ngày tái tục
      renewDate: expense.renewDate,
      expenseRenewDate: expense.expenseRenewDate,
      ngayTaiTuc: expense.ngayTaiTuc
    });
  }
  
  // Format dates
  const formattedDate = formatDate(expense.date || expense.ngay || expense.expenseDate);
  const formattedRenewDate = formatDate(expense.renewDate || expense.expenseRenewDate || expense.ngayTaiTuc);
  
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
    <td>${note.replace(/\n/g, "<br>")}</td>
    <td>
      <select class="action-select" data-expense='${JSON.stringify(expense).replace(/'/g, "&apos;")}' onchange="handleExpenseAction(this, this.dataset.expense)">
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
  const renewDateValue = expense.renewDate || expense.expenseRenewDate || expense.ngayTaiTuc;
  if (renewDateValue) {
    const today = new Date();
    const parseDate = (str) => {
      const [y, m, d] = (str || '').split('/').map(Number);
      return new Date(y, m - 1, d);
    };
    const renewDateObj = parseDate(renewDateValue);
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
 * Update expense pagination - Sử dụng component giống transaction table
 */
function updateExpensePagination(totalPages, currentPage) {
  const pagination = document.getElementById("expensePagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  // Thêm nút "Tất cả" nếu đang trong trạng thái tìm kiếm
  if (window.isExpenseSearching) {
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tất cả";
    allBtn.className = "pagination-btn all-btn";
    allBtn.addEventListener("click", () => {
      window.isExpenseSearching = false;
      window.currentExpensePage = 1;
      updateExpenseTable();
    });
    pagination.appendChild(allBtn);
  }

  if (totalPages <= 1) return;

  // First button
  const firstButton = document.createElement("button");
  firstButton.textContent = "«";
  firstButton.className = "pagination-btn";
  firstButton.onclick = expenseFirstPage;
  firstButton.disabled = currentPage === 1;
  pagination.appendChild(firstButton);

  // Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "‹";
  prevButton.className = "pagination-btn";
  prevButton.onclick = expensePrevPage;
  prevButton.disabled = currentPage === 1;
  pagination.appendChild(prevButton);

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "pagination-dots";
    pagination.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = "pagination-btn";
    pageButton.onclick = () => expenseGoToPage(i);
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pagination.appendChild(pageButton);
  }

  if (endPage < totalPages) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "pagination-dots";
    pagination.appendChild(dots);
  }

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.className = "pagination-btn";
  nextButton.onclick = expenseNextPage;
  nextButton.disabled = currentPage === totalPages;
  pagination.appendChild(nextButton);

  // Last button
  const lastButton = document.createElement("button");
  lastButton.textContent = "»";
  lastButton.className = "pagination-btn";
  lastButton.onclick = expenseLastPage;
  lastButton.disabled = currentPage === totalPages;
  pagination.appendChild(lastButton);
}