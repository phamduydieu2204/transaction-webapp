// handleAdd.js

import { apiRequestJson } from './apiClient.js';
import { showResultModal } from './showResultModal.js';
import { updateTable } from './updateTable.js';
import { formatDate } from './formatDate.js';
import { editTransaction } from './editTransaction.js';
import { deleteTransaction } from './deleteTransaction.js';
import { viewTransaction } from './viewTransaction.js';
import { openAddOrUpdateModal } from './handleAddOrUpdateModal.js';
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
  
  // Kiểm tra nếu người dùng đang cố thêm giao dịch hoàn tiền hoặc hủy giao dịch trực tiếp
  const transactionTypeElement = document.getElementById("transactionType");
  if (transactionTypeElement && (transactionTypeElement.value === "Hoàn tiền" || transactionTypeElement.value === "Hoàn Tiền")) {
    showResultModal("Bạn không thể thêm 1 giao dịch Hoàn tiền. Hãy chọn Cập Nhật", false);
    return;
  }
  if (transactionTypeElement && transactionTypeElement.value === "Hủy giao dịch") {
    showResultModal("Bạn không thể thêm 1 giao dịch Hủy giao dịch. Hãy chọn Cập Nhật", false);
    return;
  }
  
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
    uiBlocker.unblock();
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
        uiBlocker.unblock();
        return;
      }
    } else {
      // Kiểm tra các trường text/select
      if (!value || value.trim() === "" || value === "0") {
        showResultModal("Thiếu dữ liệu bắt buộc, vui lòng kiểm tra lại", false);
        element.focus();
        uiBlocker.unblock();
        return;
      }
    }
  }

  // Không cần gọi showProcessingModal vì đã có uiBlocker

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
      // Tạo object giao dịch mới với data từ server
      const newTransaction = {
        transactionId: result.transactionId || `GD${Date.now()}`,
        ...data,
        transactionDate: data.transactionDate,
        timestamp: Date.now()
      };
      
      // Thêm giao dịch mới vào đầu danh sách (optimistic update)
      if (!window.transactionList) {
        window.transactionList = [];
      }
      window.transactionList.unshift(newTransaction);
      
      // Update table ngay lập tức
      updateTable(window.transactionList, 1, window.itemsPerPage || 10, 
                 formatDate, editTransaction, deleteTransaction, viewTransaction);
      
      // Reset form và các dropdown
      document.getElementById("transactionForm").reset();
      document.getElementById("softwareName").value = "";
      document.getElementById("softwarePackage").innerHTML = '<option value="">-- Chọn gói --</option>';
      document.getElementById("accountName").innerHTML = '<option value="">-- Chọn tài khoản --</option>';
      
      // Reset currentEditTransactionId
      window.currentEditTransactionId = null;
      updateState({ currentEditTransactionId: null });
      
      // Clear cache
      cacheManager.clearTransactionCaches();
      
      // Hiển thị thông báo thành công
      showResultModal("Giao dịch đã được lưu!", true);
      
      // Load lại data từ server trong background để đồng bộ
      setTimeout(() => {
        window.loadTransactions();
      }, 1000);
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
