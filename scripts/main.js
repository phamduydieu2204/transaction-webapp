// Khai báo các biến và thiết lập ban đầu
window.userInfo = null;
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

// Import các module cần thiết
import { getConstants } from './constants.js';
import { calculateEndDate } from './calculateEndDate.js';
import { logout } from './logout.js';
import { updateAccountList } from './updateAccountList.js';
import { openCalendar } from './openCalendar.js';
import { updateCustomerInfo } from './updateCustomerInfo.js';
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { handleReset } from './handleReset.js';
import { formatDate } from './formatDate.js';
import { handleAdd } from './handleAdd.js';
import { handleUpdate } from './handleUpdate.js';
import { handleSearch } from './handleSearch.js';
import { loadTransactions } from './loadTransactions.js';
import { updateTable } from './updateTable.js';
import { viewTransaction } from './viewTransaction.js';
import { copyToClipboard } from './copyToClipboard.js';
import { closeModal } from './closeModal.js';
import { updatePagination, firstPage, prevPage, nextPage, lastPage, goToPage } from './pagination.js';
import { editTransaction } from './editTransaction.js';
import { deleteTransaction } from './deleteTransaction.js';
import { fetchSoftwareList } from './fetchSoftwareList.js';
import { updatePackageList } from './updatePackageList.js';
import { editRow, deleteRow } from './legacy.js';
import { handleAddExpense } from './handleAddExpense.js';
import { initExpenseDropdowns } from './initExpenseDropdowns.js';
import { renderExpenseStats } from './renderExpenseStats.js';
import { editExpenseRow } from './editExpenseRow.js';
import { handleDeleteExpense } from './handleDeleteExpense.js';
import { handleUpdateExpense } from './handleUpdateExpense.js';
import { viewExpenseRow } from './viewExpenseRow.js';
import { handleSearchExpense } from './handleSearchExpense.js';
import { initTotalDisplay } from './updateTotalDisplay.js';
import { initStatistics, updateStatistics, loadEmployeeFilter } from './statisticsHandler.js';
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

// ✅ Import module load tab content
import { loadTabContent, waitForTabsLoaded } from './loadTabContent.js';

