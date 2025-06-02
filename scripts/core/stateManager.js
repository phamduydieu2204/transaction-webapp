/**
 * stateManager.js
 * 
 * Global state management and data persistence
 * Handles application state, localStorage, and data synchronization
 */

/**
 * State management configuration
 */
const STATE_CONFIG = {
  storagePrefix: 'transactionApp_',
  autoSaveInterval: 30000, // 30 seconds
  maxStorageSize: 5 * 1024 * 1024, // 5MB
  compressionThreshold: 100 * 1024 // 100KB
};

/**
 * Global application state
 */
const appState = {
  // User data
  user: null,
  
  // Transaction data
  transactions: [],
  currentPage: 1,
  itemsPerPage: 50,
  totalPages: 0,
  
  // Expense data
  expenses: [],
  
  // Software and account data
  softwareList: [],
  accountList: [],
  
  // UI state
  activeTab: 'giao-dich',
  filters: {},
  sortOrder: 'desc',
  sortField: 'ngayTao',
  
  // Edit state
  currentEditIndex: -1,
  currentEditTransactionId: null,
  isEditMode: false,
  
  // Search state
  isSearching: false,
  searchResults: [],
  searchQuery: '',
  
  // Loading state
  isLoading: false,
  loadingMessage: '',
  
  // Error state
  lastError: null,
  errorCount: 0
};

/**
 * State change listeners
 */
const stateListeners = new Map();

/**
 * Auto-save interval reference
 */
let autoSaveInterval = null;

/**
 * Initialize state manager
 */
export function initializeStateManager() {
  console.log('🔄 Initializing state manager...');
  
  try {
    // Load saved state from localStorage
    loadPersistedState();
    
    // Setup auto-save
    setupAutoSave();
    
    // Setup state validation
    setupStateValidation();
    
    // Make state globally available
    window.appState = appState;
    
    console.log('✅ State manager initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing state manager:', error);
    return false;
  }
}

/**
 * Get current application state
 * @returns {Object} Current state
 */
export function getState() {
  return { ...appState };
}

/**
 * Get specific state property
 * @param {string} key - State property key
 * @returns {*} State property value
 */
export function getStateProperty(key) {
  return appState[key];
}

/**
 * Update application state
 * @param {Object} updates - State updates
 * @param {boolean} persist - Whether to persist changes
 */
export function updateState(updates, persist = true) {
  try {
    const previousState = { ...appState };
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (appState.hasOwnProperty(key)) {
        appState[key] = updates[key];
      } else {
        console.warn(`⚠️ Unknown state property: ${key}`);
      }
    });
    
    // Notify listeners
    notifyStateChange(previousState, appState);
    
    // Persist changes if requested
    if (persist) {
      persistState();
    }
    
    // Update global window properties for backward compatibility
    updateGlobalProperties(updates);
    
  } catch (error) {
    console.error('❌ Error updating state:', error);
  }
}

/**
 * Update global window properties for backward compatibility
 * @param {Object} updates - State updates
 */
function updateGlobalProperties(updates) {
  const globalMappings = {
    user: 'userInfo',
    transactions: 'transactionList',
    expenses: 'expenseList',
    currentPage: 'currentPage',
    itemsPerPage: 'itemsPerPage',
    currentEditIndex: 'currentEditIndex',
    currentEditTransactionId: 'currentEditTransactionId'
  };
  
  Object.keys(updates).forEach(key => {
    const globalProperty = globalMappings[key];
    if (globalProperty) {
      window[globalProperty] = updates[key];
    }
  });
}

/**
 * Subscribe to state changes
 * @param {string} key - State property to watch
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToState(key, callback) {
  if (!stateListeners.has(key)) {
    stateListeners.set(key, []);
  }
  
  stateListeners.get(key).push(callback);
  
  // Return unsubscribe function
  return () => {
    const listeners = stateListeners.get(key);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
}

/**
 * Notify state change listeners
 * @param {Object} previousState - Previous state
 * @param {Object} currentState - Current state
 */
function notifyStateChange(previousState, currentState) {
  Object.keys(currentState).forEach(key => {
    if (previousState[key] !== currentState[key]) {
      const listeners = stateListeners.get(key);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(currentState[key], previousState[key]);
          } catch (error) {
            console.error(`❌ Error in state listener for ${key}:`, error);
          }
        });
      }
    }
  });
}

/**
 * Persist current state to localStorage
 */
