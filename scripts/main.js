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
import { calculateEndDate } from './scripts/calculateEndDate.js';
import { logout } from './scripts/logout.js';
import { updateAccountList } from './scripts/updateAccountList.js';
import { openCalendar } from './scripts/openCalendar.js';
import { updateCustomerInfo } from './scripts/updateCustomerInfo.js';
import { showProcessingModal } from './scripts/showProcessingModal.js';
import { showResultModal } from './scripts/showResultModal.js';
import { closeProcessingModal } from './scripts/closeProcessingModal.js';
import { handleReset } from './scripts/handleReset.js';
import { formatDate } from './scripts/formatDate.js';
import { handleAdd } from './scripts/handleAdd.js';
import { handleUpdate } from './scripts/handleUpdate.js';
import { handleSearch } from './scripts/handleSearch.js';
import { loadTransactions } from './scripts/loadTransactions.js';
import { updateTable } from './scripts/updateTable.js';
import { viewTransaction } from './scripts/viewTransaction.js';
import { copyToClipboard } from './scripts/copyToClipboard.js';
import { closeModal } from './scripts/closeModal.js';
import { updatePagination, firstPage, prevPage, nextPage, lastPage, goToPage } from './scripts/pagination.js';
import { editTransaction } from './scripts/editTransaction.js';
import { deleteTransaction } from './scripts/deleteTransaction.js';
import { fetchSoftwareList } from './scripts/fetchSoftwareList.js';
import { updatePackageList } from './scripts/updatePackageList.js';
import { editRow, deleteRow } from './scripts/legacy.js';
import { formatDateTime, openConfirmModal, closeConfirmModal, confirmDelete } from './scripts/confirmModal.js';

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
  fetchSoftwareList(null);
  document.getElementById("softwareName").addEventListener("change", () => updatePackageList());
  document.getElementById("softwarePackage").addEventListener("change", () => updateAccountList());

  loadTransactions();
});

// Xuất các hàm để sử dụng trong HTML
window.logout = logout;
window.openCalendar = (inputId) => openCalendar(inputId, calculateEndDate, document.getElementById("startDate"), document.getElementById("duration"), document.getElementById("endDate"));
window.updateCustomerInfo = () => updateCustomerInfo(window.transactionList);
window.handleReset = () => handleReset(fetchSoftwareList, showProcessingModal, showResultModal, window.todayFormatted);
window.handleAdd = () => handleAdd(window.userInfo, window.currentEditTransactionId, loadTransactions, handleReset, updatePackageList, showProcessingModal, showResultModal, getConstants);
window.handleUpdate = () => handleUpdate(window.userInfo, window.currentEditTransactionId, window.transactionList, loadTransactions, handleReset, showProcessingModal, showResultModal, getConstants);
window.handleSearch = () => handleSearch(window.userInfo, window.transactionList, showProcessingModal, showResultModal, updateTable, getConstants);
window.viewTransaction = (index) => viewTransaction(index, window.transactionList, formatDate, copyToClipboard, closeModal);
window.editTransaction = (index) => editTransaction(index, window.transactionList, fetchSoftwareList, updatePackageList, updateAccountList);
window.deleteTransaction = (index) => deleteTransaction(index, window.transactionList, window.userInfo, loadTransactions, handleReset, showProcessingModal, showResultModal, openConfirmModal, getConstants);
window.editRow = (index) => editRow(index, window.transactionList);
window.deleteRow = (index) => deleteRow(index, deleteTransaction);
window.confirmDelete = confirmDelete;