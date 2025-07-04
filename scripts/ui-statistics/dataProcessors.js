/**
 * dataProcessors.js
 * 
 * Data processing và filtering logic
 * Handles data transformation, filtering, and preparation for UI
 */

// console.log('📦 dataProcessors.js module loading...');

// Import required functions
import { 
  getCombinedStatistics, 
  fetchExpenseData 
} from '../statisticsDataManager.js';

import { 
  groupExpensesByMonth, 
  groupRevenueByMonth, 
  calculateFinancialAnalysis,
  calculateTotalExpenses,
  calculateTotalRevenue,
  getDateRange 
} from '../statisticsCore.js';

/**
 * Loads initial statistics data
 */
export async function loadStatisticsData(uiState) {
  if (uiState.isLoading) return;
  
  uiState.isLoading = true;
  uiState.lastError = null;
  
  // Show loading state
  const { renderLoadingState } = await import('../statisticsRenderer.js');
  renderLoadingState("monthlySummaryTable");
  
  try {
    // console.log("🔄 Loading statistics data...");
    
    // Get expense data and create combined data structure
    const expenseData = await fetchExpenseData({ forceRefresh: false });
    
    // For now, use existing transaction data from window.transactionList
    // TODO: Implement proper transaction API when ready
    const transactionData = window.transactionList || [];
    
    const data = {
      expenses: expenseData,
      transactions: transactionData,
      timestamp: Date.now()
    };
    
    console.log("📊 Combined data prepared:", {
      expenses: data.expenses.length,
      transactions: data.transactions.length
    });
    
    // Store in global variables for compatibility
    window.expenseList = data.expenses;
    window.transactionList = data.transactions;
    
    // console.log("🎯 Data loading completed");
    
    // ✅ DEBUG: Check data loading completion
    const dataLoadState = {
      expenseCount: data.expenses ? data.expenses.length : 0,
      transactionCount: data.transactions ? data.transactions.length : 0,
      windowExpenseList: window.expenseList ? window.expenseList.length : 0,
      windowTransactionList: window.transactionList ? window.transactionList.length : 0,
      isLoadingFlag: uiState.isLoading
    };
    
    // console.log("🔍 DEBUG data loading state:", dataLoadState);
    // console.log("✅ Statistics data loaded successfully");
    
    return data;
    
  } catch (error) {
    console.error("❌ Failed to load statistics data:", error);
    uiState.lastError = error.message;
    
    const { renderErrorState } = await import('../statisticsRenderer.js');
    renderErrorState("monthlySummaryTable", error.message);
    
    throw error;
  } finally {
    uiState.isLoading = false;
    
    // ✅ DEBUG: Ensure any processing modals are closed
    cleanupLoadingModals();
  }
}

/**
 * Process data for specific UI requirements
 * @param {Array} expenseData - Raw expense data
 * @param {Array} transactionData - Raw transaction data
 * @param {Object} uiState - Current UI state
 * @returns {Object} - Processed data
 */
export function processDataForUI(expenseData, transactionData, uiState) {
  // Calculate date range - sử dụng globalFilters nếu có
  let dateRangeFilter = null;
  if (window.globalFilters && window.globalFilters.dateRange) {
    dateRangeFilter = window.globalFilters.dateRange;
  } else if (typeof uiState.dateRange === 'string') {
    dateRangeFilter = getDateRange(uiState.dateRange);
  } else if (uiState.dateRange && uiState.dateRange.start && uiState.dateRange.end) {
    dateRangeFilter = uiState.dateRange;
  }
  
  // Calculate totals
  const expenseTotals = calculateTotalExpenses(expenseData, {
    currency: uiState.currency,
    dateRange: dateRangeFilter
  });
  
  const revenueTotals = calculateTotalRevenue(transactionData, {
    currency: uiState.currency,
    dateRange: dateRangeFilter
  });
  
  // Calculate financial analysis
  const financialAnalysis = calculateFinancialAnalysis(revenueTotals, expenseTotals);
  
  return {
    expenseData,
    transactionData,
    expenseTotals,
    revenueTotals,
    financialAnalysis,
    dateRangeFilter
  };
}

/**
 * Filter data by date range
 * @param {Array} data - Data to filter
 * @param {Object} dateRange - Date range filter
 * @returns {Array} - Filtered data
 */
