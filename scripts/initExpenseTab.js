/**
 * Initialize Expense Tab
 * Load expense data when switching to expense tab
 */

import { getConstants } from './constants.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { renderExpenseStats } from './renderExpenseStats.js';
import { updateExpenseTable } from './updateExpenseTable.js';

/**
 * Set default values for expense form
 */
function setDefaultExpenseValues() {
  // Set default date
  const expenseDateEl = document.getElementById("expenseDate");
  if (expenseDateEl) {
    expenseDateEl.value = window.todayFormatted || "";
  }
  
  // Set default dropdown values
  const currencyEl = document.getElementById("expenseCurrency");
  if (currencyEl) {
    currencyEl.value = "VND";
  }
  
  const recurringEl = document.getElementById("expenseRecurring");
  if (recurringEl) {
    recurringEl.value = "Chi một lần";
  }
  
  const statusEl = document.getElementById("expenseStatus");
  if (statusEl) {
    statusEl.value = "Đã thanh toán";
  }
  
  // Set default recorder
  const recorderEl = document.getElementById("expenseRecorder");
  if (recorderEl) {
    recorderEl.value = window.userInfo?.tenNhanVien || "";
  }
}

/**
 * Initialize expense tab data
 */
export async function initExpenseTab() {
  
  try {
    // Set default values for form
    setDefaultExpenseValues();
    
    // Initialize quick search
    if (typeof window.initExpenseQuickSearchNew === 'function') {
      window.initExpenseQuickSearchNew();
    }
    
    // Debug: Check current expense list state
      exists: !!window.expenseList,
      length: window.expenseList?.length || 0,
      type: typeof window.expenseList,
      expenseTabInitialized: window.expenseTabInitialized
    });
    
    // Check if we already have data and don't need to reload
    if (window.expenseTabInitialized && window.expenseList && window.expenseList.length > 0) {
      // Update table with existing data
      updateExpenseTable();
      // Render expense statistics
      renderExpenseStats();
    } else {
      await loadExpensesInBackground();
      // Mark as initialized
      window.expenseTabInitialized = true;
    }
    
    console.log('✅ Expense tab initialized');
  } catch (error) {
    console.error('❌ Error initializing expense tab:', error);
  }
}

/**
 * Load expenses from backend without modal
 */
async function loadExpensesInBackground() {
  const { BACKEND_URL } = getConstants();
  
  // Check user info
  if (!window.userInfo) {
    console.warn('⚠️ No user info found');
    return;
  }
  
  const data = {
    action: 'searchExpenses',
    maNhanVien: window.userInfo.maNhanVien,
    conditions: {} // Empty conditions to get all expenses
  };
  
  try {
    
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
      // Store expenses globally - API returns data not expenses
      window.expenseList = result.data || [];
      window.currentExpensePage = 1;
      window.isExpenseSearching = false;
      
      
      // Update table
      updateExpenseTable();
      // Render expense statistics
      renderExpenseStats();
      
    } else {
      console.error('❌ Error loading expenses:', result.message);
      window.expenseList = [];
    }
    
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
    window.expenseList = [];
  }
}

/**
 * Load expenses from backend with modal (for refresh/search operations)
 */
async function loadExpenses() {
  try {
    // Show loading modal
    showProcessingModal('Đang tải dữ liệu chi phí...');
    
    await loadExpensesInBackground();
    
    // Mark as initialized
    window.expenseTabInitialized = true;
    
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
  } finally {
    closeProcessingModal();
  }
}

/**
 * Reset expense tab state (for logout or forced refresh)
 */
function resetExpenseTabState() {
  window.expenseTabInitialized = false;
  window.expenseList = [];
}

// Make functions globally available
window.initExpenseTab = initExpenseTab;
window.loadExpenses = loadExpenses; // For refresh/search operations that need modal
window.resetExpenseTabState = resetExpenseTabState; // For logout or forced refresh