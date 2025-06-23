/**
 * chartRenderers.js
 * 
 * Chart rendering và visualization
 * Handles all chart generation and data visualization components
 */


// Import rendering utilities
import { 
  renderMonthlySummaryTable, 
  renderFinancialOverview, 
  renderSimpleChart,
  renderExportControls 
} from '../statisticsRenderer.js';

import { renderFinancialDashboard } from '../financialDashboard.js';
// DISABLED: import { renderBusinessOverviewDashboard } from '../businessOverviewDashboard.js';

/**
 * Renders overview tab content
 */
export async function renderOverviewTab(expenseData, transactionData, financialAnalysis, uiState) {
  try {
    // Render financial overview
    renderFinancialOverview(financialAnalysis, {
      containerId: "financialOverview",
      showDetails: true
    
    // Render summary chart
    const { groupExpensesByMonth } = await import('../statisticsCore.js');
    const chartData = groupExpensesByMonth(expenseData, {
      currency: uiState.currency,
      sortBy: "month",
      sortOrder: "desc"
    }).slice(0, 12); // Last 12 months
    
    renderSimpleChart(chartData, {
      containerId: "overviewChart",
      chartType: "bar",
      title: "Chi Phí Theo Tháng",
      xLabel: "Tháng",
      yLabel: "Số Tiền (VND)"
    
    
  } catch (error) {
    console.error("❌ Error rendering overview tab:", error);
    throw error;
  }
}

/**
 * Renders expenses tab content
 */
export async function renderExpensesTab(expenseData, uiState) {
  try {
    const { groupExpensesByMonth } = await import('../statisticsCore.js');
    
    const summaryData = groupExpensesByMonth(expenseData, {
      currency: uiState.currency,
      sortBy: uiState.sortBy,
      sortOrder: uiState.sortOrder
    
    renderMonthlySummaryTable(summaryData, {
      tableId: "monthlySummaryTable",
      showGrowthRate: uiState.showGrowthRate
    
    
  } catch (error) {
    console.error("❌ Error rendering expenses tab:", error);
    throw error;
  }
}

/**
 * Renders revenue tab content
 */
export async function renderRevenueTab(transactionData, uiState) {
  try {
    const { groupRevenueByMonth } = await import('../statisticsCore.js');
    
    const summaryData = groupRevenueByMonth(transactionData, {
      currency: uiState.currency,
      sortBy: uiState.sortBy,
      sortOrder: uiState.sortOrder
    
    // Convert to expense table format for compatibility
    const expenseFormatData = summaryData.map(item => ({
      month: item.month,
      type: item.software,
      amount: item.amount
    }));
    
    renderMonthlySummaryTable(expenseFormatData, {
      tableId: "monthlySummaryTable",
      showGrowthRate: uiState.showGrowthRate
    
    
  } catch (error) {
    console.error("❌ Error rendering revenue tab:", error);
    throw error;
  }
}

/**
 * Renders enhanced statistics with all features
 */
export async function renderEnhancedStatistics(expenseData, transactionData, financialAnalysis, globalFilters = null) {
  try {
    
    // Use saved filters if no filters provided
    if (!globalFilters && window.globalFilters) {
      globalFilters = window.globalFilters;
    }
    
    // Prepare date range for business dashboard
    let dateRange = null;
    if (globalFilters && globalFilters.dateRange) {
      dateRange = {
        start: globalFilters.dateRange.start,
        end: globalFilters.dateRange.end
      };
    }
    
    // 1. Render NEW Business Overview Dashboard
    /* DISABLED: Business Overview Dashboard 
    renderBusinessOverviewDashboard(transactionData, expenseData, {
      containerId: "financialDashboard",
      dateRange: dateRange
    */
    
    // Refresh report menu components if active
    if (window.refreshCurrentReport && document.querySelector('.report-page.active')) {
      window.refreshCurrentReport();
    }
    
    // 2. Render Export Controls
    renderExportControls({
      containerId: "statisticsExportControls",
      formats: ["csv", "json"],
      onExport: window.handleDataExport || (() => console.log("Export handler not found"))
    });
    
    // 3. Render Monthly Summary Table với filtered data
    await renderFilteredMonthlySummary(expenseData, globalFilters);
    
    
  } catch (error) {
    console.error("❌ Error rendering enhanced statistics:", error);
    
    // Fallback to old financial dashboard
    try {
      renderFinancialDashboard(transactionData, expenseData, {
        containerId: "financialDashboard",
        globalFilters: globalFilters
      console.log("✅ Fallback to old financial dashboard");
    } catch (fallbackError) {
      console.error("❌ Fallback failed:", fallbackError);
      await renderDefaultTab(expenseData, financialAnalysis);
    }
  }
}

/**
 * Renders filtered monthly summary table
 */
async function renderFilteredMonthlySummary(expenseData, globalFilters) {
  try {
    let filteredExpenseData = expenseData;
    
    if (globalFilters && globalFilters.dateRange) {
      // Import filter function from financialDashboard.js
      const { filterDataByDateRange } = await import('../financialDashboard.js');
      filteredExpenseData = filterDataByDateRange(expenseData, globalFilters.dateRange);
    }
    
    const { groupExpensesByMonth } = await import('../statisticsCore.js');
    const uiState = window.uiState || { currency: 'VND', sortBy: 'month', sortOrder: 'desc' };
    
    const summaryData = groupExpensesByMonth(filteredExpenseData, {
      currency: uiState.currency,
      sortBy: uiState.sortBy,
      sortOrder: uiState.sortOrder
    
    renderMonthlySummaryTable(summaryData, {
      tableId: "monthlySummaryTable",
      showGrowthRate: false
    
    
  } catch (error) {
    console.error("❌ Error rendering monthly summary:", error);
    throw error;
  }
}

/**
 * Renders default tab content (backward compatibility)
 */
export async function renderDefaultTab(expenseData, financialAnalysis) {
  try {
    const { groupExpensesByMonth } = await import('../statisticsCore.js');
    const uiState = window.uiState || { currency: 'VND', sortBy: 'month', sortOrder: 'desc' };
    
    const summaryData = groupExpensesByMonth(expenseData, {
      currency: uiState.currency,
      sortBy: uiState.sortBy,
      sortOrder: uiState.sortOrder
    
    renderMonthlySummaryTable(summaryData, {
      tableId: "monthlySummaryTable",
      showGrowthRate: false
    
    
  } catch (error) {
    console.error("❌ Error rendering default tab:", error);
    
    // Fallback - just show basic message
    const table = document.querySelector("#monthlySummaryTable tbody");
    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: #666;">
            Đang cập nhật dữ liệu thống kê...
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Render custom chart with specific configuration
 * @param {Array} data - Chart data
 * @param {Object} config - Chart configuration
 */
export function renderCustomChart(data, config) {
  const {
    containerId,
    chartType = 'bar',
    title = '',
    xLabel = '',
    yLabel = '',
    colors = ['#3498db', '#e74c3c', '#2ecc71'],
    showLegend = true,
    responsive = true
  } = config;
  
  try {
    renderSimpleChart(data, {
      containerId,
      chartType,
      title,
      xLabel,
      yLabel,
      colors,
      showLegend,
      responsive
    });
    
    
  } catch (error) {
    console.error(`❌ Error rendering custom chart in ${containerId}:`, error);
  }
}

/**
 * Render comparison chart (current vs previous period)
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data
 * @param {Object} config - Chart configuration
 */
export function renderComparisonChart(currentData, previousData, config) {
  const {
    containerId,
    title = 'So sánh thời kỳ',
    currentLabel = 'Hiện tại',
    previousLabel = 'Trước đó'
  } = config;
  
  try {
    // Prepare comparison data
    const comparisonData = currentData.map((current, index) => {
      const previous = previousData[index] || { amount: 0 };
      return {
        period: current.month || current.period,
        current: current.amount,
        previous: previous.amount,
        growth: previous.amount ? ((current.amount - previous.amount) / previous.amount * 100).toFixed(1) : 0
      };
    });
    
    renderCustomChart(comparisonData, {
      containerId,
      chartType: 'line',
      title,
      xLabel: 'Thời gian',
      yLabel: 'Số tiền',
      colors: ['#3498db', '#95a5a6'],
      showLegend: true
    
    
  } catch (error) {
    console.error(`❌ Error rendering comparison chart:`, error);
  }
}

/**
 * Render pie chart for category breakdown
 * @param {Array} data - Category data
 * @param {Object} config - Chart configuration
 */
export function renderCategoryPieChart(data, config) {
  const {
    containerId,
    title = 'Phân bổ theo danh mục',
    showPercentage = true
  } = config;
  
  try {
    // Calculate total for percentage calculation
    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Prepare pie chart data
    const pieData = data.map(item => ({
      label: item.type || item.category,
      value: item.amount || 0,
      percentage: total > 0 ? ((item.amount || 0) / total * 100).toFixed(1) : 0
    }));
    
    renderCustomChart(pieData, {
      containerId,
      chartType: 'pie',
      title,
      showLegend: true,
      responsive: true
    
    
  } catch (error) {
    console.error(`❌ Error rendering category pie chart:`, error);
  }
}

/**
 * Render trend line chart
 * @param {Array} data - Time series data
 * @param {Object} config - Chart configuration
 */
export function renderTrendChart(data, config) {
  const {
    containerId,
    title = 'Xu hướng theo thời gian',
    showTrendLine = true,
    showDataPoints = true
  } = config;
  
  try {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.month || a.date);
      const dateB = new Date(b.month || b.date);
      return dateA - dateB;
    });
    
    renderCustomChart(sortedData, {
      containerId,
      chartType: 'line',
      title,
      xLabel: 'Thời gian',
      yLabel: 'Giá trị',
      showLegend: false,
      responsive: true
    
    
  } catch (error) {
    console.error(`❌ Error rendering trend chart:`, error);
  }
}

/**
 * Clear all charts in a container
 * @param {string} containerId - Container ID to clear
 */
export function clearCharts(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Refresh all charts with new data
 * @param {Object} data - New data for charts
 * @param {Object} config - Refresh configuration
 */
export async function refreshAllCharts(data, config = {}) {
  const { containers = [], uiState = {} } = config;
  
  try {
    for (const containerConfig of containers) {
      const { id, type, data: chartData } = containerConfig;
      
      // Clear existing chart
      clearCharts(id);
      
      // Render new chart based on type
      switch (type) {
        case 'overview':
          await renderOverviewTab(data.expenses, data.transactions, data.financialAnalysis, uiState);
          break;
        case 'expenses':
          await renderExpensesTab(data.expenses, uiState);
          break;
        case 'revenue':
          await renderRevenueTab(data.transactions, uiState);
          break;
        default:
          renderCustomChart(chartData || [], { containerId: id });
      }
    }
    
    
  } catch (error) {
    console.error("❌ Error refreshing charts:", error);
  }
}

// Make functions available globally for legacy compatibility
window.renderEnhancedStatistics = renderEnhancedStatistics;
window.renderOverviewTab = renderOverviewTab;
window.renderExpensesTab = renderExpensesTab;
window.renderRevenueTab = renderRevenueTab;
window.renderDefaultTab = renderDefaultTab;
