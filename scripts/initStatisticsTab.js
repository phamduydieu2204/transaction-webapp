/**
 * initStatisticsTab.js
 * 
 * Initialize statistics tab with overview report
 */

import { initReportMenu } from './reports/reportMenuController.js';
import { loadOverviewReport } from './reports/overview/overviewReport.js';

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

// Make function available globally
window.initStatisticsTab = initStatisticsTab;

// Export for module use
export default initStatisticsTab;