/**
 * revenueCharts.js
 * 
 * Revenue visualization components and trend analysis
 * Handles revenue-specific chart rendering and data processing
 */

import { normalizeDate, formatCurrency } from '../statisticsCore.js';

/**
 * Generate revenue trend chart
 * @param {Array} data - Revenue data points
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG path for revenue line
 */
export function generateRevenueLineChart(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.revenue / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
  
  return `
    <polyline
      class="chart-line revenue-line"
      points="${points}"
      fill="none"
      stroke="#28a745"
      stroke-width="3"
    />
  `;
}

/**
 * Generate revenue data points
 * @param {Array} data - Revenue data
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG circles for data points
 */
export function generateRevenueDataPoints(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  let points = '';
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.revenue / maxValue) * 400;
    
    points += `
      <circle 
        cx="${x}" 
        cy="${y}" 
        r="5" 
        fill="#28a745" 
        class="data-point revenue-point"
        data-value="${item.revenue}"
        data-period="${item.label}"
      />
    `;
  });
  
  return points;
}

/**
 * Generate revenue area fill
 * @param {Array} data - Revenue data
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG path for revenue area
 */
export function generateRevenueArea(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  let path = 'M 0,400';
  
  // Top line (revenue)
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.revenue / maxValue) * 400;
    
    if (index === 0) {
      path += ` L ${x},${y}`;
    } else {
      path += ` L ${x},${y}`;
    }
  });
  
  // Bottom line (baseline)
  for (let i = data.length - 1; i >= 0; i--) {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * i;
    path += ` L ${x},400`;
  }
  
  path += ' Z';
  
  return `
    <path
      class="revenue-area"
      d="${path}"
      fill="url(#revenueGradient)"
      opacity="0.2"
    />
  `;
}

/**
 * Calculate revenue trend analysis
 * @param {Array} data - Revenue data points
 * @returns {Object} Trend analysis results
 */
export function analyzeRevenueTrend(data) {
  if (!data || data.length < 2) {
    return {
      trend: 'stable',
      change: 0,
      growthRate: 0,
      direction: 'neutral'
    };
  }
  
  const firstValue = data[0].revenue;
  const lastValue = data[data.length - 1].revenue;
  const change = lastValue - firstValue;
  const growthRate = firstValue > 0 ? (change / firstValue) * 100 : 0;
  
  // Calculate moving average trend
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint).reduce((sum, item) => sum + item.revenue, 0) / midpoint;
  const secondHalf = data.slice(midpoint).reduce((sum, item) => sum + item.revenue, 0) / (data.length - midpoint);
  
  let trend = 'stable';
  let direction = 'neutral';
  
  if (secondHalf > firstHalf * 1.05) {
    trend = 'increasing';
    direction = 'up';
  } else if (secondHalf < firstHalf * 0.95) {
    trend = 'decreasing';
    direction = 'down';
  }
  
  return {
    trend,
    change,
    growthRate,
    direction,
    firstHalf,
    secondHalf,
    average: data.reduce((sum, item) => sum + item.revenue, 0) / data.length
  };
}

/**
 * Generate revenue comparison with previous period
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data
 * @returns {string} SVG elements for comparison
 */
