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
  // Initialize all days in range
      label: formatDateLabel(date, 'daily'),
    };
  }
  
  // Process transactions
        label: formatDateLabel(transactionDate, 'weekly'),
  });

      };
    }
        label: formatDateLabel(expenseDate, 'weekly'),
  });

      };
    }
        label: formatDateLabel(monthDate, 'monthly'),
      };
    }
  }
  
  // Process transactions
        label: formatDateLabel(transactionDate, 'monthly'),
  });

      };
    }
        label: formatDateLabel(expenseDate, 'monthly'),
  });

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