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
  
  // Wait a bit for DOM to be ready
  setTimeout(async () => {
    try {
      // Show loading modal
      showProcessingModal('Đang tải dữ liệu chi phí...');
      
      // Set default values for form
      setDefaultExpenseValues();
      
      // Load expense data
      await loadExpenses();
      
      // Render expense statistics
      renderExpenseStats();
      
      // Initialize quick search
      if (typeof window.initExpenseQuickSearchNew === 'function') {
        window.initExpenseQuickSearchNew();
        console.log('🔍 Expense quick search initialized');
      }
      
      console.log('✅ Expense tab initialized');
    } catch (error) {
      console.error('❌ Error initializing expense tab:', error);
    } finally {
      closeProcessingModal();
    }
  }, 100); // Small delay to ensure DOM is ready
}

/**
 * Load expenses from backend
 */
async function loadExpenses() {
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
    console.log('🔄 Loading expenses...');
    
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
      
      console.log(`✅ Loaded ${window.expenseList.length} expenses`);
      
      // Update table
      updateExpenseTable();
      
    } else {
      console.error('❌ Error loading expenses:', result.message);
      window.expenseList = [];
    }
    
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
    window.expenseList = [];
  }
}

// Make function globally available
window.initExpenseTab = initExpenseTab;