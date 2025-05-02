import { getConstants } from './constants.js';
import { showResultModal } from './showResultModal.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';

export async function handleUpdateCookie(index, transactionList) {
  const transaction = transactionList?.[index];
  if (!transaction) return alert("Không tìm thấy giao dịch.");

  const modal = document.getElementById("updateCookieModal");
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
  navigator.clipboard.writeText(val);
  alert("Đã copy Cookie hiện tại.");
}

export async function confirmUpdateCookie() {
disableInteraction();
  const transaction = window.currentCookieTransaction;
  const newCookie = document.getElementById("newCookie").value.trim();

  if (!transaction || !transaction.transactionId) return;
  if (!newCookie) return alert("Vui lòng nhập cookie mới.");

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
      showResultModal("Cập nhật cookie thành công!", true);
    } else {
      showResultModal(result.message || "Không thể cập nhật cookie", false);
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
  