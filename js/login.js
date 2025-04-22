import { callProxyAPI } from './utils.js';

function togglePassword() {
  const passwordInput = document.getElementById('password');
  passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
}

async function handleLogin() {
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
    const result = await callProxyAPI(body);
    if (result.status === 'success') {
      localStorage.setItem('employeeInfo', JSON.stringify(result));
      window.location.href = 'main.html';
    } else {
      errorEl.textContent = result.message || 'Đăng nhập thất bại!';
    }
  } catch (error) {
    errorEl.textContent = 'Lỗi kết nối máy chủ: ' + error.message;
  }
}

// Gắn sự kiện khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginButton').addEventListener('click', handleLogin);
  document.getElementById('togglePassword').addEventListener('click', togglePassword);
});
