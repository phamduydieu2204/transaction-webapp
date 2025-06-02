/**
 * main.js - Entry Point
 * 
 * Main entry point that orchestrates all application modules
 * Imports and initializes core application functionality
 */

// Import core modules
import { initializeApp } from './core/appInitializer.js';
import { initializeEventHandlers } from './core/eventManager.js';
import { initializeState, getState, updateState } from './core/stateManager.js';
import { switchToTab, initializeTabSystem } from './core/navigationManager.js';
import { authManager } from './core/authManager.js';

// Import essential utilities
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';

// Import legacy functions for backward compatibility
import { logout } from './logout.js';
import { openCalendar } from './openCalendar.js';
import { calculateEndDate } from './calculateEndDate.js';
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
 * Application startup sequence
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log('🚀 Starting Transaction WebApp...');
  
  try {
    // Phase 1: Initialize state and authentication
    console.log('📊 Phase 1: Initializing state and auth...');
    initializeState();
    
    // Check authentication
    if (!authManager.loadSession()) {
      // Try legacy session format
      const userData = localStorage.getItem("employeeInfo");
      if (userData) {
        try {
          const userInfo = JSON.parse(userData);
          updateState({ user: userInfo });
        } catch (e) {
          console.warn('Invalid legacy session data');
          window.location.href = "index.html";
          return;
        }
      } else {
        window.location.href = "index.html";
        return;
      }
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
    
    console.log('✅ Application startup complete!');
    
  } catch (error) {
    console.error('❌ Application startup failed:', error);
    showResultModal(
      'Lỗi khởi tạo ứng dụng',
      'Có lỗi xảy ra khi khởi tạo ứng dụng. Vui lòng tải lại trang.',
      'error'
    );
  }
});

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
  const state = getState();
  return handleUpdate(state.user, state.currentEditTransactionId, state.transactions, window.loadTransactions, window.handleReset, showProcessingModal, showResultModal, getConstants, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction, fetchSoftwareList, updatePackageList, updateAccountList);
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
  return editTransaction(index, state.transactions, fetchSoftwareList, updatePackageList, updateAccountList);
};
window.deleteTransaction = (index) => {
  const state = getState();
  return deleteTransaction(
    index,
    state.transactions,
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
window.deleteRow = (index) => deleteRow(index, window.deleteTransaction);
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
window.switchToTab = switchToTab;

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