/**
 * main.js - Entry Point
 * 
 * Main entry point that orchestrates all application modules
 * Imports and initializes core application functionality
 */


// Import core modules
import { initializeApp } from './core/appInitializer.js';
import { initializeEventHandlers } from './core/eventManager.js';
import { initializeStateManager, getState, updateState } from './core/stateManager.js';
import { switchToTab, initializeTabSystem, switchToIntendedTab } from './core/navigationManager.js';
import { initializeTabPermissions } from './core/tabPermissions.js';
import { initializeSessionValidation, validateSessionImmediate } from './core/sessionValidator.js';
import { authManager } from './core/authManager.js';
import './debugAuth.js'; // Debug functions
import './debugEmployeeBadge.js'; // Debug employee badge
import './debug-employee-report.js'; // Debug employee report

// Import essential utilities (use unified modal system)
import { showProcessingModal, showResultModal, closeProcessingModal } from './modalUnified.js';

// Import unified detail modal for view functionality
import './detailModalUnified.js';

// Import tab initialization functions
import { initExpenseTab } from './initExpenseTab.js';
import { initTransactionTab } from './initTransactionTab.js';
import { initStatisticsTab } from './initStatisticsTab.js';

// Import employee report modules
import './reports/employee/employeeReport.js';
import './reports/employee/employeeReportLoader.js';
import './reports/employee/employeeReportCore.js';

// Import financial management modules
import './reports/finance/financialReport.js';
import './reports/finance/financialLoader.js';
import './reports/finance/financialCore.js';

// Import performance optimizers
import './core/requestOptimizer.js';
import './core/domOptimizer.js';

// Import legacy functions for backward compatibility
import { logout } from './logout.js';
import { openCalendar } from './openCalendar.js';
import { calculateEndDate, initializeDateCalculations } from './calculateEndDate.js';
import { updateCustomerInfo } from './updateCustomerInfo.js';
import { handleReset } from './handleReset.js';
import { loadTransactions, loadTransactionsOptimized } from './loadTransactions.js';
import { handleAdd } from './handleAdd.js';
import { handleUpdate } from './handleUpdate.js';
import { handleSearch } from './handleSearch.js';
import { viewTransaction } from './viewTransaction.js';

// Make view functions available globally
window.viewTransaction = viewTransaction;
import { editTransaction } from './editTransaction.js';
import { deleteTransaction } from './deleteTransaction.js';
import { fetchSoftwareList } from './fetchSoftwareList.js';
import { updatePackageList } from './updatePackageList.js';
import { updateAccountList } from './updateAccountList.js';
import { updateTable } from './updateTableUltraFast.js';
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
import { initExpenseQuickSearchNew } from './expenseQuickSearchNew.js';
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
import { checkSheetAccess } from './checkSheetAccess.js';
import { editRow, deleteRow } from './legacy.js';
import { getConstants } from './constants.js';

/**
 * Show login form when user is not authenticated
 */
