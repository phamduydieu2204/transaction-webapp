/**
 * statisticsUIController.js
 * 
 * Controls UI interactions and state management for statistics tab
 * Handles tab switching, filters, date ranges, and user interactions
 */

import { getCombinedStatistics, exportData, fetchExpenseData } from './statisticsDataManager.js';
import { 
  groupExpensesByMonth, 
  groupRevenueByMonth, 
  calculateFinancialAnalysis,
  calculateTotalExpenses,
  calculateTotalRevenue,
  getDateRange,
  normalizeDate 
} from './statisticsCore.js';
import { 
  renderMonthlySummaryTable, 
  renderFinancialOverview, 
  renderSimpleChart,
  renderExportControls,
  renderLoadingState,
  renderErrorState 
} from './statisticsRenderer.js';
import { renderFinancialDashboard, addFinancialDashboardStyles } from './financialDashboard.js';

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

/**
 * Initializes the statistics UI controller
 */
export function initializeStatisticsUI() {
  console.log("🎮 Initializing statistics UI controller");
  
  // Set flag to indicate UI controller is active
  window.statisticsUIControllerActive = true;
  
  // Add dashboard styles
  addFinancialDashboardStyles();
  
  setupTabListeners();
  setupFilterControls();
  setupDateRangeControls();
  setupExportControls();
  
  // Load initial data
  loadStatisticsData();
  
  // Expose refresh function for global filters
  window.refreshStatisticsWithFilters = refreshStatisticsWithFilters;
  
  console.log("✅ Statistics UI controller initialized");
}

/**
 * Sets up tab switching listeners
 */
function setupTabListeners() {
  // Main tab switching (between nhập giao dịch, chi phí, thống kê)
  const mainTabButtons = document.querySelectorAll('.tab-button');
  mainTabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const tabId = e.target.dataset.tab;
      if (tabId === 'tab-thong-ke') {
        handleStatisticsTabActivation();
      }
    });
  });

  // Sub-tabs within statistics (if any)
  const statsSubTabs = document.querySelectorAll('.stats-sub-tab');
  statsSubTabs.forEach(button => {
    button.addEventListener('click', (e) => {
      const subTab = e.target.dataset.subtab;
      handleSubTabSwitch(subTab);
    });
  });
}

/**
 * Sets up filter control listeners
 */
function setupFilterControls() {
  // Currency filter
  const currencySelect = document.getElementById('statsCurrencyFilter');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      uiState.currency = e.target.value;
      refreshStatistics();
    });
  }

  // Sort controls
  const sortBySelect = document.getElementById('statsSortBy');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      uiState.sortBy = e.target.value;
      refreshStatistics();
    });
  }

  const sortOrderSelect = document.getElementById('statsSortOrder');
  if (sortOrderSelect) {
    sortOrderSelect.addEventListener('change', (e) => {
      uiState.sortOrder = e.target.value;
      refreshStatistics();
    });
  }

  // Growth rate toggle
  const growthToggle = document.getElementById('statsGrowthToggle');
  if (growthToggle) {
    growthToggle.addEventListener('change', (e) => {
      uiState.showGrowthRate = e.target.checked;
      refreshStatistics();
    });
  }
}

/**
 * Sets up date range control listeners
 */
function setupDateRangeControls() {
  // Quick date range buttons
  const dateRangeButtons = document.querySelectorAll('.date-range-btn');
  dateRangeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const range = e.target.dataset.range;
      handleDateRangeChange(range);
      
      // Update active button
      dateRangeButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Custom date range inputs
  const startDateInput = document.getElementById('statsStartDate');
  const endDateInput = document.getElementById('statsEndDate');
  
  if (startDateInput && endDateInput) {
    const handleCustomDateChange = () => {
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
      
      if (startDate && endDate) {
        uiState.dateRange = { start: startDate, end: endDate };
        refreshStatistics();
      }
    };

    startDateInput.addEventListener('change', handleCustomDateChange);
    endDateInput.addEventListener('change', handleCustomDateChange);
  }
}

/**
 * Sets up export control listeners
 */
function setupExportControls() {
  renderExportControls({
    containerId: "statisticsExportControls",
    formats: ["csv", "json"],
    onExport: handleDataExport
  });
}

/**
 * Handles main statistics tab activation
 */
