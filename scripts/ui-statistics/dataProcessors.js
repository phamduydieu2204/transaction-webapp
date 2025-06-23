/**
 * dataProcessors.js
 * 
 * Data processing và filtering logic
 * Handles data transformation, filtering, and preparation for UI
 */

// Import required functions
import { 
  getCombinedStatistics, 
  fetchExpenseData 
} from '../statisticsDataManager.js';

import { 
  groupExpensesByMonth, 
  groupRevenueByMonth, 
  calculateFinancialAnalysis,
  calculateTotalExpenses,
  calculateTotalRevenue,
  getDateRange 
} from '../statisticsCore.js';

/**
 * Loads initial statistics data
 */
export async function loadStatisticsData(uiState) {
  if (uiState.isLoading) return;
  
  uiState.isLoading = true;
  uiState.lastError = null;
  
  // Show loading state
  const { renderLoadingState } = await import('../statisticsRenderer.js');
  renderLoadingState("monthlySummaryTable");
  
  try {
    
    // Get expense data and create combined data structure
    const expenseData = await fetchExpenseData({ forceRefresh: false });
    
    // For now, use existing transaction data from window.transactionList
    // TODO: Implement proper transaction API when ready
    };
    // Store in global variables for compatibility
    };

    return data;
  } catch (error) {
    console.error("❌ Failed to load statistics data:", error);
  // Calculate financial analysis
  const financialAnalysis = calculateFinancialAnalysis(revenueTotals, expenseTotals);
  
  return {
    expenseData,
    transactionData,
    expenseTotals,
    revenueTotals,
    financialAnalysis
  });
    dateRangeFilter
  };
}

/**
 * Filter data by date range
 * @param {Array} data - Data to filter
 * @param {Object} dateRange - Date range filter
 * @returns {Array} - Filtered data
 */
export function filterDataByDateRange(data, dateRange) {
  if (!data || !dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  return data.filter(item => {
    const itemDate = new Date(item.date || item.transactionDate);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Prepare data for specific tab rendering
 * @param {string} tabType - Type of tab (overview, expenses, revenue)
 * @param {Object} processedData - Processed data object
 * @param {Object} uiState - Current UI state
 * @returns {Object} - Tab-specific data
 */
export function prepareTabData(tabType, processedData, uiState) {
  const { expenseData, transactionData, financialAnalysis } = processedData;
  
  switch (tabType) {
    case 'overview':
      return prepareOverviewData(expenseData, transactionData, financialAnalysis, uiState);
      
    case 'expenses':
      return prepareExpensesData(expenseData, uiState);
      
    case 'revenue':
      return prepareRevenueData(transactionData, uiState);
      
    default:
  });

  }).slice(0, 12);
  };
}

/**
 * Prepare revenue tab data
 */
  // Convert to expense table format for compatibility
  });

  }));
  };
}

/**
 * Prepare combined data for export
 * @param {Object} data - Combined statistics data
 * @param {Object} uiState - Current UI state
 * @returns {Array} - Formatted export data
 */
  });

    });
  });
  
  // Add revenue summary
  });

    });
  });
  
  return combined;
}

/**
 * Force refresh data from server
 * @param {Object} uiState - Current UI state
 * @returns {Object} - Fresh data
 */
export async function forceRefreshData(uiState) {
  
  try {
    const data = await getCombinedStatistics({ forceRefresh: true });
    window.expenseList = data.expenses;
    window.transactionList = data.transactions;
    
    return data;
  } catch (error) {
    console.error("❌ Force refresh failed:", error);
  };
}

/**
 * Validate data integrity
 * @param {Array} data - Data to validate
 * @returns {Object} - Validation result
 */
export function validateDataIntegrity(data) {
  const issues = [];
  
  if (!Array.isArray(data)) {
    issues.push("Data is not an array");
    return { isValid: false, issues };
  }
    }
    }
    
    // Check for valid date
    }
    
    // Check for valid amount
    }
  });
  };
}

/**
 * Clean up loading modals and UI state
 */
  });

    }))
  });
  
  // Force hide any visible modals
  modalElements.forEach(el => {
    if (window.getComputedStyle(el).display !== 'none') {
      el.style.display = 'none';
    }
  });
}

// Make functions available globally for legacy compatibility
window.loadStatisticsData = loadStatisticsData;
window.processDataForUI = processDataForUI;
window.forceRefreshData = forceRefreshData;
