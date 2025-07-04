/**
 * categoryChartConfig.js
 * 
 * Chart configuration and styling for expense categories
 * Handles chart options, colors, and visual settings
 */

/**
 * Get chart color palette
 * @returns {Array} Color palette for charts
 */
export function getChartColorPalette() {
  return [
    '#667eea', // Purple
    '#f093fb', // Pink
    '#4facfe', // Blue
    '#fa709a', // Rose
    '#fed330', // Yellow
    '#55a3ff', // Light Blue
    '#fd79a8', // Light Pink
    '#a29bfe', // Lavender
    '#6c5ce7', // Dark Purple
    '#00b894'  // Green
  ];
}

/**
 * Get chart configuration options
 * @param {string} chartType - Type of chart (pie, bar, line, etc.)
 * @returns {Object} Chart configuration
 */
export function getChartConfig(chartType) {
  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };
  
  switch (chartType) {
    case 'pie':
      return {
        ...baseConfig,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${formatCurrency(value, 'VND')} (${percentage}%)`;
              }
            }
          }
        }
      };
      
    case 'bar':
      return {
        ...baseConfig,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            }
          },
          y: {
            stacked: true,
            ticks: {
              callback: function(value) {
                return formatNumber(value);
              }
            }
          }
        }
      };
      
    case 'line':
      return {
        ...baseConfig,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatNumber(value);
              }
            }
          }
        }
      };
      
    default:
      return baseConfig;
  }
}

/**
 * Format number for display
 * @param {number} value - Number value
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format currency (imported from elsewhere, redefined here for module independence)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Get gradient colors for charts
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} color - Base color
 * @returns {CanvasGradient} Gradient object
 */
export function getGradientColor(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustColorOpacity(color, 0.1));
  return gradient;
}

/**
 * Adjust color opacity
 * @param {string} color - Hex color
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color
 */
export function adjustColorOpacity(color, opacity) {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get chart theme settings
 * @returns {Object} Theme configuration
 */
export function getChartTheme() {
  return {
    fonts: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      heading: 'inherit'
    },
    colors: {
      text: '#2d3748',
      textMuted: '#718096',
      background: '#ffffff',
      backgroundAlt: '#f7fafc',
      border: '#e2e8f0',
      primary: '#667eea',
      success: '#48bb78',
      warning: '#ed8936',
      danger: '#f56565'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)'
    }
  };
}

/**
 * Export chart styles
 */
export function addExpenseCategoryChartStyles() {
  if (document.getElementById('expense-category-chart-styles')) return;
  
  const theme = getChartTheme();
  const styles = document.createElement('style');
  styles.id = 'expense-category-chart-styles';
  styles.textContent = `
    .expense-category-chart {
      background: ${theme.colors.background};
      border-radius: ${theme.borderRadius.lg}px;
      padding: ${theme.spacing.lg}px;
      box-shadow: ${theme.shadows.md};
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${theme.spacing.lg}px;
    }
    
    .chart-header h3 {
      margin: 0;
      color: ${theme.colors.text};
      font-size: 20px;
    }
    
    .chart-period {
      font-size: 14px;
      color: ${theme.colors.textMuted};
      background: ${theme.colors.backgroundAlt};
      padding: 6px 12px;
      border-radius: 6px;
    }
    
    .category-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .category-overview-card {
      background: #fafafa;
      border: 2px solid;
      border-radius: ${theme.borderRadius.lg}px;
      padding: 20px;
      transition: all 0.3s ease;
    }
    
    .category-overview-card:hover {
      transform: translateY(-4px);
      box-shadow: ${theme.shadows.lg};
    }
    
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .category-icon {
      font-size: 24px;
    }
    
    .category-name {
      font-weight: 600;
      color: ${theme.colors.text};
    }
    
    .category-amount {
      font-size: 28px;
      font-weight: bold;
      color: #1a202c;
      margin-bottom: 12px;
    }
    
    .category-percentage {
      margin-bottom: 16px;
    }
    
    .percentage-bar {
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    
    .percentage-fill {
      height: 100%;
      transition: width 0.5s ease;
    }
    
    .percentage-text {
      font-size: 12px;
      color: ${theme.colors.textMuted};
    }
    
    .subcategories {
      border-top: 1px solid ${theme.colors.border};
      padding-top: 12px;
      margin-top: 12px;
    }
    
    .subcategory-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;
      color: #4a5568;
    }
    
    .subcat-amount {
      font-weight: 500;
    }
    
    .monthly-trend-section {
      margin-bottom: 32px;
    }
    
    .monthly-trend-section h4 {
      margin: 0 0 20px 0;
      color: ${theme.colors.text};
    }
    
    .stacked-bar-chart {
      background: ${theme.colors.backgroundAlt};
      border-radius: ${theme.borderRadius.md}px;
      padding: 20px;
    }
    
    .chart-container {
      display: grid;
      grid-template-columns: 50px 1fr;
      gap: 16px;
      height: 300px;
    }
    
    .chart-y-axis {
      position: relative;
    }
    
    .y-tick {
      position: absolute;
      right: 0;
      transform: translateY(50%);
      font-size: 11px;
      color: ${theme.colors.textMuted};
      text-align: right;
    }
    
    .chart-bars {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 100%;
      padding: 0 4px;
    }
    
    .bar-column {
      position: relative;
      flex: 1;
      max-width: 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      cursor: pointer;
    }
    
    .stacked-bar {
      width: 100%;
      display: flex;
      flex-direction: column-reverse;
      border-radius: 4px 4px 0 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .bar-segment {
      width: 100%;
      transition: all 0.3s ease;
    }
    
    .bar-label {
      margin-top: 8px;
      font-size: 11px;
      color: ${theme.colors.textMuted};
    }
    
    .bar-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 10;
      pointer-events: none;
    }
    
    .bar-column.active .bar-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(-10px);
    }
    
    .bar-column.active .stacked-bar {
      transform: scaleY(1.05);
      box-shadow: ${theme.shadows.md};
    }
    
    .tooltip-header {
      font-weight: bold;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    
    .tooltip-total {
      margin-bottom: 8px;
      color: #4fd1c5;
    }
    
    .tooltip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
    }
    
    .tooltip-icon {
      font-size: 14px;
    }
    
    .tooltip-amount {
      margin-left: auto;
      font-weight: 500;
    }
    
    .expense-summary {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid ${theme.colors.border};
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: ${theme.colors.backgroundAlt};
      border-radius: ${theme.borderRadius.md}px;
      transition: all 0.2s ease;
    }
    
    .summary-item:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    }
    
    .summary-icon {
      font-size: 32px;
    }
    
    .summary-info {
      flex: 1;
    }
    
    .summary-label {
      font-size: 13px;
      color: ${theme.colors.textMuted};
      margin-bottom: 4px;
    }
    
    .summary-value {
      font-size: 18px;
      font-weight: bold;
      color: ${theme.colors.text};
    }
    
    .summary-sub {
      font-size: 12px;
      color: #a0aec0;
      margin-top: 2px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .category-overview {
        grid-template-columns: 1fr;
      }
      
      .chart-bars {
        gap: 2px;
      }
      
      .bar-column {
        max-width: 40px;
      }
      
      .bar-label {
        font-size: 9px;
      }
    }
  `;
  
  document.head.appendChild(styles);
}