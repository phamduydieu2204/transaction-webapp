// Khai báo biến toàn cục
window.userInfo = null;
window.currentEditIndex = -1;
window.currentEditTransactionId = null;
window.transactionList = [];
window.today = new Date();
window.todayFormatted = `${window.today.getFullYear()}/${String(window.today.getMonth() + 1).padStart(2, '0')}/${String(window.today.getDate()).padStart(2, '0')}`;
window.currentPage = 1;
window.itemsPerPage = 10;
window.softwareData = [];
window.confirmCallback = null;
window.currentSoftwareName = "";
window.currentSoftwarePackage = "";
window.currentAccountName = "";

// Nhập các tác vụ (import các module cần thiết)
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
import { formatDateTime } from './formatDateTime.js';
import { openConfirmModal, closeConfirmModal, confirmDelete } from './confirmModal.js';
import { openAddOrUpdateModal, closeAddOrUpdateModal, handleAddNewTransaction, handleUpdateTransactionFromModal, handleCancelModal } from './handleAddOrUpdateModal.js';

// Hàm khởi tạo – Thực thi sau khi DOM load xong
document.addEventListener("DOMContentLoaded", () => {
  // Lấy thông tin người dùng từ localStorage
  const userData = localStorage.getItem("employeeInfo");
  try {
    window.userInfo = userData ? JSON.parse(userData) : null;
  } catch (e) {
    window.userInfo = null;
  }
  // Nếu không có thông tin người dùng, chuyển hướng về trang đăng nhập
  if (!window.userInfo) {
    window.location.href = "index.html";
    return;
  }

  // Hiển thị thông tin chào mừng lên giao diện
  document.getElementById("welcome").textContent =
    `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;

  // Khởi tạo các trường ngày mặc định là hôm nay
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
  const transactionDateInput = document.getElementById("transactionDate");
  startDateInput.value = window.todayFormatted;
  transactionDateInput.value = window.todayFormatted;

  // Gắn sự kiện để tự động tính endDate khi thay đổi startDate hoặc duration
  startDateInput.addEventListener("change", () =>
    calculateEndDate(startDateInput, durationInput, endDateInput));
  durationInput.addEventListener("input", () =>
    calculateEndDate(startDateInput, durationInput, endDateInput));

  // Tải danh sách phần mềm (softwareData) và danh sách giao dịch ban đầu
  fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);
  document.getElementById("softwareName").addEventListener("change", () =>
    updatePackageList(window.softwareData, null, updateAccountList));
  document.getElementById("softwarePackage").addEventListener("change", () =>
    updateAccountList(window.softwareData, null));
  // Gọi hàm loadTransactions để lấy danh sách giao dịch và hiển thị bảng
  window.loadTransactions();  // gọi hàm bọc để tự động truyền tham số
});

// Xuất các hàm để có thể gọi từ HTML (onclick, onsubmit,...)
window.logout = logout;
window.openCalendar = (inputId) => openCalendar(
  inputId, calculateEndDate,
  document.getElementById("startDate"),
  document.getElementById("duration"),
  document.getElementById("endDate")
);
window.updateCustomerInfo = () => updateCustomerInfo(window.transactionList);
window.handleReset = () => handleReset(
  fetchSoftwareList, showProcessingModal, showResultModal,
  window.todayFormatted, updatePackageList, updateAccountList
);
window.loadTransactions = () => loadTransactions(
  window.userInfo, updateTable, formatDate, editTransaction,
  window.deleteTransaction, viewTransaction
);
window.handleAdd = () => handleAdd(
  window.userInfo, window.currentEditTransactionId,
  loadTransactions, handleReset, updatePackageList,
  showProcessingModal, showResultModal
);
window.handleUpdate = () => handleUpdate(
  window.userInfo, window.currentEditTransactionId, window.transactionList,
  loadTransactions, handleReset, showProcessingModal, showResultModal,
  getConstants, updateTable, formatDate, editTransaction,
  window.deleteTransaction, viewTransaction,
  fetchSoftwareList, updatePackageList, updateAccountList
);
window.handleSearch = () => handleSearch(
  window.userInfo, window.transactionList,
  showProcessingModal, showResultModal,
  updateTable, formatDate, editTransaction,
  window.deleteTransaction, viewTransaction
);
window.viewTransaction = (index) => viewTransaction(
  index, window.transactionList, formatDate, copyToClipboard
);
window.editTransaction = (index) => editTransaction(
  index, window.transactionList, fetchSoftwareList,
  updatePackageList, updateAccountList
);
// Hàm xóa giao dịch an toàn (đã bọc tham số cần thiết)
window.deleteTransaction = (index) => {
  deleteTransaction(
    index,
    window.transactionList,
    window.userInfo,
    window.loadTransactions,  // gọi loadTransactions sau khi xóa xong
    window.handleReset,       // reset form sau khi xóa xong
    showProcessingModal,
    showResultModal,
    openConfirmModal,
    getConstants
  );
};
window.editRow = (index) => editRow(index, window.transactionList);
window.deleteRow = (index) => deleteRow(index, window.deleteTransaction);
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.closeProcessingModal = closeProcessingModal;
