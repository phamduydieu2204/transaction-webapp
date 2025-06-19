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
  console.log('📊 Initializing expense tab...');
  
  try {
    // Set default values for form
    setDefaultExpenseValues();
    
    // Initialize quick search
    if (typeof window.initExpenseQuickSearchNew === 'function') {
      window.initExpenseQuickSearchNew();
      console.log('🔍 Expense quick search initialized');
    }
    
    // Only load data if not already loaded
    if (!window.expenseList || window.expenseList.length === 0) {
      console.log('💰 Loading expense data for the first time...');
      await loadExpensesInBackground();
    } else {
      console.log('✅ Using cached expense data');
      // Update table with existing data
      updateExpenseTable();
      // Render expense statistics
      renderExpenseStats();
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
    console.log('🔄 Loading expenses in background...');
    
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
      
      console.log(`✅ Loaded ${window.expenseList.length} expenses in background`);
      
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
    
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
  } finally {
    closeProcessingModal();
  }
}

// Make functions globally available
window.initExpenseTab = initExpenseTab;
window.loadExpenses = loadExpenses; // For refresh/search operations that need modal