/**
 * financialDashboard.js
 * 
 * Main financial dashboard controller - refactored modular version
 * Orchestrates all financial dashboard components
 */

// Import core modules
import { 
  globalFilters, 
  saveFiltersToStorage, 
  filterDataByDateRange,
  calculateFinancialMetrics 
} from './core/dataProcessor.js';

import { initChartManager } from './core/chartManager.js';
import { applyFiltersToTransactions, applyFiltersToExpenses } from './core/filterManager.js';

// Import dashboard components
import { renderOverviewCards, renderCashFlowCards, renderPerformanceAlerts } from './dashboard/kpiCards.js';
import { 
  renderRevenueTrendChart, 
  renderRevenueBySoftwareChart, 
  renderMonthlyRevenueChart,
  renderRevenueAnalyticsTable 
} from './dashboard/revenueCharts.js';
import { 
  renderExpenseByCategoryChart, 
  renderExpenseTrendChart,
  renderExpenseAnalyticsTable 
} from './dashboard/expenseCharts.js';
import { renderProfitTrendChart, renderProfitBySoftwareChart } from './dashboard/profitCharts.js';

// Import export modules
import { exportFinancialDashboardToExcel } from './export/excelExporter.js';
import { exportFinancialDashboardToPDF } from './export/pdfExporter.js';

// Make global filters available globally
window.globalFilters = globalFilters;

/**
 * Renders the comprehensive financial dashboard
 * @param {Array} transactionData - Transaction records from GiaoDich sheet
 * @param {Array} expenseData - Expense records from ChiPhi sheet  
 * @param {Object} options - Dashboard options
 */
export function renderFinancialDashboard(transactionData, expenseData, options = {}) {
  const {
    containerId = "financialDashboard",
    globalFilters: optionFilters = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Dashboard container #${containerId} not found`);
    return;
  }

  console.log("💰 Rendering Financial Dashboard với dữ liệu:", {
    transactions: transactionData.length,
    expenses: expenseData.length,
    globalFilters: optionFilters,
    sampleTransaction: transactionData[0],
    sampleExpense: expenseData[0]
  });

  // Initialize chart manager
  initChartManager();

  // Apply global filters if available
  let filteredTransactionData = transactionData;
  let filteredExpenseData = expenseData;
  
  const activeFilters = optionFilters || window.globalFilters;
  if (activeFilters) {
    filteredTransactionData = applyFiltersToTransactions(transactionData, activeFilters);
    filteredExpenseData = applyFiltersToExpenses(expenseData, activeFilters);
    
    console.log("🔍 Đã áp dụng bộ lọc:", {
      originalTransactions: transactionData.length,
      filteredTransactions: filteredTransactionData.length,
      originalExpenses: expenseData.length,
      filteredExpenses: filteredExpenseData.length,
      activeFilters
    });
  }

  // Calculate all metrics với dữ liệu đã lọc
  const metrics = calculateFinancialMetrics(filteredTransactionData, filteredExpenseData, activeFilters);

  // Render dashboard HTML structure
  renderDashboardStructure(container);

  // Render all dashboard components
  renderDashboardComponents(metrics, filteredTransactionData, filteredExpenseData);

  console.log("✅ Financial Dashboard rendered successfully");
}

/**
 * Render dashboard HTML structure
 * @param {HTMLElement} container - Dashboard container
 */
function renderDashboardStructure(container) {
  const dashboardHTML = `
    <div class="dashboard-wrapper">
      ${renderFilterPanel()}
      <div class="financial-dashboard">
        <div class="dashboard-header">
          <h2>💰 Dashboard Tài Chính Tổng Quan</h2>
          <div class="dashboard-controls">
            <button class="filter-toggle-btn" onclick="toggleFilterPanel()">
              <span class="filter-icon">⚙️</span> Bộ lọc
            </button>
            <button class="export-btn" onclick="exportDashboard('excel')">
              <span class="export-icon">📊</span> Excel
            </button>
            <button class="export-btn" onclick="exportDashboard('pdf')">
              <span class="export-icon">📄</span> PDF
            </button>
            <div class="last-updated">Cập nhật: ${new Date().toLocaleString('vi-VN')}</div>
          </div>
        </div>
        
        <!-- Overview Cards -->
        <div id="overviewCards" class="overview-section"></div>
        
        <!-- Cash Flow Cards -->
        <div id="cashFlowCards" class="cash-flow-section"></div>
        
        <!-- Charts Section -->
        <div class="charts-section">
          <div class="charts-row">
            <div class="chart-container half-width">
              <div id="revenueTrendChart"></div>
            </div>
            <div class="chart-container half-width">
              <div id="expenseByCategoryChart"></div>
            </div>
          </div>
          
          <div class="charts-row">
            <div class="chart-container half-width">
              <div id="revenueBySoftwareChart"></div>
            </div>
            <div class="chart-container half-width">
              <div id="profitTrendChart"></div>
            </div>
          </div>
        </div>
        
        <!-- Analytics Tables -->
        <div class="analytics-section">
          <div class="analytics-row">
            <div class="analytics-container half-width">
              <div id="revenueAnalyticsTable"></div>
            </div>
            <div class="analytics-container half-width">
              <div id="expenseAnalyticsTable"></div>
            </div>
          </div>
        </div>
        
        <!-- Performance Alerts -->
        <div id="performanceAlerts" class="alerts-section"></div>
      </div>
    </div>
  `;

  container.innerHTML = dashboardHTML;
}

