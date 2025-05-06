import { getConstants } from './constants.js';

let selectedTransactionIndex = null;
let selectedTransaction = null;

export function handleChangePassword(index) {
  selectedTransactionIndex = index;
  selectedTransaction = window.transactionList[index];

  // Hiển thị thông tin cũ
  document.getElementById("oldLoginEmail").textContent = selectedTransaction.loginEmail || "(chưa có)";
  document.getElementById("oldPassword").textContent = selectedTransaction.loginPassword || "(chưa có)";
  document.getElementById("oldSecret").textContent = selectedTransaction.secret || "(chưa có)";

  // Reset input mới
  document.getElementById("newLoginEmail").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("newSecret").value = "";

  // Hiển thị modal
  document.getElementById("changePasswordModal").style.display = "block";
}

export function closeChangePasswordModal() {
  document.getElementById("changePasswordModal").style.display = "none";
}

export async function confirmChangePassword() {
  const newEmail = document.getElementById("newLoginEmail").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const newSecret = document.getElementById("newSecret").value.trim();

  const changes = {
    softwareName: selectedTransaction.softwareName,
    softwarePackage: selectedTransaction.softwarePackage,
    accountName: selectedTransaction.accountName,
    accountSheetId: selectedTransaction.accountSheetId,
    transactionId: selectedTransaction.transactionId,

    newEmail: newEmail || null,
    newPassword: newPassword || null,
    newSecret: newSecret || null
  };

  const { BACKEND_URL } = getConstants();

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateAccountInfo",
        ...changes,
        editor: window.userInfo?.tenNhanVien || "Chưa xác định"
      })
    });

    const result = await res.json();
    if (result.status === "success") {
      alert("✅ Đổi thông tin thành công!");
      closeChangePasswordModal();
      window.loadTransactions();
    } else {
      alert("❌ Thất bại: " + result.message);
    }
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    alert("❌ Lỗi kết nối server.");
  }
}
