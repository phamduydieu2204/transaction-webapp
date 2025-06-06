/**
 * reportMenuController.js
 * 
 * Main controller for report menu - refactored version
 * Imports functionality from separate modules
 */

// Import core utilities
import { showError, refreshCurrentReport, exportCurrentReport } from './core/reportHelpers.js';

// Import report modules
import { loadOverviewReport } from './overview/overviewReport.js';
import { loadRevenueReport } from './revenue/revenueReport.js';
import { loadCustomerReport } from './customer/customerReport.js';
import { loadRenewalReport } from './renewal/renewalReport.js';
import { loadEmployeeReport } from './employee/employeeReport.js';
import { loadFinanceReport } from './finance/financeReport.js';

// State management
const reportState = {
  currentReport: 'overview',
  isLoading: false
};

// Make state available globally
window.reportState = reportState;

/**
 * Initialize report menu controller
 */
export function initReportMenu() {
  console.log('🎮 Initializing report menu controller');
  
  // Check if containers exist
  console.log('🔍 Checking containers:', {
    revenueChart: !!document.getElementById('revenueChart'),
    topProducts: !!document.getElementById('topProducts'),
    topCustomers: !!document.getElementById('topCustomers'),
    summaryStats: !!document.getElementById('summaryStats')
  });
  
  // Setup menu click handlers
  setupMenuHandlers();
  
  // Load default report
  loadReport('overview');
  
  // Setup global functions
  window.refreshCurrentReport = refreshCurrentReport;
  window.exportCurrentReport = exportCurrentReport;
  window.loadReport = loadReport;
  
  console.log('✅ Report menu controller initialized');
}

/**
 * Setup menu item click handlers
 */
function setupMenuHandlers() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const reportType = item.dataset.report;
      
      // Update active menu item
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
      
      // Load corresponding report
      loadReport(reportType);
    });
  });
}

/**
 * Load a specific report
 * @param {string} reportType - Type of report to load
 */
async function loadReport(reportType) {
  if (reportState.isLoading) return;
  
  console.log(`📊 Loading report: ${reportType}`);
  
  reportState.currentReport = reportType;
  reportState.isLoading = true;
  
  // Hide all report pages
  const reportPages = document.querySelectorAll('.report-page');
  reportPages.forEach(page => page.classList.remove('active'));
  
  // Show selected report page
  const selectedPage = document.getElementById(`report-${reportType}`);
  if (selectedPage) {
    selectedPage.classList.add('active');
  }
  
  // Load report content based on type
  try {
    switch (reportType) {
      case 'overview':
        await loadOverviewReport();
        break;
      case 'revenue':
        await loadRevenueReport();
        break;
      case 'expense':
        await loadExpenseReport();
        break;
      case 'customer':
        await loadCustomerReport();
        break;
      case 'software':
        await loadSoftwareReport();
        break;
      case 'employee':
        await loadEmployeeReport();
        break;
      case 'finance':
        await loadFinanceReport();
        break;
      case 'renewal':
        await loadRenewalReport();
        break;
      default:
        console.warn(`Unknown report type: ${reportType}`);
    }
  } catch (error) {
    console.error(`Error loading report ${reportType}:`, error);
    showError(`Không thể tải báo cáo ${reportType}`);
  } finally {
    reportState.isLoading = false;
  }
}

/**
 * Load expense report (placeholder for now)
 */
async function loadExpenseReport() {
  console.log('💸 Loading expense report');
  // Expense report functionality will be implemented in separate module
  const container = document.getElementById('report-expense');
  if (container) {
    container.innerHTML = `
      <div class="report-placeholder">
        <h3>📊 Báo cáo Chi phí</h3>
        <p>Báo cáo chi phí đang được phát triển...</p>
      </div>
    `;
  }
}

/**
 * Load software report (placeholder for now)
 */
async function loadSoftwareReport() {
  console.log('💻 Loading software report');
  // Software report functionality will be implemented in separate module
  const container = document.getElementById('report-software');
  if (container) {
    container.innerHTML = `
      <div class="report-placeholder">
        <h3>📊 Báo cáo Phần mềm</h3>
        <p>Báo cáo phần mềm đang được phát triển...</p>
      </div>
    `;
  }
}

// Make functions available globally for backward compatibility
window.initReportMenu = initReportMenu;