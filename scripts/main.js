/**
 * main.js - Entry Point (Optimized for Fast Loading)
 * 
 * Main entry point with lazy loading for better performance
 * Only loads essential modules initially, others are loaded on-demand
 */

// Import core modules (essential for startup)
import { initializeApp } from './core/appInitializer.js';
import { initializeEventHandlers } from './core/eventManager.js';
import { initializeStateManager, getState, updateState } from './core/stateManager.js';
import { switchToTab, initializeTabSystem, switchToIntendedTab } from './core/navigationManager.js';
import { initializeSessionValidation, validateSessionImmediate } from './core/sessionValidator.js';
import { authManager } from './core/authManager.js';

// Import lazy loading system
import { loadModule, preloadModule } from './core/lazyLoader.js';
import { loadTabModules, startSmartPreloading } from './core/tabLoader.js';

// Import performance monitoring
import { trackModuleLoad, trackTabSwitch, generateReport } from './core/performanceMonitor.js';

// Import essential utilities only
import { showProcessingModal, showResultModal, closeProcessingModal } from './modalUnified.js';
import { getConstants } from './constants.js';

// Cache for loaded modules to avoid re-importing
const moduleCache = new Map();

/**
 * Lazy load a function and cache it
 */
async function lazyLoadFunction(functionName, modulePath, exportName = null) {
  if (moduleCache.has(functionName)) {
    return moduleCache.get(functionName);
  }
  
  try {
    // Use the path as provided - don't auto-adjust anymore
    const module = await loadModule(modulePath);
    const fn = exportName ? module[exportName] : module[functionName] || module.default;
    
    if (typeof fn === 'function') {
      moduleCache.set(functionName, fn);
      return fn;
    } else {
      console.error(`❌ Function ${functionName} not found in ${modulePath}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Failed to load ${functionName} from ${modulePath}:`, error);
    return null;
  }
}

/**
 * Create a lazy wrapper for a function
 */
function createLazyFunction(functionName, modulePath, exportName = null) {
  return async (...args) => {
    const fn = await lazyLoadFunction(functionName, modulePath, exportName);
    if (fn) {
      return fn(...args);
    }
    throw new Error(`Function ${functionName} could not be loaded`);
  };
}

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
 * Fast application initialization for better UX
 */
async function initializeAppFast() {
  try {
    console.log('⚡ Starting fast app initialization...');
    
    // Import fast loader and skeleton  
    const { default: fastDataLoader } = await loadModule('../core/fastDataLoader.js');
    const SkeletonLoader = (await loadModule('../core/skeletonLoader.js')).default;
    
    // Initialize globals and constants
    const { initializeGlobals } = await loadModule('../core/appInitializer.js');
    initializeGlobals();
    
    // Show skeleton loading immediately
    SkeletonLoader.showInitialLoadingState();
    
    // Get user from state
    const user = getState()?.user;
    if (!user) {
      console.error('❌ No user found for fast initialization');
      return;
    }
    
    // Phase 1: Load critical data (first 20 transactions + software)
    console.log('⚡ Loading critical data for immediate display...');
    const [criticalData, ] = await Promise.allSettled([
      fastDataLoader.loadCriticalData(user),
      fastDataLoader.loadSoftwareList()
    ]);
    
    // Update UI immediately with critical data
    if (criticalData.status === 'fulfilled' && criticalData.value.transactions.length > 0) {
      console.log('✅ Displaying first 20 transactions immediately');
      console.log('📊 Transaction data sample:', criticalData.value.transactions.slice(0, 2));
      
      // Load table updater and update immediately
      const { updateTableUltraFast } = await loadModule('../updateTableUltraFast.js');
      const { formatDate } = await loadModule('../formatDate.js');
      
      console.log('🔧 About to call updateTableUltraFast with:', {
        count: criticalData.value.transactions.length,
        page: 1,
        itemsPerPage: 20
      });
      
      await updateTableUltraFast(criticalData.value.transactions, 1, 20, formatDate, () => {}, () => {}, () => {});
      SkeletonLoader.hideAllSkeletons();
      
      console.log('✅ Initial data displayed to user');
    } else {
      console.error('❌ No critical data to display:', criticalData);
    }
    
    // Phase 2: Load remaining data in background (non-blocking)
    setTimeout(async () => {
      console.log('📊 Loading full data in background...');
      try {
        const fullData = await fastDataLoader.loadRemainingData(user);
        if (fullData && fullData.fullDataLoaded) {
          console.log('✅ Full data loaded in background');
          
          // Refresh UI with full data if user is still on transaction tab
          const currentTab = document.querySelector('.tab-content.active');
          if (currentTab && currentTab.id === 'tab-giao-dich') {
            const { updateTableUltraFast } = await loadModule('../updateTableUltraFast.js');
            const { formatDate } = await loadModule('../formatDate.js');
            await updateTableUltraFast(fullData.transactions, 1, 50, formatDate, () => {}, () => {}, () => {});
            console.log('🔄 UI refreshed with full data');
          }
        }
      } catch (error) {
        console.warn('⚠️ Background data loading failed:', error);
      }
    }, 100); // Load in background after 100ms
    
    console.log('⚡ Fast initialization complete');
  } catch (error) {
    console.error('❌ Fast initialization failed:', error);
    // Fallback to regular initialization
    const { initializeApp } = await loadModule('../core/appInitializer.js');
    await initializeApp();
  }
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
    
    // Phase 2: Initialize core application with fast loading
    await initializeAppFast();
    
    // Phase 3: Setup event handlers
    initializeEventHandlers();
    
    // Phase 4: Initialize navigation system and override tab switch function
    initializeTabSystem();
    
    // Override switchToTab to support lazy loading and performance tracking
    const originalSwitchToTab = window.switchToTab;
    window.switchToTab = async (tabName, options) => {
      const tabTracker = trackTabSwitch(tabName);
      try {
        // Load tab modules before switching
        console.log(`🔄 Loading modules for tab: ${tabName}`);
        await loadTabModules(tabName);
        
        // Now switch to the tab
        const result = await originalSwitchToTab(tabName, options);
        tabTracker.end();
        return result;
      } catch (error) {
        console.error(`❌ Error switching to tab ${tabName}:`, error);
        tabTracker.end();
        return false;
      }
    };
    
    // Phase 4.1: Switch to intended tab after authentication
    switchToIntendedTab();
    
    // Phase 4.2: Start smart preloading
    setTimeout(() => {
      startSmartPreloading();
    }, 1000);
    
    // Phase 5: Generate performance report after initial load
    setTimeout(() => {
      generateReport();
    }, 3000);
    
    
    // Phase 4.5: Initialize date defaults and calculations
    setTimeout(async () => {
      try {
        const { initializeDateCalculations } = await loadModule('../calculateEndDate.js');
        initializeDateCalculations();
      } catch (error) {
        console.error('Failed to initialize date calculations:', error);
      }
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

// Legacy global function exports with lazy loading for backward compatibility
window.logout = createLazyFunction('logout', './logout.js');
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

// Cash Flow vs Accrual debug functions (inline for immediate availability)
window.debugCashFlowAccrual = function() {
    console.log('🔍 Debugging Cash Flow vs Accrual...');
    
    const results = {
        functions: {
            loadCashFlowAccrualReport: typeof window.loadCashFlowAccrualReport,
            initCashFlowAccrualReport: typeof window.initCashFlowAccrualReport,
            cleanupCashFlowAccrualReport: typeof window.cleanupCashFlowAccrualReport
        },
        containers: {
            reportCashflowAccrual: !!document.getElementById('report-cashflow-accrual'),
            reportPagesContainer: !!document.getElementById('report-pages-container')
        },
        menuItems: {
            cashflowAccrualMenuItem: !!document.querySelector('[data-report="cashflow-accrual"]'),
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
    if (typeof window.loadCashFlowAccrualReport === 'function') {
        console.log('✅ Testing loadCashFlowAccrualReport...');
        window.loadCashFlowAccrualReport();
    } else {
        console.error('❌ loadCashFlowAccrualReport function not available');
    }
    
    return results;
};

window.forceCashFlowAccrual = function() {
    console.log('🔧 Force loading cash flow vs accrual...');
    
    // Hide all report pages
    const reportPages = document.querySelectorAll('.report-page');
    reportPages.forEach(page => page.classList.remove('active'));
    console.log('Hidden report pages:', reportPages.length);
    
    // Show cash flow accrual report page
    const cashflowPage = document.getElementById('report-cashflow-accrual');
    if (cashflowPage) {
        cashflowPage.classList.add('active');
        console.log('✅ Cash flow accrual page shown');
        
        // Force load cash flow accrual
        if (typeof window.loadCashFlowAccrualReport === 'function') {
            window.loadCashFlowAccrualReport();
            console.log('✅ Cash flow accrual forced');
        } else {
            console.error('❌ loadCashFlowAccrualReport not available');
        }
        
    } else {
        console.error('❌ Cash flow accrual page not found');
    }
    
    // Update menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    const cashflowMenuItem = document.querySelector('[data-report="cashflow-accrual"]');
    if (cashflowMenuItem) {
        cashflowMenuItem.classList.add('active');
        console.log('✅ Cash flow accrual menu item activated');
    }
};

// Lazy-loaded global functions for better performance
window.closeProcessingModalUnified = closeProcessingModal;
window.updatePackageList = createLazyFunction('updatePackageList', './updatePackageList.js');
window.updateAccountList = createLazyFunction('updateAccountList', './updateAccountList.js');
window.fetchSoftwareList = createLazyFunction('fetchSoftwareList', './fetchSoftwareList.js');
window.openCalendar = async (inputId) => {
  const [openCalendarFn, calculateEndDateFn] = await Promise.all([
    lazyLoadFunction('openCalendar', './openCalendar.js'),
    lazyLoadFunction('calculateEndDate', './calculateEndDate.js')
  ]);
  return openCalendarFn(inputId, calculateEndDateFn, document.getElementById("startDate"), document.getElementById("duration"), document.getElementById("endDate"));
};
window.updateCustomerInfo = async () => {
  const fn = await lazyLoadFunction('updateCustomerInfo', './updateCustomerInfo.js');
  const state = getState();
  return fn(state.transactions);
};
window.handleReset = async () => {
  const fn = await lazyLoadFunction('handleReset', './handleReset.js');
  const state = getState();
  return fn(window.fetchSoftwareList, showProcessingModal, showResultModal, state.todayFormatted, window.updatePackageList, window.updateAccountList);
};
window.loadTransactions = async () => {
  const [loadTransactionsFn, updateTableFn, formatDateFn, editTransactionFn, viewTransactionFn] = await Promise.all([
    lazyLoadFunction('loadTransactions', './loadTransactions.js'),
    lazyLoadFunction('updateTable', './updateTableUltraFast.js'),
    lazyLoadFunction('formatDate', './formatDate.js'),
    lazyLoadFunction('editTransaction', './editTransaction.js'),
    lazyLoadFunction('viewTransaction', './viewTransaction.js')
  ]);
  const state = getState();
  return loadTransactionsFn(state.user, updateTableFn, formatDateFn, editTransactionFn, window.deleteTransaction, viewTransactionFn);
};
window.loadTransactionsOptimized = async (options = {}) => {
  const fn = await lazyLoadFunction('loadTransactionsOptimized', './loadTransactions.js');
  const state = getState();
  return fn(state.user, window.updateTable, window.formatDate, window.editTransaction, window.deleteTransaction, window.viewTransaction, options);
};
window.handleAdd = async () => {
  const fn = await lazyLoadFunction('handleAdd', './handleAdd.js');
  const state = getState();
  return fn(state.user, state.currentEditTransactionId, window.loadTransactions, window.handleReset, window.updatePackageList, showProcessingModal, showResultModal);
};
window.handleUpdate = createLazyFunction('handleUpdate', './handleUpdate.js');
window.handleSearch = async () => {
  const [handleSearchFn, updateTableFn, formatDateFn, editTransactionFn, viewTransactionFn] = await Promise.all([
    lazyLoadFunction('handleSearch', './handleSearch.js'),
    lazyLoadFunction('updateTable', './updateTableUltraFast.js'),
    lazyLoadFunction('formatDate', './formatDate.js'),
    lazyLoadFunction('editTransaction', './editTransaction.js'),
    lazyLoadFunction('viewTransaction', './viewTransaction.js')
  ]);
  const state = getState();
  return handleSearchFn(state.user, state.transactions, showProcessingModal, showResultModal, updateTableFn, formatDateFn, editTransactionFn, window.deleteTransaction, viewTransactionFn);
};
window.viewTransaction = async (indexOrTransaction, transactionList, formatDateFn) => {
  const viewTransactionFn = await lazyLoadFunction('viewTransaction', './viewTransaction.js');
  const formatDateFn2 = formatDateFn || await lazyLoadFunction('formatDate', './formatDate.js');
  const state = getState();
  const list = transactionList || state.transactions || window.transactionList;
  return viewTransactionFn(indexOrTransaction, list, formatDateFn2);
};
window.editTransaction = async (index) => {
  const editTransactionFn = await lazyLoadFunction('editTransaction', './editTransaction.js');
  const state = getState();
  const transactionList = window.transactionList || state.transactions || [];
  return editTransactionFn(index, transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
};
window.deleteTransaction = async (index) => {
  const deleteTransactionFn = await lazyLoadFunction('deleteTransaction', './deleteTransaction.js');
  const openConfirmModalFn = await lazyLoadFunction('openConfirmModal', './confirmModal.js');
  const state = getState();
  const transactionList = window.transactionList || state.transactions || [];
  
  if (!transactionList || transactionList.length === 0) {
    return;
  }
  
  return deleteTransactionFn(
    index,
    transactionList,
    state.user,
    window.loadTransactions,
    window.handleReset,
    showProcessingModal,
    showResultModal,
    openConfirmModalFn,
    getConstants
  );
};
window.handleUpdateCookie = async (index) => {
  const fn = await lazyLoadFunction('handleUpdateCookie', './handleUpdateCookie.js');
  return fn(index, window.transactionList);
};
window.handleChangePassword = createLazyFunction('handleChangePassword', './handleChangePassword.js');
window.handleAddExpense = createLazyFunction('handleAddExpense', './handleAddExpense.js');
window.closeChangePasswordModal = createLazyFunction('closeChangePasswordModal', './handleChangePassword.js');
window.confirmChangePassword = createLazyFunction('confirmChangePassword', './handleChangePassword.js');
window.confirmUpdateCookie = createLazyFunction('confirmUpdateCookie', './handleUpdateCookie.js');
window.cancelUpdateCookie = createLazyFunction('cancelUpdateCookie', './handleUpdateCookie.js');
window.copyCurrentCookie = createLazyFunction('copyCurrentCookie', './handleUpdateCookie.js');
window.copyUsername = createLazyFunction('copyUsername', './handleUpdateCookie.js');
window.copyPassword = createLazyFunction('copyPassword', './handleUpdateCookie.js');
window.closeUpdateCookieModal = createLazyFunction('closeUpdateCookieModal', './handleUpdateCookie.js');
window.editExpenseRow = createLazyFunction('editExpenseRow', './editExpenseRow.js');
window.handleDeleteExpense = createLazyFunction('handleDeleteExpense', './handleDeleteExpense.js');
window.handleUpdateExpense = createLazyFunction('handleUpdateExpense', './handleUpdateExpense.js');
window.viewExpenseRow = createLazyFunction('viewExpenseRow', './viewExpenseRow.js');
window.handleSearchExpense = async () => {
  const fn = await lazyLoadFunction('handleSearchExpense', './handleSearchExpense.js');
  return fn();
};
window.handleResetExpense = createLazyFunction('handleResetExpense', './handleResetExpense.js');
window.editRow = async (index) => {
  const editRowFn = await lazyLoadFunction('editRow', './legacy.js');
  const state = getState();
  return editRowFn(index, state.transactions);
};
window.deleteRow = async (index) => {
  const deleteRowFn = await lazyLoadFunction('deleteRow', './legacy.js');
  return deleteRowFn(index, window.deleteTransaction);
};
window.initSoftwareTab = async () => {
  try {
    const initSoftwareTabFn = await lazyLoadFunction('initSoftwareTab', './initSoftwareTab.js');
    return initSoftwareTabFn();
  } catch (error) {
    console.warn('⚠️ initSoftwareTab function not available:', error);
  }
};
window.closeModal = createLazyFunction('closeModal', './closeModal.js');
window.confirmDelete = createLazyFunction('confirmDelete', './confirmModal.js');
window.closeProcessingModal = closeProcessingModal;
window.openAddOrUpdateModal = createLazyFunction('openAddOrUpdateModal', './handleAddOrUpdateModal.js');
window.closeAddOrUpdateModal = createLazyFunction('closeAddOrUpdateModal', './handleAddOrUpdateModal.js');
window.handleAddNewTransaction = createLazyFunction('handleAddNewTransaction', './handleAddOrUpdateModal.js');
window.handleUpdateTransactionFromModal = createLazyFunction('handleUpdateTransactionFromModal', './handleAddOrUpdateModal.js');
window.handleCancelModal = createLazyFunction('handleCancelModal', './handleAddOrUpdateModal.js');
window.firstPage = createLazyFunction('firstPage', './pagination.js');
window.prevPage = createLazyFunction('prevPage', './pagination.js');
window.nextPage = createLazyFunction('nextPage', './pagination.js');
window.lastPage = createLazyFunction('lastPage', './pagination.js');
window.goToPage = createLazyFunction('goToPage', './pagination.js');

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