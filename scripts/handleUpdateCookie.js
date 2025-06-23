import { getConstants } from './constants.js';
import { showResultModal } from './showResultModal.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';

export async function handleUpdateCookie(index, transactionList) {
  
  const transaction = transactionList?.[index];
  
  if (!transaction) {
    console.error('❌ No transaction found at index:', index);
    return alert("Không tìm thấy giao dịch.");
  }

  const modal = document.getElementById("updateCookieModal");
  const currentCookieEl = document.getElementById("currentCookie");
  const newCookieEl = document.getElementById("newCookie");

  currentCookieEl.value = "";
  newCookieEl.value = "";
  window.currentCookieTransaction = transaction;

  // Lấy cookie hiện tại và tên file
  try {
    const { BACKEND_URL } = getConstants();
    showProcessingModal("Đang tải cookie...");
    
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
  
  const val = document.getElementById("currentCookie").value;
  
  if (!val || val === "(Không có dữ liệu)") {
    showResultModal("⚠️ Không có cookie để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    showResultModal("✅ Đã sao chép cookie thành công!", true);
  }).catch((err) => {
    console.error('❌ Copy failed:', err);
    showResultModal("❌ Không thể sao chép cookie!", false);
  });
}


export async function confirmUpdateCookie() {
  
  try {
    disableInteraction();
    const transaction = window.currentCookieTransaction;
    
    const newCookieEl = document.getElementById("newCookie");
    
    const newCookie = newCookieEl?.value.trim();

    if (!transaction || !transaction.transactionId) {
      console.error('❌ No transaction or transaction ID');
      enableInteraction();
      return;
    }
    
    // Kiểm tra cookie mới có rỗng không
    if (!newCookie) {
      enableInteraction();
      alert("⚠️ Vui lòng nhập cookie mới trước khi cập nhật!");
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có quá ngắn không (có thể là lỗi)
    if (newCookie.length < 10) {
      enableInteraction();
      alert("⚠️ Cookie có vẻ quá ngắn. Vui lòng kiểm tra lại!");
      return; // Không đóng modal, để user sửa
    }
    
    // Kiểm tra cookie có chứa ký tự đặc biệt cần thiết không
    if (!newCookie.includes('=')) {
      enableInteraction();
      alert("⚠️ Cookie có vẻ không đúng định dạng. Cookie thường chứa dấu '='.");
      return; // Không đóng modal, để user sửa
    }

    
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
  
  try {
    disableInteraction();
    const transaction = window.currentCookieTransaction;
    
    if (!transaction?.transactionId) {
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
    
  } catch (err) {
    console.warn("❌ Không thể gửi log hủy cập nhật cookie:", err.message);
  } finally {
    enableInteraction();
    closeUpdateCookieModal();
  }
}

export function closeUpdateCookieModal() {
  const modal = document.getElementById("updateCookieModal");
  if (modal) {
    modal.style.display = "none";
  } else {
    console.error('❌ Modal not found');
  }
}



function disableInteraction() {
  const overlay = document.getElementById("formOverlay");
  if (overlay) {
    overlay.style.display = "block";
  } else {
    console.error('❌ formOverlay not found');
  }
}

function enableInteraction() {
  const overlay = document.getElementById("formOverlay");
  if (overlay) {
    overlay.style.display = "none";
  } else {
    console.error('❌ formOverlay not found');
  }
}

export function copyUsername() {
  
  const val = document.getElementById("currentUsername").value;
  
  if (!val) {
    showResultModal("⚠️ Không có tên đăng nhập để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    showResultModal("✅ Đã sao chép tên đăng nhập!", true);
  }).catch((err) => {
    console.error('❌ Copy failed:', err);
    showResultModal("❌ Không thể sao chép tên đăng nhập!", false);
  });
}

export function copyPassword() {
  
  const val = document.getElementById("currentPassword").value;
  
  if (!val) {
    showResultModal("⚠️ Không có mật khẩu để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    showResultModal("✅ Đã sao chép mật khẩu!", true);
  }).catch((err) => {
    console.error('❌ Copy failed:', err);
    showResultModal("❌ Không thể sao chép mật khẩu!", false);
  });
}
  