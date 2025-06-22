import { getConstants } from './constants.js';

let selectedTransactionIndex = null;
let selectedTransaction = null;

// Gọi khi chọn "Đổi mật khẩu"
export function handleChangePassword(index) {
  selectedTransactionIndex = index;
  selectedTransaction = window.transactionList[index];

  // Reset các trường nhập mới
  document.getElementById("newLoginEmail").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("newSecret").value = "";

  // Set placeholder cho tên file ngay lập tức
  const fileNameLabel = document.getElementById("currentFileNameLabel");
  fileNameLabel.textContent = "📁 Đang tải...";

  // Hiện modal ngay lập tức
  document.getElementById("changePasswordModal").style.display = "block";

  // Lấy thông tin cũ từ sheet PhanMem và tên file
  (async () => {
    const { softwareName, softwarePackage, accountName, accountSheetId } = selectedTransaction;
    
    // Load song song cả 2 API calls để tăng tốc
    const [accountInfo, fileNameInfo] = await Promise.all([
      fetchAccountInfo(softwareName, softwarePackage, accountName),
      accountSheetId ? fetchFileName(accountSheetId) : Promise.resolve({ fileName: "" })
    ]);

    // Cập nhật thông tin tài khoản
    document.getElementById("oldLoginEmail").textContent = accountInfo.email || "(chưa có)";
    document.getElementById("oldPassword").textContent = accountInfo.password || "(chưa có)";
    document.getElementById("oldSecret").textContent = accountInfo.secret || "(chưa có)";

    // Lưu để truyền về khi ghi log
    selectedTransaction.loginEmail = accountInfo.email;
    selectedTransaction.loginPassword = accountInfo.password;
    selectedTransaction.secret = accountInfo.secret;

    // Cập nhật tên file
    if (fileNameInfo.fileName) {
      fileNameLabel.textContent = fileNameInfo.fileName;
    } else {
      fileNameLabel.textContent = "📁 Thông tin tài khoản";
    }
  })();
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

// Hàm lấy tên file
async function fetchFileName(accountSheetId) {
  const { BACKEND_URL } = getConstants();

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getCookieAndFileName",
        accountSheetId: accountSheetId
      })
    });

    const result = await response.json();
    if (result.status === "success") {
      return {
        fileName: result.fileName || ""
      };
    } else {
      console.warn("Không tìm thấy file:", result.message);
      return { fileName: "" };
    }
  } catch (error) {
    console.error("Lỗi khi fetchFileName:", error);
    return { fileName: "" };
  }
}

// Hàm copy cho các trường cũ
function copyOldLoginEmail() {
  const val = document.getElementById("oldLoginEmail").textContent;
  if (!val || val === "(chưa có)") {
    alert("⚠️ Không có email để sao chép!");
    return;
  }
  navigator.clipboard.writeText(val).then(() => {
    alert("✅ Đã sao chép email đăng nhập!");
  }).catch(() => {
    alert("❌ Không thể sao chép email!");
  });
}

function copyOldPassword() {
  const val = document.getElementById("oldPassword").textContent;
  if (!val || val === "(chưa có)") {
    alert("⚠️ Không có mật khẩu để sao chép!");
    return;
  }
  navigator.clipboard.writeText(val).then(() => {
    alert("✅ Đã sao chép mật khẩu!");
  }).catch(() => {
    alert("❌ Không thể sao chép mật khẩu!");
  });
}

function copyOldSecret() {
  const val = document.getElementById("oldSecret").textContent;
  if (!val || val === "(chưa có)") {
    alert("⚠️ Không có secret để sao chép!");
    return;
  }
  navigator.clipboard.writeText(val).then(() => {
    alert("✅ Đã sao chép secret!");
  }).catch(() => {
    alert("❌ Không thể sao chép secret!");
  });
}

// Đăng ký các hàm vào global scope để có thể gọi từ HTML onclick
window.copyOldLoginEmail = copyOldLoginEmail;
window.copyOldPassword = copyOldPassword;
window.copyOldSecret = copyOldSecret;
