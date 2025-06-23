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
    formats: ["csv", "json"]
  });

  });
}

/**
 * Handles main statistics tab activation
 */
  // Import required functions
  });

      // Check if we need to refresh data
  };
}

/**
 * Process user input and sanitize
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
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
