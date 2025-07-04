import { apiRequestJson } from './apiClient.js';

export function togglePassword() {
  const passwordInput = document.getElementById('password');
  passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
}

export async function handleLogin() {
  console.log("Bắt đầu đăng nhập...");

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
    const result = await apiRequestJson(body);

    if (result.status === 'success') {
    const employeeInfo = {
      tenNhanVien: result.tenNhanVien,
      maNhanVien: result.maNhanVien,
      vaiTro: result.vaiTro,
      tabNhinThay: result.tabNhinThay || "giao dịch",  // Thêm mới
      giaoDichNhinThay: result.giaoDichNhinThay || "",
      nhinThayGiaoDichCuaAi: result.nhinThayGiaoDichCuaAi || "",
      duocSuaGiaoDichCuaAi: result.duocSuaGiaoDichCuaAi || "chỉ bản thân",
      duocXoaGiaoDichCuaAi: result.duocXoaGiaoDichCuaAi || "chỉ bản thân",
      duocTimKiemGiaoDichCuaAi: result.duocTimKiemGiaoDichCuaAi || "chỉ bản thân",
      passwordHash: result.passwordHash // Store password hash for session validation
    };
      localStorage.setItem('employeeInfo', JSON.stringify(employeeInfo));
      // Don't redirect if called from login wrapper
      if (!window._isLoginWrapper) {
        window.location.href = 'main.html';
      }
    } else {
      errorEl.textContent = result.message || 'Đăng nhập thất bại!';
    }
  } catch (error) {
    errorEl.textContent = 'Lỗi kết nối máy chủ: ' + error.message;
    console.error(error);
  }
}

// Export login wrapper for main.js
export async function login(username, password) {
  // Create mock DOM elements for handleLogin
  const mockElements = {
    employeeCode: { value: username },
    password: { value: password },
    errorMessage: { textContent: '' }
  };
  
  // Override getElementById temporarily
  const originalGetElementById = document.getElementById;
  document.getElementById = (id) => mockElements[id] || originalGetElementById.call(document, id);
  
  try {
    // Set flag to prevent redirect
    window._isLoginWrapper = true;
    
    await handleLogin();
    
    // Check if login was successful by checking localStorage
    const employeeInfo = localStorage.getItem('employeeInfo');
    if (!employeeInfo) {
      throw new Error(mockElements.errorMessage.textContent || 'Login failed');
    }
    
    return true;
  } finally {
    // Restore original getElementById and remove flag
    document.getElementById = originalGetElementById;
    delete window._isLoginWrapper;
  }
}

// Gắn các hàm vào window để sử dụng trong sự kiện onclick
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
