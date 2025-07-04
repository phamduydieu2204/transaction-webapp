/**
 * comparisonCharts.js
 * 
 * Revenue vs expense comparisons and profit analysis
 * Handles comparative visualization and profitability metrics
 */

import { formatCurrency } from '../statisticsCore.js';

/**
 * Generate profit area between revenue and expense lines
 * @param {Array} data - Combined revenue/expense data
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG path for profit area
 */
export function generateProfitArea(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  let path = 'M 0,400';
  
  // Top line (revenue)
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const revenueY = maxValue === 0 ? 400 : 400 - (item.revenue / maxValue) * 400;
    
    if (index === 0) {
      path += ` L ${x},${revenueY}`;
    } else {
      path += ` L ${x},${revenueY}`;
    }
  });
  
  // Bottom line (expense)
  for (let i = data.length - 1; i >= 0; i--) {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * i;
    const expenseY = maxValue === 0 ? 400 : 400 - (data[i].expense / maxValue) * 400;
    path += ` L ${x},${expenseY}`;
  }
  
  path += ' Z';
  
  return `
    <path
      class="profit-area"
      d="${path}"
      fill="url(#profitGradient)"
      opacity="0.3"
    />
  `;
}

/**
 * Generate comparison chart with previous period
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG elements for comparison
 */
