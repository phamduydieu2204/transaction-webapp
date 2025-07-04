/**
 * filterManager.js
 * 
 * Filter management for financial dashboard
 * Handles date ranges, software filters, and period selections
 */

/**
 * Apply global filters to transaction data
 * @param {Array} transactionData - Transaction records
 * @param {Object} filters - Filter configuration
 * @returns {Array} Filtered transaction data
 */
export function applyFiltersToTransactions(transactionData, filters) {
  if (!filters || !transactionData) return transactionData;
  
  let filteredData = [...transactionData];
  
  // Apply date range filter
  if (filters.dateRange) {
    filteredData = filterByDateRange(filteredData, filters.dateRange, 'ngayTao');
  }
  
  // Apply software filter
  if (filters.selectedSoftware && filters.selectedSoftware.length > 0 && !filters.showAllSoftware) {
    filteredData = filterBySoftware(filteredData, filters.selectedSoftware);
  }
  
  return filteredData;
}

/**
 * Apply global filters to expense data
 * @param {Array} expenseData - Expense records
 * @param {Object} filters - Filter configuration
 * @returns {Array} Filtered expense data
 */
export function applyFiltersToExpenses(expenseData, filters) {
  if (!filters || !expenseData) return expenseData;
  
  let filteredData = [...expenseData];
  
  // Apply date range filter
  if (filters.dateRange) {
    filteredData = filterByDateRange(filteredData, filters.dateRange, 'ngayTao');
  }
  
  return filteredData;
}

/**
 * Filter data by date range
 * @param {Array} data - Data array to filter
 * @param {Object} dateRange - Date range object with start and end
 * @param {string} dateField - Field name containing the date
 * @returns {Array} Filtered data
 */
export function filterByDateRange(data, dateRange, dateField = 'ngayTao') {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField] || item.date || item.createdAt);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Filter transactions by software
 * @param {Array} transactionData - Transaction records
 * @param {Array} selectedSoftware - Array of selected software names
 * @returns {Array} Filtered transactions
 */
export function filterBySoftware(transactionData, selectedSoftware) {
  if (!selectedSoftware || selectedSoftware.length === 0) {
    return transactionData;
  }
  
  return transactionData.filter(transaction => {
    return selectedSoftware.includes(transaction.software);
  });
}

/**
 * Get date range for predefined periods
 * @param {string} period - Period type ('current_month', 'last_month', 'current_year', etc.)
 * @returns {Object} Date range object
 */
export function getDateRangeForPeriod(period) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  switch (period) {
    case 'current_month':
      return {
        start: new Date(currentYear, currentMonth, 1),
        end: new Date(currentYear, currentMonth + 1, 0)
      };
      
    case 'last_month':
      return {
        start: new Date(currentYear, currentMonth - 1, 1),
        end: new Date(currentYear, currentMonth, 0)
      };
      
    case 'current_quarter':
      const quarterStart = Math.floor(currentMonth / 3) * 3;
      return {
        start: new Date(currentYear, quarterStart, 1),
        end: new Date(currentYear, quarterStart + 3, 0)
      };
      
    case 'last_quarter':
      const lastQuarterStart = Math.floor(currentMonth / 3) * 3 - 3;
      const lastQuarterYear = lastQuarterStart < 0 ? currentYear - 1 : currentYear;
      const adjustedQuarterStart = lastQuarterStart < 0 ? 9 : lastQuarterStart;
      return {
        start: new Date(lastQuarterYear, adjustedQuarterStart, 1),
        end: new Date(lastQuarterYear, adjustedQuarterStart + 3, 0)
      };
      
    case 'current_year':
      return {
        start: new Date(currentYear, 0, 1),
        end: new Date(currentYear, 11, 31)
      };
      
    case 'last_year':
      return {
        start: new Date(currentYear - 1, 0, 1),
        end: new Date(currentYear - 1, 11, 31)
      };
      
    case 'last_30_days':
      return {
        start: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)),
        end: now
      };
      
    case 'last_90_days':
      return {
        start: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)),
        end: now
      };
      
    case 'ytd': // Year to date
      return {
        start: new Date(currentYear, 0, 1),
        end: now
      };
      
    default:
      // Return current month as default
      return {
        start: new Date(currentYear, currentMonth, 1),
        end: new Date(currentYear, currentMonth + 1, 0)
      };
  }
}

