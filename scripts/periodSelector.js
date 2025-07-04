/**
 * periodSelector.js
 * 
 * Handles period selection for statistics reports
 */

// Current selected period
let currentReportPeriod = 'this_month';

/**
 * Toggle period dropdown
 */
window.togglePeriodDropdown = function() {
  const dropdown = document.querySelector('.period-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('open');
    
    // Close dropdown when clicking outside
    if (dropdown.classList.contains('open')) {
      document.addEventListener('click', closePeriodDropdown);
    }
  }
}

/**
 * Close period dropdown when clicking outside
 */
function closePeriodDropdown(event) {
  const dropdown = document.querySelector('.period-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    dropdown.classList.remove('open');
    document.removeEventListener('click', closePeriodDropdown);
  }
}

/**
 * Select report period
 */
window.selectReportPeriod = function(period) {
  // console.log('📅 Selecting report period:', period);
  
  // Update selected period
  currentReportPeriod = period;
  
  // Update UI
  updatePeriodUI(period);
  
  // Calculate date range
  const dateRange = calculateDateRange(period);
  
  // Handle custom period
  if (period === 'custom') {
    showCustomDatePicker();
    return;
  }
  
  // Initialize global filters if not exists
  if (!window.globalFilters) {
    window.globalFilters = {};
  }
  
  // Update global filters
  window.globalFilters.dateRange = dateRange;
  window.globalFilters.period = period;
  
  // Save to localStorage
  localStorage.setItem('dashboardFilters', JSON.stringify(window.globalFilters));
  
  // Refresh all reports with new date range
  refreshAllReports(dateRange);
  
  // Close dropdown
  const dropdown = document.querySelector('.period-dropdown');
  if (dropdown) {
    dropdown.classList.remove('open');
  }
}

/**
 * Update period UI
 */
function updatePeriodUI(period) {
  // Update selected text
  const selectedText = document.getElementById('selectedPeriodText');
  if (selectedText) {
    selectedText.textContent = getPeriodLabel(period);
  }
  
  // Update active state
  document.querySelectorAll('.period-option').forEach(option => {
    option.classList.remove('active');
  });
  
  const activeOption = document.querySelector(`.period-option[onclick*="${period}"]`);
  if (activeOption) {
    activeOption.classList.add('active');
  }
}

/**
 * Get period label
 */
function getPeriodLabel(period) {
  const labels = {
    'today': 'Hôm nay',
    'yesterday': 'Hôm qua',
    'this_week': 'Tuần này',
    'last_week': 'Tuần trước',
    'last_7_days': '7 ngày qua',
    'this_month': 'Tháng này',
    'last_month': 'Tháng trước',
    'last_30_days': '30 ngày qua',
    'this_quarter': 'Quý này',
    'last_quarter': 'Quý trước',
    'this_year': 'Năm nay',
    'last_year': 'Năm trước',
    'all_time': 'Tất cả thời gian',
    'custom': 'Tùy chỉnh'
  };
  
  return labels[period] || period;
}

/**
 * Calculate date range for period
 */
function calculateDateRange(period) {
  const today = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(today);
      endDate = new Date(today);
      break;
      
    case 'yesterday':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(startDate);
      break;
      
    case 'this_week':
      // Monday of current week
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysToMonday);
      endDate = new Date(today);
      break;
      
    case 'last_week':
      // Monday to Sunday of last week
      const lastWeekDay = today.getDay();
      const daysToLastMonday = lastWeekDay === 0 ? 13 : lastWeekDay + 6;
      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysToLastMonday);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
      
    case 'last_7_days':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      endDate = new Date(today);
      break;
      
    case 'this_month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
      
    case 'last_month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
      
    case 'last_30_days':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      endDate = new Date(today);
      break;
      
    case 'this_quarter':
      const currentQuarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
      endDate = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0);
      break;
      
    case 'last_quarter':
      const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
      const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const quarter = lastQuarter < 0 ? 3 : lastQuarter;
      startDate = new Date(year, quarter * 3, 1);
      endDate = new Date(year, quarter * 3 + 3, 0);
      break;
      
    case 'this_year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
      
    case 'last_year':
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
      break;
      
    case 'all_time':
      // Return null to indicate all data
      return null;
      
    default:
      // Default to this month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }
  
  // Format dates as yyyy/mm/dd
  if (startDate && endDate) {
    return {
      start: formatDateForFilter(startDate),
      end: formatDateForFilter(endDate)
    };
  }
  
  return null;
}

/**
 * Format date for filter (yyyy/mm/dd)
 */
function formatDateForFilter(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Refresh all reports with new date range
 */
function refreshAllReports(dateRange) {
  // console.log('🔄 Refreshing all reports with date range:', dateRange);
  
  // Update filter panel if exists
  if (window.updatePeriodFilter) {
    const period = dateRange ? 'custom' : 'all_time';
    window.updatePeriodFilter(period);
  }
  
  // Refresh statistics
  if (window.refreshStatisticsWithFilters) {
    window.refreshStatisticsWithFilters({
      ...window.globalFilters,
      dateRange: dateRange
    });
  }
  
  // Refresh current report with new date range
  if (window.refreshCurrentReport) {
    window.refreshCurrentReport();
  } else if (window.reportState?.currentReport === 'overview') {
    // If refreshCurrentReport not available, try to reload overview directly
    if (window.loadOverviewReport) {
      const options = {
        dateRange: dateRange,
        period: currentReportPeriod
      };
      window.loadOverviewReport(options);
    }
  }
}

/**
 * Show custom date picker
 */
function showCustomDatePicker() {
  // This would open a date picker modal
  // For now, just use the existing filter panel
  if (window.toggleFilterPanel) {
    window.toggleFilterPanel();
    
    // Switch to custom date tab
    if (window.selectPeriod) {
      window.selectPeriod('custom');
    }
  }
}

/**
 * Initialize period selector
 */
export function initPeriodSelector() {
  // Initializing period selector
  
  // Set initial period from saved filters
  if (window.globalFilters && window.globalFilters.period) {
    currentReportPeriod = window.globalFilters.period;
    updatePeriodUI(currentReportPeriod);
  }
  
  // Close dropdown on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const dropdown = document.querySelector('.period-dropdown');
      if (dropdown && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
      }
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPeriodSelector);
} else {
  initPeriodSelector();
}