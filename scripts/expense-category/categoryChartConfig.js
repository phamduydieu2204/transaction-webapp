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
    }
  };
        ...baseConfig,
              }
            }
          },
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
        ...baseConfig,
            }
          },
          }
        },
            }
          },
        ...baseConfig,
          },
          }
        },
            }
          },
  }
}

/**
 * Format number for display
 * @param {number} value - Number value
 * @returns {string} Formatted number
 */
  });

  }).format(amount);
}

/**
 * Get gradient colors for charts
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} color - Base color
 * @returns {CanvasGradient} Gradient object
 */
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    },
    },
    },
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
      margin-bottom: ${theme.spacing.lg}px;
    }
    
    .chart-header h3 {
      color: ${theme.colors.text};
    }
    
    .chart-period {
      color: ${theme.colors.textMuted};
      background: ${theme.colors.backgroundAlt};
    }
    
    .category-overview {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
    
    .category-overview-card {
      border-radius: ${theme.borderRadius.lg}px;
    }
    
    .category-overview-card:hover {
      box-shadow: ${theme.shadows.lg};
    }
    
    .category-header {
    }
    
    .category-icon {
    }
    
    .category-name {
      color: ${theme.colors.text};
    }
    
    .category-amount {
    }
    
    .category-percentage {
    }
    
    .percentage-bar {
    }
    
    .percentage-fill {
    }
    
    .percentage-text {
      color: ${theme.colors.textMuted};
    }
    
    .subcategories {
      border-top: 1px solid ${theme.colors.border};
    }
    
    .subcategory-item {
    }
    
    .subcat-amount {
    }
    
    .monthly-trend-section {
    }
    
    .monthly-trend-section h4 {
      color: ${theme.colors.text};
    }
    
    .stacked-bar-chart {
      background: ${theme.colors.backgroundAlt};
      border-radius: ${theme.borderRadius.md}px;
    }
    
    .chart-container {
    }
    
    .chart-y-axis {
    }
    
    .y-tick {
      color: ${theme.colors.textMuted};
    }
    
    .chart-bars {
    }
    
    .bar-column {
    }
    
    .stacked-bar {
    }
    
    .bar-segment {
    }
    
    .bar-label {
      color: ${theme.colors.textMuted};
    }
    
    .bar-tooltip {
      background: rgba(0,0,0,0.9);
    }
    
    .bar-column.active .bar-tooltip {
    }
    
    .bar-column.active .stacked-bar {
      box-shadow: ${theme.shadows.md};
    }
    
    .tooltip-header {
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    
    .tooltip-total {
    }
    
    .tooltip-item {
    }
    
    .tooltip-icon {
    }
    
    .tooltip-amount {
    }
    
    .expense-summary {
      border-top: 1px solid ${theme.colors.border};
    }
    
    .summary-cards {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
    
    .summary-item {
      background: ${theme.colors.backgroundAlt};
      border-radius: ${theme.borderRadius.md}px;
    }
    
    .summary-item:hover {
      box-shadow: ${theme.shadows.md};
    }
    
    .summary-icon {
    }
    
    .summary-info {
    }
    
    .summary-label {
      color: ${theme.colors.textMuted};
    }
    
    .summary-value {
      color: ${theme.colors.text};
    }
    
    .summary-sub {
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .category-overview {
      }
      
      .chart-bars {
      }
      
      .bar-column {
      }
      
      .bar-label {
      }
    }
  `;
  
  document.head.appendChild(styles);
}