export function generateRevenueComparison(currentData, previousData, maxValue) {
  if (!previousData || previousData.length === 0) return '';
  
  const points = previousData.map((item, index) => {
    const x = previousData.length === 1 ? 500 : (1000 / (previousData.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.revenue / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
  
  return `
    <polyline
      class="chart-line compare-revenue-line"
      points="${points}"
      fill="none"
      stroke="#28a745"
      stroke-width="2"
      stroke-dasharray="8,4"
      opacity="0.6"
    />
  `;
}

/**
 * Calculate revenue statistics
 * @param {Array} data - Revenue data
 * @returns {Object} Revenue statistics
 */
export function calculateRevenueStats(data) {
  if (!data || data.length === 0) {
    return {
      total: 0,
      average: 0,
      max: 0,
      min: 0,
      median: 0,
      variance: 0,
      standardDeviation: 0
    };
  }
  
  const revenues = data.map(item => item.revenue).sort((a, b) => a - b);
  const total = revenues.reduce((sum, val) => sum + val, 0);
  const average = total / revenues.length;
  const max = Math.max(...revenues);
  const min = Math.min(...revenues);
  const median = revenues.length % 2 === 0 
    ? (revenues[revenues.length / 2 - 1] + revenues[revenues.length / 2]) / 2
    : revenues[Math.floor(revenues.length / 2)];
  
  // Calculate variance and standard deviation
  const variance = revenues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / revenues.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    total,
    average,
    max,
    min,
    median,
    variance,
    standardDeviation,
    count: revenues.length
  };
}

/**
 * Generate revenue tooltip content
 * @param {Object} dataPoint - Revenue data point
 * @param {Object} stats - Revenue statistics
 * @returns {string} HTML for tooltip
 */
export function generateRevenueTooltip(dataPoint, stats) {
  const percentage = stats.total > 0 ? (dataPoint.revenue / stats.total) * 100 : 0;
  const vsAverage = stats.average > 0 ? ((dataPoint.revenue - stats.average) / stats.average) * 100 : 0;
  
  return `
    <div class="tooltip-section revenue-section">
      <div class="tooltip-title">
        <span class="icon">💰</span>
        Doanh thu ${dataPoint.label}
      </div>
      <div class="tooltip-value primary">
        ${formatCurrency(dataPoint.revenue, 'VND')}
      </div>
      <div class="tooltip-details">
        <div class="detail-row">
          <span>Tỷ lệ tổng:</span>
          <span>${percentage.toFixed(1)}%</span>
        </div>
        <div class="detail-row">
          <span>So với TB:</span>
          <span class="${vsAverage >= 0 ? 'positive' : 'negative'}">
            ${vsAverage >= 0 ? '+' : ''}${vsAverage.toFixed(1)}%
          </span>
        </div>
        <div class="detail-row">
          <span>Xếp hạng:</span>
          <span>${getRankInPeriod(dataPoint.revenue, stats)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get rank of revenue value in period
 * @param {number} value - Revenue value
 * @param {Object} stats - Revenue statistics
 * @returns {string} Rank description
 */
function getRankInPeriod(value, stats) {
  if (value >= stats.max * 0.8) return 'Cao nhất';
  if (value >= stats.average * 1.2) return 'Trên TB';
  if (value >= stats.average * 0.8) return 'Trung bình';
  if (value >= stats.min * 1.2) return 'Dưới TB';
  return 'Thấp nhất';
}

/**
 * Generate revenue performance indicators
 * @param {Array} data - Revenue data
 * @returns {string} HTML for performance indicators
 */
export function generateRevenueIndicators(data) {
  const stats = calculateRevenueStats(data);
  const trend = analyzeRevenueTrend(data);
  
  return `
    <div class="performance-indicators revenue-indicators">
      <div class="indicator-card total">
        <div class="indicator-icon">💰</div>
        <div class="indicator-content">
          <div class="indicator-label">Tổng doanh thu</div>
          <div class="indicator-value">${formatCurrency(stats.total, 'VND')}</div>
        </div>
      </div>
      
      <div class="indicator-card average">
        <div class="indicator-icon">📊</div>
        <div class="indicator-content">
          <div class="indicator-label">Trung bình</div>
          <div class="indicator-value">${formatCurrency(stats.average, 'VND')}</div>
        </div>
      </div>
      
      <div class="indicator-card trend ${trend.direction}">
        <div class="indicator-icon">${trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'}</div>
        <div class="indicator-content">
          <div class="indicator-label">Xu hướng</div>
          <div class="indicator-value">
            ${trend.direction === 'up' ? '+' : trend.direction === 'down' ? '' : ''}${trend.growthRate.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div class="indicator-card peak">
        <div class="indicator-icon">🏆</div>
        <div class="indicator-content">
          <div class="indicator-label">Cao nhất</div>
          <div class="indicator-value">${formatCurrency(stats.max, 'VND')}</div>
        </div>
      </div>
    </div>
  `;
}

// Make functions available globally for backward compatibility
window.generateRevenueLineChart = generateRevenueLineChart;
window.generateRevenueDataPoints = generateRevenueDataPoints;
window.generateRevenueArea = generateRevenueArea;
window.analyzeRevenueTrend = analyzeRevenueTrend;
window.generateRevenueComparison = generateRevenueComparison;
window.calculateRevenueStats = calculateRevenueStats;
window.generateRevenueTooltip = generateRevenueTooltip;
window.generateRevenueIndicators = generateRevenueIndicators;