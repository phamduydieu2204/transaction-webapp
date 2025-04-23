import { showProcessingModal, showResultModal, fetchSoftwareList } from './utils.js';
import { updatePackageList } from './software.js';
import { loadTransactions } from './pagination.js';

let userInfo = null;
let currentEditTransactionId = null;
const today = new Date();
const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

export function initAdd() {
  userInfo = JSON.parse(localStorage.getItem('employeeInfo'));
  document.getElementById('transactionForm').addEventListener('reset', handleReset);
}

export async function handleAdd() {
  showProcessingModal("Đang thêm giao dịch...");
  const { BACKEND_URL } = getConstants();
  if (!userInfo) {
    showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }

  const transactionType = document.getElementById("transactionType").value;
  let note = document.getElementById("note").value;

  if (transactionType === "Hoàn Tiền" && currentEditTransactionId) {
    note = note ? `${note}\nHoàn tiền cho đơn hàng có mã giao dịch ${currentEditTransactionId}` : `Hoàn tiền cho đơn hàng có mã giao dịch ${currentEditTransactionId}`;
  }

  const data = {
    action: "addTransaction",
    transactionType,
    transactionDate: todayFormatted,
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value.toLowerCase(),
    customerPhone: document.getElementById("customerPhone").value,
    duration: parseInt(document.getElementById("duration").value) || 0,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    deviceCount: parseInt(document.getElementById("deviceCount").value) || 0,
    softwareName: document.getElementById("softwareName").value,
    softwarePackage: document.getElementById("softwarePackage").value,
    accountName: document.getElementById("accountName").value,
    revenue: parseFloat(document.getElementById("revenue").value) || 0,
    note,
    tenNhanVien: userInfo.tenNhanVien,
    maNhanVien: userInfo.maNhanVien,
    originalTransactionId: transactionType === "Hoàn Tiền" ? currentEditTransactionId : null
  };

  console.log("📤 Dữ liệu gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      document.getElementById("successMessage").textContent = "Giao dịch đã được lưu!";
      handleReset();
      await loadTransactions();
      updatePackageList();
      showResultModal("Giao dịch đã được lưu!", true);
    } else {
      showResultModal(result.message || "Không thể lưu giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi:", err);
  }
}

export function handleReset() {
  showProcessingModal("Đang làm mới dữ liệu...");
  const startDateInput = document.getElementById("startDate");
  const transactionDateInput = document.getElementById("transactionDate");

  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;

  document.getElementById("transactionForm").reset();

  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");

  softwareNameSelect.removeEventListener("focus", softwareNameSelect.focusHandler);
  softwarePackageSelect.removeEventListener("focus", softwarePackageSelect.focusHandler);
  accountNameSelect.removeEventListener("focus", accountNameSelect.focusHandler);

  document.getElementById("transactionType").value = "";
  document.getElementById("softwareName").value = "";
  document.getElementById("softwarePackage").value = "";
  document.getElementById("accountName").value = "";
  document.getElementById("customerName").value = "";
  document.getElementById("customerEmail").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("duration").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("deviceCount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("revenue").value = "";

  currentEditTransactionId = null;

  fetchSoftwareList().then(() => {
    showResultModal("Dữ liệu đã được làm mới!", true);
  }).catch(err => {
    showResultModal(`Lỗi khi làm mới dữ liệu: ${err.message}`, false);
  });
}