/**
 * Render all dashboard components
 * @param {Object} metrics - Financial metrics
 * @param {Array} transactionData - Filtered transaction data
 * @param {Array} expenseData - Filtered expense data
 */
function renderDashboardComponents(metrics, transactionData, expenseData) {
  try {
    // Render KPI cards
    renderOverviewCards(metrics);
    renderCashFlowCards(metrics);
    renderPerformanceAlerts(metrics);

    // Render charts
    renderRevenueTrendChart(metrics);
    renderExpenseByCategoryChart(metrics);
    renderRevenueBySoftwareChart(metrics);
    renderProfitTrendChart(metrics);

    // Render analytics tables
    renderRevenueAnalyticsTable(metrics);
    renderExpenseAnalyticsTable(metrics);

    console.log("✅ All dashboard components rendered");
  } catch (error) {
    console.error("❌ Error rendering dashboard components:", error);
  }
}

/**
 * Render filter panel HTML
 * @returns {string} Filter panel HTML
 */
function renderFilterPanel() {
  return `
    <div class="filter-panel" id="filterPanel">
      <div class="filter-header">
        <h3>⚙️ Bộ lọc Dashboard</h3>
        <button class="close-filter-btn" onclick="toggleFilterPanel()">✕</button>
      </div>
      
      <div class="filter-content">
        <div class="filter-group">
          <label>📅 Khoảng thời gian:</label>
          <select id="periodSelect" onchange="updatePeriodFilter()">
            <option value="current_month">Tháng hiện tại</option>
            <option value="last_month">Tháng trước</option>
            <option value="current_quarter">Quý hiện tại</option>
            <option value="current_year">Năm hiện tại</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>
        
        <div class="filter-group custom-dates" id="customDateGroup" style="display: none;">
          <label>Từ ngày:</label>
          <input type="date" id="startDate" onchange="updateCustomDateFilter()">
          <label>Đến ngày:</label>
          <input type="date" id="endDate" onchange="updateCustomDateFilter()">
        </div>
        
        <div class="filter-group">
          <label>💻 Phần mềm:</label>
          <div class="software-filter">
            <label>
              <input type="checkbox" id="showAllSoftware" checked onchange="updateSoftwareFilter()">
              Hiển thị tất cả
            </label>
            <div id="softwareList" class="software-list"></div>
          </div>
        </div>
        
        <div class="filter-actions">
          <button onclick="applyFilters()" class="apply-btn">Áp dụng</button>
          <button onclick="resetFilters()" class="reset-btn">Đặt lại</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Export dashboard data
 * @param {string} format - Export format ('excel' or 'pdf')
 */
function exportDashboard(format) {
  const currentData = {
    metrics: window.currentDashboardMetrics || {},
    transactionData: window.filteredTransactionData || [],
    expenseData: window.filteredExpenseData || []
  };

  switch (format) {
    case 'excel':
      exportFinancialDashboardToExcel(
        currentData.metrics,
        currentData.transactionData,
        currentData.expenseData,
        `financial-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`
      );
      break;

    case 'pdf':
      exportFinancialDashboardToPDF(
        currentData.metrics,
        currentData.transactionData,
        currentData.expenseData,
        `financial-dashboard-${new Date().toISOString().split('T')[0]}.pdf`
      );
      break;

    default:
      console.warn('Unknown export format:', format);
  }
}

/**
 * Toggle filter panel visibility
 */
function toggleFilterPanel() {
  const filterPanel = document.getElementById('filterPanel');
  if (filterPanel) {
    filterPanel.classList.toggle('active');
  }
}

/**
 * Apply filters and refresh dashboard
 */
function applyFilters() {
  // Save current filters
  saveFiltersToStorage();
  
  // Trigger dashboard refresh
  if (window.refreshStatisticsWithFilters) {
    window.refreshStatisticsWithFilters(window.globalFilters);
  }
  
  // Close filter panel
  toggleFilterPanel();
}

/**
 * Reset all filters to default
 */
function resetFilters() {
  // Reset global filters
  Object.assign(window.globalFilters, {
    dateRange: null,
    period: 'current_month',
    customStartDate: null,
    customEndDate: null,
    selectedSoftware: [],
    compareMode: 'none',
    showAllSoftware: true
  });
  
  // Save and refresh
  saveFiltersToStorage();
  applyFilters();
}

// Make functions available globally
window.exportDashboard = exportDashboard;
window.toggleFilterPanel = toggleFilterPanel;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;

// Export main function
export default renderFinancialDashboard;