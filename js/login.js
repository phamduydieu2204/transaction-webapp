// Chuyển đổi hiển thị mật khẩu
function togglePassword() {
  const passwordInput = document.getElementById('password');
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

// Xác thực dữ liệu đăng nhập
function validateLoginData(code, password) {
  const errors = [];
  if (!code) errors.push("Vui lòng nhập mã nhân viên.");
  if (!password) errors.push("Vui lòng nhập mật khẩu.");
  return errors.length ? errors.join(" ") : null;
}

// Xử lý đăng nhập
async function handleLogin() {
  console.log("Bắt đầu đăng nhập...");

  const { BACKEND_URL } = getConstants();
  const employeeCode = document.getElementById('employeeCode').value.trim().toUpperCase();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('errorMessage');

  // Xác thực dữ liệu đầu vào
  const validationError = validateLoginData(employeeCode, password);
  if (validationError) {
    errorEl.textContent = validationError;
    return;
  }

  const body = {
    action: 'login',
    code: employeeCode,
    password: password
  };

  try {
    console.log("🟢 Gửi login tới Heroku với body:", body);
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      // Lưu thông tin người dùng vào sessionStorage
      sessionStorage.setItem('employeeInfo', JSON.stringify(result));
      window.location.href = 'main.html';
    } else {
      // Hiển thị thông báo lỗi thân thiện
      const friendlyMessages = {
        "Mã nhân viên không tồn tại": "Mã nhân viên không đúng. Vui lòng kiểm tra lại.",
        "Sai mật khẩu": "Mật khẩu không đúng. Vui lòng thử lại.",
        "Tài khoản đã bị khóa": "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
      };
      errorEl.textContent = friendlyMessages[result.message] || result.message || 'Đăng nhập thất bại!';
    }
  } catch (error) {
    errorEl.textContent = 'Không thể kết nối tới server. Vui lòng kiểm tra mạng và thử lại.';
    console.error("Lỗi đăng nhập:", error);
  }
}
