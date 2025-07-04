/**
 * eventManager.js
 * 
 * Event management and handling system
 * Manages event listeners, form handlers, and UI interactions
 */

// Import event handlers
import { handleReset } from '../handleReset.js';
import { handleAdd } from '../handleAdd.js';
import { handleUpdate } from '../handleUpdate.js';
import { handleSearch } from '../handleSearch.js';
import { handleAddExpense } from '../handleAddExpense.js';
import { handleUpdateExpense } from '../handleUpdateExpense.js';
import { handleSearchExpense } from '../handleSearchExpense.js';
import { handleResetExpense } from '../handleResetExpense.js';
import { logout } from '../logout.js';
import { openCalendar } from '../openCalendar.js';
import { updateCustomerInfo } from '../updateCustomerInfo.js';
import { updatePackageList } from '../updatePackageList.js';
import { copyToClipboard } from '../copyToClipboard.js';
import { closeModal } from '../closeModal.js';
import { firstPage, prevPage, nextPage, lastPage, goToPage } from '../pagination.js';

/**
 * Event listener registry for cleanup
 */
const eventListeners = new Map();

/**
 * Add event listener with cleanup tracking
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
function addTrackedEventListener(element, event, handler, options = {}) {
  element.addEventListener(event, handler, options);
  
  // Store for cleanup
  const key = `${element.id || element.className}-${event}`;
  if (!eventListeners.has(key)) {
    eventListeners.set(key, []);
  }
  eventListeners.get(key).push({ element, event, handler, options });
}

/**
 * Setup form event handlers
 */
export function setupFormHandlers() {
  // console.log('🎯 Setting up form handlers...');

  // Transaction form handlers
  setupTransactionFormHandlers();
  
  // Expense form handlers
  setupExpenseFormHandlers();
  
  // Global form handlers
  setupGlobalFormHandlers();
  
  // console.log('✅ Form handlers setup complete');
}

/**
 * Setup transaction form event handlers
 */
function setupTransactionFormHandlers() {
  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    addTrackedEventListener(resetBtn, 'click', handleReset);
  }

  // Add button
  const addBtn = document.getElementById('addBtn');
  if (addBtn) {
    addTrackedEventListener(addBtn, 'click', handleAdd);
  }

  // Update button
  const updateBtn = document.getElementById('updateBtn');
  if (updateBtn) {
    addTrackedEventListener(updateBtn, 'click', handleUpdate);
  }

  // Search button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    addTrackedEventListener(searchBtn, 'click', handleSearch);
  }

  // Software select change handler
  const softwareSelect = document.getElementById('software');
  if (softwareSelect) {
    addTrackedEventListener(softwareSelect, 'change', function() {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption && selectedOption.dataset.packages) {
        updatePackageList(selectedOption.dataset.packages);
      }
    });
  }

  // Customer input change handler
  const customerInput = document.getElementById('customer');
  if (customerInput) {
    addTrackedEventListener(customerInput, 'input', function() {
      updateCustomerInfo(this.value);
    });
  }

  // Date input handlers
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput) {
    addTrackedEventListener(startDateInput, 'click', () => openCalendar('startDate'));
  }
  
  if (endDateInput) {
    addTrackedEventListener(endDateInput, 'click', () => openCalendar('endDate'));
  }
}

/**
 * Setup expense form event handlers
 */
function setupExpenseFormHandlers() {
  // Expense add button
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  if (addExpenseBtn) {
    addTrackedEventListener(addExpenseBtn, 'click', handleAddExpense);
  }

  // Expense update button
  const updateExpenseBtn = document.getElementById('updateExpenseBtn');
  if (updateExpenseBtn) {
    addTrackedEventListener(updateExpenseBtn, 'click', handleUpdateExpense);
  }

  // Expense search button
  const searchExpenseBtn = document.getElementById('searchExpenseBtn');
  if (searchExpenseBtn) {
    addTrackedEventListener(searchExpenseBtn, 'click', handleSearchExpense);
  }

  // Expense reset button
  const resetExpenseBtn = document.getElementById('resetExpenseBtn');
  if (resetExpenseBtn) {
    addTrackedEventListener(resetExpenseBtn, 'click', handleResetExpense);
  }
}

/**
 * Setup global form handlers
 */
function setupGlobalFormHandlers() {
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    addTrackedEventListener(logoutBtn, 'click', logout);
  }

  // Close modal buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    addTrackedEventListener(btn, 'click', closeModal);
  });

  // Copy to clipboard buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    addTrackedEventListener(btn, 'click', function() {
      const textToCopy = this.dataset.text || this.previousElementSibling?.textContent;
      if (textToCopy) {
        copyToClipboard(textToCopy);
      }
    });
  });
}

/**
 * Setup pagination event handlers
 */
