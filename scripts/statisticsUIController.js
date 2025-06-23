/**
 * statisticsUIController.js
 * 
 * Orchestrator module for statistics UI controller
 * Coordinates between specialized UI modules
 */


// Import specialized UI modules
import {
  setupTabListeners,
  setupFilterControls,
  setupDateRangeControls,
  setupExportControls,
  handleStatisticsTabActivation
} from './ui-statistics/uiHandlers.js';

import {
  loadStatisticsData,
  processDataForUI,
  prepareCombinedExportData,
  forceRefreshData,
  filterDataByGlobalFilters
} from './ui-statistics/dataProcessors.js';

import {
  renderEnhancedStatistics,
  renderOverviewTab,
  renderExpensesTab,
  renderRevenueTab,
  renderDefaultTab
} from './ui-statistics/chartRenderers.js';

import {
  showSuccessMessage,
  showErrorMessage,
  loadingManager
} from './ui-statistics/displayManagers.js';

import {
  viewController,
  layoutManager,
  initializeViewControllers
} from './ui-statistics/viewControllers.js';

// Legacy imports for backward compatibility
import { exportData } from './statisticsDataManager.js';
import { addFinancialDashboardStyles } from './financialDashboard.js';
// DISABLED: import { addBusinessDashboardStyles } from './businessOverviewDashboard.js';

/**
 * UI state management
 */
const uiState = {
  currentTab: "overview",
  dateRange: "month",
  currency: "VND",
  sortBy: "month",
  sortOrder: "desc",
  showGrowthRate: false,
  isLoading: false,
  lastError: null
};

// Make uiState available globally for modules
window.uiState = uiState;

/**
 * Initializes the statistics UI controller using modular components
 */
export function initializeStatisticsUI() {
  
  // Set flag to indicate UI controller is active
  window.statisticsUIControllerActive = true;
  
  // Add dashboard styles
  addFinancialDashboardStyles();
  // DISABLED: addBusinessDashboardStyles();
  
  // Initialize view controllers
  initializeViewControllers();
  
  // Setup UI handlers with callbacks
  setupTabListeners();
  setupFilterControls(uiState, refreshStatistics);
  setupDateRangeControls(uiState, refreshStatistics);
  setupExportControls(handleDataExport);
  
  // Initialize report menu controller
  import('./reportMenuController.js').then(module => {
    if (module.initReportMenu) {
      module.initReportMenu();
    }
  }).catch(error => {
    console.warn("⚠️ Could not load report menu controller:", error);
  });
  
  // Load initial data using modular data processor
  loadStatisticsData(uiState).then(() => {
    refreshStatistics();
  }).catch(error => {
    console.error("❌ Failed to load initial data:", error);
    showErrorMessage("Không thể tải dữ liệu thống kê");
  });
  
  // Expose refresh function for global filters
  window.refreshStatisticsWithFilters = refreshStatisticsWithFilters;
  
}

/**
 * Handles data export using modular data processor
 * @param {string} format - Export format
 */
async function handleDataExport(format) {
  
  try {
    // Use modular data processor for export preparation
    const { getCombinedStatistics } = await import('./statisticsDataManager.js');
    const data = await getCombinedStatistics();
    
    let exportData = [];
    let filename = "statistics";
    
    switch (uiState.currentTab) {
      case "expenses":
        exportData = data.expenses;
        filename = "expense_statistics";
        break;
      case "revenue":
        exportData = data.transactions;
        filename = "revenue_statistics";
        break;
      default:
        // Export combined summary using modular function
        exportData = prepareCombinedExportData(data, uiState);
        filename = "combined_statistics";
    }
    
    await exportData(exportData, format, filename);
    showSuccessMessage(`Đã xuất ${exportData.length} bản ghi thành công`);
    
  } catch (error) {
    console.error("❌ Export failed:", error);
    showErrorMessage("Có lỗi xảy ra khi xuất dữ liệu");
  }
}

// Make handleDataExport available globally for modules
window.handleDataExport = handleDataExport;

/**
 * Refreshes statistics display using modular components
 */
async function refreshStatistics() {
  if (uiState.isLoading) return;
  
  try {
    
    // Check if we're in statistics tab
    const currentTab = document.querySelector(".tab-button.active");
    const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
    
      currentTab: currentTab ? currentTab.dataset.tab : "null",
      isThongKeTab: isThongKeTab,
      shouldRenderEnhanced: isThongKeTab
    
    if (!isThongKeTab) {
      console.log("⏭️ Not in statistics tab, skipping enhanced render");
      return;
    }
    
    const expenseData = window.expenseList || [];
    const transactionData = window.transactionList || [];
    
    // Process data using modular processor
    const processedData = processDataForUI(expenseData, transactionData, uiState);
    
      expenseCount: expenseData.length,
      transactionCount: transactionData.length,
      hasFinancialAnalysis: !!processedData.financialAnalysis
    
    // Render using modular chart renderer
    await renderEnhancedStatistics(
      processedData.expenseData, 
      processedData.transactionData, 
      processedData.financialAnalysis,
      window.globalFilters
    );
    
    // Clear loading state
    uiState.isLoading = false;
    uiState.lastError = null;
    
    
  } catch (error) {
    console.error("❌ Failed to refresh statistics:", error);
    showErrorMessage("Có lỗi xảy ra khi cập nhật thống kê");
  }
}

/**
 * Gets current UI state
 * @returns {Object} - Current UI state
 */
export function getUIState() {
  return { ...uiState };
}

/**
 * Updates UI state
 * @param {Object} newState - New state values
 */
export function updateUIState(newState) {
  Object.assign(uiState, newState);
}

/**
 * Forces refresh of statistics using modular data processor
 */
export async function forceRefresh() {
  
  try {
    const data = await forceRefreshData(uiState);
    
    await refreshStatistics();
    showSuccessMessage("Dữ liệu đã được cập nhật");
    
  } catch (error) {
    console.error("❌ Force refresh failed:", error);
    showErrorMessage("Không thể cập nhật dữ liệu");
  }
}

/**
 * Resets UI to default state using modular UI handlers
 */
export function resetUI() {
  
  uiState.currentTab = "overview";
  uiState.dateRange = "month";
  uiState.currency = "VND";
  uiState.sortBy = "month";
  uiState.sortOrder = "desc";
  uiState.showGrowthRate = false;
  
  // Reset UI controls using modular function
  import('./ui-statistics/uiHandlers.js').then(module => {
    if (module.resetUIControls) {
      module.resetUIControls();
    }
  });
  
  refreshStatistics();
}

/**
 * Refresh statistics với global filters using modular components
 */
async function refreshStatisticsWithFilters(globalFilters) {
  
  try {
    const expenseData = window.expenseList || [];
    const transactionData = window.transactionList || [];
    
    // Filter data using modular processor
    const filteredData = await filterDataByGlobalFilters(expenseData, transactionData, globalFilters);
    
    // Render dashboard using modular chart renderer
    await renderEnhancedStatistics(
      filteredData.expenses, 
      filteredData.transactions, 
      null, 
      globalFilters
    );
    
    console.log("✅ Statistics refreshed with filters using orchestrator");
  } catch (error) {
    console.error("❌ Error refreshing statistics with filters:", error);
  }
}

// Make core functions available globally for legacy compatibility
window.initializeStatisticsUI = initializeStatisticsUI;
window.refreshStatistics = refreshStatistics;
window.refreshStatisticsWithFilters = refreshStatisticsWithFilters;
window.getUIState = getUIState;
window.updateUIState = updateUIState;
window.forceRefresh = forceRefresh;
window.resetUI = resetUI;
