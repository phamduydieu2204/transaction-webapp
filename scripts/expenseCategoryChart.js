/**
 * expenseCategoryChart.js
 * 
 * Orchestrator for expense category chart functionality
 * Coordinates between different modules to provide complete chart experience
 */

// Import modules
import { 
  calculateExpenseByCategoryData, 
  calculateCategoryStats,
  groupExpensesByPeriod 
} from './expense-category/categoryDataProcessors.js';

import { 
  renderExpenseCategoryChart as renderChart 
} from './expense-category/categoryChartComponents.js';

import { 
  addExpenseCategoryChartStyles,
  getChartConfig,
  getChartTheme 
} from './expense-category/categoryChartConfig.js';

import { 
  exportChartAsPNG,
  exportCategoryDataAsCSV,
  exportCategoryDataAsExcel,
  exportCategoryReportAsPDF,
  downloadCategorySummaryReport,
  copyCategoryDataToClipboard 
} from './expense-category/categoryExportUtils.js';

// Re-export main functions for backward compatibility
export { calculateExpenseByCategoryData } from './expense-category/categoryDataProcessors.js';
export { addExpenseCategoryChartStyles } from './expense-category/categoryChartConfig.js';

/**
 * Main orchestrator function to render expense category chart
 * @param {Array} expenseData - Expense records
 * @param {string} containerId - Container element ID
 * @param {Object} options - Additional options
 */
export function renderExpenseCategoryChart(expenseData, containerId = 'expenseByCategory', options = {}) {
  try {
    // Process data
    const processedData = calculateExpenseByCategoryData(expenseData);
    
    // Add styles if not already added
    addExpenseCategoryChartStyles();
    
    // Render chart
    renderChart(expenseData, containerId, processedData);
    
    // Calculate statistics for potential use
    const stats = calculateCategoryStats(processedData);
    
    // Store data for export functions
    const container = document.getElementById(containerId);
    if (container) {
      container._chartData = processedData;
      container._chartStats = stats;
      
      // Add export buttons if enabled
      if (options.showExportButtons) {
        addExportButtons(containerId);
      }
    }
    
    return { processedData, stats };
  } catch (error) {
    console.error('Error rendering expense category chart:', error);
    return null;
  }
}

/**
 * Add export buttons to chart container
 * @param {string} containerId - Container element ID
 */
function addExportButtons(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const exportContainer = document.createElement('div');
  exportContainer.className = 'chart-export-buttons';
  exportContainer.innerHTML = `
    <button class="export-btn" data-action="png">
      <span>📸</span> Export PNG
    </button>
    <button class="export-btn" data-action="csv">
      <span>📄</span> Export CSV
    </button>
    <button class="export-btn" data-action="excel">
      <span>📊</span> Export Excel
    </button>
    <button class="export-btn" data-action="pdf">
      <span>📑</span> Export PDF
    </button>
    <button class="export-btn" data-action="copy">
      <span>📋</span> Copy Data
    </button>
  `;
  
  // Add styles for export buttons
  if (!document.getElementById('export-buttons-styles')) {
    const styles = document.createElement('style');
    styles.id = 'export-buttons-styles';
    styles.textContent = `
      .chart-export-buttons {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
        flex-wrap: wrap;
      }
      
      .export-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        color: #4a5568;
        transition: all 0.2s ease;
      }
      
      .export-btn:hover {
        background: #edf2f7;
        border-color: #cbd5e0;
        transform: translateY(-1px);
      }
      
      .export-btn:active {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Append to chart container
  const chart = container.querySelector('.expense-category-chart');
  if (chart) {
    chart.appendChild(exportContainer);
  }
  
  // Add event listeners
  exportContainer.addEventListener('click', handleExportAction);
}

/**
 * Handle export button clicks
 * @param {Event} event - Click event
 */
function handleExportAction(event) {
  const button = event.target.closest('.export-btn');
  if (!button) return;
  
  const action = button.dataset.action;
  const container = event.target.closest('[id]');
  const chartData = container._chartData;
  const chartStats = container._chartStats;
  
  if (!chartData) {
    console.error('No chart data available for export');
    return;
  }
  
  switch (action) {
    case 'png':
      exportChartAsPNG(container.id);
      break;
    case 'csv':
      exportCategoryDataAsCSV(chartData);
      break;
    case 'excel':
      exportCategoryDataAsExcel(chartData);
      break;
    case 'pdf':
      exportCategoryReportAsPDF(chartData);
      break;
    case 'copy':
      copyCategoryDataToClipboard(chartData);
      button.textContent = '✓ Copied!';
      setTimeout(() => {
        button.innerHTML = '<span>📋</span> Copy Data';
      }, 2000);
      break;
  }
}

/**
 * Get expense insights
 * @param {Array} expenseData - Expense records
 * @returns {Object} Insights and recommendations
 */
export function getExpenseInsights(expenseData) {
  const processedData = calculateExpenseByCategoryData(expenseData);
  const stats = calculateCategoryStats(processedData);
  
  const insights = {
    summary: {
      totalExpense: stats.totalExpense,
      avgMonthly: stats.avgMonthlyExpense,
      topCategory: stats.topCategory,
      categoryCount: Object.keys(processedData.categories).length
    },
    trends: {
      monthlyGrowth: calculateAverageGrowth(stats.monthlyTrend),
      volatility: calculateVolatility(processedData.monthly),
      seasonal: detectSeasonalPatterns(processedData.monthly)
    },
    recommendations: generateRecommendations(stats, processedData)
  };
  
  return insights;
}

/**
 * Calculate average monthly growth
 * @param {Array} monthlyTrend - Monthly trend data
 * @returns {number} Average growth percentage
 */
function calculateAverageGrowth(monthlyTrend) {
  const growthRates = monthlyTrend.slice(1).map(m => m.growth);
  return growthRates.length > 0 
    ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length 
    : 0;
}

/**
 * Calculate expense volatility
 * @param {Array} monthlyData - Monthly expense data
 * @returns {number} Volatility score (0-100)
 */
function calculateVolatility(monthlyData) {
  const amounts = monthlyData.map(m => m.total);
  const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / avg) * 100;
}

/**
 * Detect seasonal patterns
 * @param {Array} monthlyData - Monthly expense data
 * @returns {Object} Seasonal pattern analysis
 */
function detectSeasonalPatterns(monthlyData) {
  // Simple seasonal detection - can be enhanced
  const highMonths = monthlyData
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(m => m.monthLabel);
    
  return {
    highSpendingMonths: highMonths,
    pattern: 'Further analysis needed'
  };
}

/**
 * Generate recommendations based on expense analysis
 * @param {Object} stats - Category statistics
 * @param {Object} processedData - Processed expense data
 * @returns {Array} Recommendations
 */
function generateRecommendations(stats, processedData) {
  const recommendations = [];
  
  // High spending category recommendation
  if (stats.topCategory && stats.categoryPercentages[stats.topCategory.name] > 50) {
    recommendations.push({
      type: 'warning',
      message: `${stats.topCategory.name} chiếm hơn 50% tổng chi phí. Cân nhắc tối ưu hóa.`
    });
  }
  
  // Volatility recommendation
  const volatility = calculateVolatility(processedData.monthly);
  if (volatility > 30) {
    recommendations.push({
      type: 'info',
      message: 'Chi phí hàng tháng biến động lớn. Nên lập kế hoạch ngân sách ổn định hơn.'
    });
  }
  
  return recommendations;
}