/**
 * appInitializer.js
 * 
 * Application initialization and setup
 * Handles app startup, data loading, and global configuration
 */

// Import core dependencies
  } catch (e) {
    console.error('❌ Error parsing user data:', e);
    // Load both transaction and expense data in parallel
    // This ensures statistics tab has data available immediately
    await initializeMinimalFeatures();
    
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
  });

      }
    );

    // Preload next page in background after UI settles
      }
    }, 2000);
  } catch (error) {
    console.error('❌ Failed to load transaction data:', error);
      conditions: {} // Empty conditions to get all expenses
    };
  });

        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      window.expenseList = result.data || [];
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
    };
    
    // Log performance information
    await loadInitialData();
    
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
  
}

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupApp);
}