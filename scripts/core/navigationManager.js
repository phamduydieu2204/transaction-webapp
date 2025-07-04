/**
 * navigationManager.js
 * 
 * Navigation and tab management system
 * Handles tab switching, routing, and URL management
 */

import { updateState, getStateProperty } from './stateManager.js';
import { canAccessTab, validateTabAccess, getDefaultAllowedTab, initializeTabPermissions } from './tabPermissions.js';

/**
 * Navigation configuration
 */
const NAV_CONFIG = {
  defaultTab: 'giao-dich',
  urlParamName: 'tab',
  tabTransitionDelay: 150,
  saveTabHistory: true,
  maxHistoryLength: 10
};

/**
 * Tab configuration and metadata
 */
const TAB_CONFIG = {
  'giao-dich': {
    name: 'Giao dịch',
    icon: '💰',
    requiresAuth: true,
    preloadData: true,
    initFunction: 'initTransactionTab'
  },
  'phan-mem': {
    name: 'Phần mềm',
    icon: '💿',
    requiresAuth: true,
    preloadData: true,
    initFunction: 'initSoftwareTab'
  },
  'chi-phi': {
    name: 'Chi phí',
    icon: '💸',
    requiresAuth: true,
    preloadData: true,
    initFunction: 'initExpenseTab'
  },
  'thong-ke': {
    name: 'Thống kê',
    icon: '📊',
    requiresAuth: true,
    preloadData: false,
    initFunction: 'initStatisticsTab'
  },
  'bao-cao': {
    name: 'Báo cáo',
    icon: '📈',
    requiresAuth: true,
    preloadData: false,
    initFunction: 'initReportTab'
  },
  'cai-dat': {
    name: 'Cài đặt',
    icon: '⚙️',
    requiresAuth: true,
    preloadData: false,
    initFunction: 'initSettingsTab'
  }
};

/**
 * Tab history for navigation
 */
let tabHistory = [];

/**
 * Currently active tab
 */
let currentTab = NAV_CONFIG.defaultTab;

/**
 * Intended tab from URL (preserved across authentication)
 */
let intendedTab = null;

/**
 * Tab switch event listeners
 */
const tabSwitchListeners = [];

/**
 * Initialize navigation manager
 */
export function initializeNavigation() {
  // '🧭 Initializing navigation manager...';

  try {
    // Setup tab event handlers
    setupTabHandlers();
    
    // Load tab from URL or state
    loadInitialTab();
    
    // Setup URL change listener
    setupURLListener();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // '✅ Navigation manager initialized';
    return true;
  } catch (error) {
    console.error('❌ Error initializing navigation:', error);
    return false;
  }
}

/**
 * Setup tab click handlers
 */
function setupTabHandlers() {
  document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const tabName = button.dataset.tab;
      
      if (tabName && tabName !== currentTab) {
        await switchToTab(tabName);
      }
    });
  });
  
  // '✅ Tab handlers setup complete';
}

/**
 * Switch to a specific tab
 * @param {string} tabName - Tab identifier
 * @param {Object} options - Switch options
 */
