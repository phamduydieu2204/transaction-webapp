/**
 * expenseCategoryChart.js
 * 
 * Orchestrator for expense category chart functionality
 * Coordinates between different modules to provide complete chart experience
 */

// Import modules
import { 
  calculateExpenseByCategoryData, 
  calculateCategoryStats,
  groupExpensesByPeriod 
} from './expense-category/categoryDataProcessors.js';

import { 
  renderExpenseCategoryChart as renderChart 
} from './expense-category/categoryChartComponents.js';

import { 
  addExpenseCategoryChartStyles,
  getChartConfig,
  getChartTheme 
} from './expense-category/categoryChartConfig.js';

import { 
  exportChartAsPNG,
  exportCategoryDataAsCSV,
  exportCategoryDataAsExcel,
  exportCategoryReportAsPDF,
  downloadCategorySummaryReport,
  copyCategoryDataToClipboard 
} from './expense-category/categoryExportUtils.js';

// Re-export main functions for backward compatibility
export { calculateExpenseByCategoryData } from './expense-category/categoryDataProcessors.js';
export { addExpenseCategoryChartStyles } from './expense-category/categoryChartConfig.js';

/**
 * Main orchestrator function to render expense category chart
 * @param {Array} expenseData - Expense records
 * @param {string} containerId - Container element ID
 * @param {Object} options - Additional options
 */
export function renderExpenseCategoryChart(expenseData, containerId = 'expenseByCategory', options = {}) {
  try {
    // Process data
    const processedData = calculateExpenseByCategoryData(expenseData);
    
    // Add styles if not already added
    addExpenseCategoryChartStyles();
    
    // Render chart
    renderChart(expenseData, containerId, processedData);
    
    // Calculate statistics for potential use
    const stats = calculateCategoryStats(processedData);
    
    // Store data for export functions
    const container = document.getElementById(containerId);
    if (container) {
      container._chartData = processedData;
      container._chartStats = stats;
      
      // Add export buttons if enabled
      if (options.showExportButtons) {
        addExportButtons(containerId);
      }
    }
    
    return { processedData, stats };
  } catch (error) {
    console.error('Error rendering expense category chart:', error);
      }
      
      .export-btn {
      }
      
      .export-btn:hover {
      }
      
      .export-btn:active {
      }
    `;
    },
    },
    recommendations: generateRecommendations(stats, processedData)
  };
}

/**
 * Calculate expense volatility
 * @param {Array} monthlyData - Monthly expense data
 * @returns {number} Volatility score (0-100)
 */
  };
}

/**
 * Generate recommendations based on expense analysis
 * @param {Object} stats - Category statistics
 * @param {Object} processedData - Processed expense data
 * @returns {Array} Recommendations
 */
  });
      message: `${stats.topCategory.name} chiếm hơn 50% tổng chi phí. Cân nhắc tối ưu hóa.`
    });
  }
  
  // Volatility recommendation
  });

    });
  }
  
  return recommendations;
}