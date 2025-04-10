document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("employeeInfo");
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
    window.location.href = "index.html";
    return;
  }

  // Mặc định ngày bắt đầu = hôm nay
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
  const today = new Date().toISOString().split("T")[0];
  startDateInput.value = today;

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

  // Submit form
  const form = document.getElementById("transactionForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { BACKEND_URL } = getConstants();

    const data = {
      action: "addTransaction",
      maNhanVien: userInfo.maNhanVien,
      tenNhanVien: userInfo.tenNhanVien,
      transactionType: document.getElementById("transactionType").value,
      customerName: document.getElementById("customerName").value,
      customerEmail: document.getElementById("customerEmail").value,
      customerPhone: document.getElementById("customerPhone").value,
      duration: parseInt(document.getElementById("duration").value),
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      deviceCount: parseInt(document.getElementById("deviceCount").value),
      softwareName: document.getElementById("softwareName").value,
      softwarePackage: document.getElementById("softwarePackage").value,
      revenue: parseFloat(document.getElementById("revenue").value),
      note: document.getElementById("note").value
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
        startDateInput.value = today; // đặt lại mặc định
        endDateInput.value = "";
      } else {
        document.getElementById("errorMessage").textContent = result.message || "Không thể lưu giao dịch!";
      }
    } catch (err) {
      document.getElementById("errorMessage").textContent = "Lỗi kết nối server.";
    }
  });
});
