function togglePassword() {
  const passwordInput = document.getElementById('password');
  passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
}

async function handleLogin(event) {
  event.preventDefault();
  console.log("Bắt đầu đăng nhập...");

  const { BACKEND_URL } = getConstants();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      localStorage.setItem('employeeInfo', JSON.stringify(result));
      window.location.href = 'main.html';
    } else {
      errorEl.textContent = result.message || 'Đăng nhập thất bại!';
    }
  } catch (error) {
    errorEl.textContent = 'Lỗi kết nối máy chủ: ' + error.message;
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
});