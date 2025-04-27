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

// Nhập các tác vụ
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


// Hàm khởi tạo
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

  // Hiển thị thông tin chào mừng
  document.getElementById("welcome").textContent =
    `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;

  // Khởi tạo các trường ngày
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
  const transactionDateInput = document.getElementById("transactionDate");

  startDateInput.value = window.todayFormatted;
  transactionDateInput.value = window.todayFormatted;

  // Gắn sự kiện thay đổi để tự động tính ngày kết thúc
  startDateInput.addEventListener("change", () => calculateEndDate(startDateInput, durationInput, endDateInput));
  durationInput.addEventListener("input", () => calculateEndDate(startDateInput, durationInput, endDateInput));

  // Tải danh sách phần mềm và giao dịch
  fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);
  document.getElementById("softwareName").addEventListener("change", () => updatePackageList(window.softwareData, null, updateAccountList));
  document.getElementById("softwarePackage").addEventListener("change", () => updateAccountList(window.softwareData, null));

  loadTransactions(window.userInfo, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
});

// Xuất các hàm để sử dụng trong HTML
window.logout = logout;
window.openCalendar = (inputId) => openCalendar(inputId, calculateEndDate, document.getElementById("startDate"), document.getElementById("duration"), document.getElementById("endDate"));
window.updateCustomerInfo = () => updateCustomerInfo(window.transactionList);
window.handleReset = () => handleReset(fetchSoftwareList, showProcessingModal, showResultModal, window.todayFormatted, updatePackageList, updateAccountList);
window.handleAdd = () => handleAdd(window.userInfo, window.currentEditTransactionId, loadTransactions, handleReset, updatePackageList, showProcessingModal, showResultModal);
window.handleUpdate = () => handleUpdate(window.userInfo, window.currentEditTransactionId, window.transactionList, loadTransactions, handleReset, showProcessingModal, showResultModal, getConstants, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction, fetchSoftwareList, updatePackageList, updateAccountList);
window.handleSearch = () => handleSearch(window.userInfo, window.transactionList, showProcessingModal, showResultModal, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction);
window.viewTransaction = (index) => viewTransaction(index, window.transactionList, formatDate, copyToClipboard);
window.editTransaction = (index) => editTransaction(index, window.transactionList, fetchSoftwareList, updatePackageList, updateAccountList);
// Bọc deleteTransaction thành 1 "safe" function
window.deleteTransaction = (index) => {
  deleteTransaction(
    index,
    window.transactionList,
    window.userInfo,
    loadTransactions,
    handleReset,
    showProcessingModal,
    showResultModal,
    openConfirmModal,
    getConstants
  );
};

window.editRow = (index) => editRow(index, window.transactionList);
window.deleteRow = (index) => deleteRow(index, deleteTransaction);
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.closeProcessingModal = closeProcessingModal;