function handleStatisticsTabActivation() {
  console.log("📊 Statistics tab activated");
  
  // ✅ DEBUG: Check initial state
  const currentTab = document.querySelector(".tab-button.active");
  const tabContent = document.getElementById("tab-thong-ke");
  const tabContentStyle = tabContent ? window.getComputedStyle(tabContent) : null;
  
  console.log("🔍 DEBUG handleStatisticsTabActivation initial state:", {
    currentTab: currentTab ? currentTab.dataset.tab : "null",
    tabContent: tabContent ? "found" : "null",
    tabDisplay: tabContentStyle ? tabContentStyle.display : "unknown",
    windowExpenseList: window.expenseList ? window.expenseList.length : "null"
  });
  
  // Wait for tab to be fully displayed before rendering
  setTimeout(() => {
    // ✅ DEBUG: Check state after timeout
    const currentTabAfter = document.querySelector(".tab-button.active");
    const tabContentAfter = document.getElementById("tab-thong-ke");
    const tabContentStyleAfter = tabContentAfter ? window.getComputedStyle(tabContentAfter) : null;
    
    console.log("🔍 DEBUG handleStatisticsTabActivation after timeout:", {
      currentTab: currentTabAfter ? currentTabAfter.dataset.tab : "null",
      tabContent: tabContentAfter ? "found" : "null",
      tabDisplay: tabContentStyleAfter ? tabContentStyleAfter.display : "unknown",
      tableExists: document.querySelector("#monthlySummaryTable") ? "found" : "null",
      tbodyExists: document.querySelector("#monthlySummaryTable tbody") ? "found" : "null"
    });
    
    // Check if we need to refresh data
    if (!window.expenseList || window.expenseList.length === 0) {
      console.log("🔄 Loading statistics data (no existing data)");
      loadStatisticsData();
    } else {
      console.log("🔄 Refreshing statistics (using existing data)");
      refreshStatistics();
    }
    
    // Render any pending data that was stored
    if (window.pendingStatsData && window.pendingStatsOptions) {
      console.log("📊 Rendering pending statistics data...");
      renderMonthlySummaryTable(window.pendingStatsData, window.pendingStatsOptions);
      window.pendingStatsData = null;
      window.pendingStatsOptions = null;
    }
  }, 200); // Increased delay to ensure tab is visible
}

/**
 * Handles sub-tab switching within statistics
 * @param {string} subTab - Sub-tab identifier
 */
