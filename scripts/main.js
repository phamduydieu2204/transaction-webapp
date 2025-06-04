/**
 * main.js - Entry Point
 * 
 * Main entry point that orchestrates all application modules
 * Imports and initializes core application functionality
 */

console.log('🎯 Main.js: File loaded, starting imports...');

// Import core modules
import { initializeApp } from './core/appInitializer.js';
import { initializeEventHandlers } from './core/eventManager.js';
import { initializeStateManager, getState, updateState } from './core/stateManager.js';
import { switchToTab, initializeTabSystem } from './core/navigationManager.js';
import { authManager } from './core/authManager.js';

// Import essential utilities
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';

// Import tab initialization functions
import { initExpenseTab } from './initExpenseTab.js';
import { initTransactionTab } from './initTransactionTab.js';

// Import legacy functions for backward compatibility
import { logout } from './logout.js';
import { openCalendar } from './openCalendar.js';
import { calculateEndDate, initializeDateCalculations } from './calculateEndDate.js';
import { updateCustomerInfo } from './updateCustomerInfo.js';
import { handleReset } from './handleReset.js';
import { loadTransactions } from './loadTransactions.js';
import { handleAdd } from './handleAdd.js';
import { handleUpdate } from './handleUpdate.js';
import { handleSearch } from './handleSearch.js';
import { viewTransaction } from './viewTransaction.js';
import { editTransaction } from './editTransaction.js';
import { deleteTransaction } from './deleteTransaction.js';
import { fetchSoftwareList } from './fetchSoftwareList.js';
import { updatePackageList } from './updatePackageList.js';
import { updateAccountList } from './updateAccountList.js';
import { updateTable } from './updateTable.js';
import { formatDate } from './formatDate.js';
import { copyToClipboard } from './copyToClipboard.js';
import { closeModal } from './closeModal.js';
import { firstPage, prevPage, nextPage, lastPage, goToPage } from './pagination.js';
import { handleAddExpense } from './handleAddExpense.js';
import { initExpenseDropdowns } from './initExpenseDropdowns.js';
import { renderExpenseStats } from './renderExpenseStats.js';
import { editExpenseRow } from './editExpenseRow.js';
import { handleDeleteExpense } from './handleDeleteExpense.js';
import { handleUpdateExpense } from './handleUpdateExpense.js';
import { viewExpenseRow } from './viewExpenseRow.js';
import { handleSearchExpense } from './handleSearchExpense.js';
import { handleResetExpense } from './handleResetExpense.js';
import { initTotalDisplay } from './updateTotalDisplay.js';
import { initExpenseQuickSearch } from './expenseQuickSearch.js';
import { handleChangePassword, closeChangePasswordModal, confirmChangePassword } from './handleChangePassword.js';
import { formatDateTime } from './formatDateTime.js';
import { openConfirmModal, closeConfirmModal, confirmDelete } from './confirmModal.js';
import { 
  openAddOrUpdateModal, 
  closeAddOrUpdateModal, 
  handleAddNewTransaction, 
  handleUpdateTransactionFromModal, 
  handleCancelModal 
} from './handleAddOrUpdateModal.js';
import {
  handleUpdateCookie,
  confirmUpdateCookie,
  cancelUpdateCookie,
  copyCurrentCookie,
  closeUpdateCookieModal
} from './handleUpdateCookie.js';
import { editRow, deleteRow } from './legacy.js';
import { getConstants } from './constants.js';

/**
 * Show login form when user is not authenticated
 */
function showLoginForm() {
  console.log('🔐 Showing login form...');
  
  // Hide main content
  document.querySelector('.container').style.display = 'none';
  
  // Create and show login form
  const loginContainer = document.createElement('div');
  loginContainer.className = 'login-container';
  loginContainer.innerHTML = `
    <div class="login-box">
      <h2 class="login-title">Đăng nhập hệ thống</h2>
      <form id="loginForm" class="login-form">
        <div class="form-group">
          <label for="username">Tên đăng nhập</label>
          <input type="text" id="username" name="username" required class="form-control">
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input type="password" id="password" name="password" required class="form-control">
        </div>
        <button type="submit" class="btn btn-primary btn-block">Đăng nhập</button>
      </form>
      <div id="loginError" class="error-message" style="display: none;"></div>
    </div>
  `;
  
  document.body.appendChild(loginContainer);
  
  // Handle login form submission
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      // Import login function
      const { login } = await import('./login.js');
      
      // Show processing
      const loginBtn = e.target.querySelector('button[type="submit"]');
      loginBtn.disabled = true;
      loginBtn.textContent = 'Đang xử lý...';
      
      // Attempt login
      await login(username, password);
      
      // If login successful, reload page
      window.location.reload();
      
    } catch (error) {
      console.error('Login error:', error);
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').textContent = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      
      // Reset button
      const loginBtn = e.target.querySelector('button[type="submit"]');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Đăng nhập';
    }
  });
}

