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
let currentEditIndex = -1; // theo dõi dòng đang chỉnh sửa
const tableBody = document.querySelector("#transactionTable tbody");

function renderRow(data, index) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.transactionType}</td>
    <td>${data.customerName}</td>
    <td>${data.customerEmail}</td>
    <td>${data.customerPhone}</td>
    <td>${data.softwareName}</td>
    <td>${data.softwarePackage}</td>
    <td>${data.duration}</td>
    <td>${data.startDate}</td>
    <td>${data.endDate}</td>
    <td>${data.revenue}</td>
    <td>${data.deviceCount}</td>
    <td>${data.note}</td>
    <td>
      <button class="edit-btn" onclick="editRow(${index})">Sửa</button>
      <button class="delete-btn" onclick="deleteRow(${index})">Xóa</button>
    </td>
  `;
  return row;
}

let transactionList = [];

function updateTable() {
  tableBody.innerHTML = "";
  transactionList.forEach((t, i) => {
    tableBody.appendChild(renderRow(t, i));
  });
}

window.editRow = function(index) {
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
}

window.deleteRow = function(index) {
  if (confirm("Bạn có chắc muốn xóa dòng này?")) {
    transactionList.splice(index, 1);
    updateTable();
  }
}

