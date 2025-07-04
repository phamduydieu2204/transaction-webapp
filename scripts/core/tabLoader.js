/**
 * Tab Loader System
 * Loads tab-specific modules only when the tab is accessed
 */

import { loadModule, preloadModule, isLoaded } from './lazyLoader.js';

/**
 * Tab module configurations
 * Defines which modules to load for each tab
 */
const TAB_MODULES = {
  'giao-dich': {
    required: [
      { path: '../initTransactionTab.js', key: 'transactionTab' },
      { path: '../loadTransactions.js', key: 'transactionLoader' },
      { path: '../updateTable.js', key: 'tableUpdater' }
    ],
    optional: [
      { path: '../reports/overview/overviewReport.js', key: 'overviewReport' }
    ]
  },
  'chi-phi': {
    required: [
      { path: '../initExpenseTab.js', key: 'expenseTab' },
      { path: '../initExpenseTab.js', key: 'expenseLoader' }
    ],
    optional: []
  },
  'phan-mem': {
    required: [
      { path: '../initSoftwareTab.js', key: 'softwareTab' },
      { path: '../fetchSoftwareList.js', key: 'softwareLoader' }
    ],
    optional: []
  },
  'thong-ke': {
    required: [
      { path: '../statisticsCore.js', key: 'statisticsCore' },
      { path: '../statisticsUIController.js', key: 'statisticsUI' }
    ],
    optional: [
      { path: '../ui-statistics/chartRenderers.js', key: 'chartRenderers' },
      { path: '../revenueExpenseChart.js', key: 'revenueChart' }
    ]
  },
  'bao-cao': {
    required: [],
    optional: [
      { path: '../reports/profit/profitAnalysis.js', key: 'profitAnalysis' },
      { path: '../reports/employee/employeeReportCore.js', key: 'employeeReport' },
      { path: '../reports/software/softwareManagementCore.js', key: 'softwareManagement' },
      { path: '../reports/customer/customerManagement.js', key: 'customerManagement' },
      { path: '../reports/expense/expenseAnalysis.js', key: 'expenseAnalysis' }
    ]
  },
  'cai-dat': {
    required: [],
    optional: []
  }
};

/**
 * Track loaded tabs
 */
const loadedTabs = new Set();
const loadingTabs = new Map();

/**
 * Load all required modules for a specific tab
 */
export async function loadTabModules(tabName) {
  // Return if already loaded
  if (loadedTabs.has(tabName)) {
    // console.log(`✅ Tab ${tabName} already loaded`);
    return true;
  }
  
  // Return existing promise if already loading
  if (loadingTabs.has(tabName)) {
// console.log(`⏳ Tab ${tabName} already loading, waiting...`);
    return loadingTabs.get(tabName);
  }
  
  const config = TAB_MODULES[tabName];
  if (!config) {
// console.warn(`⚠️ No configuration found for tab: ${tabName}`);
    return false;
  }
  
  // console.log(`🔄 Loading tab modules for: ${tabName}`);
  
  // Create loading promise
  const loadingPromise = loadTabModulesInternal(tabName, config);
  loadingTabs.set(tabName, loadingPromise);
  
  try {
    const result = await loadingPromise;
    if (result) {
      loadedTabs.add(tabName);
      // console.log(`✅ Tab ${tabName} loaded successfully`);
    }
    return result;
  } finally {
    loadingTabs.delete(tabName);
  }
}

/**
 * Internal function to load tab modules
 */
async function loadTabModulesInternal(tabName, config) {
  try {
    // Load required modules first
    if (config.required && config.required.length > 0) {
      // console.log(`📦 Loading ${config.required.length} required modules for ${tabName}`);
      await Promise.all(
        config.required.map(module => 
          loadModule(module.path, module.key)
        )
      );
    }
    
    // Preload optional modules in background (non-blocking)
    if (config.optional && config.optional.length > 0) {
      // console.log(`🔄 Preloading ${config.optional.length} optional modules for ${tabName}`);
      config.optional.forEach(module => {
        preloadModule(module.path, module.key).catch(error => {
// console.warn(`⚠️ Failed to preload ${module.key}:`, error);
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to load tab ${tabName}:`, error);
    return false;
  }
}

/**
 * Preload modules for a tab (non-blocking)
 */
export function preloadTabModules(tabName) {
  const config = TAB_MODULES[tabName];
  if (!config) return;
  
  // Preload required modules
  if (config.required) {
    config.required.forEach(module => {
      preloadModule(module.path, module.key).catch(error => {
// console.warn(`⚠️ Failed to preload ${module.key}:`, error);
      });
    });
  }
}

/**
 * Check if tab modules are loaded
 */
export function isTabLoaded(tabName) {
  return loadedTabs.has(tabName);
}

/**
 * Get loading statistics
 */
export function getTabLoadingStats() {
  return {
    loadedTabs: Array.from(loadedTabs),
    loadingTabs: Array.from(loadingTabs.keys()),
    totalTabs: Object.keys(TAB_MODULES).length
  };
}

/**
 * Smart preloading based on user behavior
 */
export function startSmartPreloading() {
  // Preload the most commonly used tabs after initial load
  setTimeout(() => {
    preloadTabModules('giao-dich');
    preloadTabModules('chi-phi');
  }, 2000);
  
  // Preload statistics tab after 5 seconds
  setTimeout(() => {
    preloadTabModules('thong-ke');
  }, 5000);
}

// Export tab module configurations for external use
export { TAB_MODULES };