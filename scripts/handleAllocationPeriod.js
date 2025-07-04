/**
 * handleAllocationPeriod.js
 * 
 * Xử lý logic phân bổ chi phí cho báo cáo
 */

/**
 * Handle allocation period change
 */
window.handleAllocationPeriodChange = function() {
  const period = document.getElementById('expenseAllocationPeriod').value;
  const customDiv = document.getElementById('customAllocationDiv');
  const expenseDate = document.getElementById('expenseDate').value;
  
  if (period === 'custom') {
    customDiv.style.display = 'block';
  } else {
    customDiv.style.display = 'none';
    
    // Tự động tính toán ngày bắt đầu và kết thúc
    if (expenseDate && period !== 'none') {
      const dates = calculateAllocationDates(expenseDate, period);
      document.getElementById('expenseAllocationStart').value = dates.start;
      document.getElementById('expenseAllocationEnd').value = dates.end;
    }
  }
}

/**
 * Calculate allocation dates based on period
 */
function calculateAllocationDates(expenseDate, period) {
  const startDate = new Date(expenseDate);
  let endDate = new Date(expenseDate);
  
  switch (period) {
    case '1_month':
      // Từ đầu tháng đến cuối tháng
      startDate.setDate(1);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      break;
      
    case '3_months':
      // 3 tháng từ ngày chi
      endDate.setMonth(startDate.getMonth() + 3);
      endDate.setDate(endDate.getDate() - 1);
      break;
      
    case '6_months':
      // 6 tháng từ ngày chi
      endDate.setMonth(startDate.getMonth() + 6);
      endDate.setDate(endDate.getDate() - 1);
      break;
      
    case '12_months':
      // 1 năm từ ngày chi
      endDate.setFullYear(startDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1);
      break;
  }
  
  return {
    start: formatDateForInput(startDate),
    end: formatDateForInput(endDate)
  };
}

/**
 * Format date for input field
 */
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Calculate daily allocation amount
 */
export function calculateDailyAllocation(expense) {
  // Nếu không có phân bổ, return 0
  if (!expense.allocationPeriod || expense.allocationPeriod === 'none') {
    return 0;
  }
  
  // Lấy ngày bắt đầu và kết thúc
  const startDate = new Date(expense.allocationStart || expense.date);
  const endDate = new Date(expense.allocationEnd || expense.date);
  
  // Tính số ngày
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // Tính số tiền phân bổ mỗi ngày
  return expense.amount / days;
}

/**
 * Get allocated amount for a specific date range
 */
export function getAllocatedAmount(expense, rangeStart, rangeEnd) {
  // Nếu không có phân bổ, kiểm tra ngày chi có trong khoảng không
  if (!expense.allocationPeriod || expense.allocationPeriod === 'none') {
    const expenseDate = new Date(expense.date);
    if (expenseDate >= rangeStart && expenseDate <= rangeEnd) {
      return expense.amount;
    }
    return 0;
  }
  
  // Lấy khoảng thời gian phân bổ
  const allocStart = new Date(expense.allocationStart || expense.date);
  const allocEnd = new Date(expense.allocationEnd || expense.date);
  
  // Tìm giao của 2 khoảng thời gian
  const overlapStart = new Date(Math.max(allocStart, rangeStart));
  const overlapEnd = new Date(Math.min(allocEnd, rangeEnd));
  
  // Nếu không có giao nhau
  if (overlapStart > overlapEnd) {
    return 0;
  }
  
  // Tính số ngày giao nhau
  const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
  
  // Tính tổng số ngày phân bổ
  const totalDays = Math.ceil((allocEnd - allocStart) / (1000 * 60 * 60 * 24)) + 1;
  
  // Tính số tiền phân bổ cho khoảng thời gian
  return (expense.amount / totalDays) * overlapDays;
}

/**
 * Check if expense is allocated in date range
 */
export function isExpenseInRange(expense, rangeStart, rangeEnd) {
  // Chi phí không phân bổ
  if (!expense.allocationPeriod || expense.allocationPeriod === 'none') {
    const expenseDate = new Date(expense.date);
    return expenseDate >= rangeStart && expenseDate <= rangeEnd;
  }
  
  // Chi phí có phân bổ
  const allocStart = new Date(expense.allocationStart || expense.date);
  const allocEnd = new Date(expense.allocationEnd || expense.date);
  
  // Kiểm tra có giao nhau không
  return allocStart <= rangeEnd && allocEnd >= rangeStart;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Set default value
    const allocationPeriod = document.getElementById('expenseAllocationPeriod');
    if (allocationPeriod && !allocationPeriod.value) {
      allocationPeriod.value = 'none';
    }
  });
}