export function persistState() {
  try {
    const stateToSave = {
      ...appState,
      timestamp: Date.now()
    };
    
    // Check storage size
    const stateString = JSON.stringify(stateToSave);
    const sizeInBytes = new Blob([stateString]).size;
    
    if (sizeInBytes > STATE_CONFIG.maxStorageSize) {
      console.warn('⚠️ State too large for localStorage, compressing...');
      // Implement compression or selective saving
      stateToSave.transactions = stateToSave.transactions.slice(-100); // Keep only last 100
      stateToSave.expenses = stateToSave.expenses.slice(-100);
    }
    
    localStorage.setItem(
      STATE_CONFIG.storagePrefix + 'appState',
      JSON.stringify(stateToSave)
    );
    
    console.log('💾 State persisted to localStorage');
  } catch (error) {
    console.error('❌ Error persisting state:', error);
    
    // Try to save critical data only
    try {
      const criticalState = {
        user: appState.user,
        activeTab: appState.activeTab,
        timestamp: Date.now()
      };
      
      localStorage.setItem(
        STATE_CONFIG.storagePrefix + 'criticalState',
        JSON.stringify(criticalState)
      );
      
      console.log('💾 Critical state saved as fallback');
    } catch (fallbackError) {
      console.error('❌ Could not save critical state:', fallbackError);
    }
  }
}

/**
 * Load persisted state from localStorage
 */
function loadPersistedState() {
  try {
    const savedState = localStorage.getItem(STATE_CONFIG.storagePrefix + 'appState');
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Validate state age (don't load states older than 24 hours)
      const stateAge = Date.now() - (parsedState.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (stateAge < maxAge) {
        // Merge saved state with default state
        Object.keys(parsedState).forEach(key => {
          if (appState.hasOwnProperty(key) && key !== 'timestamp') {
            appState[key] = parsedState[key];
          }
        });
        
        console.log('✅ State loaded from localStorage');
      } else {
        console.log('⚠️ Saved state is too old, using default state');
      }
    }
    
    // Load critical state as fallback
    const criticalState = localStorage.getItem(STATE_CONFIG.storagePrefix + 'criticalState');
    if (criticalState && !savedState) {
      const parsedCriticalState = JSON.parse(criticalState);
      appState.user = parsedCriticalState.user;
      appState.activeTab = parsedCriticalState.activeTab;
      
      console.log('✅ Critical state loaded as fallback');
    }
    
  } catch (error) {
    console.error('❌ Error loading persisted state:', error);
  }
}

/**
 * Setup auto-save functionality
 */
function setupAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    persistState();
  }, STATE_CONFIG.autoSaveInterval);
  
  console.log('⏰ Auto-save setup complete');
}

/**
 * Setup state validation
 */
function setupStateValidation() {
  // Validate critical state properties
  if (!Array.isArray(appState.transactions)) {
    appState.transactions = [];
  }
  
  if (!Array.isArray(appState.expenses)) {
    appState.expenses = [];
  }
  
  if (typeof appState.currentPage !== 'number' || appState.currentPage < 1) {
    appState.currentPage = 1;
  }
  
  if (typeof appState.itemsPerPage !== 'number' || appState.itemsPerPage < 1) {
    appState.itemsPerPage = 50;
  }
  
  console.log('✅ State validation complete');
}

/**
 * Clear all persisted state
 */
export function clearPersistedState() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STATE_CONFIG.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🗑️ Persisted state cleared');
  } catch (error) {
    console.error('❌ Error clearing persisted state:', error);
  }
}

/**
 * Reset state to defaults
 */
export function resetState() {
  const defaultState = {
    user: null,
    transactions: [],
    currentPage: 1,
    itemsPerPage: 50,
    totalPages: 0,
    expenses: [],
    softwareList: [],
    accountList: [],
    activeTab: 'giao-dich',
    filters: {},
    sortOrder: 'desc',
    sortField: 'ngayTao',
    currentEditIndex: -1,
    currentEditTransactionId: null,
    isEditMode: false,
    isSearching: false,
    searchResults: [],
    searchQuery: '',
    isLoading: false,
    loadingMessage: '',
    lastError: null,
    errorCount: 0
  };
  
  updateState(defaultState, true);
  console.log('🔄 State reset to defaults');
}

/**
 * Get state statistics
 * @returns {Object} State statistics
 */
export function getStateStats() {
  return {
    transactionCount: appState.transactions.length,
    expenseCount: appState.expenses.length,
    currentPage: appState.currentPage,
    totalPages: appState.totalPages,
    isLoading: appState.isLoading,
    isSearching: appState.isSearching,
    errorCount: appState.errorCount,
    lastUpdate: Date.now()
  };
}

/**
 * Cleanup state manager
 */
export function cleanupStateManager() {
  console.log('🧹 Cleaning up state manager...');
  
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  
  // Final state save
  persistState();
  
  // Clear listeners
  stateListeners.clear();
  
  console.log('✅ State manager cleanup complete');
}

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupStateManager);
  
  // Make functions globally available for debugging
  if (window.DEBUG) {
    window.stateManager = {
      getState,
      updateState,
      persistState,
      clearPersistedState,
      resetState,
      getStateStats
    };
  }
}