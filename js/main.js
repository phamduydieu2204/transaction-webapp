document.addEventListener("DOMContentLoaded", () => {
  // Lấy thông tin người dùng từ localStorage
  const userData = localStorage.getItem("employeeInfo");
  try {
    userInfo = userData ? JSON.parse(userData) : null;
  } catch (e) {
    userInfo = null;
  }

  // Nếu không có thông tin người dùng, chuyển hướng về trang đăng nhập
  if (!userInfo) {
    window.location.href = "index.html";
    return;
  }

  // Hiển thị thông tin chào mừng
  document.getElementById("welcome").textContent =
    `Xin chào ${userInfo.tenNhanVien} (${userInfo.maNhanVien}) - ${userInfo.vaiTro}`;

  // Khởi tạo các trường ngày
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const transactionDateInput = document.getElementById("transactionDate");

  // Định nghĩa todayFormatted trong trường hợp utils.js chưa tải
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;

  // Gắn sự kiện thay đổi để tự động tính ngày kết thúc
  startDateInput.addEventListener("change", calculateEndDate);
  durationInput.addEventListener("input", calculateEndDate);

  // Tải danh sách phần mềm và giao dịch
  fetchSoftwareList(null);
  document.getElementById("softwareName").addEventListener("change", updatePackageList);
  document.getElementById("softwarePackage").addEventListener("change", updateAccountList);

  loadTransactions();
});
