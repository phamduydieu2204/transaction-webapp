// Khai báo biến toàn cục
let transactions = [];
let USER_INFO = null;
let currentEditTransactionId = null;
let currentSoftwareName = "";
let currentSoftwarePackage = "";
let currentAccountName = "";
const BACKEND_URL = "https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy";

// Nhập các tác vụ
import { handleEdit } from './scripts/handleEdit.js';
import { updatePackageList } from './scripts/updatePackageList.js';
import { updateAccountList } from './scripts/updateAccountList.js';
import { handleSubmit } from './scripts/handleSubmit.js';
import { handleDelete } from './scripts/handleDelete.js';
import { showProcessingModal } from './scripts/showProcessingModal.js';
import { showResultModal } from './scripts/showResultModal.js';

// Hàm đóng modal xử lý
function closeProcessingModal() {
  document.getElementById("processingModal").style.display = "none";
}

// Hàm tải danh sách giao dịch
async function loadTransactions() {
  showProcessingModal("Đang tải danh sách giao dịch...");
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getTransactions",
      maNhanVien: USER_INFO.maNhanVien,
      vaiTro: USER_INFO.vaiTro
    })
  });
  const result = await response.json();
  if (result.status === "success") {
    transactions = result.data;
    const tableBody = document.getElementById("transactionTableBody");
    tableBody.innerHTML = "";
    transactions.forEach(t => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.transactionId}</td>
        <td>${t.transactionDate}</td>
        <td>${t.transactionType}</td>
        <td>${t.customerName}</td>
        <td>${t.customerEmail}</td>
        <td>${t.customerPhone}</td>
        <td>${t.duration}</td>
        <td>${t.startDate}</td>
        <td>${t.endDate}</td>
        <td>${t.deviceCount}</td>
        <td>${t.softwareName}</td>
        <td>${t.softwarePackage}</td>
        <td>${t.accountName}</td>
        <td>${t.revenue}</td>
        <td>${t.note}</td>
        <td>
          <button onclick="handleEdit('${t.transactionId}')">Sửa</button>
          <button onclick="handleDelete('${t.transactionId}')">Xóa</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    showResultModal("Lỗi khi tải danh sách giao dịch: " + result.message, false);
  }
  closeProcessingModal();
}

// Hàm khởi tạo
document.addEventListener("DOMContentLoaded", async () => {
  USER_INFO = JSON.parse(localStorage.getItem("userInfo"));
  if (!USER_INFO) {
    window.location.href = "index.html";
    return;
  }

  // Gán sự kiện
  document.getElementById("softwareName").addEventListener("change", () => updatePackageList(BACKEND_URL));
  document.getElementById("softwarePackage").addEventListener("change", () => updateAccountList(BACKEND_URL));
  document.getElementById("transactionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit(BACKEND_URL, USER_INFO, transactions, showProcessingModal, showResultModal, closeProcessingModal, loadTransactions);
  });

  // Tải danh sách phần mềm
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getSoftwareList" })
  });
  const result = await response.json();
  if (result.status === "success") {
    const softwareSelect = document.getElementById("softwareName");
    softwareSelect.innerHTML = '<option value="">Chọn phần mềm</option>';
    result.data.forEach(software => {
      const option = document.createElement("option");
      option.value = software.softwareName;
      option.textContent = software.softwareName;
      softwareSelect.appendChild(option);
    });
  }

  // Tải danh sách giao dịch
  await loadTransactions();
});

// Xuất các hàm để sử dụng trong HTML
window.handleEdit = (transactionId) => handleEdit(transactionId, transactions, showProcessingModal, showResultModal, closeProcessingModal, updatePackageList, updateAccountList);
window.handleDelete = (transactionId) => handleDelete(transactionId, BACKEND_URL, USER_INFO, showProcessingModal, showResultModal, closeProcessingModal, loadTransactions);