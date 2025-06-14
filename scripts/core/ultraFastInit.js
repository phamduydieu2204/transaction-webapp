/**
 * Ultra-Fast Application Initialization
 * Skips all non-essential features for maximum speed
 */

import { getConstants } from '../constants.js';
import { loadTransactionsOptimized } from '../loadTransactions.js';
import { updateTable } from '../updateTableUltraFast.js';
import { formatDate } from '../formatDate.js';
import { editTransaction } from '../editTransaction.js';
import { deleteTransaction } from '../deleteTransaction.js';
import { viewTransaction } from '../viewTransaction.js';
import { deduplicateRequest } from './requestOptimizer.js';

/**
 * Load critical functions needed for basic operations
 */
async function loadCriticalFunctions() {
  console.log('⚡ Loading critical functions...');
  
  try {
    // Import and attach modal functions
    const { showProcessingModal } = await import('../showProcessingModal.js');
    const { closeProcessingModal } = await import('../closeProcessingModal.js');
    const { showResultModal } = await import('../showResultModal.js');
    
    // Attach to window for global access
    window.showProcessingModal = showProcessingModal;
    window.closeProcessingModal = closeProcessingModal;
    window.showResultModal = showResultModal;
    
    console.log('✅ Critical modal functions loaded');
    
    // Load other critical functions
    const { updatePackageList } = await import('../updatePackageList.js');
    const { updateAccountList } = await import('../updateAccountList.js');
    
    window.updatePackageList = updatePackageList;
    window.updateAccountList = updateAccountList;
    
    console.log('✅ Critical utility functions loaded');
    
  } catch (error) {
    console.error('❌ Failed to load critical functions:', error);
    throw error;
  }
}

/**
 * Ultra-fast app initialization - skips everything non-essential
 */
export async function ultraFastInit(userInfo) {
  console.log('🚀 ULTRA-FAST INIT: Starting...');
  const startTime = Date.now();

  try {
    // Step 1: Set minimal globals only
    window.userInfo = userInfo;
    window.currentPage = 1;
    window.itemsPerPage = 15; // Ultra-small
    window.transactionList = [];
    window.expenseList = [];

    // Step 1.5: Load critical modal functions immediately
    await loadCriticalFunctions();

    // Step 2: Load only the most critical 15 transactions
    console.log('⚡ Loading first 15 transactions only...');
    
    const result = await loadTransactionsOptimized(
      userInfo,
      updateTable,
      formatDate,
      editTransaction,
      deleteTransaction,
      viewTransaction,
      {
        page: 1,
        limit: 15,
        useCache: true,
        showProgress: true
      }
    );

    if (result.status === 'success') {
      console.log(`⚡ Ultra-fast load complete: ${result.data.length} transactions in ${Date.now() - startTime}ms`);
      
      // Step 3: Schedule background loading of remaining features
      scheduleBackgroundLoading();
      
      return true;
    } else {
      throw new Error(result.message || 'Failed to load transactions');
    }

  } catch (error) {
    console.error('❌ Ultra-fast init failed:', error);
    return false;
  }
}

/**
 * Schedule background loading of non-essential features
 */
function scheduleBackgroundLoading() {
  // Load software list in background (for dropdowns)
  setTimeout(async () => {
    try {
      console.log('🔄 Background: Loading software list...');
      const { fetchSoftwareList } = await import('../fetchSoftwareList.js');
      const { updatePackageList } = await import('../updatePackageList.js');
      const { updateAccountList } = await import('../updateAccountList.js');
      
      await fetchSoftwareList(null, [], updatePackageList, updateAccountList);
      console.log('✅ Background: Software list loaded');
    } catch (error) {
      console.warn('⚠️ Background software list loading failed:', error);
    }
  }, 1000);

  // Load expense data in background
  setTimeout(async () => {
    try {
      console.log('🔄 Background: Loading expense data...');
      const { getConstants } = await import('../constants.js');
      const { BACKEND_URL } = getConstants();
      
      if (window.userInfo && window.userInfo.maNhanVien) {
        const data = {
          action: 'searchExpenses',
          maNhanVien: window.userInfo.maNhanVien,
          conditions: {}
        };
        
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.status === 'success') {
          window.expenseList = result.data || [];
          console.log(`✅ Background: Loaded ${window.expenseList.length} expenses`);
        }
      }
      
      // Then load expense features
      const { initExpenseDropdowns } = await import('../initExpenseDropdowns.js');
      await initExpenseDropdowns();
      console.log('✅ Background: Expense features loaded');
    } catch (error) {
      console.warn('⚠️ Background expense loading failed:', error);
    }
  }, 2000);

  // Preload next page of transactions
  setTimeout(async () => {
    try {
      console.log('🔄 Background: Preloading next transactions...');
      await loadTransactionsOptimized(
        window.userInfo,
        () => {}, // No UI update
        formatDate,
        editTransaction,
        deleteTransaction,
        viewTransaction,
        {
          page: 2,
          limit: 25,
          useCache: true,
          showProgress: false
        }
      );
      console.log('✅ Background: Next page preloaded');
    } catch (error) {
      console.warn('⚠️ Background preloading failed:', error);
    }
  }, 3000);
}

/**
 * Check if ultra-fast mode should be used
 */
export function shouldUseUltraFast() {
  // Use ultra-fast mode if:
  // 1. User has slow connection
  // 2. Large dataset detected
  // 3. Performance preference set
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.effectiveType === '3g'
  );

  const hasPerformancePreference = localStorage.getItem('preferUltraFast') === 'true';
  
  return isSlowConnection || hasPerformancePreference;
}

// Export for global access
window.ultraFastInit = {
  ultraFastInit,
  shouldUseUltraFast,
  scheduleBackgroundLoading
};