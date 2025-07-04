/**
 * chartHelpers.js
 * 
 * Chart data preparation and visualization utilities
 * Handles chart data transformation, color schemes, and chart configuration
 */

/**
 * Predefined color schemes for charts
 */
export const COLOR_SCHEMES = {
  primary: [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
    '#fd7e14', '#20c997', '#6c757d', '#e83e8c', '#17a2b8'
  ],
  revenue: [
    '#28a745', '#20c997', '#17a2b8', '#007bff', '#6f42c1',
    '#fd7e14', '#ffc107', '#e83e8c', '#dc3545', '#6c757d'
  ],
  expense: [
    '#dc3545', '#fd7e14', '#ffc107', '#e83e8c', '#6c757d',
    '#6f42c1', '#17a2b8', '#20c997', '#28a745', '#007bff'
  ],
  profit: [
    '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1',
    '#fd7e14', '#20c997', '#e83e8c', '#007bff', '#6c757d'
  ],
  pastel: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ],
  gradient: [
    'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    'linear-gradient(45deg, #4ECDC4, #45B7D1)',
    'linear-gradient(45deg, #45B7D1, #96CEB4)',
    'linear-gradient(45deg, #96CEB4, #FECA57)',
    'linear-gradient(45deg, #FECA57, #FF9FF3)'
  ]
};

/**
 * Gets color for a chart item by index
 * @param {number} index - Item index
 * @param {string} scheme - Color scheme name
 * @returns {string} - Color value
 */
export function getColor(index, scheme = 'primary') {
  const colors = COLOR_SCHEMES[scheme] || COLOR_SCHEMES.primary;
  return colors[index % colors.length];
}

/**
 * Generates colors for multiple chart items
 * @param {number} count - Number of colors needed
 * @param {string} scheme - Color scheme name
 * @returns {Array} - Array of color values
 */
export function generateColors(count, scheme = 'primary') {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(getColor(i, scheme));
  }
  return colors;
}

/**
 * Transforms revenue data for chart display
 * @param {Array} revenueData - Revenue data by month
 * @param {Object} options - Chart options
 * @returns {Object} - Chart data configuration
 */
export function prepareRevenueChartData(revenueData, options = {}) {
  const {
    chartType = 'line',
    colorScheme = 'revenue',
    showTrendLine = false
  } = options;

  const labels = [];
  const datasets = [];
  const dataMap = {};

  // Group data by software/category
  revenueData.forEach(item => {
    const label = item.month;
    const category = item.software || item.category || 'Khác';
    
    if (!dataMap[category]) {
      dataMap[category] = {};
    }
    
    dataMap[category][label] = (dataMap[category][label] || 0) + item.amount;
    
    if (!labels.includes(label)) {
      labels.push(label);
    }
  });

  // Sort labels chronologically
  labels.sort();

  // Create datasets for each category
  Object.keys(dataMap).forEach((category, index) => {
    const data = labels.map(label => dataMap[category][label] || 0);
    const color = getColor(index, colorScheme);
    
    datasets.push({
      label: category,
      data: data,
      backgroundColor: chartType === 'line' ? `${color}20` : color,
      borderColor: color,
      borderWidth: 2,
      fill: chartType === 'area',
      tension: 0.4
    });
  });

  // Add trend line if requested
  if (showTrendLine && datasets.length > 0) {
    const totalData = labels.map(label => 
      Object.keys(dataMap).reduce((sum, category) => 
        sum + (dataMap[category][label] || 0), 0
      )
    );
    
    datasets.push({
      label: 'Xu hướng',
      data: calculateTrendLine(totalData),
      borderColor: '#6c757d',
      borderWidth: 1,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      type: 'line'
    });
  }

  return {
    labels: labels.map(label => formatChartLabel(label)),
    datasets: datasets
  };
}

/**
 * Transforms expense data for chart display
 * @param {Array} expenseData - Expense data by month/category
 * @param {Object} options - Chart options
 * @returns {Object} - Chart data configuration
 */
export function prepareExpenseChartData(expenseData, options = {}) {
  const {
    chartType = 'doughnut',
    colorScheme = 'expense',
    groupByMonth = false
  } = options;

  if (groupByMonth) {
    return prepareMonthlyExpenseData(expenseData, options);
  }

  // Group by category/type
  const categoryTotals = {};
  
  expenseData.forEach(item => {
    const category = item.type || item.category || 'Khác';
    categoryTotals[category] = (categoryTotals[category] || 0) + item.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = generateColors(labels.length, colorScheme);

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.8', '1')),
      borderWidth: 1
    }]
  };
}

/**
 * Prepares monthly expense data for line/bar charts
 * @param {Array} expenseData - Expense data
 * @param {Object} options - Chart options
 * @returns {Object} - Chart data configuration
 */
