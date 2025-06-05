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
  window.itemsPerPage = 50;
  window.softwareData = [];
  window.confirmCallback = null;
  window.currentSoftwareName = "";
  window.currentSoftwarePackage = "";
  window.currentAccountName = "";
  window.isExpenseSearching = false;
  window.expenseList = [];

  console.log('✅ Global variables initialized');
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
    console.error('❌ Error parsing user data:', e);
    window.userInfo = null;
  }

  if (!window.userInfo) {
    console.warn('⚠️ No user information found');
    return false;
  }

  console.log('✅ User information loaded:', {
    name: window.userInfo.tenNhanVien,
    id: window.userInfo.maNhanVien,
    role: window.userInfo.vaiTro
  });

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

  console.log('✅ UI elements initialized');
}

/**
 * Load initial data for the application
 */
export async function loadInitialData() {
  console.log('🚀 Loading initial data...');

  try {
    // Check if we should use ultra-fast mode
    if (shouldUseUltraFast()) {
      console.log('⚡ Using ULTRA-FAST mode for performance');
      const success = await ultraFastInit(window.userInfo);
      if (success) {
        console.log('✅ Ultra-fast initialization complete');
        return;
      }
      console.warn('⚠️ Ultra-fast init failed, falling back to optimized mode');
    }

    // Phase 1: Critical data only (parallel loading)
    console.log('🚀 Phase 1: Loading critical data...');
    const softwareDataPromise = loadSoftwareData();
    
    // Wait for software data (needed for dropdowns)
    await softwareDataPromise;
    console.log('✅ Software data loaded');
    
    // Phase 2: Tab-specific data (lazy loading)
    console.log('🚀 Phase 2: Loading tab-specific data...');
    
    // Only load transaction data initially (most common tab)
    // Other tab data will be loaded when user switches to them
    await loadTransactionDataOptimized();
    console.log('✅ Transaction data loaded');
    
    // Phase 3: Initialize minimal features
    console.log('🚀 Phase 3: Initializing minimal features...');
    await initializeMinimalFeatures();
    console.log('✅ Minimal features initialized');
    
    console.log('✅ Initial data loaded successfully (optimized)');
  } catch (error) {
    console.error('❌ Error loading initial data:', error);
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
    console.log('✅ Software data loaded');
  } catch (error) {
    console.error('❌ Error loading software data:', error);
    // Continue execution even if software data fails
  }
}

/**
 * Load transaction data optimized for performance
 */
async function loadTransactionDataOptimized() {
  console.log('📊 Loading transaction data (optimized)...');
  
  try {
    // Ultra-fast initial load with minimal data
    const initialPageSize = 15; // Ultra-small for fastest possible load
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
    
    console.log('✅ Initial transaction data loaded');
    
    // Preload next page in background after UI settles
    setTimeout(async () => {
      if (window.transactionList && window.transactionList.length >= initialPageSize) {
        console.log('🔄 Preloading additional transaction data...');
        // Increase page size for subsequent loads
        window.itemsPerPage = 50;
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Failed to load transaction data:', error);
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
 * Initialize minimal features for immediate interaction
 */
async function initializeMinimalFeatures() {
  console.log('⚡ Initializing minimal features...');
  
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
    
    console.log('✅ Minimal features initialized');
  } catch (error) {
    console.error('❌ Error initializing minimal features:', error);
    // Continue with basic functionality
  }
}

/**
 * Initialize heavy features in background
 */
async function initializeHeavyFeatures() {
  console.log('📈 Initializing heavy features in background...');
  
  try {
    // Initialize expense features (only when needed)
    await initializeExpenseFeatures();
    
    // Initialize other heavy features on-demand
    console.log('📊 Heavy features available for lazy loading');
  } catch (error) {
    console.error('❌ Error initializing heavy features:', error);
  }
}

/**
 * Initialize expense-related features
 */
async function initializeExpenseFeatures() {
  try {
    // Initialize expense dropdowns
    await initExpenseDropdowns();
    
    // Render expense statistics
    renderExpenseStats();
    
    // Initialize expense quick search
    initExpenseQuickSearch();
    
    console.log('✅ Expense features initialized');
  } catch (error) {
    console.error('❌ Error initializing expense features:', error);
    // Continue execution even if expense features fail
  }
}

/**
 * Setup error handling for the application
 */
export function setupErrorHandling() {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    
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
    console.error('❌ Unhandled promise rejection:', event.reason);
    
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

  console.log('✅ Error handling setup complete');
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
    
    console.log('✅ Constants initialized');
  } catch (error) {
    console.error('❌ Error initializing constants:', error);
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
    console.log('🔧 Development mode enabled');
    
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
        console.log(`📊 Page load time: ${loadTime}ms`);
      }, 0);
    }
  }
}

/**
 * Main application initialization function
 * @returns {Promise<boolean>} True if initialization successful
 */
export async function initializeApp() {
  console.log('🚀 Starting application initialization...');
  
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
    
    console.log('✅ Application initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    
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
  console.log('🧹 Cleaning up application...');
  
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
    console.warn('⚠️ Could not save last activity:', error);
  }
  
  console.log('✅ Application cleanup complete');
}

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupApp);
}