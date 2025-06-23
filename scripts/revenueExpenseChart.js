/**
 * revenueExpenseChart.js
 * 
 * Orchestrator module for revenue and expense charts
 * Coordinates between specialized chart modules
 */


// Import specialized chart modules
import { 
  generateRevenueLineChart,
  generateRevenueProfitArea 
} from './revenue-expense/revenueCharts.js';

import { 
  generateExpenseLineChart,
  generateExpenseBarChart 
} from './revenue-expense/expenseCharts.js';

import { 
  generateComparisonChart,
  generateProfitLossChart,
  calculateProfitMargins 
} from './revenue-expense/comparisonCharts.js';

import { 
  aggregateDataByPeriod,
  formatDateForChart,
  getCompareDateRange,
  determineGranularity 
} from './revenue-expense/chartUtils.js';

import { 
  getChartTheme,
  getResponsiveConfig,
  applyChartStyles 
} from './revenue-expense/chartConfig.js';

// Legacy imports for backward compatibility
import { formatCurrency } from './statistics/formatters.js';

/**
 * Calculate revenue and expense data based on date range and granularity
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} dateRange - Optional date range filter
 * @returns {Object} Data for chart
 */
export function calculateChartData(transactionData, expenseData, dateRange = null) {
    transactions: transactionData.length,
    expenses: expenseData.length,

  
  const granularity = determineGranularity(dateRange);
  
  return aggregateDataByPeriod(transactionData, expenseData, dateRange, granularity);
}

/**
 * Calculate revenue and expense data for last 12 months (backward compatibility)
 */
export function calculateLast12MonthsData(transactionData, expenseData) {
  const today = new Date();
  const dateRange = {
    start: new Date(today.getFullYear() - 1, today.getMonth(), 1),
    end: today
  };
  
  return calculateChartData(transactionData, expenseData, dateRange);
}

/**
 * Render revenue/expense chart using modular components
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {string} containerId - Container element ID
 */