function prepareMonthlyExpenseData(expenseData, options = {}) {
  const { colorScheme = 'expense' } = options;
  
  const monthlyData = {};
  const categories = new Set();

  expenseData.forEach(item => {
    const month = item.month;
    const category = item.type || item.category || 'Khác';
    
    if (!monthlyData[month]) {
      monthlyData[month] = {};
    }
    
    monthlyData[month][category] = (monthlyData[month][category] || 0) + item.amount;
    categories.add(category);
  });

  const labels = Object.keys(monthlyData).sort();
  const datasets = [];

  Array.from(categories).forEach((category, index) => {
    const data = labels.map(month => monthlyData[month][category] || 0);
    const color = getColor(index, colorScheme);
    
    datasets.push({
      label: category,
      data: data,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1
    });
  });

  return {
    labels: labels.map(label => formatChartLabel(label)),
    datasets: datasets
  };
}

/**
 * Prepares ROI comparison chart data
 * @param {Array} roiData - ROI data by product/service
 * @param {Object} options - Chart options
 * @returns {Object} - Chart data configuration
 */
export function prepareROIChartData(roiData, options = {}) {
  const {
    sortBy = 'accountingROI',
    maxItems = 10,
    colorScheme = 'profit'
  } = options;

  // Sort and limit data
  const sortedData = [...roiData]
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, maxItems);

  const labels = sortedData.map(item => item.tenChuan);
  const revenueData = sortedData.map(item => item.revenue);
  const expenseData = sortedData.map(item => item.allocatedExpense);
  const profitData = sortedData.map(item => item.accountingProfit);

  return {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueData,
        backgroundColor: getColor(0, colorScheme),
        borderColor: getColor(0, colorScheme),
        borderWidth: 1
      },
      {
        label: 'Chi phí',
        data: expenseData,
        backgroundColor: getColor(1, colorScheme),
        borderColor: getColor(1, colorScheme),
        borderWidth: 1
      },
      {
        label: 'Lợi nhuận',
        data: profitData,
        backgroundColor: getColor(2, colorScheme),
        borderColor: getColor(2, colorScheme),
        borderWidth: 1
      }
    ]
  };
}

/**
 * Calculates trend line data using linear regression
 * @param {Array} data - Data points
 * @returns {Array} - Trend line data points
 */
function calculateTrendLine(data) {
  const n = data.length;
  if (n < 2) return data;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((_, index) => slope * index + intercept);
}

/**
 * Formats chart labels for display
 * @param {string} label - Raw label
 * @returns {string} - Formatted label
 */
function formatChartLabel(label) {
  if (label.includes('/')) {
    const [year, month] = label.split('/');
    return `${month}/${year}`;
  }
  return label;
}

/**
 * Generates chart configuration with Vietnamese localization
 * @param {string} chartType - Chart type
 * @param {Object} customOptions - Custom chart options
 * @returns {Object} - Chart.js configuration
 */
export function generateChartConfig(chartType, customOptions = {}) {
  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed;
            return `${label}: ${formatChartValue(value)}`;
          }
        }
      }
    },
    scales: {}
  };

  // Add scales for line/bar charts
  if (['line', 'bar'].includes(chartType)) {
    baseConfig.scales = {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          callback: function(value) {
            return formatChartValue(value);
          }
        }
      }
    };
  }

  // Merge with custom options
  return mergeDeep(baseConfig, customOptions);
}

/**
 * Formats values for chart display
 * @param {number} value - Numeric value
 * @returns {string} - Formatted value
 */
function formatChartValue(value) {
  if (typeof value !== 'number') return value;
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toLocaleString('vi-VN');
  }
}

/**
 * Deep merges two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Checks if a value is an object
 * @param {*} item - Item to check
 * @returns {boolean} - Whether item is an object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Prepares data for comparison charts (current vs previous period)
 * @param {Object} currentData - Current period data
 * @param {Object} previousData - Previous period data
 * @param {Object} options - Chart options
 * @returns {Object} - Comparison chart data
 */
export function prepareComparisonChartData(currentData, previousData, options = {}) {
  const {
    colorScheme = 'primary',
    dataKey = 'amount'
  } = options;

  const categories = new Set([
    ...Object.keys(currentData || {}),
    ...Object.keys(previousData || {})
  ]);

  const labels = Array.from(categories);
  const currentValues = labels.map(label => currentData[label]?.[dataKey] || 0);
  const previousValues = labels.map(label => previousData[label]?.[dataKey] || 0);

  return {
    labels,
    datasets: [
      {
        label: 'Kỳ hiện tại',
        data: currentValues,
        backgroundColor: getColor(0, colorScheme),
        borderColor: getColor(0, colorScheme),
        borderWidth: 1
      },
      {
        label: 'Kỳ trước',
        data: previousValues,
        backgroundColor: getColor(1, colorScheme),
        borderColor: getColor(1, colorScheme),
        borderWidth: 1
      }
    ]
  };
}

// Make functions available globally for backward compatibility
window.COLOR_SCHEMES = COLOR_SCHEMES;
window.getColor = getColor;
window.generateColors = generateColors;
window.prepareRevenueChartData = prepareRevenueChartData;
window.prepareExpenseChartData = prepareExpenseChartData;
window.prepareROIChartData = prepareROIChartData;
window.generateChartConfig = generateChartConfig;
window.prepareComparisonChartData = prepareComparisonChartData;