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

// ✅ Import statistics module
import { initStatistics } from './statistics-core.js';

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

  // ✅ KHỞI TẠO HỆ THỐNG HIỂN THỊ TỔNG SỐ NGAY LẬP TỨC
  initTotalDisplay();

  // ✅ HIỂN THỊ THÔNG TIN NGƯỜI DÙNG NGAY LẬP TỨC
  document.getElementById("userWelcome").textContent =
    `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;

  // ✅ Load tab thống kê HTML
  await loadStatisticsHTML();

  // ✅ THIẾT LẬP CÁC SỰ KIỆN TAB NGAY LẬP TỨC (TRƯỚC KHI LOAD DỮ LIỆU)
  document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", async () => {
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
      } else if (selectedTab === "tab-chi-phi") {
        // Refresh bảng chi phí
        console.log("🔄 Chuyển sang tab chi phí - refresh bảng");
        renderExpenseStats();
      } else if (selectedTab === "tab-thong-ke") {
        // ✅ Khởi tạo tab thống kê
        console.log("🔄 Chuyển sang tab thống kê - khởi tạo");
        await initStatistics();
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

  if (startDateInput && transactionDateInput) {
    startDateInput.value = window.todayFormatted;
    transactionDateInput.value = window.todayFormatted;

    startDateInput.addEventListener("change", () =>
      calculateEndDate(startDateInput, durationInput, endDateInput)
    );
    durationInput.addEventListener("input", () =>
      calculateEndDate(startDateInput, durationInput, endDateInput)
    );
  }

  // ✅ THIẾT LẬP CÁC SỰ KIỆN DROPDOWN
  const softwareNameEl = document.getElementById("softwareName");
  const softwarePackageEl = document.getElementById("softwarePackage");
  
  if (softwareNameEl && softwarePackageEl) {
    softwareNameEl.addEventListener("change", () =>
      updatePackageList(window.softwareData, null, updateAccountList)
    );
    softwarePackageEl.addEventListener("change", () =>
      updateAccountList(window.softwareData, null)
    );
  }

  // ✅ THIẾT LẬP CHI PHÍ
  const expenseDateEl = document.getElementById("expenseDate");
  const expenseRecorderEl = document.getElementById("expenseRecorder");
  
  if (expenseDateEl && expenseRecorderEl) {
    expenseDateEl.value = window.todayFormatted;
    expenseRecorderEl.value = window.userInfo?.tenNhanVien || "";
  }

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

// ✅ Function load HTML cho tab thống kê
async function loadStatisticsHTML() {
  try {
    // Kiểm tra xem tab-thong-ke đã có nội dung chưa
    const tabElement = document.querySelector('#tab-thong-ke');
    if (!tabElement) {
      console.error("❌ Không tìm thấy #tab-thong-ke element");
      return;
    }
    
    // Nếu đã có nội dung (không phải chỉ có text "Nội dung sẽ được load..."), không load lại
    if (tabElement.innerHTML.trim() && !tabElement.innerHTML.includes('Nội dung sẽ được load')) {
      console.log("✅ Tab thống kê đã có nội dung, không cần load lại");
      return;
    }

    const response = await fetch('tab-thong-ke.html');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Chỉ cập nhật nội dung, không tạo element mới
    tabElement.innerHTML = html;
    console.log("✅ Đã load tab-thong-ke.html thành công");
    
  } catch (error) {
    console.error('❌ Lỗi khi load tab-thong-ke.html:', error);
    const tabElement = document.querySelector('#tab-thong-ke');
    if (tabElement) {
      tabElement.innerHTML = `
        <div style="text-align: center; padding: 50px; color: #dc3545;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
          <p>Không thể tải tab thống kê. Vui lòng thử lại.</p>
          <button onclick="loadStatisticsHTML()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Thử lại</button>
        </div>
      `;
    }
  }
}

// ✅ Gán các function vào window
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