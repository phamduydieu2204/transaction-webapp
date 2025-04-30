// Khai báo các biến và thiết lập ban đầu
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
import { formatDateTime } from './formatDateTime.js';
import { openConfirmModal, closeConfirmModal, confirmDelete } from './confirmModal.js';
import {
  openAddOrUpdateModal,
  closeAddOrUpdateModal,
  handleAddNewTransaction,
  handleUpdateTransactionFromModal,
  handleCancelModal
} from './handleAddOrUpdateModal.js';

// Thực hiện khi DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  // Lấy thông tin người dùng từ localStorage
  const userData = localStorage.getItem("employeeInfo");
  try {
    window.userInfo = userData ? JSON.parse(userData) : null;
  } catch (e) {
    window.userInfo = null;
  }

  // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!window.userInfo) {
    window.location.href = "index.html";
    return;
  }

  // Hiển thị thông tin chào mừng
  document.getElementById("welcome").textContent =
    `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;

  // Thiết lập giá trị ngày mặc định cho các input ngày tháng
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
  const transactionDateInput = document.getElementById("transactionDate");

  startDateInput.value = window.todayFormatted;
  transactionDateInput.value = window.todayFormatted;

  // Gắn sự kiện tính toán ngày kết thúc
  startDateInput.addEventListener("change", () =>
    calculateEndDate(startDateInput, durationInput, endDateInput)
  );
  durationInput.addEventListener("input", () =>
    calculateEndDate(startDateInput, durationInput, endDateInput)
  );

  // Tải danh sách phần mềm và sau đó là danh sách giao dịch
  await fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);

  // Gắn sự kiện thay đổi dropdown phần mềm → cập nhật gói phần mềm
  document.getElementById("softwareName").addEventListener("change", () =>
    updatePackageList(window.softwareData, null, updateAccountList)
  );

  // Gắn sự kiện thay đổi dropdown gói → cập nhật danh sách tài khoản
  document.getElementById("softwarePackage").addEventListener("change", () =>
    updateAccountList(window.softwareData, null)
  );

  // Sau khi tất cả dropdown sẵn sàng, load dữ liệu giao dịch
  window.loadTransactions();
});

// Gán các hàm toàn cục (không thay đổi logic)
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
  console.log("✅ Gọi editTransaction từ main.js với index =", index);
  console.log("▶️ fetchSoftwareList =", typeof fetchSoftwareList);
  console.log("▶️ updatePackageList =", typeof updatePackageList);
  console.log("▶️ updateAccountList =", typeof updateAccountList);
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
window.editRow = (index) => editRow(index, window.transactionList);
window.deleteRow = (index) => deleteRow(index, window.deleteTransaction);
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.closeProcessingModal = closeProcessingModal;
