/**
 * chartHelpers.js
 * 
 * Chart data preparation and visualization utilities
 * Handles chart data transformation, color schemes, and chart configuration
 */

/**
 * Predefined color schemes for charts
 */
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
    '#fd7e14', '#20c997', '#6c757d', '#e83e8c', '#17a2b8'
  ],
    '#28a745', '#20c997', '#17a2b8', '#007bff', '#6f42c1',
    '#fd7e14', '#ffc107', '#e83e8c', '#dc3545', '#6c757d'
  ],
    '#dc3545', '#fd7e14', '#ffc107', '#e83e8c', '#6c757d',
    '#6f42c1', '#17a2b8', '#20c997', '#28a745', '#007bff'
  ],
    '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1',
    '#fd7e14', '#20c997', '#e83e8c', '#007bff', '#6c757d'
  ],
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ],
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
  });
      backgroundColor: chartType === 'line' ? `${color}20` : color,
    });
  });

  // Add trend line if requested
      borderDash: [5, 5],
  });

    });
  }
  };
}

/**
 * Transforms expense data for chart display
 * @param {Array} expenseData - Expense data by month/category
 * @param {Object} options - Chart options
 * @returns {Object} - Chart data configuration
 */
      borderColor: colors.map(color => color.replace('0.8', '1')),
    }]
  };
}

/**
 * Prepares monthly expense data for line/bar charts
 * @param {Array} expenseData - Expense data
 * @param {Object} options - Chart options
 * @returns {Object} - Chart data configuration
 */
  });

    });
  });
  };
}

/**
 * Prepares ROI comparison chart data
 * @param {Array} roiData - ROI data by product/service
 * @param {Object} options - Chart options
 * @returns {Object} - Chart data configuration
 */
      {
        backgroundColor: getColor(0, colorScheme),
        borderColor: getColor(0, colorScheme),
      },
      {
        backgroundColor: getColor(1, colorScheme),
        borderColor: getColor(1, colorScheme),
      },
      {
        backgroundColor: getColor(2, colorScheme),
        borderColor: getColor(2, colorScheme),
      }
    ]
  };
}

/**
 * Calculates trend line data using linear regression
 * @param {Array} data - Data points
 * @returns {Array} - Trend line data points
 */
            family: 'Inter, system-ui, sans-serif',
          },
        }
      },
        backgroundColor: 'rgba(0,0,0,0.8)',
          family: 'Inter, system-ui, sans-serif',
        },
          family: 'Inter, system-ui, sans-serif',
        },
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
        },
            family: 'Inter, system-ui, sans-serif',
          }
        }
      },
          color: 'rgba(0,0,0,0.1)'
        },
            family: 'Inter, system-ui, sans-serif',
          },
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
      {
        backgroundColor: getColor(0, colorScheme),
        borderColor: getColor(0, colorScheme),
      },
      {
        backgroundColor: getColor(1, colorScheme),
        borderColor: getColor(1, colorScheme),
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