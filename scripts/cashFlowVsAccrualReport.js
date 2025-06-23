/**
 * cashFlowVsAccrualReport.js
 * 
 * Main orchestrator for Cash Flow vs Accrual Report
 * Coordinates all modules to generate comprehensive comparison report
 */

// Import all modules
import { calculateCashFlowView, renderCashFlowChart, renderLargePayments } from './cash-flow/cashFlowComponents.js';
import { calculateAccrualView, renderAccrualChart, renderAllocatedExpenses } from './cash-flow/accrualComponents.js';
import { compareViews, renderComparisonSummary, renderDualViewCharts, renderDetailedBreakdown, renderInsights } from './cash-flow/comparisonLogic.js';
import { renderReportHeader, addReportInteractivity } from './cash-flow/reportUtilities.js';
import { dataManager } from './cash-flow/dataManagers.js';

/**
 * Render Cash Flow vs Accrual comparison report
 */
export async function renderCashFlowVsAccrualReport(expenseData, options = {}) {
  const {
    containerId = "cashFlowVsAccrualReport",
    dateRange = null,
    useCache = true
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container #${containerId} not found`);
    return;
  }

    expenses: expenseData.length,
    dateRange,


  try {
    // Fetch data if needed
    if (useCache) {
      expenseData = await dataManager.getReportData({ dateRange });
    }

    // Calculate both views
    const cashFlowData = calculateCashFlowView(expenseData, dateRange);
    const accrualData = calculateAccrualView(expenseData, dateRange);
    const comparison = compareViews(cashFlowData, accrualData);

    // Render report
    const reportHTML = `
      <div class="cashflow-accrual-report">
        ${renderReportHeader(dateRange)}
        ${renderComparisonSummary(comparison)}
        ${renderDualViewCharts(cashFlowData, accrualData)}
        ${renderDetailedBreakdown(cashFlowData, accrualData)}
        ${renderLargePayments(cashFlowData.largePayments)}
        ${renderAllocatedExpenses(accrualData.allocatedExpenses)}
        ${renderInsights(comparison)}
      </div>
    `;

    container.innerHTML = reportHTML;
    
    // Add interactivity
    addReportInteractivity();
    
    // Initialize charts if available
    if (typeof Chart !== 'undefined') {
      initializeCharts(cashFlowData, accrualData);
    }
    
    // Return report data for further processing
    return {
      cashFlow: cashFlowData,
      accrual: accrualData,
      comparison: comparison,
    };
    
  } catch (error) {
    console.error('❌ Error rendering report:', error);
    container.innerHTML = `
      <div class="error-message">
        <p>Không thể tạo báo cáo. Vui lòng thử lại.</p>
        <p class="error-detail">${error.message}</p>
      </div>
    `;
    return null;
  }
}

/**
 * Initialize Chart.js charts
 */
function initializeCharts(cashFlowData, accrualData) {
  // Initialize cash flow chart
  const cashFlowCanvas = document.getElementById('cashFlowChart');
  if (cashFlowCanvas) {
    const cashFlowChartData = prepareCashFlowChartData(cashFlowData);
    new Chart(cashFlowCanvas, {
      type: 'line',
      data: cashFlowChartData,
  }
  
  // Initialize accrual chart
  const accrualCanvas = document.getElementById('accrualChart');
  if (accrualCanvas) {
    const accrualChartData = prepareAccrualChartData(accrualData);
    new Chart(accrualCanvas, {
      type: 'line',
      data: accrualChartData,
  }
}

/**
 * Prepare chart data for Chart.js
 */
function prepareCashFlowChartData(cashFlowData) {
  const months = Object.keys(cashFlowData.byMonth).sort();
  return {
    labels: months.map(formatMonthLabel),
    datasets: [{
      label: 'Cash Flow',
      data: months.map(m => cashFlowData.byMonth[m]),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    }]
  };
}

/**
 * Prepare accrual chart data
 */
function prepareAccrualChartData(accrualData) {
  const months = Object.keys(accrualData.byMonth).sort();
  return {
    labels: months.map(formatMonthLabel),
    datasets: [{
      label: 'Chi phí phân bổ',
      data: months.map(m => accrualData.byMonth[m]),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
    }]
  };
}

/**
 * Get chart options
 */
function getChartOptions(title) {
  return {
    responsive: true,
    plugins: {
      title: {
      },
      legend: {
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrencyShort(value);
          }
        }
      }
    }
  };
}

/**
 * Format month label
 */
function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  return `${month}/${year}`;
}

/**
 * Format currency short
 */
function formatCurrencyShort(amount) {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  return `${(amount / 1000).toFixed(0)}K`;
}

// Export for global access
window.renderCashFlowVsAccrualReport = renderCashFlowVsAccrualReport;