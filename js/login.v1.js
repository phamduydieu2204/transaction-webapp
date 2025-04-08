const GAS_URL = "https://script.google.com/macros/s/AKfycbxYb5Kppy8wC4a18nUXAy_yCVup1jpdAkmyflLsVWo7VedylZwbf5DY2YwTK74UAHSl/exec";

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const maNhanVien = document.getElementById("maNhanVien").value.trim();
  const matKhau = document.getElementById("matKhau").value.trim();
  const messageDiv = document.getElementById("login-message");

  fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      maNhanVien: maNhanVien,
      matKhau: matKhau
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        // Lưu thông tin vào localStorage
        localStorage.setItem("maNhanVien", data.maNhanVien);
        localStorage.setItem("tenNhanVien", data.tenNhanVien);
        localStorage.setItem("vaiTro", data.vaiTro);

        // Chuyển sang trang chính
        window.location.href = "main.html";
      } else {
        messageDiv.textContent = data.message;
      }
    })
    .catch(error => {
      console.error("Lỗi kết nối:", error);
      messageDiv.textContent = "Đã xảy ra lỗi khi đăng nhập.";
    });
});
