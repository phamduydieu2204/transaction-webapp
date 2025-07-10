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
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  // If still no data after waiting, try to trigger load
  if (!window.transactionList || window.transactionList.length === 0) {
    if (window.loadTransactions) {
      try {
        await window.loadTransactions();
      } catch (error) {
      }
    }
  }
  
  // Also ensure expense data is loaded
  if (!window.expenseList || window.expenseList.length === 0) {
    
    // Try to load expense data directly from API
    try {
      const { getConstants } = await import('../../constants.js');
      const { BACKEND_URL } = getConstants();
      
      if (window.userInfo && window.userInfo.maNhanVien) {
        const data = {
          action: 'searchExpenses',
          maNhanVien: window.userInfo.maNhanVien,
          conditions: {} // Empty conditions to get all expenses
        };
        
        
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
          // Store expenses globally - API returns data not expenses
          window.expenseList = result.data || [];
        } else {
          window.expenseList = [];
        }
      } else {
        window.expenseList = [];
      }
    } catch (error) {
      window.expenseList = [];
    }
  }
  
  // Use fallback data if still no data
  if (!window.transactionList) window.transactionList = [];
  if (!window.expenseList) window.expenseList = [];
  
}

/**
 * Ensure software data is loaded for commission calculation
 */
export async function ensureSoftwareDataLoaded() {
  if (!window.softwareList || window.softwareList.length === 0) {
    try {
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/${SERVER_CONFIG.ENDPOINTS.GET_SOFTWARE_LIST}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        window.softwareList = result.softwareList || [];
      }
    } catch (error) {
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
  
  if (window.loadReport) {
    window.loadReport(currentReport);
  }
}

/**
 * Export current report
 */
export function exportCurrentReport() {
  const currentReport = window.reportState?.currentReport || 'overview';
  
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