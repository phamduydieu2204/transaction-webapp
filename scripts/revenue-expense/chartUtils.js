/**
 * chartUtils.js
 * 
 * Common chart utilities and data transformation helpers
 * Shared functions for chart generation and data processing
 */

import { normalizeDate } from '../statisticsCore.js';

/**
 * Determine chart granularity based on date range
 * @param {Object} dateRange - Date range object with start and end
 * @returns {string} Granularity type: 'daily', 'weekly', or 'monthly'
 */
export function determineGranularity(dateRange) {
  if (!dateRange) return 'monthly'; // Default to monthly for 12 months
  
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Standard rules:
  // <= 31 days: show daily
  // 32-90 days: show weekly
  // > 90 days: show monthly
  if (daysDiff <= 31) {
    return 'daily';
  } else if (daysDiff <= 90) {
    return 'weekly';
  } else {
    return 'monthly';
  }
}

/**
 * Format date key based on granularity
 * @param {Date} date - Date object
 * @param {string} granularity - Granularity type
 * @returns {string} Formatted date key
 */
export function formatDateKey(date, granularity) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (granularity) {
    case 'daily':
      return `${year}/${month}/${day}`;
    case 'weekly':
      // Get Monday of the week
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const mondayMonth = String(monday.getMonth() + 1).padStart(2, '0');
      const mondayDay = String(monday.getDate()).padStart(2, '0');
      return `${monday.getFullYear()}/${mondayMonth}/${mondayDay}`;
    case 'monthly':
    default:
      return `${year}/${month}`;
  }
}

/**
 * Format date label for display
 * @param {Date} date - Date object
 * @param {string} granularity - Granularity type
 * @returns {string} Formatted date label
 */
export function formatDateLabel(date, granularity) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (granularity) {
    case 'daily':
      return `${day}/${month}`;
    case 'weekly':
      // Get Monday and Sunday of the week
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const mondayDay = String(monday.getDate()).padStart(2, '0');
      const sundayDay = String(sunday.getDate()).padStart(2, '0');
      const mondayMonth = String(monday.getMonth() + 1).padStart(2, '0');
      const sundayMonth = String(sunday.getMonth() + 1).padStart(2, '0');
      
      if (mondayMonth === sundayMonth) {
        return `${mondayDay}-${sundayDay}/${mondayMonth}`;
      } else {
        return `${mondayDay}/${mondayMonth}-${sundayDay}/${sundayMonth}`;
      }
    case 'monthly':
    default:
      return `${month}/${date.getFullYear()}`;
  }
}

/**
 * Calculate daily data aggregation
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} dateRange - Date range filter
 * @returns {Array} Daily aggregated data
 */
export function calculateDailyData(transactionData, expenseData, dateRange) {
  const dailyData = {};
  const start = dateRange ? new Date(dateRange.start) : new Date();
  const end = dateRange ? new Date(dateRange.end) : new Date();
  
  // Initialize all days in range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateKey = formatDateKey(date, 'daily');
    dailyData[dateKey] = {
      date: dateKey,
      label: formatDateLabel(date, 'daily'),
      revenue: 0,
      expense: 0,
      profit: 0
    };
  }
  
  // Process transactions
  transactionData.forEach(transaction => {
    const transactionDate = normalizeDate(transaction.transactionDate);
    const dateKey = formatDateKey(new Date(transactionDate), 'daily');
    
    if (dailyData[dateKey]) {
      const revenue = parseFloat(transaction.revenue) || 0;
      dailyData[dateKey].revenue += revenue;
    }
  });
  
  // Process expenses
  expenseData.forEach(expense => {
    const expenseDate = normalizeDate(expense.date);
    const dateKey = formatDateKey(new Date(expenseDate), 'daily');
    
    if (dailyData[dateKey]) {
      const amount = parseFloat(expense.amount) || 0;
      dailyData[dateKey].expense += amount;
    }
  });
  
  // Calculate profits
  Object.values(dailyData).forEach(data => {
    data.profit = data.revenue - data.expense;
  });
  
  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate weekly data aggregation
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} dateRange - Date range filter
 * @returns {Array} Weekly aggregated data
 */