export async function switchToTab(tabName, options = {}) {
  const {
    updateURL = true,
    addToHistory = true,
    skipTransition = false
  } = options;
  
  // `🔄 Switching to tab: ${tabName}`;
  
  try {
    // Validate tab exists
    if (!TAB_CONFIG[tabName]) {
      console.error(`❌ Unknown tab: ${tabName}`);
      return false;
    }
    
    // Check authentication if required
    if (TAB_CONFIG[tabName].requiresAuth && !getStateProperty('user')) {
      console.warn('⚠️ Authentication required for tab:', tabName);
      return false;
    }
    
    // Check tab permissions
    if (!canAccessTab(tabName)) {
      console.warn('⚠️ Access denied to tab:', tabName);
      const allowedTab = getDefaultAllowedTab();
      if (allowedTab !== tabName) {
        // `🔄 Redirecting to allowed tab: ${allowedTab}`;
        return switchToTab(allowedTab, options);
      }
      return false;
    }
    
    // Hide current tab
    hideCurrentTab();
    
    // Update state
    const previousTab = currentTab;
    currentTab = tabName;
    updateState({ activeTab: tabName });
    
    // Show new tab
    const success = showTab(tabName, skipTransition);
    
    if (success) {
      // Update URL if requested
      if (updateURL) {
        updateURLForTab(tabName);
      }
      
      // Add to history if requested
      if (addToHistory && previousTab !== tabName) {
        addToTabHistory(tabName);
      }
      
      // Notify listeners
      notifyTabSwitch(previousTab, tabName);
      
      // Initialize tab if needed
      await initializeTabIfNeeded(tabName);
      
      // `✅ Successfully switched to tab: ${tabName}`;
      return true;
    } else {
      // Revert state on failure
      currentTab = previousTab;
      updateState({ activeTab: previousTab });
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error switching to tab ${tabName}:`, error);
    return false;
  }
}

/**
 * Hide current tab content
 */
function hideCurrentTab() {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.remove("active");
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-button").forEach(button => {
    button.classList.remove("active");
  });
}

/**
 * Show specific tab
 * @param {string} tabName - Tab to show
 * @param {boolean} skipTransition - Skip transition animation
 * @returns {boolean} Success status
 */
function showTab(tabName, skipTransition = false) {
  try {
    // Find tab button
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabButton) {
      tabButton.classList.add("active");
    }
    
    // Find tab content
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
      if (skipTransition) {
        tabContent.classList.add("active");
      } else {
        // Add transition effect
        setTimeout(() => {
          tabContent.classList.add("active");
        }, NAV_CONFIG.tabTransitionDelay);
      }
      
      return true;
    } else {
      console.error(`❌ Tab content not found for: ${tabName}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error showing tab ${tabName}:`, error);
    return false;
  }
}

/**
 * Load initial tab from URL or saved state
 */
function loadInitialTab() {
  // Try to get tab from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlTab = urlParams.get(NAV_CONFIG.urlParamName);
  
  // Save intended tab from URL for later use (after auth)
  if (urlTab && TAB_CONFIG[urlTab]) {
    intendedTab = urlTab;
    // `💾 Intended tab from URL: ${intendedTab}`;
  }
  
  // Try to get tab from saved state
  const stateTab = getStateProperty('activeTab');
  
  // Determine initial tab - prioritize URL, then state, then default
  const initialTab = urlTab || stateTab || NAV_CONFIG.defaultTab;
  
  // Validate tab exists
  const validTab = TAB_CONFIG[initialTab] ? initialTab : NAV_CONFIG.defaultTab;
  
  // Check if user is authenticated
  const isAuthenticated = !!getStateProperty('user');
  
  if (isAuthenticated) {
    // User is logged in, validate permissions and switch to allowed tab
    const allowedTab = validateTabAccess(validTab);
    switchToTab(allowedTab, { updateURL: true, addToHistory: false, skipTransition: true });
    // `🎯 Initial tab loaded (authenticated: ${allowedTab}`);
  } else {
    // User not logged in, save intended tab and switch to default for now
    // `🔐 User not authenticated, saving intended tab: ${validTab}`;
    // Don't switch tab yet, will be handled after authentication
  }
}

/**
 * Update URL to reflect current tab
 * @param {string} tabName - Current tab name
 */
function updateURLForTab(tabName) {
  try {
    const url = new URL(window.location);
    
    if (tabName === NAV_CONFIG.defaultTab) {
      // Remove tab parameter for default tab
      url.searchParams.delete(NAV_CONFIG.urlParamName);
    } else {
      // Set tab parameter
      url.searchParams.set(NAV_CONFIG.urlParamName, tabName);
    }
    
    // Update URL without page reload
    window.history.replaceState({}, '', url);
    
  } catch (error) {
    console.error('❌ Error updating URL:', error);
  }
}

/**
 * Setup URL change listener (for browser back/forward)
 */
function setupURLListener() {
  window.addEventListener('popstate', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get(NAV_CONFIG.urlParamName) || NAV_CONFIG.defaultTab;
    
    if (urlTab !== currentTab) {
      // Validate access before switching
      const allowedTab = validateTabAccess(urlTab);
      switchToTab(allowedTab, { 
        updateURL: allowedTab !== urlTab, // Update URL if redirected
        addToHistory: false 
      });
    }
  });
}

/**
 * Setup keyboard navigation
 */
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Number for tab switching
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      
      const tabIndex = parseInt(e.key) - 1;
      const tabNames = Object.keys(TAB_CONFIG);
      
      if (tabIndex < tabNames.length) {
        switchToTab(tabNames[tabIndex]);
      }
    }
    
    // Ctrl/Cmd + Tab for next tab
    if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
      e.preventDefault();
      switchToNextTab();
    }
  });
}

/**
 * Switch to next tab in sequence
 */
export function switchToNextTab() {
  const tabNames = Object.keys(TAB_CONFIG);
  const currentIndex = tabNames.indexOf(currentTab);
  const nextIndex = (currentIndex + 1) % tabNames.length;
  
  switchToTab(tabNames[nextIndex]);
}

/**
 * Switch to previous tab in sequence
 */
export function switchToPreviousTab() {
  const tabNames = Object.keys(TAB_CONFIG);
  const currentIndex = tabNames.indexOf(currentTab);
  const prevIndex = currentIndex === 0 ? tabNames.length - 1 : currentIndex - 1;
  
  switchToTab(tabNames[prevIndex]);
}

/**
 * Add tab to history
 * @param {string} tabName - Tab name to add
 */
function addToTabHistory(tabName) {
  if (!NAV_CONFIG.saveTabHistory) return;
  
  // Remove if already exists
  const existingIndex = tabHistory.indexOf(tabName);
  if (existingIndex > -1) {
    tabHistory.splice(existingIndex, 1);
  }
  
  // Add to beginning
  tabHistory.unshift(tabName);
  
  // Limit history length
  if (tabHistory.length > NAV_CONFIG.maxHistoryLength) {
    tabHistory = tabHistory.slice(0, NAV_CONFIG.maxHistoryLength);
  }
}

/**
 * Go back to previous tab in history
 */
export function goToPreviousTabInHistory() {
  if (tabHistory.length > 1) {
    // Current tab is at index 0, so get previous at index 1
    const previousTab = tabHistory[1];
    switchToTab(previousTab);
  }
}

/**
 * Get current active tab
 * @returns {string} Current tab name
 */
export function getCurrentTab() {
  return currentTab;
}

/**
 * Get tab history
 * @returns {Array} Tab history array
 */
export function getTabHistory() {
  return [...tabHistory];
}

/**
 * Subscribe to tab switch events
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTabSwitch(callback) {
  tabSwitchListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = tabSwitchListeners.indexOf(callback);
    if (index > -1) {
      tabSwitchListeners.splice(index, 1);
    }
  };
}

/**
 * Notify tab switch listeners
 * @param {string} fromTab - Previous tab
 * @param {string} toTab - New tab
 */
function notifyTabSwitch(fromTab, toTab) {
  tabSwitchListeners.forEach(callback => {
    try {
      callback(fromTab, toTab);
    } catch (error) {
      console.error('❌ Error in tab switch listener:', error);
    }
  });
}

/**
 * Initialize tab if needed
 * @param {string} tabName - Tab to initialize
 */
async function initializeTabIfNeeded(tabName) {
  const tabConfig = TAB_CONFIG[tabName];
  
  if (tabConfig.initFunction && window[tabConfig.initFunction]) {
    try {
      const result = window[tabConfig.initFunction]();
      
      // Handle both sync and async functions
      if (result && typeof result.then === 'function') {
        await result;
      }
      
      // `✅ Tab ${tabName} initialized`;
    } catch (error) {
      console.error(`❌ Error initializing tab ${tabName}:`, error);
    }
  }
}

/**
 * Check if tab is valid
 * @param {string} tabName - Tab name to validate
 * @returns {boolean} Is valid tab
 */
export function isValidTab(tabName) {
  return !!TAB_CONFIG[tabName];
}

/**
 * Get tab configuration
 * @param {string} tabName - Tab name
 * @returns {Object} Tab configuration
 */
export function getTabConfig(tabName) {
  return TAB_CONFIG[tabName] || null;
}

/**
 * Get all available tabs
 * @returns {Array} Array of tab configurations
 */
export function getAllTabs() {
  return Object.keys(TAB_CONFIG).map(key => ({
    id: key,
    ...TAB_CONFIG[key]
  }));
}

/**
 * Switch to intended tab after authentication
 */
export function switchToIntendedTab() {
  // '🎯 Switching to intended tab after authentication...';
  
  // Initialize tab permissions system
  initializeTabPermissions();
  
  // Get intended tab or use URL or default
  const urlParams = new URLSearchParams(window.location.search);
  const urlTab = urlParams.get(NAV_CONFIG.urlParamName);
  const targetTab = intendedTab || urlTab || getStateProperty('activeTab') || NAV_CONFIG.defaultTab;
  
  // Validate tab exists and user has permission
  const validTab = TAB_CONFIG[targetTab] ? targetTab : NAV_CONFIG.defaultTab;
  const allowedTab = validateTabAccess(validTab);
  
  // `🔄 Switching to tab after auth: ${allowedTab} (requested: ${validTab}`);
  
  // Switch to the allowed tab
  switchToTab(allowedTab, { updateURL: true, addToHistory: false, skipTransition: false });
  
  // Clear intended tab
  intendedTab = null;
}

// Export alias for backward compatibility
export const initializeTabSystem = initializeNavigation;

// Make functions globally available for backward compatibility
if (typeof window !== 'undefined') {
  window.switchToTab = switchToTab;
  window.getCurrentTab = getCurrentTab;
  window.switchToNextTab = switchToNextTab;
  window.switchToPreviousTab = switchToPreviousTab;
}