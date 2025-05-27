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


// Thực hiện khi DOMContentLoaded
// CÁCH 1: Sửa trong file main.js - Di chuyển phần khởi tạo tab lên trước

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

  // ✅ KHỞI TẠO HỆ THỐNG HIỂN THỊ TỔNG SỐ NGAY LẬP TỨC
  initTotalDisplay();

  // ✅ HIỂN THỊ THÔNG TIN NGƯỜI DÙNG NGAY LẬP TỨC
  document.getElementById("userWelcome").textContent =
    `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;

  // ✅ THIẾT LẬP CÁC SỰ KIỆN TAB NGAY LẬP TỨC (TRƯỚC KHI LOAD DỮ LIỆU)
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
        // Chỉ refresh nếu dữ liệu đã được load
        if (window.transactionList && window.transactionList.length >= 0) {
          console.log("🔄 Chuyển sang tab giao dịch - refresh bảng");
          window.loadTransactions();
        }
      } else if (selectedTab === "tab-chi-phi" || selectedTab === "tab-thong-ke") {
        // ✅ DEBUG: Check tab switching details
        const activeButton = document.querySelector(".tab-button.active");
        const tabContent = document.getElementById(selectedTab);
        const tabStyle = tabContent ? window.getComputedStyle(tabContent) : null;
        
        console.log("🔍 DEBUG main.js tab switching:", {
          selectedTab: selectedTab,
          activeButtonDataset: activeButton ? activeButton.dataset.tab : "null",
          tabContent: tabContent ? "found" : "null",
          tabDisplay: tabStyle ? tabStyle.display : "unknown"
        });
        
        // ✅ Khởi tạo statistics UI controller nếu là tab thống kê
        if (selectedTab === "tab-thong-ke") {
          console.log("🎮 Initializing statistics UI for tab-thong-ke...");
          // Lazy load and initialize statistics UI controller
          import('./statisticsUIController.js').then(module => {
            if (module.initializeStatisticsUI) {
              console.log("✅ Statistics UI Controller loaded, initializing...");
              module.initializeStatisticsUI();
            }
          }).catch(error => {
            console.warn("⚠️ Could not load statistics UI controller:", error);
            // Fallback to legacy renderExpenseStats
            renderExpenseStats();
          });
        } else {
          // Refresh bảng chi phí cho tab chi phí
          console.log("🔄 Chuyển sang tab chi phí - refresh bảng");
          renderExpenseStats();
        }
      }
    });
  });

  // ✅ XỬ LÝ LOGIC ẨN/HIỆN TAB DỰA TRÊN QUYỀN (NGAY LẬP TỨC)
  const tabNhinThay = window.userInfo.tabNhinThay || "tất cả";
  const allowedTabs = tabNhinThay.toLowerCase().split(",").map(t => t.trim());
  
  if (tabNhinThay !== "tất cả") {
    document.querySelectorAll(".tab-button").forEach(button => {
      const tabName = button.dataset.tab;
      let tabKey = "";
      
      if (tabName === "tab-giao-dich") tabKey = "giao dịch";
      else if (tabName === "tab-chi-phi") tabKey = "chi phí";
      else if (tabName === "tab-thong-ke") tabKey = "thống kê";
      
      if (tabKey && !allowedTabs.includes(tabKey)) {
        button.style.display = "none";
      }
    });
    
    // Chuyển đến tab đầu tiên được phép nếu tab hiện tại bị ẩn
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

  // ✅ THIẾT LẬP CÁC INPUT NGÀY THÁNG
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
  const transactionDateInput = document.getElementById("transactionDate");

  startDateInput.value = window.todayFormatted;
  transactionDateInput.value = window.todayFormatted;

  startDateInput.addEventListener("change", () =>
    calculateEndDate(startDateInput, durationInput, endDateInput)
  );
  durationInput.addEventListener("input", () =>
    calculateEndDate(startDateInput, durationInput, endDateInput)
  );

  // ✅ THIẾT LẬP CÁC SỰ KIỆN DROPDOWN
  document.getElementById("softwareName").addEventListener("change", () =>
    updatePackageList(window.softwareData, null, updateAccountList)
  );
  document.getElementById("softwarePackage").addEventListener("change", () =>
    updateAccountList(window.softwareData, null)
  );

  // ✅ THIẾT LẬP CHI PHÍ
  document.getElementById("expenseDate").value = window.todayFormatted;
  document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";

  // ✅ BẮT ĐẦU LOAD DỮ LIỆU (KHÔNG ĐỒNG BỘ - KHÔNG BLOCK UI)
  console.log("🚀 Bắt đầu load dữ liệu không đồng bộ...");
  
  // Load dữ liệu phần mềm
  fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList)
    .catch(err => console.error("Lỗi khi load danh sách phần mềm:", err));
  
  // Load dropdown chi phí
  initExpenseDropdowns()
    .catch(err => console.error("Lỗi khi load dropdown chi phí:", err));
  
  // Load giao dịch (chỉ khi đang ở tab giao dịch)
  const currentActiveTab = document.querySelector(".tab-button.active");
  if (currentActiveTab && currentActiveTab.dataset.tab === "tab-giao-dich") {
    window.loadTransactions()
      .catch(err => console.error("Lỗi khi load giao dịch:", err));
  }

  console.log("✅ Khởi tạo hoàn tất - UI có thể tương tác ngay lập tức");
});



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
window.handleChangePassword = (index) =>
  alert("🔐 Chức năng đổi mật khẩu đang được phát triển cho index: " + index);
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
