document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("employeeInfo"); // ✅ đúng với key đã lưu
    let userInfo = null;
    
    try {
      userInfo = userData ? JSON.parse(userData) : null;
    } catch (e) {
      userInfo = null;
    }
  
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
const startDateInput = document.getElementById("startDate");
const durationInput = document.getElementById("duration");
const endDateInput = document.getElementById("endDate");

// Đặt ngày bắt đầu mặc định là hôm nay
const today = new Date().toISOString().split("T")[0];
startDateInput.value = today;

// Tự động tính ngày kết thúc khi nhập số tháng
function calculateEndDate() {
  const start = new Date(startDateInput.value);
  const months = parseInt(durationInput.value || 0);
  if (!isNaN(months)) {
    const estimated = new Date(start.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    endDateInput.value = estimated.toISOString().split("T")[0];
  }
}
startDateInput.addEventListener("change", calculateEndDate);
durationInput.addEventListener("input", calculateEndDate);
