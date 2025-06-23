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

    // Cập nhật links nếu có accountSheetId
    if (accountSheetId) {
      const fileLinksContainer = document.getElementById("fileLinksContainer");
      const googleSheetLink = document.getElementById("googleSheetLink");
      const googleDocsLink = document.getElementById("googleDocsLink");
      
      // Google Sheets link
      googleSheetLink.href = `https://docs.google.com/spreadsheets/d/${accountSheetId}/edit`;
      
      // Google Docs link (cùng ID nhưng mở trong Docs viewer)
      googleDocsLink.href = `https://docs.google.com/document/d/${accountSheetId}/edit`;
      
      // Hiển thị container links
  };
      headers: { "Content-Type": "application/json" },
  });
        ...changes
      })
    });
    }
  } catch (err) {
    console.error("Lỗi cập nhật tài khoản:", err);
      headers: { "Content-Type": "application/json" },
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
