// handleAdd.js

import { apiRequestJson } from './apiClient.js';
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
import { updateState } from './core/stateManager.js';
import { validateBeforeOperation } from './core/sessionValidator.js';
import { cacheManager } from './core/cacheManager.js';
import { uiBlocker } from './uiBlocker.js';

// Hàm lấy todayFormatted - luôn lấy ngày hiện tại
function getTodayFormatted() {
  const today = new Date();
  return `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
}

export async function handleAdd(userInfo, currentEditTransactionId, loadTransactions, handleReset, updatePackageList, showProcessingModal, showResultModal) {
  console.log("🔍 handleAdd được gọi");
  
  // Kiểm tra nếu đang trong tiến trình sửa thì hiển thị modal ngay tức thì
  if (window.currentEditTransactionId !== null) {
    console.log("Đang trong tiến trình sửa, mở modal lựa chọn thêm/cập nhật...");
    openAddOrUpdateModal();
    return;
  }
  
  // Khóa UI ngay khi bắt đầu xử lý
  uiBlocker.block();
  
  try {
    // Validate session before adding transaction
    const sessionValid = await validateBeforeOperation();
    if (!sessionValid) {
      uiBlocker.unblock();
      return;
    }
  } catch (error) {
    uiBlocker.unblock();
    showResultModal(`Lỗi xác thực phiên: ${error.message}`, false);
    return;
  }
  
  // Always update to today's date for new transactions
  const { setDefaultDates } = await import('./calculateEndDate.js');
  setDefaultDates(true);
  console.log("📅 Updated dates to today for new transaction");

  if (!userInfo) {
    showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }

  // Kiểm tra các trường bắt buộc
  const requiredFields = {
    customerEmail: "Email khách hàng",
    customerName: "Tên khách hàng", 
    customerPhone: "Liên hệ",
    transactionDate: "Ngày giao dịch",
    transactionType: "Loại giao dịch",
    duration: "Số tháng đăng ký",
    startDate: "Ngày bắt đầu",
    softwareName: "Tên phần mềm",
    softwarePackage: "Gói phần mềm",
    accountName: "Tên tài khoản",
    revenue: "Doanh thu"
  };

  for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
    const element = document.getElementById(fieldId);
    if (!element) {
      console.error(`Không tìm thấy element với id: ${fieldId}`);
      continue;
    }
    
    const value = element.value;
    
    // Kiểm tra đặc biệt cho các trường số
    if (fieldId === 'revenue' || fieldId === 'duration') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        showResultModal("Thiếu dữ liệu bắt buộc, vui lòng kiểm tra lại", false);
        element.focus();
        return;
      }
    } else {
      // Kiểm tra các trường text/select
      if (!value || value.trim() === "" || value === "0") {
        showResultModal("Thiếu dữ liệu bắt buộc, vui lòng kiểm tra lại", false);
        element.focus();
        return;
      }
    }
  }

  showProcessingModal("Đang thêm giao dịch...");

  const transactionType = document.getElementById("transactionType").value;
  let note = document.getElementById("note").value;

  if (transactionType === "Hoàn Tiền" && currentEditTransactionId) {
    note = note ? `${note}\nHoàn tiền cho đơn hàng có mã giao dịch ${currentEditTransactionId}` : `Hoàn tiền cho đơn hàng có mã giao dịch ${currentEditTransactionId}`;
  }

  const data = {
    action: "addTransaction",
    transactionType: transactionType,
    transactionDate: document.getElementById("transactionDate").value || todayFormatted,
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
    const result = await apiRequestJson(data);
    if (result.status === "success") {
      // Reset form về giá trị mặc định
      document.getElementById("transactionForm").reset();
      // Reset các dropdown
      document.getElementById("softwareName").value = "";
      document.getElementById("softwarePackage").innerHTML = '<option value="">-- Chọn gói --</option>';
      document.getElementById("accountName").innerHTML = '<option value="">-- Chọn tài khoản --</option>';
      // Reset currentEditTransactionId sau khi thêm thành công
      window.currentEditTransactionId = null;
      updateState({ currentEditTransactionId: null });
      
      // Force clear all caches trước khi load lại
      cacheManager.clearTransactionCaches();
      
      // Cập nhật lại danh sách giao dịch từ server
      await window.loadTransactions();
      
      // Double check để đảm bảo table được update
      if (window.transactionList && window.transactionList.length > 0) {
        const { updateTable } = await import('./updateTable.js');
        const { formatDate } = await import('./formatDate.js');
        const { editTransaction } = await import('./editTransaction.js');
        const { deleteTransaction } = await import('./deleteTransaction.js');
        const { viewTransaction } = await import('./viewTransaction.js');
        
        updateTable(window.transactionList, window.currentPage || 1, window.itemsPerPage || 10, 
                   formatDate, editTransaction, deleteTransaction, viewTransaction);
      }
      
      showResultModal("Giao dịch đã được lưu!", true);
    } else {
      showResultModal(result.message || "Không thể lưu giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi:", err);
  } finally {
    // Luôn mở khóa UI khi kết thúc
    uiBlocker.unblock();
  }
}