/**
 * Application startup sequence
 */
async function startApp() {
  console.log('🚀 Starting Transaction WebApp...');
  
  try {
    // Phase 1: Initialize state and authentication
    console.log('📊 Phase 1: Initializing state and auth...');
    initializeStateManager();
    
    // Check authentication
    console.log('🔐 Checking authentication...');
    const hasSession = authManager.loadSession();
    console.log('📌 Session loaded:', hasSession);
    
    if (!hasSession) {
      console.log('❌ No valid session found, checking legacy format...');
      // Try legacy session format
      const userData = localStorage.getItem("employeeInfo");
      console.log('📌 Legacy user data:', userData ? 'Found' : 'Not found');
      
      if (userData) {
        try {
          const userInfo = JSON.parse(userData);
          console.log('✅ Legacy session parsed:', userInfo.maNhanVien);
          updateState({ user: userInfo });
        } catch (e) {
          console.warn('❌ Invalid legacy session data:', e);
          // Show login form instead of redirect
          console.log('🔐 Showing login form (invalid legacy data)...');
          showLoginForm();
          return;
        }
      } else {
        // Show login form instead of redirect
        console.log('🔐 Showing login form (no auth data)...');
        showLoginForm();
        return;
      }
    } else {
      console.log('✅ Valid session found, continuing...');
    }
    
    // Phase 2: Initialize core application
    console.log('🏗️ Phase 2: Initializing core application...');
    await initializeApp();
    
    // Phase 3: Setup event handlers
    console.log('🎮 Phase 3: Setting up event handlers...');
    initializeEventHandlers();
    
    // Phase 4: Initialize navigation system
    console.log('🧭 Phase 4: Initializing navigation...');
    initializeTabSystem();
    
    // Phase 4.5: Initialize date defaults and calculations
    console.log('📅 Phase 4.5: Initializing date defaults...');
    setTimeout(() => {
      initializeDateCalculations();
    }, 100); // Small delay to ensure DOM is ready
    
    // Phase 5: Apply ultra full-width layout override
    console.log('🔧 Phase 5: Applying ultra full-width layout...');
    setTimeout(async () => {
      try {
        // Import and run the force full-width script
        const { forceFullWidth } = await import('./forceFullWidth.js');
        forceFullWidth();
      } catch (error) {
        console.error('❌ Error loading forceFullWidth:', error);
        
        // Fallback: Apply basic full-width override directly
        console.log('🔧 Applying fallback full-width override...');
        const container = document.querySelector('.container');
        if (container) {
          container.style.cssText = `
            width: 100vw !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            position: relative !important;
            left: 0 !important;
            right: 0 !important;
          `;
          
          setTimeout(() => {
            console.log('✅ Fallback applied - Container width:', container.getBoundingClientRect().width, '/', window.innerWidth);
          }, 100);
        }
      }
    }, 500);
    
    console.log('✅ Application startup complete!');
    
  } catch (error) {
    console.error('❌ Application startup failed:', error);
    showResultModal(
      'Lỗi khởi tạo ứng dụng',
      'Có lỗi xảy ra khi khởi tạo ứng dụng. Vui lòng tải lại trang.',
      'error'
    );
  }
}

// Legacy global function exports for backward compatibility
window.logout = logout;
window.openCalendar = (inputId) =>
  openCalendar(inputId, calculateEndDate, document.getElementById("startDate"), document.getElementById("duration"), document.getElementById("endDate"));
