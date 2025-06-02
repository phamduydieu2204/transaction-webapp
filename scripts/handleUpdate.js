import { getConstants } from './constants.js';

export async function handleUpdate(
  userInfo,
  currentEditTransactionId,
  transactionList,
  loadTransactions,
  handleReset,
  showProcessingModal,
  showResultModal,
  getConstants,
  updateTable,
  formatDate,
  editTransaction,
  deleteTransaction,
  viewTransaction,
  fetchSoftwareList,
  updatePackageList,
  updateAccountList
) {
  showProcessingModal("Đang cập nhật giao dịch...");
  const { BACKEND_URL } = getConstants();

  if (!userInfo) {
    showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }

  if (currentEditTransactionId === null) {
    showResultModal("Vui lòng chọn một giao dịch để chỉnh sửa!", false);
    return;
  }

  const loadResult = await loadTransactions(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction);
  if (loadResult.status === "error") {
    showResultModal(loadResult.message, false);
    return;
  }

  const transaction = transactionList.find(t => t.transactionId === currentEditTransactionId);
  if (!transaction) {
    showResultModal("Giao dịch không tồn tại hoặc đã bị xóa. Vui lòng thử lại!", false);
    handleReset(fetchSoftwareList, showProcessingModal, showResultModal, window.todayFormatted, updatePackageList, updateAccountList);
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

  const softwareNameElement = document.getElementById("softwareName");
  const softwarePackageElement = document.getElementById("softwarePackage");
  const accountNameElement = document.getElementById("accountName");

  if (!softwareNameElement || !softwarePackageElement || !accountNameElement) {
    showResultModal("Không tìm thấy các trường dữ liệu trên form. Vui lòng thử lại!", false);
    return;
  }

  const data = {
    action: "updateTransaction",
    transactionId: currentEditTransactionId,
    transactionType: document.getElementById("transactionType").value,
    transactionDate: document.getElementById("transactionDate").value,
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value.toLowerCase(),
    customerPhone: document.getElementById("customerPhone").value,
    duration: parseInt(document.getElementById("duration").value) || 0,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    deviceCount: parseInt(document.getElementById("deviceCount").value) || 0,
    softwareName: softwareNameElement.value,
    softwarePackage: softwarePackageElement.value,
    accountName: accountNameElement.value,
    revenue: parseFloat(document.getElementById("revenue").value) || 0,
    note: document.getElementById("note").value,
    tenNhanVien: transaction.tenNhanVien,
    maNhanVien: transaction.maNhanVien,
    editorTenNhanVien: userInfo.tenNhanVien,
    editorMaNhanVien: userInfo.maNhanVien,

    // ✅ Truyền quyền mới
    duocSuaGiaoDichCuaAi: userInfo.duocSuaGiaoDichCuaAi || "chỉ bản thân"
  };

  console.log("📤 Dữ liệu cập nhật gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.status === "success") {
      handleReset(fetchSoftwareList, showProcessingModal, showResultModal, window.todayFormatted, updatePackageList, updateAccountList);
      await loadTransactions(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction);
      window.loadTransactions();
      showResultModal("Giao dịch đã được cập nhật!", true);
    } else {
      showResultModal(result.message || "Không thể cập nhật giao dịch!", false);
    }
  } catch (err) {
    console.error("Lỗi khi cập nhật:", err);
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
  }
}
