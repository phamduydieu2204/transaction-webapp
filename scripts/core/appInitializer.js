/**
 * appInitializer.js
 * 
 * Application initialization and setup
 * Handles app startup, data loading, and global configuration
 */

// Import core dependencies
import { getConstants } from '../constants.js';
import { updateAccountList } from '../updateAccountList.js';
import { updatePackageList } from '../updatePackageList.js';
import { fetchSoftwareList } from '../fetchSoftwareList.js';
import { loadTransactions, loadTransactionsOptimized } from '../loadTransactions.js';
import { ultraFastInit, shouldUseUltraFast } from './ultraFastInit.js';
import { updateTable } from '../updateTableUltraFast.js';
import { formatDate } from '../formatDate.js';
import { editTransaction } from '../editTransaction.js';
import { deleteTransaction } from '../deleteTransaction.js';
import { viewTransaction } from '../viewTransaction.js';
import { initExpenseDropdowns } from '../initExpenseDropdowns.js';
import { renderExpenseStats } from '../renderExpenseStats.js';
import { initTotalDisplay } from '../updateTotalDisplay.js';
import { initExpenseQuickSearch } from '../expenseQuickSearch.js';

/**
 * Initialize global variables and state
 */
export function initializeGlobals() {
  // Core state variables
  window.userInfo = null;
  window.currentEditIndex = -1;
  window.currentEditTransactionId = null;
  window.transactionList = [];
  window.today = new Date();
  window.todayFormatted = `${window.today.getFullYear()}/${String(window.today.getMonth() + 1).padStart(2, '0')}/${String(window.today.getDate()).padStart(2, '0')}`;
  window.currentPage = 1;
  window.itemsPerPage = 10; // Đồng bộ với yêu cầu: 10 items/trang cho cả transaction và expense
  window.softwareData = [];
  window.confirmCallback = null;
  window.currentSoftwareName = "";
  window.currentSoftwarePackage = "";
  window.currentAccountName = "";
  window.isExpenseSearching = false;
  window.expenseList = [];
}

/**
 * Load and validate user information from localStorage
 * @returns {boolean} True if user is authenticated
 */
export function loadUserInfo() {
  const userData = localStorage.getItem("employeeInfo");
  
  try {
    window.userInfo = userData ? JSON.parse(userData) : null;
  } catch (e) {
    window.userInfo = null;
  }

  if (!window.userInfo) {
    return false;
  }

  return true;
}

/**
 * Initialize user interface elements
 */