window.updateCustomerInfo = () => {
  const state = getState();
  return updateCustomerInfo(state.transactions);
};
window.handleReset = () =>
  handleReset(fetchSoftwareList, showProcessingModal, showResultModal, getState().todayFormatted, updatePackageList, updateAccountList);
window.loadTransactions = () => {
  const state = getState();
  return loadTransactions(state.user, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
};
window.handleAdd = () => {
  const state = getState();
  return handleAdd(state.user, state.currentEditTransactionId, window.loadTransactions, window.handleReset, updatePackageList, showProcessingModal, showResultModal);
};
window.handleUpdate = () => {
  console.log("🎯 window.handleUpdate called");
  return handleUpdate();
};
window.handleSearch = () => {
  const state = getState();
  return handleSearch(state.user, state.transactions, showProcessingModal, showResultModal, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
};
window.viewTransaction = (index) => {
  const state = getState();
  return viewTransaction(index, state.transactions, formatDate, copyToClipboard);
};
window.editTransaction = (index) => {
  const state = getState();
  // Use window.transactionList for consistency
  const transactionList = window.transactionList || state.transactions || [];
  return editTransaction(index, transactionList, fetchSoftwareList, updatePackageList, updateAccountList);
};
window.deleteTransaction = (index) => {
  const state = getState();
  // Use window.transactionList instead of state.transactions for consistency
  const transactionList = window.transactionList || state.transactions || [];
  
  console.log('🔍 DeleteTransaction called with:', {
    index,
    transactionListLength: transactionList.length,
    hasTransaction: !!transactionList[index],
    stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
  });
  
  // Prevent automatic calls during page load
  if (!transactionList || transactionList.length === 0) {
    console.warn('⚠️ DeleteTransaction called but no transaction data available. Skipping.');
    return;
  }
  
  return deleteTransaction(
    index,
    transactionList,
    state.user,
    window.loadTransactions,
    window.handleReset,
    showProcessingModal,
    showResultModal,
    openConfirmModal,
    getConstants
  );
};
window.handleUpdateCookie = (index) => {
  const state = getState();
  return handleUpdateCookie(index, state.transactions);
};
window.handleChangePassword = handleChangePassword;
window.handleAddExpense = handleAddExpense;
window.closeChangePasswordModal = closeChangePasswordModal;
window.confirmChangePassword = confirmChangePassword;
window.confirmUpdateCookie = confirmUpdateCookie;
window.cancelUpdateCookie = cancelUpdateCookie;
window.copyCurrentCookie = copyCurrentCookie;
window.closeUpdateCookieModal = closeUpdateCookieModal;
window.editExpenseRow = editExpenseRow;
window.handleDeleteExpense = handleDeleteExpense;
window.handleUpdateExpense = handleUpdateExpense;
window.viewExpenseRow = viewExpenseRow;
window.handleSearchExpense = () => handleSearchExpense();
window.handleResetExpense = handleResetExpense;
window.editRow = (index) => {
  const state = getState();
  return editRow(index, state.transactions);
};
window.deleteRow = (index) => {
  console.log('🔍 Legacy deleteRow called with index:', index);
  return deleteRow(index, window.deleteTransaction);
};
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.closeProcessingModal = closeProcessingModal;
window.firstPage = firstPage;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.lastPage = lastPage;
window.goToPage = goToPage;

// Export state management for modules that need it
window.getState = getState;
window.updateState = updateState;
window.switchToTab = async (tabName, options) => await switchToTab(tabName, options);

// Legacy global variables (maintained for compatibility)
window.currentEditIndex = -1;
window.currentEditTransactionId = null;
window.transactionList = [];
window.today = new Date();
window.todayFormatted = `${window.today.getFullYear()}/${String(window.today.getMonth() + 1).padStart(2, '0')}/${String(window.today.getDate()).padStart(2, '0')}`;
window.currentPage = 1;
window.itemsPerPage = 50;
window.softwareData = [];
window.confirmCallback = null;
window.currentSoftwareName = "";
window.currentSoftwarePackage = "";
window.currentAccountName = "";
window.isExpenseSearching = false;
window.expenseList = [];
window.currentExpensePage = 1;

// Start the app immediately when module loads
console.log('🚀 Main.js: Starting app...');
startApp().catch(error => {
  console.error('❌ Main.js: Failed to start app:', error);
});