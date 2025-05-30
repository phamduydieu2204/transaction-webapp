// handleAdd.js

import { getConstants } from './constants.js';
import { showProcessingModal } from './showProcessingModal.js';
import { showResultModal } from './showResultModal.js';
import { loadTransactions } from './loadTransactions.js';
import { updatePackageList } from './updatePackageList.js';
import { handleReset } from './handleReset.js';
import { updateTable } from './updateTable.js';
import { formatDate } from './formatDate.js';
import { editTransaction } from './editTransaction.js';
import { deleteTransaction } from './deleteTransaction.js';
import { viewTransaction } from './viewTransaction.js';
import { openAddOrUpdateModal } from './handleAddOrUpdateModal.js';
import { fetchSoftwareList } from './fetchSoftwareList.js'; // <<== thêm
import { updateAccountList } from './updateAccountList.js'; // <<== thêm

// Hàm lấy todayFormatted vì không lấy được trực tiếp từ main.js
const today = new Date();
const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

export async function handleAdd(userInfo, currentEditTransactionId, loadTransactions, handleReset, updatePackageList, showProcessingModal, showResultModal) {
  // Nếu đang trong tiến trình sửa thì mở modal xác nhận
  if (window.currentEditTransactionId !== null) {
    console.log("Đang trong tiến trình sửa, mở modal lựa chọn thêm/cập nhật...");
    openAddOrUpdateModal();
    return;
  }
  
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
    transactionType: transactionType,
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
    note: note,
    tenNhanVien: userInfo.tenNhanVien,
    maNhanVien: userInfo.maNhanVien,
    originalTransactionId: transactionType === "Hoàn Tiền" ? currentEditTransactionId : null
  };

  console.log("📤 Dữ liệu gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      await handleReset(fetchSoftwareList, showProcessingModal, showResultModal, todayFormatted, updatePackageList, updateAccountList);
      await loadTransactions(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction);
      window.loadTransactions();
      showResultModal("Giao dịch đã được lưu!", true);
    } else {
      showResultModal(result.message || "Không thể lưu giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi:", err);
  }
}
