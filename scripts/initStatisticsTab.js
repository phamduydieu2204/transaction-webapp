/**
 * initStatisticsTab.js
 * 
 * Initialize statistics tab with overview report
 */

import { initReportMenu } from './reports/reportMenuController.js';
import { loadOverviewReport } from './reports/overview/overviewReport.js';
import { initPeriodSelector } from './periodSelector.js';

/**
 * Initialize the statistics tab
 */
export async function initStatisticsTab() {
  console.log('📊 Initializing statistics tab...');
  
  try {
    // Check if we have transaction data
    console.log('🔍 Checking data availability:', {
      transactionList: window.transactionList ? window.transactionList.length : 0,
      expenseList: window.expenseList ? window.expenseList.length : 0,
      userInfo: !!window.userInfo
    });
    
    // Load report pages HTML if not already loaded
    await loadReportPagesHTML();
    
    // Initialize period selector
    initPeriodSelector();
    
    // Initialize menu interactions
    initMenuInteractions();
    
    // Initialize report menu controller
    if (typeof initReportMenu === 'function') {
      await initReportMenu();
      console.log('✅ Report menu initialized');
    } else {
      console.warn('⚠️ initReportMenu not available, loading overview directly');
      // Fallback: load overview report directly
      await loadOverviewReport();
    }
    
    console.log('✅ Statistics tab initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing statistics tab:', error);
    showStatisticsError(error.message);
  }
}

/**
 * Load report pages HTML into the container
 */
async function loadReportPagesHTML() {
  const container = document.getElementById('report-pages-container');
  if (!container) {
    console.warn('⚠️ Report pages container not found');
    return;
  }
  
  // Check if already loaded
  if (container.querySelector('#report-overview')) {
    console.log('📄 Report pages already loaded');
    return;
  }
  
  try {
    const response = await fetch('./partials/tabs/report-pages.html');
    if (!response.ok) throw new Error('Failed to load report pages');
    
    const html = await response.text();
    container.innerHTML = html;
    
    console.log('📄 Report pages HTML loaded');
  } catch (error) {
    console.error('❌ Error loading report pages HTML:', error);
    // Create basic structure as fallback
    container.innerHTML = `
      <div id="report-overview" class="report-page active">
        <div class="page-header">
          <h2>📊 Tổng quan kinh doanh</h2>
          <div class="header-actions">
            <button class="btn-refresh" onclick="window.loadOverviewReport && window.loadOverviewReport()">
              <i class="fas fa-sync-alt"></i> Làm mới
            </button>
          </div>
        </div>
        <div id="overview-content">
          <!-- Content will be loaded here -->
        </div>
      </div>
    `;
  }
}

/**
 * Show error in statistics tab
 */
function showStatisticsError(message) {
  const container = document.getElementById('report-pages-container') || 
                   document.getElementById('tab-thong-ke');
  
  if (container) {
    container.innerHTML = `
      <div class="statistics-error">
        <h3>⚠️ Lỗi tải tab thống kê</h3>
        <p>${message}</p>
        <button onclick="initStatisticsTab()" class="btn btn-primary">Thử lại</button>
      </div>
    `;
  }
}

/**
 * Initialize menu interactions
 */
function initMenuInteractions() {
  console.log('🎛️ Initializing menu interactions');
  
  // Setup menu item click handlers
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const reportType = item.dataset.report;
      
      // Remove active class from all items
      menuItems.forEach(mi => mi.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Load corresponding report
      loadReportByType(reportType);
    });
  });
  
  console.log('✅ Menu interactions initialized');
}

/**
 * Load report by type
 * @param {string} reportType - Type of report to load
 */
function loadReportByType(reportType) {
  console.log('📊 Loading report type:', reportType);
  
  // Hide all report pages
  const reportPages = document.querySelectorAll('.report-page');
  reportPages.forEach(page => page.classList.remove('active'));
  
  // Show selected report page
  const selectedPage = document.getElementById(`report-${reportType}`);
  if (selectedPage) {
    selectedPage.classList.add('active');
  }
  
  // Load specific report content
  switch (reportType) {
    case 'overview':
      if (window.loadOverviewReport) {
        window.loadOverviewReport();
      }
      break;
    case 'revenue':
      showReportPlaceholder(reportType, '💰 Phân tích doanh thu');
      break;
    case 'expense':
      showReportPlaceholder(reportType, '💸 Phân tích chi phí');
      break;
    case 'customer':
      if (window.loadCustomerManagement) {
        window.loadCustomerManagement();
      } else {
        showReportPlaceholder(reportType, '👥 Quản lý khách hàng');
      }
      break;
    case 'software':
      if (window.loadSoftwareManagement) {
        window.loadSoftwareManagement();
      } else {
        showReportPlaceholder(reportType, '💻 Tài khoản phần mềm');
      }
      break;
    case 'employee':
      if (window.loadEmployeeReport) {
        window.loadEmployeeReport();
      } else {
        showReportPlaceholder(reportType, '👔 Báo cáo nhân viên');
      }
      break;
    case 'finance':
      if (window.loadFinancialManagement) {
        window.loadFinancialManagement();
      } else {
        showReportPlaceholder(reportType, '🏦 Quản lý tài chính');
      }
      break;
    case 'cashflow-accrual':
      showReportPlaceholder(reportType, '⚖️ Cash Flow vs Phân bổ');
      break;
    default:
      console.warn('Unknown report type:', reportType);
  }
}

/**
 * Show placeholder for reports not yet implemented
 * @param {string} reportType - Report type
 * @param {string} title - Report title
 */
function showReportPlaceholder(reportType, title) {
  const container = document.getElementById(`report-${reportType}`);
  if (container) {
    container.innerHTML = `
      <div class="report-placeholder">
        <div class="placeholder-content">
          <h2>${title}</h2>
          <p>📊 Báo cáo này đang được phát triển</p>
          <p>Vui lòng quay lại sau hoặc sử dụng báo cáo Tổng quan kinh doanh.</p>
          <button onclick="loadReportByType('overview')" class="btn btn-primary">
            Xem Tổng quan kinh doanh
          </button>
        </div>
      </div>
    `;
  }
}

// Make function available globally
window.initStatisticsTab = initStatisticsTab;
window.loadReportByType = loadReportByType;

// Export for module use
export default initStatisticsTab;