export function initializeUI() {
  // Display user welcome message
  const userWelcomeElement = document.getElementById("userWelcome");
  if (userWelcomeElement && window.userInfo) {
    userWelcomeElement.textContent = 
      `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;
  }

  // Initialize total display system
  initTotalDisplay();
}

/**
 * Load initial data for the application
 */
export async function loadInitialData() {
  try {
    // Check if we should use ultra-fast mode
    if (shouldUseUltraFast()) {
      const success = await ultraFastInit(window.userInfo);
      if (success) {
        return;
      }
    }

    // Phase 1: Critical data only (parallel loading)
    const softwareDataPromise = loadSoftwareData();
    
    // Wait for software data (needed for dropdowns)
    await softwareDataPromise;
    
    // Phase 2: Tab-specific data (parallel loading for statistics)
    
    // Load both transaction and expense data in parallel
    // This ensures statistics tab has data available immediately
    const dataPromises = [
      loadTransactionDataOptimized(),
      loadExpenseData()
    ];
    
    await Promise.all(dataPromises);
    
    // Phase 3: Initialize minimal features
    await initializeMinimalFeatures();
    
  } catch (error) {
    throw error;
  }
}

/**
 * Load software data for dropdowns
 */
async function loadSoftwareData() {
  try {
    // Pass required parameters to fetchSoftwareList
    await fetchSoftwareList(
      null, // softwareNameToKeep
      window.softwareData || [], // softwareData
      updatePackageList, // updatePackageList function
      updateAccountList, // updateAccountList function
      null, // softwarePackageToKeep
      null  // accountNameToKeep
    );
  } catch (error) {
    // Continue execution even if software data fails
  }
}

/**
 * Load transaction data optimized for performance
 */
async function loadTransactionDataOptimized() {
  try {
    // Ultra-fast initial load with minimal data
    const initialPageSize = 10; // Đồng bộ với yêu cầu: 10 items/trang
    window.currentPage = 1;
    window.itemsPerPage = initialPageSize;
    
    // Show loading indicator immediately
    const tableBody = document.querySelector('#transactionTable tbody');
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="10" class="text-center">🔄 Đang tải dữ liệu...</td></tr>';
    }
    
    // Load transactions without blocking UI using optimized function
    await loadTransactionsOptimized(
      window.userInfo,
      updateTable,
      formatDate,
      editTransaction,
      deleteTransaction,
      viewTransaction,
      {
        page: 1,
        limit: initialPageSize,
        useCache: true,
        showProgress: true
      }
    );
    
    // Preload next page in background after UI settles
    setTimeout(async () => {
      if (window.transactionList && window.transactionList.length >= initialPageSize) {
        // Increase page size for subsequent loads
        window.itemsPerPage = 10; // Đồng bộ: 10 items/trang
      }
    }, 2000);
    
  } catch (error) {
    const tableBody = document.querySelector('#transactionTable tbody');
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">❌ Lỗi tải dữ liệu</td></tr>';
    }
  }
}

/**
 * Legacy transaction data loading (kept for compatibility)
 */
async function loadTransactionData() {
  return await loadTransactionDataOptimized();
}

/**
 * Load expense data for statistics and reports
 */
async function loadExpenseData() {
  try {
    const { BACKEND_URL } = getConstants();
    
    if (!window.userInfo || !window.userInfo.maNhanVien) {
      window.expenseList = [];
      return;
    }
    
    const data = {
      action: 'searchExpenses',
      maNhanVien: window.userInfo.maNhanVien,
      conditions: {} // Empty conditions to get all expenses
    };
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      window.expenseList = result.data || [];
    } else {
      window.expenseList = [];
    }
    
  } catch (error) {
    window.expenseList = [];
  }
}

/**
 * Initialize minimal features for immediate interaction
 */
async function initializeMinimalFeatures() {
  try {
    // Only initialize features needed for immediate interaction
    const essentialInitializers = [];
    
    // Core form event listeners (if available)
    if (typeof window.initializeFormHandlers === 'function') {
      essentialInitializers.push(window.initializeFormHandlers());
    }
    
    // Basic modal functionality (if available) 
    if (typeof window.initializeModals === 'function') {
      essentialInitializers.push(window.initializeModals());
    }
    
    // Wait for essential features
    await Promise.all(essentialInitializers);
    
    // Defer heavy features like charts, statistics, reports
    setTimeout(() => {
      initializeHeavyFeatures();
    }, 3000);
  } catch (error) {
    // Continue with basic functionality
  }
}

/**
 * Initialize heavy features in background
 */
async function initializeHeavyFeatures() {
  try {
    // Initialize expense features (only when needed)
    await initializeExpenseFeatures();
  } catch (error) {
    // Continue with basic functionality
  }
}

/**
 * Initialize expense-related features
 */
async function initializeExpenseFeatures() {
  try {
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Initialize expense dropdowns
    await initExpenseDropdowns();
    
    // Render expense statistics
    renderExpenseStats();
    
    // Initialize expense quick search
    initExpenseQuickSearch();
  } catch (error) {
    // Continue execution even if expense features fail
  }
}

/**
 * Setup error handling for the application
 */
export function setupErrorHandling() {
  // Global error handler
  window.addEventListener('error', (event) => {
    
    // Only show modal for critical errors, not minor UI issues
    const errorMessage = event.error?.message || '';
    const isCriticalError = errorMessage.includes('fetch') || 
                           errorMessage.includes('network') || 
                           errorMessage.includes('timeout') ||
                           errorMessage.includes('Failed to load');
    
    if (isCriticalError && window.showResultModal) {
      window.showResultModal('Đã xảy ra lỗi. Vui lòng thử lại sau.', false);
    }
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    
    // Prevent default browser behavior
    event.preventDefault();
    
    // Only show modal for network-related errors
    const errorMessage = event.reason?.message || '';
    const isNetworkError = errorMessage.includes('fetch') || 
                          errorMessage.includes('network') || 
                          errorMessage.includes('timeout') ||
                          errorMessage.includes('Failed to');
    
    if (isNetworkError && window.showResultModal) {
      window.showResultModal('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.', false);
    }
  });
}

/**
 * Initialize application constants and configuration
 */
export function initializeConstants() {
  try {
    // Load constants from configuration
    const constants = getConstants();
    
    // Make constants globally available if needed
    window.APP_CONSTANTS = constants;
  } catch (error) {
    throw error;
  }
}

/**
 * Setup development mode features
 */
export function setupDevelopmentMode() {
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.search.includes('debug=true');

  if (isDevelopment) {
    
    // Enable debug logging
    window.DEBUG = true;
    
    // Add debug information to window object
    window.debugInfo = {
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // Log performance information
    if (window.performance && window.performance.timing) {
      setTimeout(() => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
      }, 0);
    }
  }
}

/**
 * Main application initialization function
 * @returns {Promise<boolean>} True if initialization successful
 */
export async function initializeApp() {
  try {
    // Step 1: Initialize globals and constants
    initializeGlobals();
    initializeConstants();
    
    // Step 2: Setup error handling
    setupErrorHandling();
    
    // Step 3: Setup development mode if applicable
    setupDevelopmentMode();
    
    // Step 4: Load and validate user
    const isAuthenticated = loadUserInfo();
    if (!isAuthenticated) {
      return false;
    }
    
    // Step 5: Initialize UI
    initializeUI();
    
    // Step 6: Load initial data
    await loadInitialData();
    
    return true;
    
  } catch (error) {
    // Show error message to user
    if (window.showResultModal) {
      window.showResultModal('Không thể khởi tạo ứng dụng. Vui lòng tải lại trang.', false);
    } else {
      alert('Không thể khởi tạo ứng dụng. Vui lòng tải lại trang.');
    }
    
    return false;
  }
}

/**
 * Cleanup function for page unload
 */
export function cleanupApp() {
  // Clear any intervals or timeouts
  if (window.refreshInterval) {
    clearInterval(window.refreshInterval);
  }
  
  // Save any pending data to localStorage
  try {
    if (window.userInfo) {
      localStorage.setItem('lastActivity', new Date().toISOString());
    }
  } catch (error) {
    // Continue cleanup even if save fails
  }
}

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupApp);
}