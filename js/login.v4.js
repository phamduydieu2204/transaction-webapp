const GAS_URL = "https://script.google.com/macros/s/AKfycbxYb5Kppy8wC4a18nUXAy_yCVup1jpdAkmyflLsVWo7VedylZwbf5DY2YwTK74UAHSl/exec";

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const maNhanVien = document.getElementById("maNhanVien").value.trim();
  const matKhau = document.getElementById("matKhau").value.trim();
  const messageDiv = document.getElementById("login-message");

  const formData = new FormData();
  formData.append("action", "login");
  formData.append("maNhanVien", maNhanVien);
  formData.append("matKhau", matKhau);

  fetch(GAS_URL, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        localStorage.setItem("maNhanVien", data.maNhanVien);
        localStorage.setItem("tenNhanVien", data.tenNhanVien);
        localStorage.setItem("vaiTro", data.vaiTro);

        window.location.href = "main.html";
      } else {
        messageDiv.textContent = data.message;
      }
    })
    .catch(error => {
      console.error("Lỗi kết nối:", error);
      messageDiv.textContent = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
    });
});
