import { getConstants } from './constants.js';

let selectedTransactionIndex = null;
let selectedTransaction = null;

// Gọi khi chọn "Đổi mật khẩu"
export function handleChangePassword(index) {
  selectedTransactionIndex = index;
  selectedTransaction = window.transactionList[index];

  // Lấy thông tin cũ từ sheet PhanMem
  (async () => {
    const { softwareName, softwarePackage, accountName } = selectedTransaction;
    const accountInfo = await fetchAccountInfo(softwareName, softwarePackage, accountName);

    document.getElementById("oldLoginEmail").textContent = accountInfo.email || "(chưa có)";
    document.getElementById("oldPassword").textContent = accountInfo.password || "(chưa có)";
    document.getElementById("oldSecret").textContent = accountInfo.secret || "(chưa có)";

    // Lưu để truyền về khi ghi log
    selectedTransaction.loginEmail = accountInfo.email;
    selectedTransaction.loginPassword = accountInfo.password;
    selectedTransaction.secret = accountInfo.secret;
  })();

  // Reset các trường nhập mới
  document.getElementById("newLoginEmail").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("newSecret").value = "";

  // Hiện modal
  document.getElementById("changePasswordModal").style.display = "block";
}

// Đóng modal
export function closeChangePasswordModal() {
  document.getElementById("changePasswordModal").style.display = "none";
}

// Gửi yêu cầu cập nhật
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
    newSecret: newSecret || null,

    oldEmail: selectedTransaction.loginEmail || "",
    oldPassword: selectedTransaction.loginPassword || "",
    oldSecret: selectedTransaction.secret || "",

    editor: window.userInfo?.tenNhanVien || "Chưa xác định"
  };

  const { BACKEND_URL } = getConstants();

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateAccountInfo",
        ...changes
      })
    });

    const result = await res.json();
    if (result.status === "success") {
      alert("✅ Cập nhật tài khoản thành công!");
      closeChangePasswordModal();
      window.loadTransactions();
    } else {
      alert("❌ Thất bại: " + result.message);
    }
  } catch (err) {
    console.error("Lỗi cập nhật tài khoản:", err);
    alert("❌ Lỗi kết nối máy chủ.");
  }
}

// Hàm gọi backend lấy thông tin từ sheet PhanMem
async function fetchAccountInfo(softwareName, softwarePackage, accountName) {
  const { BACKEND_URL } = getConstants();

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getAccountInfoBySoftware",
        softwareName,
        softwarePackage,
        accountName
      })
    });

    const result = await response.json();
    if (result.status === "success") {
      return {
        email: result.username || "",
        password: result.password || "",
        secret: result.secret || ""
      };
    } else {
      console.warn("Không tìm thấy tài khoản:", result.message);
      return { email: "", password: "", secret: "" };
    }
  } catch (error) {
    console.error("Lỗi khi fetchAccountInfo:", error);
    return { email: "", password: "", secret: "" };
  }
}
