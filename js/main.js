let userInfo = null;
let currentEditIndex = -1;
let transactionList = [];
let today = new Date().toISOString().split("T")[0];

// DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("employeeInfo");
  try {
    userInfo = userData ? JSON.parse(userData) : null;
  } catch (e) {
    userInfo = null;
  }

  if (!userInfo) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcome").textContent =
    `Xin chào ${userInfo.tenNhanVien} (${userInfo.maNhanVien}) - ${userInfo.vaiTro}`;

  // Ngày bắt đầu mặc định là hôm nay
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");

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

  loadTransactions();
});

async function handleAdd() {
  const { BACKEND_URL } = getConstants();
  /* thêm vào để kiểm tra phần if !userInffo*/
if (!userInfo) {
  alert("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
  return;
}

  const data = {
    action: "addTransaction",
    maNhanVien: userInfo.maNhanVien,
    tenNhanVien: userInfo.tenNhanVien,
    transactionType: document.getElementById("transactionType").value,
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value,
    customerPhone: document.getElementById("customerPhone").value,
    softwareName: document.getElementById("softwareName").value,
    softwarePackage: document.getElementById("softwarePackage").value,
    duration: parseInt(document.getElementById("duration").value),
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    revenue: parseFloat(document.getElementById("revenue").value),
    deviceCount: parseInt(document.getElementById("deviceCount").value),
    note: document.getElementById("note").value
  };
console.log("📤 Gửi lên:", data); /* Thêm vào để kiểm tra*/
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      document.getElementById("successMessage").textContent = "Giao dịch đã được lưu!";
      document.getElementById("transactionForm").reset();
      document.getElementById("startDate").value = today;
      document.getElementById("endDate").value = "";
      await loadTransactions();
      currentEditIndex = -1;
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể lưu giao dịch!";
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = "Lỗi kết nối server.";
  }
}

async function loadTransactions() {
  const { BACKEND_URL } = getConstants();
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getTransactions" })
    });

    const result = await response.json();
    if (result.status === "success") {
      transactionList = result.data;
      updateTable();
    }
  } catch (err) {
    console.error("Lỗi khi tải danh sách giao dịch", err);
  }
}

function updateTable() {
  const tableBody = document.querySelector("#transactionTable tbody");
  tableBody.innerHTML = "";

  transactionList.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.transactionType}</td>
      <td>${t.customerName}</td>
      <td>${t.customerEmail}</td>
      <td>${t.customerPhone}</td>
      <td>${t.softwareName}</td>
      <td>${t.softwarePackage}</td>
      <td>${t.duration}</td>
      <td>${t.startDate}</td>
      <td>${t.endDate}</td>
      <td>${t.revenue}</td>
      <td>${t.deviceCount}</td>
      <td>${t.note}</td>
      <td>
        <button class="edit-btn" onclick="editRow(${i})">Sửa</button>
        <button class="delete-btn" onclick="deleteRow(${i})">Xóa</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

window.editRow = function (index) {
  const t = transactionList[index];
  document.getElementById("transactionType").value = t.transactionType;
  document.getElementById("customerName").value = t.customerName;
  document.getElementById("customerEmail").value = t.customerEmail;
  document.getElementById("customerPhone").value = t.customerPhone;
  document.getElementById("softwareName").value = t.softwareName;
  document.getElementById("softwarePackage").value = t.softwarePackage;
  document.getElementById("duration").value = t.duration;
  document.getElementById("startDate").value = t.startDate;
  document.getElementById("endDate").value = t.endDate;
  document.getElementById("revenue").value = t.revenue;
  document.getElementById("deviceCount").value = t.deviceCount;
  document.getElementById("note").value = t.note;
  currentEditIndex = index;
};

window.deleteRow = function (index) {
  if (confirm("Bạn có chắc muốn xóa dòng này?")) {
    transactionList.splice(index, 1);
    updateTable();
  }
};
