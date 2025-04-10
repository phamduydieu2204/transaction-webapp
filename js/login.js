function togglePassword() {
  const passwordInput = document.getElementById('password');
  passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
}

async function handleLogin() {
  console.log("Bắt đầu đăng nhập...");

  const { BACKEND_URL } = getAppConstants(); // dùng đúng tên hàm ở constants.js
  const employeeCode = document.getElementById('employeeCode').value.trim().toUpperCase();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('errorMessage');

  if (!employeeCode || !password) {
    errorEl.textContent = 'Vui lòng nhập đầy đủ thông tin!';
    return;
  }

  const body = {
    action: 'login',
    code: employeeCode,
    password: password
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    const result = await response.json();

    if (result.status === 'success') {
      localStorage.setItem('employeeInfo', JSON.stringify(result.data));
      window.location.href = 'main.html';
    } else {
      errorEl.textContent = result.message || 'Đăng nhập thất bại!';
    }
  } catch (error) {
    errorEl.textContent = 'Lỗi kết nối máy chủ!';
    console.error(error);
  }
}
