document.addEventListener("DOMContentLoaded", () => {
  const userInfo = JSON.parse(localStorage.getItem("employeeInfo"));
  const welcome = document.getElementById("welcome");
  if (userInfo) {
    welcome.textContent = `Xin chào ${userInfo.tenNhanVien} (${userInfo.maNhanVien}) - ${userInfo.vaiTro}`;
  } else {
    window.location.href = "index.html"; // quay về login nếu không có session
  }

  const form = document.getElementById("transactionForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { BACKEND_URL } = getConstants();
    const data = {
      action: "addTransaction",
      maNhanVien: userInfo.maNhanVien,
      customerCode: document.getElementById("customerCode").value.trim(),
      customerName: document.getElementById("customerName").value.trim(),
      toolName: document.getElementById("toolName").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      transactionDate: document.getElementById("transactionDate").value
    };

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.status === "success") {
        document.getElementById("successMessage").textContent = "Giao dịch đã được lưu!";
        form.reset();
      } else {
        document.getElementById("errorMessage").textContent = result.message || "Không thể lưu giao dịch!";
      }
    } catch (err) {
      document.getElementById("errorMessage").textContent = "Lỗi kết nối server.";
    }
  });
});