// Thực hiện khi DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {

  window.isExpenseSearching = false;
  window.expenseList = [];

  const userData = localStorage.getItem("employeeInfo");
  try {
    window.userInfo = userData ? JSON.parse(userData) : null;
  } catch (e) {
    window.userInfo = null;
  }

  if (!window.userInfo) {
    window.location.href = "index.html";
    return;
  }

  // ✅ Load nội dung các tab từ file riêng TRƯỚC KHI khởi tạo
  console.log('🔄 Bắt đầu load tab content...');
  await loadTabContent();
  
  // ✅ Chờ cho đến khi các tab được load xong
  await waitForTabsLoaded();
  console.log('✅ Tab content đã sẵn sàng');

  // ✅ Khởi tạo hệ thống hiển thị tổng số
  initTotalDisplay();

  document.getElementById("userWelcome").textContent =
  `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;

  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
  const transactionDateInput = document.getElementById("transactionDate");

  // ✅ Kiểm tra xem các element có tồn tại không trước khi sử dụng
  if (startDateInput && durationInput && endDateInput && transactionDateInput) {
    startDateInput.value = window.todayFormatted;
    transactionDateInput.value = window.todayFormatted;

    startDateInput.addEventListener("change", () =>
      calculateEndDate(startDateInput, durationInput, endDateInput)
    );
    durationInput.addEventListener("input", () =>
      calculateEndDate(startDateInput, durationInput, endDateInput)
    );
  } else {
    console.warn('⚠️ Một số element của form giao dịch chưa sẵn sàng');
  }

  await fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);
  await initExpenseDropdowns();

  // ✅ Kiểm tra element tồn tại trước khi add event listener
  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  
  if (softwareNameSelect && softwarePackageSelect) {
    softwareNameSelect.addEventListener("change", () =>
      updatePackageList(window.softwareData, null, updateAccountList)
    );
    softwarePackageSelect.addEventListener("change", () =>
      updateAccountList(window.softwareData, null)
    );
  }

  window.loadTransactions();

  // ✅ Thêm phần khởi tạo tab thống kê
  console.log('🔄 Khởi tạo tab thống kê...');
  await loadEmployeeFilter();
    
  // ✅ Xử lý tab switching với kiểm tra element tồn tại
  document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => {
      const selectedTab = button.dataset.tab;

      // 1. Kích hoạt nút
      document.querySelectorAll(".tab-button").forEach(btn =>
        btn.classList.remove("active")
      );
      button.classList.add("active");

      // 2. Ẩn tất cả tab content
      document.querySelectorAll(".tab-content").forEach(content =>
        content.classList.remove("active")
      );

      // 3. Hiện tab tương ứng
      const target = document.getElementById(selectedTab);
      if (target) {
        target.classList.add("active");
      }

      const transactionSection = document.getElementById("transactionSection");
      if (transactionSection) {
        if (selectedTab === "tab-giao-dich") {
          transactionSection.style.display = "block";
        } else {
          transactionSection.style.display = "none";
        }
      }

      // ✅ Xử lý logic riêng cho từng tab
      if (selectedTab === "tab-giao-dich") {
        console.log("🔄 Chuyển sang tab giao dịch - refresh bảng");
        window.loadTransactions();
      } else if (selectedTab === "tab-chi-phi") {
        console.log("🔄 Chuyển sang tab chi phí - refresh bảng");
        renderExpenseStats();
      } else if (selectedTab === "tab-thong-ke") {
        // ✅ QUAN TRỌNG: Khởi tạo thống kê khi chuyển sang tab
        console.log("🔄 Chuyển sang tab thống kê - khởi tạo thống kê");
        initStatistics();
        updateStatistics();
      }
    });

    // ✅ Thêm logic ẩn/hiện tab dựa trên quyền (di chuyển vào trong forEach)
    const tabNhinThay = window.userInfo.tabNhinThay || "tất cả";
    const allowedTabs = tabNhinThay.toLowerCase().split(",").map(t => t.trim());
    
    if (tabNhinThay !== "tất cả") {
      const tabName = button.dataset.tab;
      let tabKey = "";
      
      if (tabName === "tab-giao-dich") tabKey = "giao dịch";
      else if (tabName === "tab-chi-phi") tabKey = "chi phí";
      else if (tabName === "tab-thong-ke") tabKey = "thống kê";
      
      if (tabKey && !allowedTabs.includes(tabKey)) {
        button.style.display = "none";
      }
    }
  });
  
  // ✅ Chuyển đến tab đầu tiên được phép nếu tab hiện tại bị ẩn
  const tabNhinThay = window.userInfo.tabNhinThay || "tất cả";
  if (tabNhinThay !== "tất cả") {
    const activeTab = document.querySelector(".tab-button.active");
    if (activeTab && activeTab.style.display === "none") {
      const firstVisibleTab = document.querySelector(".tab-button:not([style*='display: none'])");
      if (firstVisibleTab) {
        activeTab.classList.remove("active");
        firstVisibleTab.classList.add("active");
        firstVisibleTab.click();
      }
    }
  }

  // ✅ Nếu tab thống kê active ngay từ đầu
  const activeTab = document.querySelector(".tab-button.active");
  if (activeTab && activeTab.dataset.tab === "tab-thong-ke") {
    console.log("🔄 Tab thống kê active từ đầu - khởi tạo");
    setTimeout(() => {
      initStatistics();
      updateStatistics();
    }, 1000);
  }

  // ✅ Khởi tạo giá trị cho tab chi phí nếu element tồn tại
  const expenseDateInput = document.getElementById("expenseDate");
  const expenseRecorderInput = document.getElementById("expenseRecorder");
  
  if (expenseDateInput) {
    expenseDateInput.value = window.todayFormatted;
  }
  if (expenseRecorderInput) {
    expenseRecorderInput.value = window.userInfo?.tenNhanVien || "";
  }
  
  // ✅ Gọi handleRecurringChange nếu hàm tồn tại
  if (typeof window.handleRecurringChange === 'function') {
    window.handleRecurringChange();
  }
});

// ✅ Gán các hàm vào window object (di chuyển ra ngoài DOMContentLoaded)
window.logout = logout;
window.openCalendar = (inputId) =>
  openCalendar(inputId, calculateEndDate, document.getElementById("startDate"), document.getElementById("duration"), document.getElementById("endDate"));
window.updateCustomerInfo = () => updateCustomerInfo(window.transactionList);
window.handleReset = () =>
  handleReset(fetchSoftwareList, showProcessingModal, showResultModal, window.todayFormatted, updatePackageList, updateAccountList);
window.loadTransactions = () =>
  loadTransactions(window.userInfo, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
window.handleAdd = () =>
  handleAdd(window.userInfo, window.currentEditTransactionId, window.loadTransactions, window.handleReset, updatePackageList, showProcessingModal, showResultModal);
window.handleUpdate = () =>
  handleUpdate(window.userInfo, window.currentEditTransactionId, window.transactionList, window.loadTransactions, window.handleReset, showProcessingModal, showResultModal, getConstants, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction, fetchSoftwareList, updatePackageList, updateAccountList);
window.handleSearch = () =>
  handleSearch(window.userInfo, window.transactionList, showProcessingModal, showResultModal, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
window.viewTransaction = (index) =>
  viewTransaction(index, window.transactionList, formatDate, copyToClipboard);
window.editTransaction = (index) => {
  editTransaction(index, window.transactionList, fetchSoftwareList, updatePackageList, updateAccountList);
};
window.deleteTransaction = (index) =>
  deleteTransaction(
    index,
    window.transactionList,
    window.userInfo,
    window.loadTransactions,
    window.handleReset,
    showProcessingModal,
    showResultModal,
    openConfirmModal,
    getConstants
  );
  
window.handleUpdateCookie = (index) =>
  handleUpdateCookie(index, window.transactionList);
window.handleChangePassword = handleChangePassword; // ✅ Sửa: bỏ dòng duplicate
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
window.currentExpensePage = 1;
window.editRow = (index) => editRow(index, window.transactionList);
window.deleteRow = (index) => deleteRow(index, window.deleteTransaction);
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.closeProcessingModal = closeProcessingModal;
window.firstPage = firstPage;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.lastPage = lastPage;
window.goToPage = goToPage;