function handleSubTabSwitch(subTab) {
  console.log("🔄 Switching to sub-tab:", subTab);
  
  uiState.currentTab = subTab;
  
  // Hide all sub-tab content
  const subTabContents = document.querySelectorAll('.stats-sub-content');
  subTabContents.forEach(content => content.style.display = 'none');
  
  // Show selected sub-tab content
  const selectedContent = document.getElementById(`stats-${subTab}`);
  if (selectedContent) {
    selectedContent.style.display = 'block';
  }
  
  // Update active sub-tab button
  const subTabButtons = document.querySelectorAll('.stats-sub-tab');
  subTabButtons.forEach(btn => btn.classList.remove('active'));
  
  const activeButton = document.querySelector(`[data-subtab="${subTab}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  refreshStatistics();
}

/**
 * Handles date range changes
 * @param {string} range - Date range type
 */
function handleDateRangeChange(range) {
  console.log("📅 Date range changed to:", range);
  
  uiState.dateRange = range;
  refreshStatistics();
}

/**
 * Handles data export
 * @param {string} format - Export format
 */
async function handleDataExport(format) {
  console.log("📤 Exporting data in format:", format);
  
  try {
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
        // Export combined summary
        exportData = prepareCombinedExportData(data);
        filename = "combined_statistics";
    }
    
    await exportData(exportData, format, filename);
    showSuccessMessage(`Đã xuất ${exportData.length} bản ghi thành công`);
    
  } catch (error) {
    console.error("❌ Export failed:", error);
    showErrorMessage("Có lỗi xảy ra khi xuất dữ liệu");
  }
}

/**
 * Prepares combined data for export
 * @param {Object} data - Combined statistics data
 * @returns {Array} - Formatted export data
 */
function prepareCombinedExportData(data) {
  const combined = [];
  
  // Add expense summary
  const expenseSummary = groupExpensesByMonth(data.expenses, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  expenseSummary.forEach(item => {
    combined.push({
      type: "Expense",
      month: item.month,
      category: item.type,
      amount: item.amount,
      currency: uiState.currency
    });
  });
  
  // Add revenue summary
  const revenueSummary = groupRevenueByMonth(data.transactions, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  revenueSummary.forEach(item => {
    combined.push({
      type: "Revenue",
      month: item.month,
      category: item.software,
      amount: item.amount,
      currency: uiState.currency
    });
  });
  
  return combined;
}

/**
 * Loads initial statistics data
 */
async function loadStatisticsData() {
  if (uiState.isLoading) return;
  
  uiState.isLoading = true;
  uiState.lastError = null;
  
  // Show loading state
  renderLoadingState("monthlySummaryTable");
  
  try {
    console.log("🔄 Loading statistics data...");
    
    // Get expense data and create combined data structure
    const expenseData = await fetchExpenseData({ forceRefresh: false });
    
    // For now, use existing transaction data from window.transactionList
    // TODO: Implement proper transaction API when ready
    const transactionData = window.transactionList || [];
    
    const data = {
      expenses: expenseData,
      transactions: transactionData,
      timestamp: Date.now()
    };
    
    console.log("📊 Combined data prepared:", {
      expenses: data.expenses.length,
      transactions: data.transactions.length
    });
    
    // Store in global variables for compatibility
    window.expenseList = data.expenses;
    window.transactionList = data.transactions;
    
    console.log("🎯 About to call refreshStatistics from loadStatisticsData");
    await refreshStatistics();
    
    // ✅ DEBUG: Check data loading completion
    const dataLoadState = {
      expenseCount: data.expenses ? data.expenses.length : 0,
      transactionCount: data.transactions ? data.transactions.length : 0,
      windowExpenseList: window.expenseList ? window.expenseList.length : 0,
      windowTransactionList: window.transactionList ? window.transactionList.length : 0,
      isLoadingFlag: uiState.isLoading
    };
    
    console.log("🔍 DEBUG data loading state:", dataLoadState);
    
    console.log("✅ Statistics data loaded successfully");
    
  } catch (error) {
    console.error("❌ Failed to load statistics data:", error);
    uiState.lastError = error.message;
    renderErrorState("monthlySummaryTable", error.message);
    showErrorMessage("Không thể tải dữ liệu thống kê");
  } finally {
    uiState.isLoading = false;
    
    // ✅ DEBUG: Ensure any processing modals are closed
    if (typeof window.closeProcessingModal === 'function') {
      console.log("🚫 Force closing any processing modals");
      window.closeProcessingModal();
    }
    
    // Check for any modal elements that might be stuck
    const modalElements = [
      document.querySelector('#processingModal'),
      document.querySelector('.modal'),
      document.querySelector('[class*="modal"]'),
      document.querySelector('#loading-modal')
    ].filter(el => el !== null);
    
    console.log("🔍 DEBUG modal elements:", {
      foundModals: modalElements.length,
      modals: modalElements.map(el => ({
        id: el.id,
        className: el.className,
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility
      }))
    });
    
    // Force hide any visible modals
    modalElements.forEach(el => {
      if (window.getComputedStyle(el).display !== 'none') {
        console.log(`🚫 Force hiding modal:`, el.id || el.className);
        el.style.display = 'none';
      }
    });
  }
}

/**
 * Refreshes statistics display
 */
async function refreshStatistics() {
  if (uiState.isLoading) return;
  
  try {
    console.log("🔄 Refreshing statistics display...");
    
    // ✅ DEBUG: Check if we're in statistics tab
    const currentTab = document.querySelector(".tab-button.active");
    const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
    
    console.log("🔍 DEBUG refreshStatistics:", {
      currentTab: currentTab ? currentTab.dataset.tab : "null",
      isThongKeTab: isThongKeTab,
      shouldRenderEnhanced: isThongKeTab
    });
    
    if (!isThongKeTab) {
      console.log("⏭️ Not in statistics tab, skipping enhanced render");
      return;
    }
    
    const expenseData = window.expenseList || [];
    const transactionData = window.transactionList || [];
    
    // Calculate date range
    let dateRangeFilter = null;
    if (typeof uiState.dateRange === 'string') {
      dateRangeFilter = getDateRange(uiState.dateRange);
    } else if (uiState.dateRange && uiState.dateRange.start && uiState.dateRange.end) {
      dateRangeFilter = uiState.dateRange;
    }
    
    // Calculate totals
    const expenseTotals = calculateTotalExpenses(expenseData, {
      currency: uiState.currency,
      dateRange: dateRangeFilter
    });
    
    const revenueTotals = calculateTotalRevenue(transactionData, {
      currency: uiState.currency,
      dateRange: dateRangeFilter
    });
    
    // Calculate financial analysis
    const financialAnalysis = calculateFinancialAnalysis(revenueTotals, expenseTotals);
    
    // Render based on current tab with enhanced features
    console.log("🎯 About to call renderEnhancedStatistics with data:", {
      expenseCount: expenseData.length,
      transactionCount: transactionData.length,
      hasFinancialAnalysis: !!financialAnalysis
    });
    
    await renderEnhancedStatistics(expenseData, transactionData, financialAnalysis);
    
    // ✅ DEBUG: Check final UI state and loading indicators
    const finalUIState = {
      isLoading: uiState.isLoading,
      lastError: uiState.lastError,
      tabVisible: document.getElementById("tab-thong-ke") ? 
        window.getComputedStyle(document.getElementById("tab-thong-ke")).display : "unknown",
      tableVisible: document.querySelector("#monthlySummaryTable tbody") ? "found" : "null",
      loadingElements: document.querySelectorAll('[class*="loading"], [class*="spinner"]').length
    };
    
    console.log("🔍 DEBUG final UI state:", finalUIState);
    
    // Ensure loading state is cleared
    uiState.isLoading = false;
    uiState.lastError = null;
    
    console.log("✅ Statistics refreshed successfully");
    
  } catch (error) {
    console.error("❌ Failed to refresh statistics:", error);
    showErrorMessage("Có lỗi xảy ra khi cập nhật thống kê");
  }
}

/**
 * Renders overview tab content
 */
async function renderOverviewTab(expenseData, transactionData, financialAnalysis) {
  // Render financial overview
  renderFinancialOverview(financialAnalysis, {
    containerId: "financialOverview",
    showDetails: true
  });
  
  // Render summary chart
  const chartData = groupExpensesByMonth(expenseData, {
    currency: uiState.currency,
    sortBy: "month",
    sortOrder: "desc"
  }).slice(0, 12); // Last 12 months
  
  renderSimpleChart(chartData, {
    containerId: "overviewChart",
    chartType: "bar",
    title: "Chi Phí Theo Tháng",
    xLabel: "Tháng",
    yLabel: "Số Tiền (VND)"
  });
}

/**
 * Renders expenses tab content
 */
async function renderExpensesTab(expenseData) {
  const summaryData = groupExpensesByMonth(expenseData, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  renderMonthlySummaryTable(summaryData, {
    tableId: "monthlySummaryTable",
    showGrowthRate: uiState.showGrowthRate
  });
}

/**
 * Renders revenue tab content
 */
async function renderRevenueTab(transactionData) {
  const summaryData = groupRevenueByMonth(transactionData, {
    currency: uiState.currency,
    sortBy: uiState.sortBy,
    sortOrder: uiState.sortOrder
  });
  
  // Convert to expense table format for compatibility
  const expenseFormatData = summaryData.map(item => ({
    month: item.month,
    type: item.software,
    amount: item.amount
  }));
  
  renderMonthlySummaryTable(expenseFormatData, {
    tableId: "monthlySummaryTable",
    showGrowthRate: uiState.showGrowthRate
  });
}

/**
 * Renders enhanced statistics with all features
 */
async function renderEnhancedStatistics(expenseData, transactionData, financialAnalysis, globalFilters = null) {
  try {
    console.log("🎨 Rendering enhanced statistics dashboard...");
    
    // Use saved filters if no filters provided
    if (!globalFilters && window.globalFilters) {
      globalFilters = window.globalFilters;
    }
    
    // Apply filters to data if available
    let filteredExpenseData = expenseData;
    let filteredTransactionData = transactionData;
    
    if (globalFilters && globalFilters.dateRange) {
      // Import filter function from financialDashboard.js
      const { filterDataByDateRange } = await import('./financialDashboard.js');
      
      console.log("🔍 Before filtering - data overview:", {
        expenseData: expenseData.length,
        transactionData: transactionData.length,
        dateRange: globalFilters.dateRange
      });
      
      filteredExpenseData = filterDataByDateRange(expenseData, globalFilters.dateRange);
      filteredTransactionData = filterDataByDateRange(transactionData, globalFilters.dateRange);
      
      console.log("✅ After filtering:", {
        originalExpenses: expenseData.length,
        filteredExpenses: filteredExpenseData.length,
        originalTransactions: transactionData.length,
        filteredTransactions: filteredTransactionData.length
      });
    }
    
    // 1. Render NEW Financial Dashboard với global filters
    renderFinancialDashboard(transactionData, expenseData, {
      containerId: "financialDashboard",
      showAlerts: true,
      showForecast: true,
      globalFilters: globalFilters
    });
    console.log("✅ Financial Dashboard rendered");
    
    // 2. Render Expense Chart với filtered data
    const chartData = groupExpensesByMonth(filteredExpenseData, {
      currency: uiState.currency,
      sortBy: "month",
      sortOrder: "desc"
    }).slice(0, 12); // Last 12 months
    
    renderSimpleChart(chartData, {
      containerId: "overviewChart",
      chartType: "bar",
      title: "Chi Phí Theo Tháng (12 tháng gần nhất)",
      xLabel: "Tháng",
      yLabel: "Số Tiền (VND)",
      maxBars: 12
    });
    console.log("✅ Expense chart rendered");
    
    // 3. Render Export Controls
    renderExportControls({
      containerId: "statisticsExportControls",
      formats: ["csv", "json"],
      onExport: handleDataExport
    });
    console.log("✅ Export controls rendered");
    
    // 4. Render Monthly Summary Table với filtered data
    const summaryData = groupExpensesByMonth(filteredExpenseData, {
      currency: uiState.currency,
      sortBy: uiState.sortBy,
      sortOrder: uiState.sortOrder
    });
    
    renderMonthlySummaryTable(summaryData, {
      tableId: "monthlySummaryTable",
      showGrowthRate: false
    });
    console.log("✅ Monthly summary table rendered");
    
    console.log("🎉 Enhanced statistics dashboard complete!");
    
  } catch (error) {
    console.error("❌ Error rendering enhanced statistics:", error);
    // Fallback to simple table
    await renderDefaultTab(expenseData, financialAnalysis);
  }
}

/**
 * Renders default tab content (backward compatibility)
 */
async function renderDefaultTab(expenseData, financialAnalysis) {
  try {
    const summaryData = groupExpensesByMonth(expenseData, {
      currency: uiState.currency,
      sortBy: uiState.sortBy,
      sortOrder: uiState.sortOrder
    });
    
    renderMonthlySummaryTable(summaryData, {
      tableId: "monthlySummaryTable",
      showGrowthRate: false
    });
  } catch (error) {
    console.error("❌ Error rendering default tab:", error);
    // Fallback - just show basic message
    const table = document.querySelector("#monthlySummaryTable tbody");
    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: #666;">
            Đang cập nhật dữ liệu thống kê...
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Shows success message to user
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = 'success';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  console.log("✅ Success:", message);
}

/**
 * Shows error message to user
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = 'error';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
  
  console.error("❌ Error:", message);
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
  console.log("🎮 UI state updated:", uiState);
}

/**
 * Forces refresh of statistics
 */
export async function forceRefresh() {
  console.log("🔄 Forcing statistics refresh...");
  
  try {
    const data = await getCombinedStatistics({ forceRefresh: true });
    window.expenseList = data.expenses;
    window.transactionList = data.transactions;
    
    await refreshStatistics();
    showSuccessMessage("Dữ liệu đã được cập nhật");
    
  } catch (error) {
    console.error("❌ Force refresh failed:", error);
    showErrorMessage("Không thể cập nhật dữ liệu");
  }
}

/**
 * Resets UI to default state
 */
export function resetUI() {
  console.log("🔄 Resetting statistics UI...");
  
  uiState.currentTab = "overview";
  uiState.dateRange = "month";
  uiState.currency = "VND";
  uiState.sortBy = "month";
  uiState.sortOrder = "desc";
  uiState.showGrowthRate = false;
  
  // Reset form controls
  const currencySelect = document.getElementById('statsCurrencyFilter');
  if (currencySelect) currencySelect.value = "VND";
  
  const sortBySelect = document.getElementById('statsSortBy');
  if (sortBySelect) sortBySelect.value = "month";
  
  const sortOrderSelect = document.getElementById('statsSortOrder');
  if (sortOrderSelect) sortOrderSelect.value = "desc";
  
  const growthToggle = document.getElementById('statsGrowthToggle');
  if (growthToggle) growthToggle.checked = false;
  
  refreshStatistics();
}

/**
 * Refresh statistics với global filters
 */
async function refreshStatisticsWithFilters(globalFilters) {
  console.log("🔄 Refreshing statistics with global filters:", globalFilters);
  
  try {
    const expenseData = window.expenseList || [];
    const transactionData = window.transactionList || [];
    
    // Render dashboard với global filters
    await renderEnhancedStatistics(expenseData, transactionData, null, globalFilters);
    
    console.log("✅ Statistics refreshed with filters");
  } catch (error) {
    console.error("❌ Error refreshing statistics with filters:", error);
  }
}