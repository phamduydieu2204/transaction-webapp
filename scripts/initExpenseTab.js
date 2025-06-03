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
 * Initialize expense tab data
 */
export async function initExpenseTab() {
  console.log('📊 Initializing expense tab...');
  
  try {
    // Show loading modal
    showProcessingModal('Đang tải dữ liệu chi phí...');
    
    // Load expense data
    await loadExpenses();
    
    // Render expense statistics
    renderExpenseStats();
    
    console.log('✅ Expense tab initialized');
  } catch (error) {
    console.error('❌ Error initializing expense tab:', error);
  } finally {
    closeProcessingModal();
  }
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
    vaiTro: window.userInfo.vaiTro,
    searchType: 'all', // Load all expenses
    startDate: '',
    endDate: ''
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
      // Store expenses globally
      window.expenseList = result.expenses || [];
      window.currentExpensePage = 1;
      
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