export function setupPaginationHandlers() {
  // console.log('📄 Setting up pagination handlers...');

  // First page button
  const firstPageBtn = document.getElementById('firstPage');
  if (firstPageBtn) {
    addTrackedEventListener(firstPageBtn, 'click', firstPage);
  }

  // Previous page button
  const prevPageBtn = document.getElementById('prevPage');
  if (prevPageBtn) {
    addTrackedEventListener(prevPageBtn, 'click', prevPage);
  }

  // Next page button
  const nextPageBtn = document.getElementById('nextPage');
  if (nextPageBtn) {
    addTrackedEventListener(nextPageBtn, 'click', nextPage);
  }

  // Last page button
  const lastPageBtn = document.getElementById('lastPage');
  if (lastPageBtn) {
    addTrackedEventListener(lastPageBtn, 'click', lastPage);
  }

  // Page input handler
  const pageInput = document.getElementById('pageInput');
  if (pageInput) {
    addTrackedEventListener(pageInput, 'keypress', function(e) {
      if (e.key === 'Enter') {
        const page = parseInt(this.value);
        if (page && page > 0) {
          goToPage(page);
        }
      }
    });
  }

  // console.log('✅ Pagination handlers setup complete');
}

/**
 * Setup keyboard shortcuts
 */
export function setupKeyboardShortcuts() {
  // console.log('⌨️ Setting up keyboard shortcuts...');

  addTrackedEventListener(document, 'keydown', function(e) {
    // Ctrl/Cmd + S for save/add
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      
      // Check which tab is active
      const activeTab = document.querySelector('.tab-button.active');
      if (activeTab) {
        const tabName = activeTab.dataset.tab;
        
        switch (tabName) {
          case 'giao-dich':
            handleAdd();
            break;
          case 'chi-phi':
            handleAddExpense();
            break;
        }
      }
    }
    
    // Ctrl/Cmd + R for reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      
      const activeTab = document.querySelector('.tab-button.active');
      if (activeTab) {
        const tabName = activeTab.dataset.tab;
        
        switch (tabName) {
          case 'giao-dich':
            handleReset();
            break;
          case 'chi-phi':
            handleResetExpense();
            break;
        }
      }
    }
    
    // Escape key for closing modals
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // console.log('✅ Keyboard shortcuts setup complete');
}

/**
 * Setup modal event handlers
 */
export function setupModalHandlers() {
  // console.log('🔔 Setting up modal handlers...');

  // Click outside modal to close
  addTrackedEventListener(document, 'click', function(e) {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  });

  // Modal form submissions
  document.querySelectorAll('.modal form').forEach(form => {
    addTrackedEventListener(form, 'submit', function(e) {
      e.preventDefault();
      // Handle form submission based on modal type
      const modalId = this.closest('.modal')?.id;
      
      switch (modalId) {
        case 'addOrUpdateModal':
          // Handle add/update modal submission
          break;
        case 'changePasswordModal':
          // Handle password change submission
          break;
      }
    });
  });

  // console.log('✅ Modal handlers setup complete');
}

/**
 * Setup responsive handlers
 */
export function setupResponsiveHandlers() {
  // console.log('📱 Setting up responsive handlers...');

  // Window resize handler
  let resizeTimeout;
  addTrackedEventListener(window, 'resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Handle responsive layout changes
      handleResponsiveLayout();
    }, 250);
  });

  // Initial responsive setup
  handleResponsiveLayout();

  // console.log('✅ Responsive handlers setup complete');
}

/**
 * Handle responsive layout changes
 */
function handleResponsiveLayout() {
  const isMobile = window.innerWidth <= 768;
  
  // Adjust table display for mobile
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    if (isMobile) {
      table.classList.add('mobile-table');
    } else {
      table.classList.remove('mobile-table');
    }
  });
  
  // Adjust pagination for mobile
  const pagination = document.querySelector('.pagination');
  if (pagination) {
    if (isMobile) {
      pagination.classList.add('mobile-pagination');
    } else {
      pagination.classList.remove('mobile-pagination');
    }
  }
}

/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring() {
  if (window.DEBUG) {
    // console.log('📊 Setting up performance monitoring...');

    // Monitor long-running operations
    addTrackedEventListener(document, 'click', function(e) {
      const startTime = performance.now();
      
      setTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 1000) { // Log operations taking more than 1 second
          console.warn(`⚠️ Slow operation detected: ${duration}ms`, e.target);
        }
      }, 0);
    });

    // console.log('✅ Performance monitoring setup complete');
  }
}

/**
 * Initialize all event handlers
 */
export function initializeEventHandlers() {
  // console.log('🎯 Initializing event handlers...');

  try {
    setupFormHandlers();
    setupPaginationHandlers();
    setupKeyboardShortcuts();
    setupModalHandlers();
    setupResponsiveHandlers();
    setupPerformanceMonitoring();
    
    // console.log('✅ All event handlers initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing event handlers:', error);
    return false;
  }
}

/**
 * Cleanup all event listeners
 */
export function cleanupEventHandlers() {
  console.log('🧹 Cleaning up event handlers...');

  eventListeners.forEach((listeners, key) => {
    listeners.forEach(({ element, event, handler, options }) => {
      try {
        element.removeEventListener(event, handler, options);
      } catch (error) {
        console.warn(`⚠️ Could not remove event listener for ${key}:`, error);
      }
    });
  });

  eventListeners.clear();
  
  // console.log('✅ Event handlers cleanup complete');
}

// Make functions globally available for backward compatibility
if (typeof window !== 'undefined') {
  window.setupFormHandlers = setupFormHandlers;
  window.setupPaginationHandlers = setupPaginationHandlers;
  window.cleanupEventHandlers = cleanupEventHandlers;
}