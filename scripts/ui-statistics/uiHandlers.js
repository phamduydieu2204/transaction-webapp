/**
 * uiHandlers.js
 * 
 * UI event handlers, form validation và input processing
 * Handles tab switching, form inputs, user interactions
 */


/**
 * Sets up tab switching listeners
 */
export function setupTabListeners() {
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
export function setupFilterControls(uiState, refreshCallback) {
  // Currency filter
  const currencySelect = document.getElementById('statsCurrencyFilter');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      uiState.currency = e.target.value;
      refreshCallback();
    });
  }

  // Sort controls
  const sortBySelect = document.getElementById('statsSortBy');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      uiState.sortBy = e.target.value;
      refreshCallback();
    });
  }

  const sortOrderSelect = document.getElementById('statsSortOrder');
  if (sortOrderSelect) {
    sortOrderSelect.addEventListener('change', (e) => {
      uiState.sortOrder = e.target.value;
      refreshCallback();
    });
  }

  // Growth rate toggle
  const growthToggle = document.getElementById('statsGrowthToggle');
  if (growthToggle) {
    growthToggle.addEventListener('change', (e) => {
      uiState.showGrowthRate = e.target.checked;
      refreshCallback();
    });
  }
}

/**
 * Sets up date range control listeners
 */
export function setupDateRangeControls(uiState, refreshCallback) {
  // Quick date range buttons
  const dateRangeButtons = document.querySelectorAll('.date-range-btn');
  dateRangeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const range = e.target.dataset.range;
      handleDateRangeChange(range, uiState, refreshCallback);
      
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
        refreshCallback();
      }
    };

    startDateInput.addEventListener('change', handleCustomDateChange);
    endDateInput.addEventListener('change', handleCustomDateChange);
  }
}

/**
 * Sets up export control listeners
 */
export function setupExportControls(exportHandler) {
  const { renderExportControls } = import('./statisticsRenderer.js');
  
  renderExportControls({
    containerId: "statisticsExportControls",
    formats: ["csv", "json"],
    onExport: exportHandler
  });
}

/**
 * Handles main statistics tab activation
 */
export function handleStatisticsTabActivation() {
  
  // ✅ DEBUG: Check initial state
  const currentTab = document.querySelector(".tab-button.active");
  const tabContent = document.getElementById("tab-thong-ke");
  const tabContentStyle = tabContent ? window.getComputedStyle(tabContent) : null;
  
    currentTab: currentTab ? currentTab.dataset.tab : "null",
    tabContent: tabContent ? "found" : "null",
    tabDisplay: tabContentStyle ? tabContentStyle.display : "unknown",
    windowExpenseList: window.expenseList ? window.expenseList.length : "null"
  
  // Import required functions
  return import('../statisticsUIController.js').then(module => {
    // Wait for tab to be fully displayed before rendering
    setTimeout(() => {
      // ✅ DEBUG: Check state after timeout
      const currentTabAfter = document.querySelector(".tab-button.active");
      const tabContentAfter = document.getElementById("tab-thong-ke");
      const tabContentStyleAfter = tabContentAfter ? window.getComputedStyle(tabContentAfter) : null;
      
        currentTab: currentTabAfter ? currentTabAfter.dataset.tab : "null",
        tabContent: tabContentAfter ? "found" : "null",
        tabDisplay: tabContentStyleAfter ? tabContentStyleAfter.display : "unknown",
        tableExists: document.querySelector("#monthlySummaryTable") ? "found" : "null",
        tbodyExists: document.querySelector("#monthlySummaryTable tbody") ? "found" : "null"
      
      // Check if we need to refresh data
      if (!window.expenseList || window.expenseList.length === 0) {
        if (module.loadStatisticsData) {
          module.loadStatisticsData();
        }
      } else {
        if (module.refreshStatistics) {
          module.refreshStatistics();
        }
      }
      
      // Render any pending data that was stored
      if (window.pendingStatsData && window.pendingStatsOptions) {
        const { renderMonthlySummaryTable } = import('./statisticsRenderer.js');
        renderMonthlySummaryTable(window.pendingStatsData, window.pendingStatsOptions);
        window.pendingStatsData = null;
        window.pendingStatsOptions = null;
      }
    }, 200); // Increased delay to ensure tab is visible
  });
}

/**
 * Handles sub-tab switching within statistics
 * @param {string} subTab - Sub-tab identifier
 */
export function handleSubTabSwitch(subTab, uiState, refreshCallback) {
  
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
  
  refreshCallback();
}

/**
 * Handles date range changes
 * @param {string} range - Date range type
 */
export function handleDateRangeChange(range, uiState, refreshCallback) {
  
  uiState.dateRange = range;
  refreshCallback();
}

/**
 * Reset UI form controls to default state
 */
export function resetUIControls() {
  
  // Reset form controls
  const currencySelect = document.getElementById('statsCurrencyFilter');
  if (currencySelect) currencySelect.value = "VND";
  
  const sortBySelect = document.getElementById('statsSortBy');
  if (sortBySelect) sortBySelect.value = "month";
  
  const sortOrderSelect = document.getElementById('statsSortOrder');
  if (sortOrderSelect) sortOrderSelect.value = "desc";
  
  const growthToggle = document.getElementById('statsGrowthToggle');
  if (growthToggle) growthToggle.checked = false;
}

/**
 * Validate form inputs
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result
 */
export function validateFormInputs(formData) {
  const errors = [];
  
  // Validate date range
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (start > end) {
      errors.push("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
    }
    
    if (start > new Date()) {
      errors.push("Ngày bắt đầu không thể là tương lai");
    }
  }
  
  // Validate currency
  const validCurrencies = ['VND', 'USD', 'EUR'];
  if (formData.currency && !validCurrencies.includes(formData.currency)) {
    errors.push("Loại tiền tệ không hợp lệ");
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Process user input and sanitize
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
export function processUserInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove dangerous characters
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>&"'/]/g, '') // Remove dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Handle keyboard shortcuts
 * @param {Event} event - Keyboard event
 */
export function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + R: Refresh statistics
  if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
    event.preventDefault();
    if (window.refreshStatistics) {
      window.refreshStatistics();
    }
  }
  
  // Ctrl/Cmd + E: Export data
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault();
    // Trigger export dialog
    const exportButton = document.querySelector('[data-action="export"]');
    if (exportButton) {
      exportButton.click();
    }
  }
}

// Setup keyboard shortcuts on module load
document.addEventListener('keydown', handleKeyboardShortcuts);

// Make functions available globally for legacy compatibility  
window.setupTabListeners = setupTabListeners;
window.setupFilterControls = setupFilterControls;
window.handleStatisticsTabActivation = handleStatisticsTabActivation;
