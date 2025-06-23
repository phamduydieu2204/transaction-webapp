/**
 * chartRenderers.js
 * 
 * Chart rendering và visualization
 * Handles all chart generation and data visualization components
 */

// Import rendering utilities
import { 
  renderMonthlySummaryTable, 
  renderFinancialOverview, 
  renderSimpleChart,
  renderExportControls 
} from '../statisticsRenderer.js';

import { renderFinancialDashboard } from '../financialDashboard.js';
// DISABLED: import { renderBusinessOverviewDashboard } from '../businessOverviewDashboard.js';

/**
 * Renders overview tab content
 */
  });

    // Render summary chart
  });

    }).slice(0, 12); // Last 12 months
  });
  } catch (error) {
    console.error("❌ Error rendering overview tab:", error);
  });
  } catch (error) {
    console.error("❌ Error rendering expenses tab:", error);
    // Convert to expense table format for compatibility
  });

    }));
  });
  } catch (error) {
    console.error("❌ Error rendering revenue tab:", error);
      };
    }
    
    // 1. Render NEW Business Overview Dashboard
    /* DISABLED: Business Overview Dashboard 
  });

    */
    
    // Refresh report menu components if active
      formats: ["csv", "json"]
  });

    });
    
    // 3. Render Monthly Summary Table với filtered data
    await renderFilteredMonthlySummary(expenseData, globalFilters);
  } catch (error) {
    console.error("❌ Error rendering enhanced statistics:", error);
    
    // Fallback to old financial dashboard
  });

      console.log("✅ Fallback to old financial dashboard");
    } catch (fallbackError) {
      console.error("❌ Fallback failed:", fallbackError);
      await renderDefaultTab(expenseData, financialAnalysis);
    }
  }
}

/**
 * Renders filtered monthly summary table
 */
async function renderFilteredMonthlySummary(expenseData, globalFilters) {
  try {
    let filteredExpenseData = expenseData;
    
    if (globalFilters && globalFilters.dateRange) {
      // Import filter function from financialDashboard.js
      const { filterDataByDateRange } = await import('../financialDashboard.js');
      filteredExpenseData = filterDataByDateRange(expenseData, globalFilters.dateRange);
    }
    
    const { groupExpensesByMonth } = await import('../statisticsCore.js');
    const uiState = window.uiState || { currency: 'VND', sortBy: 'month', sortOrder: 'desc' };
  });
  } catch (error) {
    console.error("❌ Error rendering monthly summary:", error);
    throw error;
  }
}

/**
 * Renders default tab content (backward compatibility)
 */
export async function renderDefaultTab(expenseData, financialAnalysis) {
  try {
    const { groupExpensesByMonth } = await import('../statisticsCore.js');
    const uiState = window.uiState || { currency: 'VND', sortBy: 'month', sortOrder: 'desc' };
  });
  } catch (error) {
    console.error("❌ Error rendering default tab:", error);
    
    // Fallback - just show basic message
            Đang cập nhật dữ liệu thống kê...
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Render custom chart with specific configuration
 * @param {Array} data - Chart data
 * @param {Object} config - Chart configuration
 */
export function renderCustomChart(data, config) {
  const {
    containerId,
    chartType = 'bar',
    title = '',
    xLabel = '',
    yLabel = '',
    colors = ['#3498db', '#e74c3c', '#2ecc71'],
    showLegend = true,
    responsive = true
  } = config;
  
  try {
    renderSimpleChart(data, {
      containerId,
      chartType,
      title,
      xLabel,
      yLabel,
      colors,
      showLegend
  });
  } catch (error) {
    console.error(`❌ Error rendering custom chart in ${containerId}:`, error);
  }
}

/**
 * Render comparison chart (current vs previous period)
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data
 * @param {Object} config - Chart configuration
 */
export function renderComparisonChart(currentData, previousData, config) {
  const {
    containerId,
    title = 'So sánh thời kỳ',
    currentLabel = 'Hiện tại',
    previousLabel = 'Trước đó'
  } = config;
  
  try {
    // Prepare comparison data
    const comparisonData = currentData.map((current, index) => {
      const previous = previousData[index] || { amount: 0 };
      };
    });
      colors: ['#3498db', '#95a5a6']
  });
  } catch (error) {
    console.error(`❌ Error rendering comparison chart:`, error);
  }
}

/**
 * Render pie chart for category breakdown
 * @param {Array} data - Category data
 * @param {Object} config - Chart configuration
 */
  });

    }));
  });
  } catch (error) {
    console.error(`❌ Error rendering category pie chart:`, error);
  }
}

/**
 * Render trend line chart
 * @param {Array} data - Time series data
 * @param {Object} config - Chart configuration
 */
  });
  } catch (error) {
    console.error(`❌ Error rendering trend chart:`, error);
  }
}

/**
 * Clear all charts in a container
 * @param {string} containerId - Container ID to clear
 */
export function clearCharts(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Refresh all charts with new data
 * @param {Object} data - New data for charts
 * @param {Object} config - Refresh configuration
 */
export async function refreshAllCharts(data, config = {}) {
  const { containers = [], uiState = {} } = config;
  
  try {
    for (const containerConfig of containers) {
      const { id, type, data: chartData } = containerConfig;
      
      // Clear existing chart
      clearCharts(id);
      
      // Render new chart based on type
      switch (type) {
        case 'overview':
          await renderOverviewTab(data.expenses, data.transactions, data.financialAnalysis, uiState);
          break;
        case 'expenses':
          await renderExpensesTab(data.expenses, uiState);
          break;
        case 'revenue':
          await renderRevenueTab(data.transactions, uiState);
          break;
        default:
          renderCustomChart(chartData || [], { containerId: id });
      }
    }
  } catch (error) {
    console.error("❌ Error refreshing charts:", error);
  }
}

// Make functions available globally for legacy compatibility
window.renderEnhancedStatistics = renderEnhancedStatistics;
window.renderOverviewTab = renderOverviewTab;
window.renderExpensesTab = renderExpensesTab;
window.renderRevenueTab = renderRevenueTab;
window.renderDefaultTab = renderDefaultTab;