export async function renderRevenueExpenseChart(transactionData, expenseData, containerId = 'revenueChart') {
    containerId,
    transactionCount: transactionData.length,
    expenseCount: expenseData.length
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  // Get configuration and filters
  const dateRange = window.globalFilters?.dateRange || null;
  const compareMode = window.globalFilters?.compareMode || 'none';
  const theme = getChartTheme();
  const config = getResponsiveConfig();
  
  const chartData = calculateChartData(transactionData, expenseData, dateRange);
  
  // Calculate compare data if needed
  let compareData = null;
  if (compareMode !== 'none' && dateRange) {
    const compareRange = getCompareDateRange(compareMode, dateRange);
    
    try {
      const { filterDataByDateRange } = await import('./financialDashboard.js');
      const allTransactions = window.transactionList || [];
      const allExpenses = window.expenseList || [];
      
      const compareTransactions = filterDataByDateRange(allTransactions, compareRange, window.globalFilters);
      const compareExpenses = filterDataByDateRange(allExpenses, compareRange, window.globalFilters);
      
      compareData = calculateChartData(compareTransactions, compareExpenses, compareRange);
      console.log('🔄 Compare data calculated:', compareData);
    } catch (error) {
      console.error('❌ Error loading compare data:', error);
    }
  }
  
  // Find max value for scaling
  const allData = compareData ? [...chartData, ...compareData] : chartData;
  const maxValue = Math.max(
    ...allData.map(d => Math.max(d.revenue, d.expense))
  );
  
  // Get period label and granularity
  let periodLabel = '12 tháng gần nhất';
  let granularity = 'monthly';
  if (dateRange) {
    const { start, end } = dateRange;
    periodLabel = `Từ ${start} đến ${end}`;
    granularity = determineGranularity(dateRange);
  }
  
  // Generate chart components using specialized modules
  const revenueChart = generateRevenueLineChart(chartData, maxValue);
  const expenseChart = generateExpenseLineChart(chartData, maxValue);
  const comparisonChart = compareData ? generateComparisonChart(chartData, compareData, maxValue, compareMode) : '';
  const profitChart = generateProfitLossChart(chartData, maxValue);
  
  // Create comprehensive chart HTML using modular components
  const chartHTML = `
    <div class="revenue-expense-chart" data-theme="${theme.name}">
      <div class="chart-header">
        <h3>📊 Biểu đồ Doanh thu & Chi phí</h3>
        <div class="period-badge">${periodLabel}</div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color revenue"></span>
            <span>Doanh thu${compareMode !== 'none' ? ' (hiện tại)' : ''}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color expense"></span>
            <span>Chi phí${compareMode !== 'none' ? ' (hiện tại)' : ''}</span>
          </div>
          ${compareMode !== 'none' ? `
            <div class="legend-item">
              <span class="legend-color compare"></span>
              <span>${compareMode === 'previous_period' ? 'Kỳ trước' : 'Cùng kỳ năm trước'}</span>
            </div>
          ` : `
            <div class="legend-item">
              <span class="legend-color profit"></span>
              <span>Lợi nhuận</span>
            </div>
          `}
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-y-axis">
          ${generateYAxisLabels(maxValue)}
        </div>
        
        <div class="chart-area">
          <svg viewBox="0 0 1000 400" class="line-chart">
            ${generateGridLines()}
            ${revenueChart}
            ${expenseChart}
            ${profitChart}
            ${comparisonChart}
            ${generateDataPoints(chartData, maxValue)}
            
            <defs>
              <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${theme.colors.profit};stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:${theme.colors.profit};stop-opacity:0.1" />
              </linearGradient>
            </defs>
          </svg>
          
          <div class="chart-tooltips">
            ${generateTooltips(chartData)}
          </div>
        </div>
        
        <div class="chart-x-axis">
          ${generateXAxisLabels(chartData, granularity)}
        </div>
      </div>
      
      <div class="chart-summary">
        ${generateChartSummary(chartData, granularity)}
      </div>
    </div>
  `;
  
  container.innerHTML = chartHTML;
  
  // Apply chart styles and interactivity
  applyChartStyles(containerId);
  addChartInteractivity(containerId);
}

// Helper functions for chart generation
function generateYAxisLabels(maxValue) {
  const steps = 5;
  let labels = '';
  
  for (let i = steps; i >= 0; i--) {
    const value = (maxValue / steps) * i;
    labels += `
      <div class="y-label" style="bottom: ${(i / steps) * 100}%">
        ${formatNumber(value)}
      </div>
    `;
  }
  
  return labels;
}

