/**
 * appInitializer.js
 * 
 * Application initialization and setup
 * Handles app startup, data loading, and global configuration
 */

// Import core dependencies
import { fetchSoftwareList } from '../fetchSoftwareList.js';
import { getConstants } from '../config/constants.js';

/**
 * Main application initialization function
 */
export async function initializeApplication() {
  console.log('🚀 Starting application initialization...');
  
  try {
    // Setup error handling first
    setupErrorHandling();
    
    // Initialize constants and configuration
    initializeConstants();
    
    // Load initial data in parallel
    // This ensures statistics tab has data available immediately
    await loadInitialData();
    
    console.log('✅ Application initialized successfully');
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
 * Load initial data required for app startup
 */
async function loadInitialData() {
  console.log('📦 Loading initial data...');
  
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    window.userInfo = userData;
    
    // Load both transaction and expense data in parallel
    await Promise.all([
      loadTransactionData(),
      loadExpenseData(),
      loadSoftwareData()
    ]);
    
    // Initialize minimal features for immediate interaction
    await initializeMinimalFeatures();
    
    console.log('✅ Initial data loaded successfully');
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
async function loadTransactionData() {
  try {
    console.log('📊 Loading transaction data...');
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'getTransactions',
        page: 1,
        pageSize: 50,
        conditions: {}
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      window.transactionList = result.data || [];
      console.log(`✅ Loaded ${window.transactionList.length} transactions`);
      
      // Preload next page in background after UI settles
      setTimeout(async () => {
        try {
          await loadTransactionPage(2, 50);
        } catch (error) {
          console.warn('⚠️ Failed to preload next transaction page:', error);
        }
      }, 2000);
    } else {
      console.error('❌ Error loading transactions:', result.message);
      window.transactionList = [];
    }
  } catch (error) {
    console.error('❌ Failed to load transaction data:', error);
    window.transactionList = [];
  }
}

/**
 * Load expense data optimized for performance
 */
async function loadExpenseData() {
  try {
    console.log('💰 Loading expense data...');
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'getExpenses',
        page: 1,
        pageSize: 50,
        conditions: {} // Empty conditions to get all expenses
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      window.expenseList = result.data || [];
      console.log(`✅ Loaded ${window.expenseList.length} expenses`);
    } else {
      console.error('❌ Error loading expenses:', result.message);
      window.expenseList = [];
    }
  } catch (error) {
    console.error('❌ Failed to load expense data:', error);
    window.expenseList = [];
  }
}

/**
 * Load specific page of transaction data
 */
async function loadTransactionPage(page, pageSize) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'getTransactions',
        page: page,
        pageSize: pageSize,
        conditions: {}
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success' && result.data && result.data.length > 0) {
      // Append to existing data
      window.transactionList = window.transactionList.concat(result.data);
      console.log(`✅ Preloaded page ${page}: ${result.data.length} more transactions`);
    }
  } catch (error) {
    console.warn(`⚠️ Failed to load transaction page ${page}:`, error);
  }
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
  console.log('📊 Initializing heavy features...');
  
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
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Initialize expense dropdowns
    if (typeof window.initExpenseDropdowns === 'function') {
      await window.initExpenseDropdowns();
    }
    
    // Render expense statistics
    if (typeof window.renderExpenseStats === 'function') {
      window.renderExpenseStats();
    }
    
    // Initialize expense quick search
    if (typeof window.initExpenseQuickSearch === 'function') {
      window.initExpenseQuickSearch();
    }
    
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
    // Continue with default values
  }
}

/**
 * Placeholder functions for updatePackageList and updateAccountList
 * These should be implemented based on your UI requirements
 */
function updatePackageList(packages) {
  // Implementation depends on your UI structure
  console.log('📦 Package list updated:', packages?.length || 0);
}

function updateAccountList(accounts) {
  // Implementation depends on your UI structure
  console.log('👤 Account list updated:', accounts?.length || 0);
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
  
  console.log('✅ Application cleanup completed');
}

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupApp);
}