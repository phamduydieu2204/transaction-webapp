/**
 * Update Expense Table
 * Render expense data to table with pagination
 */

import { formatDate } from './formatDate.js';
import { formatDateTime } from './formatDateTime.js';
import { editExpenseRow } from './editExpenseRow.js';
import { viewExpenseRow } from './viewExpenseRow.js';
import { handleDeleteExpense } from './handleDeleteExpense.js';

/**
 * Update expense table with current data
 */
export function updateExpenseTable() {
  const tableBody = document.querySelector('#expenseTable tbody');
  if (!tableBody) {
    console.warn('⚠️ Expense table body not found');
    return;
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
 * Create a single expense row
 */
function createExpenseRow(expense, index) {
  const tr = document.createElement('tr');
  
  // Format dates
  const formattedDate = formatDate(expense.date || expense.ngay);
  const formattedDateTime = formatDateTime(expense.timestamp);
  
  // Build row HTML
  tr.innerHTML = `
    <td>${index + 1}</td>
    <td>${expense.category || expense.loai || ''}</td>
    <td>${expense.description || expense.moTa || ''}</td>
    <td class="text-right">${formatCurrency(expense.amount || expense.soTien || 0)}</td>
    <td>${expense.accountingType || expense.loaiKeToan || ''}</td>
    <td>${formattedDate}</td>
    <td>${expense.allocationPeriod || expense.kyPhanBo || ''}</td>
    <td>${expense.employee || expense.nhanVien || ''}</td>
    <td>${formattedDateTime}</td>
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