function showLoginForm() {
  
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
  
  try {
    // Phase 1: Initialize state and authentication
    initializeStateManager();
    
    // Check authentication
    const hasSession = authManager.loadSession();
    
    if (hasSession) {
      // Phase 1.5: Immediate session validation for authenticated users
      const sessionValid = await validateSessionImmediate();
      if (!sessionValid) {
        return; // Stop app initialization
      }
      // Setup periodic validation after immediate check passes
      initializeSessionValidation();
    }
    
    if (!hasSession) {
      // Try legacy session format
      const userData = localStorage.getItem("employeeInfo");
      
      if (userData) {
        try {
          const userInfo = JSON.parse(userData);
          
          // Add default tab permissions for legacy users
          if (!userInfo.tabNhinThay) {
            userInfo.tabNhinThay = 'tất cả'; // Default to all tabs for legacy users
          }
          
          updateState({ user: userInfo });
          
          // Phase 1.5: Immediate session validation for legacy users
          const sessionValid = await validateSessionImmediate();
          if (!sessionValid) {
            return; // Stop app initialization
          }
          // Setup periodic validation after immediate check passes
          initializeSessionValidation();
        } catch (e) {
          // Show login form instead of redirect
          showLoginForm();
          return;
        }
      } else {
        // Show login form instead of redirect
        showLoginForm();
        return;
      }
    } else {
    }
    
    // Phase 2: Initialize core application
    await initializeApp();
    
    // Phase 3: Setup event handlers
    initializeEventHandlers();
    
    // Phase 4: Initialize navigation system
    initializeTabSystem();
    
    // Phase 4.1: Switch to intended tab after authentication
    switchToIntendedTab();
    
    
    // Phase 4.5: Initialize date defaults and calculations
    setTimeout(() => {
      initializeDateCalculations();
    }, 100); // Small delay to ensure DOM is ready
    
    // Phase 5: Apply ultra full-width layout override
    setTimeout(async () => {
      try {
        // Import and run the force full-width script
        const { forceFullWidth } = await import('./forceFullWidth.js');
        forceFullWidth();
      } catch (error) {
        
        // Fallback: Apply basic full-width override directly
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
          }, 100);
        }
      }
    }, 500);
    
    
  } catch (error) {
    showResultModal(
      'Lỗi khởi tạo ứng dụng',
      'Có lỗi xảy ra khi khởi tạo ứng dụng. Vui lòng tải lại trang.',
      'error'
    );
  }
}

// Legacy global function exports for backward compatibility
window.logout = logout;
window.showProcessingModal = showProcessingModal;
window.closeProcessingModal = closeProcessingModal; 
window.showResultModal = showResultModal;

// Employee report debug functions (inline for immediate availability)
window.debugEmployeeReport = function() {
    console.log('🔍 Debugging Employee Report...');
    
    const results = {
        functions: {
            loadEmployeeReport: typeof window.loadEmployeeReport,
            initEmployeeReport: typeof window.initEmployeeReport,
            cleanupEmployeeReport: typeof window.cleanupEmployeeReport
        },
        containers: {
            reportEmployee: !!document.getElementById('report-employee'),
            reportPagesContainer: !!document.getElementById('report-pages-container')
        },
        menuItems: {
            employeeMenuItem: !!document.querySelector('[data-report="employee"]'),
            menuItemsCount: document.querySelectorAll('.menu-item').length
        },
        globalData: {
            transactionData: window.currentTransactionData ? window.currentTransactionData.length : 'undefined',
            expenseData: window.currentExpenseData ? window.currentExpenseData.length : 'undefined',
            transactionList: window.transactionList ? window.transactionList.length : 'undefined',
            expenseList: window.expenseList ? window.expenseList.length : 'undefined'
        }
    };
    
    console.log('Debug results:', results);
    
    // Try to manually trigger employee report
    console.log('🧪 Testing manual employee report load...');
    if (window.loadEmployeeReport) {
        window.loadEmployeeReport();
    } else {
        console.error('❌ loadEmployeeReport function not available');
    }
    
    return results;
};

window.forceEmployeeReport = function() {
    console.log('🔧 Force loading employee report...');
    
    // Hide all report pages
    const reportPages = document.querySelectorAll('.report-page');
    reportPages.forEach(page => page.classList.remove('active'));
    console.log('Hidden report pages:', reportPages.length);
    
    // Show employee report page
    const employeePage = document.getElementById('report-employee');
    if (employeePage) {
        employeePage.classList.add('active');
        console.log('✅ Employee page shown');
        
        // Force load template
        fetch('./partials/tabs/report-pages/employee-report.html')
            .then(response => response.text())
            .then(html => {
                employeePage.innerHTML = html;
                console.log('✅ Template injected directly');
            })
            .catch(error => {
                console.error('❌ Template load failed:', error);
            });
        
    } else {
        console.error('❌ Employee page not found');
    }
    
    // Update menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    const employeeMenuItem = document.querySelector('[data-report="employee"]');
    if (employeeMenuItem) {
        employeeMenuItem.classList.add('active');
        console.log('✅ Employee menu item activated');
    }
};

