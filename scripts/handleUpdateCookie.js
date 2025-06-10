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
  const val = document.getElementById("currentCookie").value;
  
  if (!val || val === "(Không có dữ liệu)") {
    showResultModal("⚠️ Không có cookie để sao chép!", false);
    return;
  }
  
  navigator.clipboard.writeText(val).then(() => {
    showResultModal("✅ Đã sao chép cookie thành công!", true);
  }).catch(() => {
    showResultModal("❌ Không thể sao chép cookie!", false);
  });
}

export async function confirmUpdateCookie() {
disableInteraction();
  const transaction = window.currentCookieTransaction;
  const newCookie = document.getElementById("newCookie").value.trim();

  if (!transaction || !transaction.transactionId) {
    enableInteraction();
    return;
  }
  
  // Kiểm tra cookie mới có rỗng không
  if (!newCookie) {
    enableInteraction();
    showResultModal("⚠️ Vui lòng nhập cookie mới trước khi cập nhật!", false);
    return;
  }
  
  // Kiểm tra cookie có quá ngắn không (có thể là lỗi)
  if (newCookie.length < 10) {
    enableInteraction();
    showResultModal("⚠️ Cookie có vẻ quá ngắn. Vui lòng kiểm tra lại!", false);
    return;
  }
  
  // Kiểm tra cookie có chứa ký tự đặc biệt cần thiết không
  if (!newCookie.includes('=')) {
    enableInteraction();
    showResultModal("⚠️ Cookie có vẻ không đúng định dạng. Cookie thường chứa dấu '='.", false);
    return;
  }

  const { BACKEND_URL } = getConstants();
  try {
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
    closeProcessingModal();
    if (result.status === "success") {
      showResultModal("✅ Cập nhật cookie thành công!\n\nCookie mới đã được lưu cho giao dịch " + transaction.transactionId, true);
    } else {
      showResultModal("❌ " + (result.message || "Không thể cập nhật cookie"), false);
    }
  } catch (err) {
    closeProcessingModal();
    showResultModal("Lỗi khi cập nhật cookie: " + err.message, false);
  } finally {
    enableInteraction();
    closeUpdateCookieModal();
  }
}

export async function cancelUpdateCookie() {
    disableInteraction();
  const transaction = window.currentCookieTransaction;
  if (!transaction?.transactionId) return;

  const { BACKEND_URL } = getConstants();
  try {
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
    console.warn("Không thể gửi log hủy cập nhật cookie:", err.message);
  } finally {
    enableInteraction();
    closeUpdateCookieModal();
  }
}

export function closeUpdateCookieModal() {
  document.getElementById("updateCookieModal").style.display = "none";
}

function disableInteraction() {
    document.getElementById("formOverlay").style.display = "block";
  }
  function enableInteraction() {
    document.getElementById("formOverlay").style.display = "none";
  }
  