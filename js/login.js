async function handleLogin() {
  const { BACKEND_URL } = getAppConstants(); // Hoặc getConstants() nếu bạn dùng lại tên cũ
  const employeeCode = document.getElementById('employeeCode').value.trim().toUpperCase(); // CHUYỂN VỀ VIẾT HOA
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