export function generatePeriodComparison(currentData, previousData, maxValue) {
  if (!previousData || previousData.length === 0) return '';
  
  let comparisonSVG = '';
  
  // Previous period revenue line
  const prevRevenuePoints = previousData.map((item, index) => {
    const x = previousData.length === 1 ? 500 : (1000 / (previousData.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.revenue / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
  
  comparisonSVG += `
    <polyline
      class="chart-line compare-revenue-line"
      points="${prevRevenuePoints}"
      fill="none"
      stroke="#28a745"
      stroke-width="2"
      stroke-dasharray="8,4"
      opacity="0.6"
    />
  `;
  
  // Previous period expense line
  const prevExpensePoints = previousData.map((item, index) => {
    const x = previousData.length === 1 ? 500 : (1000 / (previousData.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.expense / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
  
  comparisonSVG += `
    <polyline
      class="chart-line compare-expense-line"
      points="${prevExpensePoints}"
      fill="none"
      stroke="#dc3545"
      stroke-width="2"
      stroke-dasharray="8,4"
      opacity="0.6"
    />
  `;
  
  return comparisonSVG;
}

/**
 * Calculate profit analysis metrics
 * @param {Array} data - Revenue/expense data
 * @returns {Object} Profit analysis results
 */
export function analyzeProfitMetrics(data) {
  if (!data || data.length === 0) {
    return {
      totalProfit: 0,
      profitMargin: 0,
      averageProfit: 0,
      profitTrend: 'stable',
      profitableMonths: 0,
      unprofitableMonths: 0,
      breakEvenMonths: 0,
      bestMonth: null,
      worstMonth: null
    };
  }
  
  const profits = data.map(item => ({
    ...item,
    profit: item.revenue - item.expense,
    margin: item.revenue > 0 ? ((item.revenue - item.expense) / item.revenue) * 100 : 0
  }));
  
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const averageProfit = profits.reduce((sum, item) => sum + item.profit, 0) / profits.length;
  
  // Count profitable/unprofitable months
  const profitableMonths = profits.filter(item => item.profit > 0).length;
  const unprofitableMonths = profits.filter(item => item.profit < 0).length;
  const breakEvenMonths = profits.filter(item => item.profit === 0).length;
  
  // Find best and worst months
  const bestMonth = profits.reduce((best, item) => 
    item.profit > best.profit ? item : best
  );
  const worstMonth = profits.reduce((worst, item) => 
    item.profit < worst.profit ? item : worst
  );
  
  // Analyze profit trend
  const midpoint = Math.floor(profits.length / 2);
  const firstHalfProfit = profits.slice(0, midpoint).reduce((sum, item) => sum + item.profit, 0) / midpoint;
  const secondHalfProfit = profits.slice(midpoint).reduce((sum, item) => sum + item.profit, 0) / (profits.length - midpoint);
  
  let profitTrend = 'stable';
  if (secondHalfProfit > firstHalfProfit * 1.1) {
    profitTrend = 'improving';
  } else if (secondHalfProfit < firstHalfProfit * 0.9) {
    profitTrend = 'declining';
  }
  
  return {
    totalProfit,
    profitMargin,
    averageProfit,
    profitTrend,
    profitableMonths,
    unprofitableMonths,
    breakEvenMonths,
    bestMonth,
    worstMonth,
    firstHalfProfit,
    secondHalfProfit,
    profits
  };
}

/**
 * Generate profit bar chart overlay
 * @param {Array} data - Revenue/expense data
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG bars for profit visualization
 */
export function generateProfitBars(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  const barWidth = 1000 / data.length * 0.6; // 60% of available space
  let bars = '';
  
  data.forEach((item, index) => {
    const profit = item.revenue - item.expense;
    const x = (1000 / data.length) * index + (1000 / data.length - barWidth) / 2;
    const barHeight = Math.abs(profit) / maxValue * 400;
    const y = profit >= 0 ? 400 - barHeight : 400;
    
    const colorClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
    const color = profit >= 0 ? '#28a745' : '#dc3545';
    
    bars += `
      <rect
        x="${x}"
        y="${y}"
        width="${barWidth}"
        height="${barHeight}"
        fill="${color}"
        opacity="0.7"
        class="profit-bar ${colorClass}"
        data-period="${item.label}"
        data-profit="${profit}"
      />
    `;
  });
  
  return bars;
}

/**
 * Generate comparison summary table
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data (optional)
 * @returns {string} HTML table for comparison
 */
export function generateComparisonSummary(currentData, previousData = null) {
  const currentMetrics = analyzeProfitMetrics(currentData);
  const previousMetrics = previousData ? analyzeProfitMetrics(previousData) : null;
  
  const currentTotalRevenue = currentData.reduce((sum, item) => sum + item.revenue, 0);
  const currentTotalExpense = currentData.reduce((sum, item) => sum + item.expense, 0);
  
  let comparisonRows = '';
  
  if (previousMetrics) {
    const previousTotalRevenue = previousData.reduce((sum, item) => sum + item.revenue, 0);
    const previousTotalExpense = previousData.reduce((sum, item) => sum + item.expense, 0);
    
    const revenueChange = previousTotalRevenue > 0 ? 
      ((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : 0;
    const expenseChange = previousTotalExpense > 0 ? 
      ((currentTotalExpense - previousTotalExpense) / previousTotalExpense) * 100 : 0;
    const profitChange = previousMetrics.totalProfit !== 0 ? 
      ((currentMetrics.totalProfit - previousMetrics.totalProfit) / Math.abs(previousMetrics.totalProfit)) * 100 : 0;
    
    comparisonRows = `
      <tr>
        <td>Thay đổi so với kỳ trước</td>
        <td class="${revenueChange >= 0 ? 'positive' : 'negative'}">
          ${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%
        </td>
        <td class="${expenseChange <= 0 ? 'positive' : 'negative'}">
          ${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%
        </td>
        <td class="${profitChange >= 0 ? 'positive' : 'negative'}">
          ${profitChange >= 0 ? '+' : ''}${profitChange.toFixed(1)}%
        </td>
      </tr>
    `;
  }
  
  return `
    <div class="comparison-summary">
      <h4>📊 Tổng quan so sánh</h4>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Chỉ số</th>
            <th>Doanh thu</th>
            <th>Chi phí</th>
            <th>Lợi nhuận</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Kỳ hiện tại</td>
            <td>${formatCurrency(currentTotalRevenue, 'VND')}</td>
            <td>${formatCurrency(currentTotalExpense, 'VND')}</td>
            <td class="${currentMetrics.totalProfit >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(currentMetrics.totalProfit, 'VND')}
            </td>
          </tr>
          ${previousMetrics ? `
            <tr>
              <td>Kỳ trước</td>
              <td>${formatCurrency(previousData.reduce((sum, item) => sum + item.revenue, 0), 'VND')}</td>
              <td>${formatCurrency(previousData.reduce((sum, item) => sum + item.expense, 0), 'VND')}</td>
              <td class="${previousMetrics.totalProfit >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(previousMetrics.totalProfit, 'VND')}
              </td>
            </tr>
          ` : ''}
          ${comparisonRows}
          <tr class="summary-row">
            <td><strong>Tỷ suất lợi nhuận</strong></td>
            <td colspan="2">-</td>
            <td><strong>${currentMetrics.profitMargin.toFixed(1)}%</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Generate profitability indicators
 * @param {Array} data - Revenue/expense data
 * @returns {string} HTML for profitability indicators
 */
export function generateProfitabilityIndicators(data) {
  const metrics = analyzeProfitMetrics(data);
  
  const profitabilityRatio = data.length > 0 ? (metrics.profitableMonths / data.length) * 100 : 0;
  
  return `
    <div class="profitability-indicators">
      <div class="indicator-grid">
        <div class="indicator-card total-profit ${metrics.totalProfit >= 0 ? 'positive' : 'negative'}">
          <div class="indicator-icon">${metrics.totalProfit >= 0 ? '💰' : '⚠️'}</div>
          <div class="indicator-content">
            <div class="indicator-label">Tổng lợi nhuận</div>
            <div class="indicator-value">${formatCurrency(metrics.totalProfit, 'VND')}</div>
          </div>
        </div>
        
        <div class="indicator-card profit-margin">
          <div class="indicator-icon">📊</div>
          <div class="indicator-content">
            <div class="indicator-label">Tỷ suất LN</div>
            <div class="indicator-value">${metrics.profitMargin.toFixed(1)}%</div>
          </div>
        </div>
        
        <div class="indicator-card profitable-months">
          <div class="indicator-icon">✅</div>
          <div class="indicator-content">
            <div class="indicator-label">Tháng có lãi</div>
            <div class="indicator-value">${metrics.profitableMonths}/${data.length}</div>
          </div>
        </div>
        
        <div class="indicator-card trend ${metrics.profitTrend}">
          <div class="indicator-icon">
            ${metrics.profitTrend === 'improving' ? '📈' : 
              metrics.profitTrend === 'declining' ? '📉' : '➡️'}
          </div>
          <div class="indicator-content">
            <div class="indicator-label">Xu hướng</div>
            <div class="indicator-value">
              ${metrics.profitTrend === 'improving' ? 'Cải thiện' : 
                metrics.profitTrend === 'declining' ? 'Giảm sút' : 'Ổn định'}
            </div>
          </div>
        </div>
      </div>
      
      <div class="best-worst-months">
        <div class="best-month">
          <span class="label">🏆 Tháng tốt nhất:</span>
          <span class="value">${metrics.bestMonth.label} - ${formatCurrency(metrics.bestMonth.profit, 'VND')}</span>
        </div>
        <div class="worst-month">
          <span class="label">⚠️ Tháng khó khăn:</span>
          <span class="value">${metrics.worstMonth.label} - ${formatCurrency(metrics.worstMonth.profit, 'VND')}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate profit tooltip content
 * @param {Object} dataPoint - Data point
 * @returns {string} HTML for profit tooltip
 */
export function generateProfitTooltip(dataPoint) {
  const profit = dataPoint.revenue - dataPoint.expense;
  const margin = dataPoint.revenue > 0 ? (profit / dataPoint.revenue) * 100 : 0;
  const profitStatus = profit >= 0 ? 'Có lãi' : 'Thua lỗ';
  
  return `
    <div class="tooltip-section profit-section">
      <div class="tooltip-title">
        <span class="icon">${profit >= 0 ? '💰' : '⚠️'}</span>
        Lợi nhuận ${dataPoint.label}
      </div>
      <div class="tooltip-value ${profit >= 0 ? 'positive' : 'negative'}">
        ${formatCurrency(profit, 'VND')}
      </div>
      <div class="tooltip-details">
        <div class="detail-row">
          <span>Trạng thái:</span>
          <span class="${profit >= 0 ? 'positive' : 'negative'}">${profitStatus}</span>
        </div>
        <div class="detail-row">
          <span>Tỷ suất LN:</span>
          <span class="${margin >= 0 ? 'positive' : 'negative'}">${margin.toFixed(1)}%</span>
        </div>
        <div class="detail-row">
          <span>Hiệu quả:</span>
          <span>${getProfitEfficiency(margin)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get profit efficiency description
 * @param {number} margin - Profit margin percentage
 * @returns {string} Efficiency description
 */
function getProfitEfficiency(margin) {
  if (margin >= 30) return 'Xuất sắc';
  if (margin >= 20) return 'Tốt';
  if (margin >= 10) return 'Khá';
  if (margin >= 0) return 'Thấp';
  return 'Thua lỗ';
}

// Make functions available globally for backward compatibility
window.generateProfitArea = generateProfitArea;
window.generatePeriodComparison = generatePeriodComparison;
window.analyzeProfitMetrics = analyzeProfitMetrics;
window.generateProfitBars = generateProfitBars;
window.generateComparisonSummary = generateComparisonSummary;
window.generateProfitabilityIndicators = generateProfitabilityIndicators;
window.generateProfitTooltip = generateProfitTooltip;