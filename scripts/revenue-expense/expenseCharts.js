/**
 * expenseCharts.js
 * 
 * Expense visualization components and category breakdown
 * Handles expense-specific chart rendering and analysis
 */

import { normalizeDate, formatCurrency } from '../statisticsCore.js';

/**
 * Generate expense trend chart
 * @param {Array} data - Expense data points
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG path for expense line
 */
export function generateExpenseLineChart(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.expense / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
  
  return `
    <polyline
      class="chart-line expense-line"
      points="${points}"
      fill="none"
      stroke="#dc3545"
      stroke-width="3"
    />
  `;
}

/**
 * Generate expense data points
 * @param {Array} data - Expense data
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG circles for data points
 */
export function generateExpenseDataPoints(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  let points = '';
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.expense / maxValue) * 400;
    
    points += `
      <circle 
        cx="${x}" 
        cy="${y}" 
        r="5" 
        fill="#dc3545" 
        class="data-point expense-point"
        data-value="${item.expense}"
        data-period="${item.label}"
      />
    `;
  });
  
  return points;
}

/**
 * Generate expense area fill
 * @param {Array} data - Expense data
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG path for expense area
 */
export function generateExpenseArea(data, maxValue) {
  if (!data || data.length === 0) return '';
  
  let path = 'M 0,400';
  
  // Top line (expense)
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item.expense / maxValue) * 400;
    
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
      class="expense-area"
      d="${path}"
      fill="url(#expenseGradient)"
      opacity="0.2"
    />
  `;
}

/**
 * Generate expense category breakdown chart
 * @param {Array} expenseData - Raw expense data
 * @param {Object} dateRange - Date range filter
 * @returns {Object} Category breakdown data
 */
export function generateExpenseCategoryBreakdown(expenseData, dateRange = null) {
  const categoryTotals = {};
  
  expenseData.forEach(expense => {
    // Apply date filter if provided
    if (dateRange) {
      const expenseDate = normalizeDate(expense.date);
      if (expenseDate < dateRange.start || expenseDate > dateRange.end) {
        return;
      }
    }
    
    const category = expense.category || expense.type || 'Khác';
    const amount = parseFloat(expense.amount) || 0;
    
    if (!categoryTotals[category]) {
      categoryTotals[category] = {
        total: 0,
        count: 0,
        average: 0,
        items: []
      };
    }
    
    categoryTotals[category].total += amount;
    categoryTotals[category].count += 1;
    categoryTotals[category].items.push(expense);
  });
  
  // Calculate averages and sort by total
  const categories = Object.keys(categoryTotals).map(category => {
    const data = categoryTotals[category];
    data.average = data.total / data.count;
    data.category = category;
    return data;
  }).sort((a, b) => b.total - a.total);
  
  return categories;
}

/**
 * Generate pie chart for expense categories
 * @param {Array} categories - Category breakdown data
 * @returns {string} SVG pie chart
 */
export function generateExpensePieChart(categories) {
  if (!categories || categories.length === 0) return '';
  
  const total = categories.reduce((sum, cat) => sum + cat.total, 0);
  if (total === 0) return '';
  
  let currentAngle = -90; // Start from top
  const radius = 150;
  const centerX = 200;
  const centerY = 200;
  
  const colors = [
    '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997',
    '#17a2b8', '#6f42c1', '#e83e8c', '#6c757d', '#007bff'
  ];
  
  let svgSlices = '';
  let legends = '';
  
  categories.forEach((category, index) => {
    const percentage = (category.total / total) * 100;
    const angle = (category.total / total) * 360;
    
    if (percentage < 1) return; // Skip very small slices
    
    const color = colors[index % colors.length];
    
    // Calculate slice path
    const startAngle = currentAngle * (Math.PI / 180);
    const endAngle = (currentAngle + angle) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    svgSlices += `
      <path
        d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
        fill="${color}"
        class="pie-slice"
        data-category="${category.category}"
        data-value="${category.total}"
        data-percentage="${percentage.toFixed(1)}"
      />
    `;
    
    // Add percentage label
    const labelAngle = (currentAngle + angle / 2) * (Math.PI / 180);
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);
    
    if (percentage > 5) { // Only show label if slice is large enough
      svgSlices += `
        <text
          x="${labelX}"
          y="${labelY}"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="white"
          font-size="12"
          font-weight="bold"
          class="slice-label"
        >${percentage.toFixed(0)}%</text>
      `;
    }
    
    // Legend item
    legends += `
      <div class="legend-item" data-category="${category.category}">
        <div class="legend-color" style="background-color: ${color}"></div>
        <div class="legend-text">
          <div class="legend-name">${category.category}</div>
          <div class="legend-value">${formatCurrency(category.total, 'VND')} (${percentage.toFixed(1)}%)</div>
        </div>
      </div>
    `;
    
    currentAngle += angle;
  });
  
  return `
    <div class="expense-pie-container">
      <div class="pie-chart-wrapper">
        <svg viewBox="0 0 400 400" class="pie-chart">
          ${svgSlices}
          <circle cx="${centerX}" cy="${centerY}" r="50" fill="white" class="pie-center"/>
          <text x="${centerX}" y="${centerY - 10}" text-anchor="middle" font-size="14" font-weight="bold">
            Chi phí
          </text>
          <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" font-size="12">
            ${formatCurrency(total, 'VND')}
          </text>
        </svg>
      </div>
      <div class="pie-legend">
        ${legends}
      </div>
    </div>
  `;
}

/**
 * Calculate expense statistics
 * @param {Array} data - Expense data
 * @returns {Object} Expense statistics
 */
export function calculateExpenseStats(data) {
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
  
  const expenses = data.map(item => item.expense).sort((a, b) => a - b);
  const total = expenses.reduce((sum, val) => sum + val, 0);
  const average = total / expenses.length;
  const max = Math.max(...expenses);
  const min = Math.min(...expenses);
  const median = expenses.length % 2 === 0 
    ? (expenses[expenses.length / 2 - 1] + expenses[expenses.length / 2]) / 2
    : expenses[Math.floor(expenses.length / 2)];
  
  const variance = expenses.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / expenses.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    total,
    average,
    max,
    min,
    median,
    variance,
    standardDeviation,
    count: expenses.length
  };
}

/**
 * Analyze expense trend
 * @param {Array} data - Expense data points
 * @returns {Object} Trend analysis results
 */
export function analyzeExpenseTrend(data) {
  if (!data || data.length < 2) {
    return {
      trend: 'stable',
      change: 0,
      growthRate: 0,
      direction: 'neutral'
    };
  }
  
  const firstValue = data[0].expense;
  const lastValue = data[data.length - 1].expense;
  const change = lastValue - firstValue;
  const growthRate = firstValue > 0 ? (change / firstValue) * 100 : 0;
  
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint).reduce((sum, item) => sum + item.expense, 0) / midpoint;
  const secondHalf = data.slice(midpoint).reduce((sum, item) => sum + item.expense, 0) / (data.length - midpoint);
  
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
    average: data.reduce((sum, item) => sum + item.expense, 0) / data.length
  };
}

/**
 * Generate expense tooltip content
 * @param {Object} dataPoint - Expense data point
 * @param {Object} stats - Expense statistics
 * @returns {string} HTML for tooltip
 */
export function generateExpenseTooltip(dataPoint, stats) {
  const percentage = stats.total > 0 ? (dataPoint.expense / stats.total) * 100 : 0;
  const vsAverage = stats.average > 0 ? ((dataPoint.expense - stats.average) / stats.average) * 100 : 0;
  
  return `
    <div class="tooltip-section expense-section">
      <div class="tooltip-title">
        <span class="icon">💸</span>
        Chi phí ${dataPoint.label}
      </div>
      <div class="tooltip-value primary">
        ${formatCurrency(dataPoint.expense, 'VND')}
      </div>
      <div class="tooltip-details">
        <div class="detail-row">
          <span>Tỷ lệ tổng:</span>
          <span>${percentage.toFixed(1)}%</span>
        </div>
        <div class="detail-row">
          <span>So với TB:</span>
          <span class="${vsAverage >= 0 ? 'negative' : 'positive'}">
            ${vsAverage >= 0 ? '+' : ''}${vsAverage.toFixed(1)}%
          </span>
        </div>
        <div class="detail-row">
          <span>Mức độ:</span>
          <span>${getExpenseLevel(dataPoint.expense, stats)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get expense level description
 * @param {number} value - Expense value
 * @param {Object} stats - Expense statistics
 * @returns {string} Level description
 */
function getExpenseLevel(value, stats) {
  if (value >= stats.max * 0.9) return 'Rất cao';
  if (value >= stats.average * 1.3) return 'Cao';
  if (value >= stats.average * 0.7) return 'Bình thường';
  if (value >= stats.min * 1.5) return 'Thấp';
  return 'Rất thấp';
}

/**
 * Generate expense performance indicators
 * @param {Array} data - Expense data
 * @returns {string} HTML for performance indicators
 */
export function generateExpenseIndicators(data) {
  const stats = calculateExpenseStats(data);
  const trend = analyzeExpenseTrend(data);
  
  return `
    <div class="performance-indicators expense-indicators">
      <div class="indicator-card total">
        <div class="indicator-icon">💸</div>
        <div class="indicator-content">
          <div class="indicator-label">Tổng chi phí</div>
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
        <div class="indicator-icon">⚠️</div>
        <div class="indicator-content">
          <div class="indicator-label">Cao nhất</div>
          <div class="indicator-value">${formatCurrency(stats.max, 'VND')}</div>
        </div>
      </div>
    </div>
  `;
}

// Make functions available globally for backward compatibility
window.generateExpenseLineChart = generateExpenseLineChart;
window.generateExpenseDataPoints = generateExpenseDataPoints;
window.generateExpenseArea = generateExpenseArea;
window.generateExpenseCategoryBreakdown = generateExpenseCategoryBreakdown;
window.generateExpensePieChart = generateExpensePieChart;
window.calculateExpenseStats = calculateExpenseStats;
window.analyzeExpenseTrend = analyzeExpenseTrend;
window.generateExpenseTooltip = generateExpenseTooltip;
window.generateExpenseIndicators = generateExpenseIndicators;