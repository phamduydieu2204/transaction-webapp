/**
 * chartManager.js
 * 
 * Chart management utilities for financial dashboard
 * Handles Chart.js instances, configurations, and rendering
 */

/**
 * Global storage for chart instances
 */
const chartInstances = new Map();

/**
 * Default chart colors palette
 */
export const CHART_COLORS = {
  primary: '#007bff',
  success: '#28a745', 
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  revenue: '#28a745',
  expense: '#dc3545',
  profit: '#007bff',
  gradient: {
    revenue: ['#28a745', '#20c997'],
    expense: ['#dc3545', '#fd7e14'],
    profit: ['#007bff', '#6610f2']
  }
};

/**
 * Default chart options
 */
export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#007bff',
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.1)'
      },
      ticks: {
        callback: function(value) {
          return formatCurrencyForChart(value);
        }
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

/**
 * Create or update a chart instance
 * @param {string} canvasId - Canvas element ID
 * @param {Object} config - Chart.js configuration
 * @returns {Object} Chart instance
 */
export function createOrUpdateChart(canvasId, config) {
  // Destroy existing chart if it exists
  if (chartInstances.has(canvasId)) {
    chartInstances.get(canvasId).destroy();
  }
  
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element #${canvasId} not found`);
    return null;
  }
  
  try {
    const chart = new Chart(canvas, config);
    chartInstances.set(canvasId, chart);
    return chart;
  } catch (error) {
    console.error(`Error creating chart ${canvasId}:`, error);
    return null;
  }
}

/**
 * Destroy a chart instance
 * @param {string} canvasId - Canvas element ID
 */
export function destroyChart(canvasId) {
  if (chartInstances.has(canvasId)) {
    chartInstances.get(canvasId).destroy();
    chartInstances.delete(canvasId);
  }
}

/**
 * Destroy all chart instances
 */
export function destroyAllCharts() {
  chartInstances.forEach((chart, canvasId) => {
    chart.destroy();
  });
  chartInstances.clear();
}

/**
 * Create line chart configuration
 * @param {Array} labels - Chart labels
 * @param {Array} datasets - Chart datasets
 * @param {Object} options - Additional options
 * @returns {Object} Chart configuration
 */
export function createLineChartConfig(labels, datasets, options = {}) {
  return {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(dataset => ({
        ...dataset,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      }))
    },
    options: {
      ...DEFAULT_CHART_OPTIONS,
      ...options,
      plugins: {
        ...DEFAULT_CHART_OPTIONS.plugins,
        ...options.plugins
      }
    }
  };
}

/**
 * Create bar chart configuration
 * @param {Array} labels - Chart labels
 * @param {Array} datasets - Chart datasets
 * @param {Object} options - Additional options
 * @returns {Object} Chart configuration
 */
export function createBarChartConfig(labels, datasets, options = {}) {
  return {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(dataset => ({
        ...dataset,
        borderRadius: 4,
        borderSkipped: false
      }))
    },
    options: {
      ...DEFAULT_CHART_OPTIONS,
      ...options,
      plugins: {
        ...DEFAULT_CHART_OPTIONS.plugins,
        ...options.plugins
      }
    }
  };
}

/**
 * Create pie chart configuration
 * @param {Array} labels - Chart labels
 * @param {Array} data - Chart data
 * @param {Object} options - Additional options
 * @returns {Object} Chart configuration
 */
export function createPieChartConfig(labels, data, options = {}) {
  const colors = generateColorPalette(labels.length);
  
  return {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrencyForChart(context.parsed)} (${percentage}%)`;
            }
          }
        }
      },
      ...options
    }
  };
}

/**
 * Create doughnut chart configuration
 * @param {Array} labels - Chart labels
 * @param {Array} data - Chart data
 * @param {Object} options - Additional options
 * @returns {Object} Chart configuration
 */
export function createDoughnutChartConfig(labels, data, options = {}) {
  const config = createPieChartConfig(labels, data, options);
  config.type = 'doughnut';
  
  return {
    ...config,
    options: {
      ...config.options,
      cutout: '60%',
      plugins: {
        ...config.options.plugins,
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        }
      }
    }
  };
}

/**
 * Generate color palette for charts
 * @param {number} count - Number of colors needed
 * @returns {Array} Array of color strings
 */
export function generateColorPalette(count) {
  const baseColors = [
    CHART_COLORS.primary,
    CHART_COLORS.success,
    CHART_COLORS.danger,
    CHART_COLORS.warning,
    CHART_COLORS.info,
    '#6f42c1', // Purple
    '#e83e8c', // Pink
    '#fd7e14', // Orange
    '#20c997', // Teal
    '#6610f2'  // Indigo
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    if (i < baseColors.length) {
      colors.push(baseColors[i]);
    } else {
      // Generate additional colors using HSL
      const hue = (i * 137.508) % 360; // Golden angle approximation
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
  }
  
  return colors;
}

/**
 * Create gradient for chart backgrounds
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} colors - Gradient colors
 * @param {string} direction - Gradient direction ('vertical' or 'horizontal')
 * @returns {CanvasGradient} Gradient object
 */
export function createGradient(ctx, colors, direction = 'vertical') {
  const gradient = direction === 'vertical' 
    ? ctx.createLinearGradient(0, 0, 0, 400)
    : ctx.createLinearGradient(0, 0, 400, 0);
    
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  return gradient;
}

/**
 * Format currency values for chart display
 * @param {number} value - Numeric value
 * @returns {string} Formatted currency string
 */
export function formatCurrencyForChart(value) {
  if (value === 0) return '0';
  
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Update chart data without recreating the chart
 * @param {string} canvasId - Canvas element ID
 * @param {Object} newData - New chart data
 */
export function updateChartData(canvasId, newData) {
  const chart = chartInstances.get(canvasId);
  if (!chart) {
    console.warn(`Chart ${canvasId} not found for update`);
    return;
  }
  
  chart.data = newData;
  chart.update('active');
}

/**
 * Animate chart on load
 * @param {string} canvasId - Canvas element ID
 */
export function animateChart(canvasId) {
  const chart = chartInstances.get(canvasId);
  if (!chart) {
    return;
  }
  
  chart.update('active');
}

/**
 * Export chart as image
 * @param {string} canvasId - Canvas element ID
 * @param {string} filename - Export filename
 */
export function exportChartAsImage(canvasId, filename = 'chart.png') {
  const chart = chartInstances.get(canvasId);
  if (!chart) {
    console.warn(`Chart ${canvasId} not found for export`);
    return;
  }
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = chart.toBase64Image();
  link.click();
}

/**
 * Get chart instance by canvas ID
 * @param {string} canvasId - Canvas element ID
 * @returns {Object|null} Chart instance
 */
export function getChart(canvasId) {
  return chartInstances.get(canvasId) || null;
}

/**
 * Check if Chart.js is available
 * @returns {boolean} True if Chart.js is loaded
 */
export function isChartJSAvailable() {
  return typeof Chart !== 'undefined';
}

/**
 * Initialize chart manager
 */
export function initChartManager() {
  if (!isChartJSAvailable()) {
    console.warn('Chart.js is not loaded. Charts will not be available.');
    return false;
  }
  
  // Set global Chart.js defaults
  if (Chart.defaults) {
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#495057';
  }
  
  return true;
}