export function calculateWeeklyData(transactionData, expenseData, dateRange) {
  const weeklyData = {};
  
  // Process transactions
  transactionData.forEach(transaction => {
    const transactionDate = new Date(normalizeDate(transaction.transactionDate));
    const weekKey = formatDateKey(transactionDate, 'weekly');
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        date: weekKey,
        label: formatDateLabel(transactionDate, 'weekly'),
        revenue: 0,
        expense: 0,
        profit: 0
      };
    }
    
    const revenue = parseFloat(transaction.revenue) || 0;
    weeklyData[weekKey].revenue += revenue;
  });
  
  // Process expenses
  expenseData.forEach(expense => {
    const expenseDate = new Date(normalizeDate(expense.date));
    const weekKey = formatDateKey(expenseDate, 'weekly');
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        date: weekKey,
        label: formatDateLabel(expenseDate, 'weekly'),
        revenue: 0,
        expense: 0,
        profit: 0
      };
    }
    
    const amount = parseFloat(expense.amount) || 0;
    weeklyData[weekKey].expense += amount;
  });
  
  // Calculate profits
  Object.values(weeklyData).forEach(data => {
    data.profit = data.revenue - data.expense;
  });
  
  return Object.values(weeklyData).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate monthly data aggregation
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} dateRange - Date range filter
 * @returns {Array} Monthly aggregated data
 */
export function calculateMonthlyData(transactionData, expenseData, dateRange) {
  const monthlyData = {};
  
  // If no date range provided, get last 12 months
  if (!dateRange) {
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = formatDateKey(monthDate, 'monthly');
      monthlyData[monthKey] = {
        date: monthKey,
        label: formatDateLabel(monthDate, 'monthly'),
        revenue: 0,
        expense: 0,
        profit: 0
      };
    }
  }
  
  // Process transactions
  transactionData.forEach(transaction => {
    const transactionDate = new Date(normalizeDate(transaction.transactionDate));
    const monthKey = formatDateKey(transactionDate, 'monthly');
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        date: monthKey,
        label: formatDateLabel(transactionDate, 'monthly'),
        revenue: 0,
        expense: 0,
        profit: 0
      };
    }
    
    const revenue = parseFloat(transaction.revenue) || 0;
    monthlyData[monthKey].revenue += revenue;
  });
  
  // Process expenses
  expenseData.forEach(expense => {
    const expenseDate = new Date(normalizeDate(expense.date));
    const monthKey = formatDateKey(expenseDate, 'monthly');
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        date: monthKey,
        label: formatDateLabel(expenseDate, 'monthly'),
        revenue: 0,
        expense: 0,
        profit: 0
      };
    }
    
    const amount = parseFloat(expense.amount) || 0;
    monthlyData[monthKey].expense += amount;
  });
  
  // Calculate profits
  Object.values(monthlyData).forEach(data => {
    data.profit = data.revenue - data.expense;
  });
  
  return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate maximum value for chart scaling
 * @param {Array} data - Chart data
 * @param {Array} compareData - Optional comparison data
 * @returns {number} Maximum value
 */
export function calculateMaxValue(data, compareData = null) {
  let maxValue = 0;
  
  data.forEach(item => {
    maxValue = Math.max(maxValue, item.revenue, item.expense);
  });
  
  if (compareData) {
    compareData.forEach(item => {
      maxValue = Math.max(maxValue, item.revenue, item.expense);
    });
  }
  
  // Add 10% padding
  return maxValue * 1.1;
}

/**
 * Format number for display
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  } else {
    return value.toFixed(0);
  }
}

/**
 * Generate Y-axis labels for chart
 * @param {number} maxValue - Maximum value
 * @param {number} steps - Number of steps (default 5)
 * @returns {string} HTML for Y-axis labels
 */