/**
 * Format date range for display
 * @param {Object} dateRange - Date range object
 * @returns {string} Formatted date range string
 */
export function formatDateRangeForDisplay(dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return 'Tất cả thời gian';
  }
  
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  const formatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  };
  
  return `${start.toLocaleDateString('vi-VN', formatOptions)} - ${end.toLocaleDateString('vi-VN', formatOptions)}`;
}

/**
 * Get all unique software names from transaction data
 * @param {Array} transactionData - Transaction records
 * @returns {Array} Array of unique software names
 */
export function getUniqueSoftwareList(transactionData) {
  if (!transactionData || !Array.isArray(transactionData)) {
    return [];
  }
  
  const softwareSet = new Set();
  
  transactionData.forEach(transaction => {
    if (transaction.software && transaction.software.trim()) {
      softwareSet.add(transaction.software.trim());
    }
  });
  
  return Array.from(softwareSet).sort();
}

/**
 * Get all unique expense categories from expense data
 * @param {Array} expenseData - Expense records
 * @returns {Array} Array of unique categories
 */
export function getUniqueExpenseCategories(expenseData) {
  if (!expenseData || !Array.isArray(expenseData)) {
    return [];
  }
  
  const categorySet = new Set();
  
  expenseData.forEach(expense => {
    const category = expense.loaiChiPhi || expense.category;
    if (category && category.trim()) {
      categorySet.add(category.trim());
    }
  });
  
  return Array.from(categorySet).sort();
}

/**
 * Generate comparison data for previous period
 * @param {Array} currentData - Current period data
 * @param {Array} allData - All available data
 * @param {Object} dateRange - Current date range
 * @param {string} compareMode - Comparison mode ('previous_period', 'same_period_last_year')
 * @returns {Array} Comparison data
 */
export function generateComparisonData(currentData, allData, dateRange, compareMode) {
  if (!compareMode || compareMode === 'none' || !dateRange) {
    return [];
  }
  
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const periodDuration = end.getTime() - start.getTime();
  
  let comparisonDateRange;
  
  switch (compareMode) {
    case 'previous_period':
      comparisonDateRange = {
        start: new Date(start.getTime() - periodDuration),
        end: start
      };
      break;
      
    case 'same_period_last_year':
      comparisonDateRange = {
        start: new Date(start.getFullYear() - 1, start.getMonth(), start.getDate()),
        end: new Date(end.getFullYear() - 1, end.getMonth(), end.getDate())
      };
      break;
      
    default:
      return [];
  }
  
  return filterByDateRange(allData, comparisonDateRange);
}

/**
 * Check if filters are active
 * @param {Object} filters - Filter configuration
 * @returns {boolean} True if any filters are active
 */
export function hasActiveFilters(filters) {
  if (!filters) return false;
  
  return !!(
    filters.dateRange ||
    (filters.selectedSoftware && filters.selectedSoftware.length > 0 && !filters.showAllSoftware) ||
    filters.compareMode !== 'none'
  );
}

/**
 * Reset all filters to default state
 * @returns {Object} Default filter configuration
 */
export function resetFilters() {
  return {
    dateRange: null,
    period: 'current_month',
    customStartDate: null,
    customEndDate: null,
    selectedSoftware: [],
    compareMode: 'none',
    showAllSoftware: true
  };
}

/**
 * Validate filter configuration
 * @param {Object} filters - Filter configuration to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateFilters(filters) {
  const errors = [];
  
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    
    if (isNaN(start.getTime())) {
      errors.push('Ngày bắt đầu không hợp lệ');
    }
    
    if (isNaN(end.getTime())) {
      errors.push('Ngày kết thúc không hợp lệ');
    }
    
    if (start > end) {
      errors.push('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }
    
    // Check if date range is too large (more than 2 years)
    const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
    if ((end.getTime() - start.getTime()) > twoYears) {
      errors.push('Khoảng thời gian không được vượt quá 2 năm');
    }
  }
  
  if (filters.selectedSoftware && !Array.isArray(filters.selectedSoftware)) {
    errors.push('Danh sách phần mềm đã chọn phải là một mảng');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}