export function filterDataByDateRange(data, dateRange) {
  if (!data || !dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  return data.filter(item => {
    const itemDate = new Date(item.date || item.transactionDate);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Prepare data for specific tab rendering
 * @param {string} tabType - Type of tab (overview, expenses, revenue)
 * @param {Object} processedData - Processed data object
 * @param {Object} uiState - Current UI state
 * @returns {Object} - Tab-specific data
 */
export function prepareTabData(tabType, processedData, uiState) {
  const { expenseData, transactionData, financialAnalysis } = processedData;
  
  switch (tabType) {
    case 'overview':
      return prepareOverviewData(expenseData, transactionData, financialAnalysis, uiState);
      
    case 'expenses':
      return prepareExpensesData(expenseData, uiState);
      
    case 'revenue':
      return prepareRevenueData(transactionData, uiState);
      
    default:
      return prepareOverviewData(expenseData, transactionData, financialAnalysis, uiState);
  }
}

/**
 * Prepare overview tab data
 */
function prepareOverviewData(expenseData, transactionData, financialAnalysis, uiState) {
  // Create chart data for last 12 months
  const chartData = groupExpensesByMonth(expenseData, {
    currency: uiState.currency,
    sortBy: "month",
    sortOrder: "desc"
  }).slice(0, 12);
  
  return {
    financialAnalysis,
    chartData,
    expenseData,
    transactionData
  };
}

/**
 * Prepare expenses tab data
 */
function prepareExpensesData(expenseData, uiState) {
  const summaryData = groupExpensesByMonth(expenseData, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  return {
    summaryData,
    showGrowthRate: uiState.showGrowthRate
  };
}

/**
 * Prepare revenue tab data
 */
function prepareRevenueData(transactionData, uiState) {
  const summaryData = groupRevenueByMonth(transactionData, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  // Convert to expense table format for compatibility
  const expenseFormatData = summaryData.map(item => ({
    month: item.month,
    type: item.software,
    amount: item.amount
  }));
  
  return {
    summaryData: expenseFormatData,
    showGrowthRate: uiState.showGrowthRate
  };
}

/**
 * Prepare combined data for export
 * @param {Object} data - Combined statistics data
 * @param {Object} uiState - Current UI state
 * @returns {Array} - Formatted export data
 */
export function prepareCombinedExportData(data, uiState) {
  const combined = [];
  
  // Add expense summary
  const expenseSummary = groupExpensesByMonth(data.expenses, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  expenseSummary.forEach(item => {
    combined.push({
      type: "Expense",
      month: item.month,
      category: item.type,
      amount: item.amount,
      currency: uiState.currency
    });
  });
  
  // Add revenue summary
  const revenueSummary = groupRevenueByMonth(data.transactions, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  revenueSummary.forEach(item => {
    combined.push({
      type: "Revenue",
      month: item.month,
      category: item.software,
      amount: item.amount,
      currency: uiState.currency
    });
  });
  
  return combined;
}

/**
 * Force refresh data from server
 * @param {Object} uiState - Current UI state
 * @returns {Object} - Fresh data
 */
export async function forceRefreshData(uiState) {
  // console.log("🔄 Forcing data refresh...");
  
  try {
    const data = await getCombinedStatistics({ forceRefresh: true });
    window.expenseList = data.expenses;
    window.transactionList = data.transactions;
    
    return data;
    
  } catch (error) {
    console.error("❌ Force refresh failed:", error);
    throw error;
  }
}

/**
 * Filter data by global filters
 * @param {Array} expenseData - Expense data
 * @param {Array} transactionData - Transaction data  
 * @param {Object} globalFilters - Global filter settings
 * @returns {Object} - Filtered data
 */
export async function filterDataByGlobalFilters(expenseData, transactionData, globalFilters) {
  let filteredExpenseData = expenseData;
  let filteredTransactionData = transactionData;
  
  if (globalFilters && globalFilters.dateRange) {
    // Import filter function from financialDashboard.js
    try {
      const { filterDataByDateRange } = await import('../financialDashboard.js');
      filteredExpenseData = filterDataByDateRange(expenseData, globalFilters.dateRange);
      filteredTransactionData = filterDataByDateRange(transactionData, globalFilters.dateRange);
    } catch (error) {
      console.warn("Could not load filter function, using local implementation");
      filteredExpenseData = filterDataByDateRange(expenseData, globalFilters.dateRange);
      filteredTransactionData = filterDataByDateRange(transactionData, globalFilters.dateRange);
    }
  }
  
  return {
    expenses: filteredExpenseData,
    transactions: filteredTransactionData
  };
}

/**
 * Validate data integrity
 * @param {Array} data - Data to validate
 * @returns {Object} - Validation result
 */
export function validateDataIntegrity(data) {
  const issues = [];
  
  if (!Array.isArray(data)) {
    issues.push("Data is not an array");
    return { isValid: false, issues };
  }
  
  data.forEach((item, index) => {
    // Check for required fields
    if (!item.date && !item.transactionDate) {
      issues.push(`Item ${index}: Missing date field`);
    }
    
    if (!item.amount && !item.revenue) {
      issues.push(`Item ${index}: Missing amount field`);
    }
    
    // Check for valid date
    const dateValue = item.date || item.transactionDate;
    if (dateValue && isNaN(new Date(dateValue).getTime())) {
      issues.push(`Item ${index}: Invalid date format`);
    }
    
    // Check for valid amount
    const amountValue = item.amount || item.revenue;
    if (amountValue && (isNaN(parseFloat(amountValue)) || parseFloat(amountValue) < 0)) {
      issues.push(`Item ${index}: Invalid amount value`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

/**
 * Clean up loading modals and UI state
 */
function cleanupLoadingModals() {
  // Force close any processing modals
  if (typeof window.closeProcessingModal === 'function') {
    // console.log("🚫 Force closing any processing modals");
    window.closeProcessingModal();
  }
  
  // Check for any modal elements that might be stuck
  const modalElements = [
    document.querySelector('#processingModal'),
    document.querySelector('.modal'),
    document.querySelector('[class*="modal"]'),
    document.querySelector('#loading-modal')
  ].filter(el => el !== null);
  
  console.log("🔍 DEBUG modal elements:", {
    foundModals: modalElements.length,
    modals: modalElements.map(el => ({
      id: el.id,
      className: el.className,
      display: window.getComputedStyle(el).display,
      visibility: window.getComputedStyle(el).visibility
    }))
  });
  
  // Force hide any visible modals
  modalElements.forEach(el => {
    if (window.getComputedStyle(el).display !== 'none') {
      // console.log(`🚫 Force hiding modal:`, el.id || el.className);
      el.style.display = 'none';
    }
  });
}

// Make functions available globally for legacy compatibility
window.loadStatisticsData = loadStatisticsData;
window.processDataForUI = processDataForUI;
window.forceRefreshData = forceRefreshData;

// console.log('✅ dataProcessors.js module loaded successfully');