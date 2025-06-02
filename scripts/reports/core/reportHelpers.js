/**
 * reportHelpers.js
 * 
 * Shared utility functions for all reports
 */

/**
 * Ensure data is loaded before rendering reports
 */
export async function ensureDataIsLoaded() {
  let attempts = 0;
  const maxAttempts = 50; // Wait up to 5 seconds
  
  while (attempts < maxAttempts && (!window.transactionList || !window.expenseList)) {
    console.log(`⏳ Waiting for data to load... (attempt ${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  // If still no data after waiting, try to trigger load
  if (!window.transactionList || window.transactionList.length === 0) {
    console.log('🔄 No transaction data found, triggering load...');
    if (window.loadTransactions) {
      try {
        await window.loadTransactions();
      } catch (error) {
        console.warn('⚠️ Failed to load transactions:', error);
      }
    }
  }
  
  // Also ensure expense data is loaded
  if (!window.expenseList || window.expenseList.length === 0) {
    console.log('🔄 No expense data found, trying to load from statistics...');
    // Try to get expense data from statistics module
    if (window.loadStatisticsData && typeof window.loadStatisticsData === 'function') {
      try {
        await window.loadStatisticsData();
      } catch (error) {
        console.warn('⚠️ Failed to load expense data:', error);
      }
    }
  }
  
  // Use fallback data if still no data
  if (!window.transactionList) window.transactionList = [];
  if (!window.expenseList) window.expenseList = [];
  
  console.log('✅ Data ensured:', {
    transactions: window.transactionList.length,
    expenses: window.expenseList.length
  });
}

/**
 * Ensure software data is loaded for commission calculation
 */
export async function ensureSoftwareDataLoaded() {
  if (!window.softwareList || window.softwareList.length === 0) {
    console.log('📦 Loading software list...');
    try {
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/${SERVER_CONFIG.ENDPOINTS.GET_SOFTWARE_LIST}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        window.softwareList = result.softwareList || [];
        console.log(`✅ Loaded ${window.softwareList.length} software items`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load software list:', error);
      window.softwareList = [];
    }
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
export function showError(message) {
  if (window.showResultModal) {
    window.showResultModal(message, false);
  } else {
    alert(message);
  }
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
  if (window.showResultModal) {
    window.showResultModal(message, true);
  } else {
    alert(message);
  }
}

/**
 * Show loading state
 * @param {string} message - Loading message
 */
export function showLoading(message = 'Đang tải...') {
  if (window.showProcessingModal) {
    window.showProcessingModal(message);
  }
}

/**
 * Hide loading state
 */
export function hideLoading() {
  if (window.closeProcessingModal) {
    window.closeProcessingModal();
  }
}

/**
 * Refresh current report
 */
export function refreshCurrentReport() {
  const currentReport = window.reportState?.currentReport || 'overview';
  console.log(`🔄 Refreshing current report: ${currentReport}`);
  
  if (window.loadReport) {
    window.loadReport(currentReport);
  }
}

/**
 * Export current report
 */
export function exportCurrentReport() {
  const currentReport = window.reportState?.currentReport || 'overview';
  console.log(`📊 Exporting current report: ${currentReport}`);
  
  // Implementation depends on report type
  switch (currentReport) {
    case 'overview':
      exportOverviewReport();
      break;
    case 'revenue':
      exportRevenueReport();
      break;
    case 'customer':
      exportCustomerReport();
      break;
    default:
      showError(`Xuất báo cáo ${currentReport} chưa được hỗ trợ`);
  }
}

/**
 * Export overview report to Excel
 */
function exportOverviewReport() {
  // Use existing export functionality if available
  if (window.exportToExcel) {
    window.exportToExcel();
  } else {
    showError('Chức năng xuất Excel không khả dụng');
  }
}

/**
 * Export revenue report to Excel
 */
function exportRevenueReport() {
  // Implementation for revenue report export
  showError('Xuất báo cáo doanh thu đang được phát triển');
}

/**
 * Export customer report to Excel
 */
function exportCustomerReport() {
  // Implementation for customer report export
  showError('Xuất báo cáo khách hàng đang được phát triển');
}

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'VND') {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 ' + currency;
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency === 'VND' ? 'VND' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}