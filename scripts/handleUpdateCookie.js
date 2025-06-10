import { getConstants } from './constants.js';
import { showResultModal } from './showResultModal.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';

export async function handleUpdateCookie(index, transactionList) {
  console.log('🍪 handleUpdateCookie called with:', { index, transactionListLength: transactionList?.length });
  
  const transaction = transactionList?.[index];
  console.log('🍪 Found transaction:', transaction);
  
  if (!transaction) {
    console.error('❌ No transaction found at index:', index);
    return alert("Không tìm thấy giao dịch.");
  }

  const modal = document.getElementById("updateCookieModal");
  console.log('🍪 Modal found:', !!modal);
  const currentCookieEl = document.getElementById("currentCookie");
  const newCookieEl = document.getElementById("newCookie");

  currentCookieEl.value = "";
  newCookieEl.value = "";
  window.currentCookieTransaction = transaction;

  // Lấy cookie hiện tại
  try {
    const { BACKEND_URL } = getConstants();
    showProcessingModal("Đang tải cookie...");
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getCookie",
        accountSheetId: transaction.accountSheetId
      })
    });
    const result = await response.json();
    currentCookieEl.value = result.cookie || "(Không có dữ liệu)";
    closeProcessingModal();
    modal.style.display = "block";
  } catch (err) {
    closeProcessingModal();
    showResultModal("Không thể tải cookie: " + err.message, false);
  }
}

export function copyCurrentCookie() {
  console.log('🍪 copyCurrentCookie called');
  
  const val = document.getElementById("currentCookie").value;
  console.log('🍪 Current cookie value:', val);
  
  if (!val || val === "(Không có dữ liệu)") {
    showResultModal("⚠️ Không có cookie để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    console.log('✅ Cookie copied successfully');
    showResultModal("✅ Đã sao chép cookie thành công!", true);
  }).catch((err) => {
    console.error('❌ Copy failed:', err);
    showResultModal("❌ Không thể sao chép cookie!", false);
  });
}

export async function confirmUpdateCookie() {
  console.log('🍪 confirmUpdateCookie called');
  
  try {
    disableInteraction();
    const transaction = window.currentCookieTransaction;
    console.log('🍪 Current transaction:', transaction);
    
    const newCookieEl = document.getElementById("newCookie");
    console.log('🍪 New cookie element found:', !!newCookieEl);
    
    const newCookie = newCookieEl?.value.trim();
    console.log('🍪 New cookie value:', newCookie);

    if (!transaction || !transaction.transactionId) {
      console.error('❌ No transaction or transaction ID');
      enableInteraction();
      return;
    }
    
    // Kiểm tra cookie mới có rỗng không
    if (!newCookie) {
      console.log('❌ Empty cookie');
      enableInteraction();
      showResultModal("⚠️ Vui lòng nhập cookie mới trước khi cập nhật!", false);
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có quá ngắn không (có thể là lỗi)
    if (newCookie.length < 10) {
      console.log('❌ Cookie too short');
      enableInteraction();
      showResultModal("⚠️ Cookie có vẻ quá ngắn. Vui lòng kiểm tra lại!", false);
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có chứa ký tự đặc biệt cần thiết không
    if (!newCookie.includes('=')) {
      console.log('❌ Cookie invalid format');
      enableInteraction();
      showResultModal("⚠️ Cookie có vẻ không đúng định dạng. Cookie thường chứa dấu '='.", false);
      return; // Không đóng modal, để user sửa
    }

    console.log('✅ All validations passed, proceeding with update');
    
    const { BACKEND_URL } = getConstants();
    showProcessingModal("Đang cập nhật Cookie...");
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateCookie",
        transactionId: transaction.transactionId,
        accountSheetId: transaction.accountSheetId,
        newCookie: newCookie,
        type: "confirm"
      })
    });
    
    const result = await response.json();
    console.log('🍪 Update result:', result);
    
    closeProcessingModal();
    
    if (result.status === "success") {
      showResultModal("✅ Cập nhật cookie thành công!\n\nCookie mới đã được lưu cho giao dịch " + transaction.transactionId, true);
      // Chỉ đóng modal khi thành công
      enableInteraction();
      closeUpdateCookieModal();
    } else {
      showResultModal("❌ " + (result.message || "Không thể cập nhật cookie"), false);
      // Không đóng modal khi thất bại, để user thử lại
      enableInteraction();
    }
    
  } catch (err) {
    console.error('❌ Error in confirmUpdateCookie:', err);
    closeProcessingModal();
    showResultModal("❌ Lỗi khi cập nhật cookie: " + err.message, false);
    // Không đóng modal khi có lỗi, để user thử lại
    enableInteraction();
  }
}

export async function cancelUpdateCookie() {
  console.log('🍪 cancelUpdateCookie called');
  
  try {
    disableInteraction();
    const transaction = window.currentCookieTransaction;
    console.log('🍪 Cancel transaction:', transaction);
    
    if (!transaction?.transactionId) {
      console.log('❌ No transaction to cancel');
      enableInteraction();
      closeUpdateCookieModal();
      return;
    }

    const { BACKEND_URL } = getConstants();
    await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateCookie",
        transactionId: transaction.transactionId,
        type: "cancel"
      })
    });
    console.log('✅ Cancel log sent successfully');
    
  } catch (err) {
    console.warn("❌ Không thể gửi log hủy cập nhật cookie:", err.message);
  } finally {
    enableInteraction();
    closeUpdateCookieModal();
  }
}

export function closeUpdateCookieModal() {
  console.log('🍪 closeUpdateCookieModal called');
  const modal = document.getElementById("updateCookieModal");
  if (modal) {
    modal.style.display = "none";
    console.log('✅ Modal closed');
  } else {
    console.error('❌ Modal not found');
  }
}

function disableInteraction() {
    document.getElementById("formOverlay").style.display = "block";
  }
  function enableInteraction() {
    document.getElementById("formOverlay").style.display = "none";
  }
  