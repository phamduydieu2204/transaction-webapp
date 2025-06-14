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

  // Lấy cookie hiện tại và tên file
  try {
    const { BACKEND_URL } = getConstants();
    showProcessingModal("Đang tải cookie...");
    
    console.log('🍪 Request data:', {
      action: "getCookieAndFileName",
      accountSheetId: transaction.accountSheetId
    });
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getCookieAndFileName",
        accountSheetId: transaction.accountSheetId
      })
    });
    const result = await response.json();
    
    console.log('🍪 Response result:', result);
    
    // Cập nhật cookie content
    currentCookieEl.value = result.cookie || "(Không có dữ liệu)";
    
    // Cập nhật label với tên file
    const currentCookieLabel = document.getElementById("currentCookieLabel");
    if (currentCookieLabel && result.fileName) {
      currentCookieLabel.textContent = result.fileName + ":";
    } else {
      currentCookieLabel.textContent = "Cookie hiện tại:";
    }
    
    // Lấy thông tin username và password từ API
    try {
      const accountResponse = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getAccountInfoBySoftware",
          softwareName: transaction.softwareName,
          softwarePackage: transaction.softwarePackage,
          accountName: transaction.accountName
        })
      });
      const accountResult = await accountResponse.json();
      
      console.log('🔐 Account info result:', accountResult);
      
      // Cập nhật username và password
      const usernameEl = document.getElementById("currentUsername");
      const passwordEl = document.getElementById("currentPassword");
      
      if (accountResult.status === "success") {
        if (usernameEl) usernameEl.value = accountResult.username || "";
        if (passwordEl) passwordEl.value = accountResult.password || "";
      } else {
        // Fallback: hiển thị accountName nếu không lấy được username
        if (usernameEl) usernameEl.value = transaction.accountName || "";
        if (passwordEl) passwordEl.value = "";
      }
    } catch (accountErr) {
      console.error('🔐 Error loading account info:', accountErr);
      // Fallback values
      const usernameEl = document.getElementById("currentUsername");
      const passwordEl = document.getElementById("currentPassword");
      if (usernameEl) usernameEl.value = transaction.accountName || "";
      if (passwordEl) passwordEl.value = "";
    }
    
    closeProcessingModal();
    modal.style.display = "block";
  } catch (err) {
    console.error('🍪 Error loading cookie:', err);
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
      console.log('🔔 Showing alert for empty cookie');
      alert("⚠️ Vui lòng nhập cookie mới trước khi cập nhật!");
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có quá ngắn không (có thể là lỗi)
    if (newCookie.length < 10) {
      console.log('❌ Cookie too short');
      enableInteraction();
      console.log('🔔 Showing alert for short cookie');
      alert("⚠️ Cookie có vẻ quá ngắn. Vui lòng kiểm tra lại!");
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có chứa ký tự đặc biệt cần thiết không
    if (!newCookie.includes('=')) {
      console.log('❌ Cookie invalid format');
      enableInteraction();
      alert("⚠️ Cookie có vẻ không đúng định dạng. Cookie thường chứa dấu '='.");
      return; // Không đóng modal, để user sửa
    }

    console.log('✅ All validations passed, proceeding with update');
    
    const { BACKEND_URL } = getConstants();
    showProcessingModal("Đang cập nhật Cookie...");
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateCookieAndRename",
        transactionId: transaction.transactionId,
        accountSheetId: transaction.accountSheetId,
        newCookie: newCookie,
        softwareName: transaction.softwareName,
        softwarePackage: transaction.softwarePackage,
        accountName: transaction.accountName,
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
  console.log('🔒 Disabling interaction');
  const overlay = document.getElementById("formOverlay");
  if (overlay) {
    overlay.style.display = "block";
  } else {
    console.error('❌ formOverlay not found');
  }
}

function enableInteraction() {
  console.log('🔓 Enabling interaction'); 
  const overlay = document.getElementById("formOverlay");
  if (overlay) {
    overlay.style.display = "none";
  } else {
    console.error('❌ formOverlay not found');
  }
}

export function copyUsername() {
  console.log('👤 copyUsername called');
  
  const val = document.getElementById("currentUsername").value;
  console.log('👤 Username value:', val);
  
  if (!val) {
    showResultModal("⚠️ Không có tên đăng nhập để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    console.log('✅ Username copied successfully');
    showResultModal("✅ Đã sao chép tên đăng nhập!", true);
  }).catch((err) => {
    console.error('❌ Copy failed:', err);
    showResultModal("❌ Không thể sao chép tên đăng nhập!", false);
  });
}

export function copyPassword() {
  console.log('🔑 copyPassword called');
  
  const val = document.getElementById("currentPassword").value;
  console.log('🔑 Password value:', val ? '***' : '(empty)');
  
  if (!val) {
    showResultModal("⚠️ Không có mật khẩu để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    console.log('✅ Password copied successfully');
    showResultModal("✅ Đã sao chép mật khẩu!", true);
  }).catch((err) => {
    console.error('❌ Copy failed:', err);
    showResultModal("❌ Không thể sao chép mật khẩu!", false);
  });
}
  