// Financial Management debug functions (inline for immediate availability)
window.debugFinancialManagement = function() {
    console.log('🔍 Debugging Financial Management...');
    
    const results = {
        functions: {
            loadFinancialManagement: typeof window.loadFinancialManagement,
            initFinancialManagement: typeof window.initFinancialManagement,
            cleanupFinancialManagement: typeof window.cleanupFinancialManagement
        },
        containers: {
            reportFinance: !!document.getElementById('report-finance'),
            reportPagesContainer: !!document.getElementById('report-pages-container')
        },
        menuItems: {
            financeMenuItem: !!document.querySelector('[data-report="finance"]'),
            menuItemsCount: document.querySelectorAll('.menu-item').length
        },
        currentPage: {
            currentActiveReport: document.querySelector('.report-page.active')?.id,
            currentActiveMenu: document.querySelector('.menu-item.active')?.dataset?.report
        }
    };
    
    console.table(results.functions);
    console.table(results.containers);
    console.table(results.menuItems);
    console.table(results.currentPage);
    
    // Test loading function
    if (typeof window.loadFinancialManagement === 'function') {
        console.log('✅ Testing loadFinancialManagement...');
        window.loadFinancialManagement();
    } else {
        console.error('❌ loadFinancialManagement function not available');
    }
    
    return results;
};

window.forceFinancialManagement = function() {
    console.log('🔧 Force loading financial management...');
    
    // Hide all report pages
    const reportPages = document.querySelectorAll('.report-page');
    reportPages.forEach(page => page.classList.remove('active'));
    console.log('Hidden report pages:', reportPages.length);
    
    // Show financial report page
    const financePage = document.getElementById('report-finance');
    if (financePage) {
        financePage.classList.add('active');
        console.log('✅ Finance page shown');
        
        // Force load financial management
        if (typeof window.loadFinancialManagement === 'function') {
            window.loadFinancialManagement();
            console.log('✅ Financial management forced');
        } else {
            console.error('❌ loadFinancialManagement not available');
        }
        
    } else {
        console.error('❌ Finance page not found');
    }
    
    // Update menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    const financeMenuItem = document.querySelector('[data-report="finance"]');
    if (financeMenuItem) {
        financeMenuItem.classList.add('active');
        console.log('✅ Finance menu item activated');
    }
};

// Make close function available globally
window.closeProcessingModalUnified = closeProcessingModal;
window.updatePackageList = updatePackageList;
window.updateAccountList = updateAccountList;
window.fetchSoftwareList = fetchSoftwareList;
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
window.loadTransactionsOptimized = (options = {}) => {
  const state = getState();
  return loadTransactionsOptimized(state.user, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction, options);
};
window.handleAdd = () => {
  const state = getState();
  return handleAdd(state.user, state.currentEditTransactionId, window.loadTransactions, window.handleReset, updatePackageList, showProcessingModal, showResultModal);
};
window.handleUpdate = () => {
  return handleUpdate();
};
window.handleSearch = () => {
  const state = getState();
  return handleSearch(state.user, state.transactions, showProcessingModal, showResultModal, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
};
window.viewTransaction = (indexOrTransaction, transactionList, formatDateFn) => {
  const state = getState();
  // Use passed parameters or defaults
  const list = transactionList || state.transactions || window.transactionList;
  const formatter = formatDateFn || formatDate;
  return viewTransaction(indexOrTransaction, list, formatter);
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
  
  // Prevent automatic calls during page load
  if (!transactionList || transactionList.length === 0) {
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
  // Use window.transactionList for consistency with updateTable.js
  return handleUpdateCookie(index, window.transactionList);
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
  return deleteRow(index, window.deleteTransaction);
};
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.closeProcessingModal = closeProcessingModal;
// Add/Update modal handlers
window.openAddOrUpdateModal = openAddOrUpdateModal;
window.closeAddOrUpdateModal = closeAddOrUpdateModal;
window.handleAddNewTransaction = handleAddNewTransaction;
window.handleUpdateTransactionFromModal = handleUpdateTransactionFromModal;
window.handleCancelModal = handleCancelModal;
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
startApp().catch(error => {
});