export function generateYAxisLabels(maxValue, steps = 5) {
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

/**
 * Generate X-axis labels for chart
 * @param {Array} data - Chart data
 * @param {string} granularity - Time granularity
 * @returns {string} HTML for X-axis labels
 */
export function generateXAxisLabels(data, granularity) {
  const maxLabels = granularity === 'daily' ? 10 : data.length;
  const skipInterval = Math.ceil(data.length / maxLabels);
  
  return data.map((item, index) => {
    if (index % skipInterval !== 0 && index !== data.length - 1) return '';
    
    const label = granularity === 'daily' 
      ? item.label.split('/')[0] // Just show day number
      : item.label.split('/')[0]; // Show month number or week range
      
    return `
      <div class="x-label" style="left: ${(index / (data.length - 1)) * 100}%">
        ${label}
      </div>
    `;
  }).join('');
}

/**
 * Generate grid lines for chart
 * @param {number} steps - Number of horizontal steps (default 5)
 * @param {number} dataPoints - Number of data points for vertical lines
 * @returns {string} SVG grid lines
 */
export function generateGridLines(steps = 5, dataPoints = 12) {
  let lines = '';
  
  // Horizontal lines
  for (let i = 0; i <= steps; i++) {
    const y = 400 - (400 / steps) * i;
    lines += `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="#e0e0e0" stroke-width="1" />`;
  }
  
  // Vertical lines
  for (let i = 0; i < dataPoints; i++) {
    const x = (1000 / (dataPoints - 1)) * i;
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="400" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />`;
  }
  
  return lines;
}

/**
 * Generate SVG gradient definitions
 * @returns {string} SVG gradient definitions
 */
export function generateGradientDefinitions() {
  return `
    <defs>
      <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#17a2b8;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#17a2b8;stop-opacity:0.1" />
      </linearGradient>
      <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#28a745;stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:#28a745;stop-opacity:0.1" />
      </linearGradient>
      <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#dc3545;stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:#dc3545;stop-opacity:0.1" />
      </linearGradient>
    </defs>
  `;
}

/**
 * Generate line points for SVG polyline
 * @param {Array} data - Chart data
 * @param {string} type - Data type ('revenue', 'expense', 'profit')
 * @param {number} maxValue - Maximum value for scaling
 * @returns {string} SVG points string
 */
export function generateLinePoints(data, type, maxValue) {
  if (data.length === 0) return '';
  
  return data.map((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = maxValue === 0 ? 400 : 400 - (item[type] / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
}

/**
 * Get period label based on granularity and date range
 * @param {string} granularity - Time granularity
 * @param {Object} dateRange - Date range (optional)
 * @returns {string} Period label
 */
export function getPeriodLabel(granularity, dateRange = null) {
  if (dateRange) {
    return `${dateRange.start} - ${dateRange.end}`;
  }
  
  switch (granularity) {
    case 'daily':
      return 'Hàng ngày';
    case 'weekly':
      return 'Hàng tuần';
    case 'monthly':
    default:
      return '12 tháng gần nhất';
  }
}

// Make functions available globally for backward compatibility
window.determineGranularity = determineGranularity;
window.formatDateKey = formatDateKey;
window.formatDateLabel = formatDateLabel;
window.calculateDailyData = calculateDailyData;
window.calculateWeeklyData = calculateWeeklyData;
window.calculateMonthlyData = calculateMonthlyData;
window.calculateMaxValue = calculateMaxValue;
window.formatNumber = formatNumber;
window.generateYAxisLabels = generateYAxisLabels;
window.generateXAxisLabels = generateXAxisLabels;
window.generateGridLines = generateGridLines;
window.generateGradientDefinitions = generateGradientDefinitions;
window.generateLinePoints = generateLinePoints;
window.getPeriodLabel = getPeriodLabel;