function generateGridLines() {
  let lines = '';
  const steps = 5;
  
  for (let i = 0; i <= steps; i++) {
    const y = 400 - (400 / steps) * i;
    lines += `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="#e0e0e0" stroke-width="1" />`;
  }
  
  for (let i = 0; i < 12; i++) {
    const x = (1000 / 11) * i;
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="400" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />`;
  }
  
  return lines;
}

function generateXAxisLabels(data, granularity) {
  const maxLabels = granularity === 'daily' ? 10 : data.length;
  const skipInterval = Math.ceil(data.length / maxLabels);
  
  return data.map((item, index) => {
    if (index % skipInterval !== 0 && index !== data.length - 1) return '';
    
    const label = granularity === 'daily' 
      ? item.label.split('/')[0]
      : item.label.split('/')[0];
      
    return `
      <div class="x-label" style="left: ${(index / (data.length - 1)) * 100}%">
        ${label}
      </div>
    `;
  }).join('');
}

function generateDataPoints(data, maxValue) {
  if (data.length === 0) return '';
  
  let points = '';
  
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const revenueY = maxValue === 0 ? 400 : 400 - (item.revenue / maxValue) * 400;
    const expenseY = maxValue === 0 ? 400 : 400 - (item.expense / maxValue) * 400;
    
    points += `
      <circle cx="${x}" cy="${revenueY}" r="5" fill="#28a745" class="data-point revenue-point" />
      <circle cx="${x}" cy="${expenseY}" r="5" fill="#dc3545" class="data-point expense-point" />
    `;
  });
  
  return points;
}

function generateTooltips(chartData) {
  return chartData.map((data, index) => `
    <div class="chart-tooltip" 
         style="left: ${(index / (chartData.length - 1)) * 100}%"
         data-period="${data.label}">
      <div class="tooltip-content">
        <div class="tooltip-title">${data.label}</div>
        <div class="tooltip-row revenue">
          Doanh thu: ${formatCurrency(data.revenue, 'VND')}
        </div>
        <div class="tooltip-row expense">
          Chi phí: ${formatCurrency(data.expense, 'VND')}
        </div>
        <div class="tooltip-row profit ${data.profit >= 0 ? 'positive' : 'negative'}">
          Lợi nhuận: ${formatCurrency(data.profit, 'VND')}
        </div>
      </div>
    </div>
  `).join('');
}

function generateChartSummary(data, granularity) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const avgExpense = data.length > 0 ? totalExpense / data.length : 0;
  
  const bestPeriod = data.reduce((best, item) => 
    item.profit > best.profit ? item : best
  , data[0] || { profit: 0 });
  
  const periodLabel = granularity === 'daily' ? 'ngày' : granularity === 'weekly' ? 'tuần' : 'tháng';
  
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon">💰</div>
        <div class="summary-content">
          <div class="summary-label">Tổng doanh thu</div>
          <div class="summary-value revenue">${formatCurrency(totalRevenue, 'VND')}</div>
          <div class="summary-detail">TB: ${formatCurrency(avgRevenue, 'VND')}/${periodLabel}</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">💸</div>
        <div class="summary-content">
          <div class="summary-label">Tổng chi phí</div>
          <div class="summary-value expense">${formatCurrency(totalExpense, 'VND')}</div>
          <div class="summary-detail">TB: ${formatCurrency(avgExpense, 'VND')}/${periodLabel}</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">📈</div>
        <div class="summary-content">
          <div class="summary-label">Lợi nhuận ròng</div>
          <div class="summary-value ${totalProfit >= 0 ? 'profit' : 'loss'}">${formatCurrency(totalProfit, 'VND')}</div>
          <div class="summary-detail">Margin: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">🏆</div>
        <div class="summary-content">
          <div class="summary-label">${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)} tốt nhất</div>
          <div class="summary-value">${bestPeriod.label || 'N/A'}</div>
          <div class="summary-detail">LN: ${formatCurrency(bestPeriod.profit || 0, 'VND')}</div>
        </div>
      </div>
    </div>
  `;
}

function formatNumber(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
}

function addChartInteractivity(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const tooltips = container.querySelectorAll('.chart-tooltip');
  const dataPoints = container.querySelectorAll('.data-point');
  
  tooltips.forEach((tooltip, index) => {
    tooltip.addEventListener('mouseenter', () => {
      tooltip.classList.add('active');
      
      const revenuePoint = dataPoints[index * 2];
      const expensePoint = dataPoints[index * 2 + 1];
      
      if (revenuePoint) revenuePoint.setAttribute('r', '8');
      if (expensePoint) expensePoint.setAttribute('r', '8');
    });
    
    tooltip.addEventListener('mouseleave', () => {
      tooltip.classList.remove('active');
      
      const revenuePoint = dataPoints[index * 2];
      const expensePoint = dataPoints[index * 2 + 1];
      
      if (revenuePoint) revenuePoint.setAttribute('r', '5');
      if (expensePoint) expensePoint.setAttribute('r', '5');
    });
  });
}

// Legacy style function for backward compatibility
export function addRevenueExpenseChartStyles() {
  applyChartStyles();
}

// Make functions available globally for legacy compatibility
window.calculateChartData = calculateChartData;
window.calculateLast12MonthsData = calculateLast12MonthsData;
window.renderRevenueExpenseChart = renderRevenueExpenseChart;
window.addRevenueExpenseChartStyles = addRevenueExpenseChartStyles;
