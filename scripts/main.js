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
import { openAddOrUpdateModal, closeAddOrUpdateModal, handleAddNewTransaction, handleUpdateTransactionFromModal, handleCancelModal } from './handleAddOrUpdateModal.js';

// Khi DOMContentLoaded xong
document.addEventListener("DOMContentLoaded", async () => {
  // Lấy thông tin người dùng
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

  // Hiển thị tên nhân viên
  document.getElementById("userWelcome").textContent =
    `Xin chào ${window.userInfo.tenNhanVien} (${window.userInfo.maNhanVien}) - ${window.userInfo.vaiTro}`;
  

  // Setup ngày tháng ban đầu
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

  // Tải danh sách phần mềm trước, sau đó mới load giao dịch
  await fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);

  document.getElementById("softwareName").addEventListener("change", () =>
    updatePackageList(window.softwareData, null, updateAccountList)
  );
  document.getElementById("softwarePackage").addEventListener("change", () =>
    updateAccountList(window.softwareData, null)
  );

  window.loadTransactions();
});

// Hàm tiện ích cho các thao tác
window.logout = logout;
window.openCalendar = (inputId) => openCalendar(inputId, calculateEndDate, document.getElementById("startDate"), document.getElementById("duration"), document.getElementById("endDate"));
window.updateCustomerInfo = () => updateCustomerInfo(window.transactionList);
window.handleReset = () => handleReset(fetchSoftwareList, showProcessingModal, showResultModal, window.todayFormatted, updatePackageList, updateAccountList);
window.loadTransactions = () => loadTransactions(window.userInfo, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
window.handleAdd = () => handleAdd(window.userInfo, window.currentEditTransactionId, window.loadTransactions, window.handleReset, updatePackageList, showProcessingModal, showResultModal);
window.handleUpdate = () => handleUpdate(window.userInfo, window.currentEditTransactionId, window.transactionList, window.loadTransactions, window.handleReset, showProcessingModal, showResultModal, getConstants, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction, fetchSoftwareList, updatePackageList, updateAccountList);
window.handleSearch = () => handleSearch(window.userInfo, window.transactionList, showProcessingModal, showResultModal, updateTable, formatDate, editTransaction, window.deleteTransaction, viewTransaction);
window.viewTransaction = (index) => viewTransaction(index, window.transactionList, formatDate, copyToClipboard);
window.editTransaction = (index) => editTransaction(index, window.transactionList, fetchSoftwareList, updatePackageList, updateAccountList);
window.deleteTransaction = (index) => {
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
};
window.editRow = (index) => editRow(index, window.transactionList);
window.deleteRow = (index) => deleteRow(index, window.deleteTransaction);
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.closeProcessingModal = closeProcessingModal;

function makeColumnsResizable(table) {
  const thElements = table.querySelectorAll("thead th");
  thElements.forEach((th, index) => {
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    th.appendChild(resizer);

    let startX, startWidth;

    resizer.addEventListener("mousedown", (e) => {
      startX = e.pageX;
      startWidth = th.offsetWidth;

      const onMouseMove = (e) => {
        const newWidth = startWidth + (e.pageX - startX);
        th.style.width = `${newWidth}px`;

        // 🔥 Resize luôn tất cả <td> trong cùng cột
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
          const cell = row.children[index];
          if (cell) {
            cell.style.width = `${newWidth}px`;
          }
        });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const transactionTable = document.getElementById("transactionTable");
  if (transactionTable) {
    makeColumnsResizable(transactionTable);
  }
});
