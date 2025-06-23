import { getConstants } from './constants.js';
import { updateState } from './core/stateManager.js';
import { validateBeforeOperation } from './core/sessionValidator.js';
import { cacheManager } from './core/cacheManager.js';

export async function handleUpdate() {
  console.log("🔄 handleUpdate được gọi");
  
  // Validate session before updating transaction
  const sessionValid = await validateBeforeOperation();
  if (!sessionValid) {
    return;
  }
  
  // Kiểm tra currentEditTransactionId từ window và state
  const windowId = window.currentEditTransactionId;
  const stateId = window.getState ? window.getState().currentEditTransactionId : null;
  const currentEditTransactionId = windowId || stateId;
  
  console.log("🔍 Current edit IDs:", { windowId, stateId, currentEditTransactionId });
  
  if (!currentEditTransactionId) {
    console.error("❌ Không có giao dịch nào đang được chỉnh sửa");
    window.showResultModal("Vui lòng chọn một giao dịch để chỉnh sửa!", false);
    return;
  }
  
  // Lấy thông tin user
  const userInfo = window.getState ? window.getState().user : null;
  if (!userInfo) {
    console.error("❌ Không có thông tin user");
    window.showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }
  
  console.log("✅ User info:", userInfo.tenNhanVien);
  
  // Tìm giao dịch đang chỉnh sửa
  const transactionList = window.transactionList || [];
  const transaction = transactionList.find(t => t.transactionId === currentEditTransactionId);
  
  if (!transaction) {
    console.error("❌ Không tìm thấy giao dịch:", currentEditTransactionId);
    window.showResultModal("Giao dịch không tồn tại hoặc đã bị xóa. Vui lòng thử lại!", false);
    return;
  }
  
  console.log("✅ Found transaction to update:", transaction.transactionId);
  
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
      console.error(`❌ Không tìm thấy element với id: ${fieldId}`);
      continue;
    }
    
    const value = element.value;
    
    // Kiểm tra đặc biệt cho các trường số
    if (fieldId === 'revenue' || fieldId === 'duration') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        window.showResultModal(`${fieldName} không hợp lệ. Vui lòng kiểm tra lại`, false);
        element.focus();
        return;
      }
    } else {
      // Kiểm tra các trường text/select
      if (!value || value.trim() === "" || value === "0") {
        window.showResultModal(`${fieldName} không được để trống. Vui lòng kiểm tra lại`, false);
        element.focus();
        return;
      }
    }
  }
  
  console.log("✅ Validation passed");
  
  // Hiển thị processing modal
  if (typeof window.showProcessingModal === 'function') {
    window.showProcessingModal("Đang cập nhật giao dịch...");
  } else {
    console.warn('⚠️ showProcessingModal not available, loading function...');
    // Dynamically load the function if not available
    import('./showProcessingModal.js').then(({ showProcessingModal }) => {
      window.showProcessingModal = showProcessingModal;
      showProcessingModal("Đang cập nhật giao dịch...");
    }).catch(err => {
      console.error('❌ Failed to load showProcessingModal:', err);
    });
  }
  
  // Chuẩn bị dữ liệu gửi lên server
  const { BACKEND_URL } = getConstants();
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
    softwareName: document.getElementById("softwareName").value,
    softwarePackage: document.getElementById("softwarePackage").value,
    accountName: document.getElementById("accountName").value,
    revenue: parseFloat(document.getElementById("revenue").value) || 0,
    note: document.getElementById("note").value || "",
    tenNhanVien: transaction.tenNhanVien,
    maNhanVien: transaction.maNhanVien,
    editorTenNhanVien: userInfo.tenNhanVien,
    editorMaNhanVien: userInfo.maNhanVien,
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
    console.log("📥 Kết quả từ server:", result);

    if (result.status === "success") {
      // Reset currentEditTransactionId
      window.currentEditTransactionId = null;
      updateState({ currentEditTransactionId: null });
      
      // Reset form
      if (window.handleReset) {
        window.handleReset();
      }
      
      // Clear cache để đảm bảo load data mới
      cacheManager.clearTransactionCaches();
      
      // Reload transactions
      if (window.loadTransactions) {
        await window.loadTransactions();
      }
      
      console.log("✅ Cập nhật thành công");
      
      // Close processing modal
      if (typeof window.closeProcessingModal === 'function') {
        window.closeProcessingModal();
      }
      
      if (typeof window.showResultModal === 'function') {
        window.showResultModal("Giao dịch đã được cập nhật thành công!", true);
      } else {
        alert("Giao dịch đã được cập nhật thành công!");
      }
    } else {
      console.error("❌ Lỗi từ server:", result.message);
      
      // Close processing modal
      if (typeof window.closeProcessingModal === 'function') {
        window.closeProcessingModal();
      }
      
      if (typeof window.showResultModal === 'function') {
        window.showResultModal(result.message || "Không thể cập nhật giao dịch!", false);
      } else {
        alert(result.message || "Không thể cập nhật giao dịch!");
      }
    }
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật:", err);
    
    // Close processing modal
    if (typeof window.closeProcessingModal === 'function') {
      window.closeProcessingModal();
    }
    
    if (typeof window.showResultModal === 'function') {
      window.showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    } else {
      alert(`Lỗi kết nối server: ${err.message}`);
    }
  }
}