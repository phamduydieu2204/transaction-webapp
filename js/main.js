let userInfo = null;
let currentEditIndex = -1;
let transactionList = [];
let today = new Date().toISOString().split("T")[0];
let currentPage = 1;
const itemsPerPage = 10;
let softwareData = [];

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

  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
  const transactionDateInput = document.getElementById("transactionDate");

  startDateInput.value = today;
  transactionDateInput.value = today; // Đặt giá trị mặc định là ngày hôm nay

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

  fetchSoftwareList();
  document.getElementById("softwareName").addEventListener("change", updatePackageList);

  loadTransactions();
});


// Hàm lấy danh sách phần mềm từ Google Apps Script
async function fetchSoftwareList() {
  const { BACKEND_URL } = getConstants();
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "getSoftwareList" })
    });

    const result = await response.json();
    if (result.status === "success") {
      softwareData = result.data;
      populateSoftwareList();
    } else {
      console.error("Không thể lấy danh sách phần mềm:", result.message);
    }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phần mềm:", err);
  }
}

// Hàm điền danh sách Tên phần mềm vào select
function populateSoftwareList() {
  const softwareSelect = document.getElementById("softwareName");
  softwareSelect.innerHTML = '<option value="">-- Chọn phần mềm --</option>';
  softwareData.forEach(software => {
    const option = document.createElement("option");
    option.value = software.name;
    option.textContent = software.name;
    softwareSelect.appendChild(option);
  });
}

// Hàm cập nhật danh sách Gói phần mềm dựa trên Tên phần mềm được chọn
function updatePackageList() {
  const softwareSelect = document.getElementById("softwareName");
  const packageSelect = document.getElementById("softwarePackage");
  const selectedSoftware = softwareSelect.value;

  packageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';
  if (selectedSoftware) {
    const software = softwareData.find(s => s.name === selectedSoftware);
    if (software && software.packages) {
      software.packages.forEach(pkg => {
        const option = document.createElement("option");
        option.value = pkg;
        option.textContent = pkg;
        packageSelect.appendChild(option);
      });
    }
  }
}

async function handleAdd() {
  const { BACKEND_URL } = getConstants();
  if (!userInfo) {
    alert("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
    return;
  }

  const data = {
    action: "addTransaction",
    transactionType: document.getElementById("transactionType").value,
    transactionDate: today, // Sử dụng ngày hôm nay, bỏ qua giá trị nhập từ form
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value.toLowerCase(),
    customerPhone: document.getElementById("customerPhone").value,
    duration: parseInt(document.getElementById("duration").value) || 0,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    deviceCount: parseInt(document.getElementById("deviceCount").value) || 0,
    softwareName: document.getElementById("softwareName").value,
    softwarePackage: document.getElementById("softwarePackage").value,
    revenue: parseFloat(document.getElementById("revenue").value) || 0,
    note: document.getElementById("note").value,
    tenNhanVien: userInfo.tenNhanVien,
    maNhanVien: userInfo.maNhanVien
  };

  console.log("📤 Dữ liệu gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      document.getElementById("successMessage").textContent = "Giao dịch đã được lưu!";
      document.getElementById("transactionForm").reset();
      document.getElementById("startDate").value = today;
      document.getElementById("transactionDate").value = today; // Reset Ngày giao dịch về ngày hôm nay
      document.getElementById("endDate").value = "";
      await loadTransactions();
      currentEditIndex = -1;
      updatePackageList();
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể lưu giao dịch!";
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi kết nối server: ${err.message}`;
    console.error("Lỗi:", err);
  }
}


async function handleUpdate() {
  if (currentEditIndex === -1) {
    document.getElementById("errorMessage").textContent = "Vui lòng chọn giao dịch để sửa!";
    return;
  }

  const { BACKEND_URL } = getConstants();
  const data = {
    action: "updateTransaction",
    transactionId: transactionList[currentEditIndex].transactionId,
    transactionType: document.getElementById("transactionType").value,    // Cột C: Loại giao dịch
    customerName: document.getElementById("customerName").value,         // Cột D: Tên khách hàng
    customerEmail: document.getElementById("customerEmail").value.toLowerCase(), // Cột E: Email
    customerPhone: document.getElementById("customerPhone").value,       // Cột F: Liên hệ
    duration: parseInt(document.getElementById("duration").value),       // Cột G: Số tháng đăng ký
    startDate: document.getElementById("startDate").value,               // Cột H: Ngày bắt đầu
    endDate: document.getElementById("endDate").value,                   // Cột I: Ngày kết thúc
    deviceCount: parseInt(document.getElementById("deviceCount").value), // Cột J: Số thiết bị
    softwareName: document.getElementById("softwareName").value,         // Cột K: Tên phần mềm
    softwarePackage: document.getElementById("softwarePackage").value,   // Cột L: Gói phần mềm
    revenue: parseFloat(document.getElementById("revenue").value),       // Cột M: Doanh thu
    note: document.getElementById("note").value,                         // Cột N: Ghi chú
    tenNhanVien: userInfo.tenNhanVien,                                   // Cột O: Tên nhân viên
    maNhanVien: userInfo.maNhanVien                                      // Cột P: Mã nhân viên
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      document.getElementById("successMessage").textContent = "Giao dịch đã được cập nhật!";
      document.getElementById("transactionForm").reset();
      document.getElementById("startDate").value = today;
      document.getElementById("endDate").value = "";
      await loadTransactions();
      currentEditIndex = -1;
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể cập nhật giao dịch!";
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi kết nối server: ${err.message}`;
    console.error("Lỗi:", err);
  }
}

async function handleDelete() {
  if (currentEditIndex === -1) {
    document.getElementById("errorMessage").textContent = "Vui lòng chọn giao dịch để xóa!";
    return;
  }

  if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

  const { BACKEND_URL } = getConstants();
  const data = {
    action: "deleteTransaction",
    transactionId: transactionList[currentEditIndex].transactionId,
    maNhanVien: userInfo.maNhanVien
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      document.getElementById("successMessage").textContent = "Giao dịch đã được xóa!";
      document.getElementById("transactionForm").reset();
      document.getElementById("startDate").value = today;
      document.getElementById("endDate").value = "";
      await loadTransactions();
      currentEditIndex = -1;
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể xóa giao dịch!";
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi kết nối server: ${err.message}`;
    console.error("Lỗi:", err);
  }
}

async function handleSearch() {
  const { BACKEND_URL } = getConstants();
  const conditions = {};

  const transactionType = document.getElementById("transactionType").value;
  const transactionDate = document.getElementById("transactionDate").value;
  const customerName = document.getElementById("customerName").value;
  const customerEmail = document.getElementById("customerEmail").value.toLowerCase();
  const customerPhone = document.getElementById("customerPhone").value;
  const duration = document.getElementById("duration").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const deviceCount = document.getElementById("deviceCount").value;
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const revenue = document.getElementById("revenue").value;
  const note = document.getElementById("note").value;
  const tenNhanVien = userInfo.tenNhanVien;
  const maNhanVien = userInfo.maNhanVien;

  if (transactionType && transactionType !== "") conditions.transactionType = transactionType;
  if (transactionDate && transactionDate !== today) conditions.transactionDate = transactionDate; // Chỉ thêm nếu không phải ngày mặc định
  if (customerName) conditions.customerName = customerName;
  if (customerEmail) conditions.customerEmail = customerEmail;
  if (customerPhone) conditions.customerPhone = customerPhone;
  if (duration && duration !== "0") conditions.duration = duration;
  if (startDate && startDate !== today) conditions.startDate = startDate;
  if (endDate && endDate !== "") conditions.endDate = endDate;
  if (deviceCount && deviceCount !== "0") conditions.deviceCount = deviceCount;
  if (softwareName && softwareName !== "") conditions.softwareName = softwareName;
  if (softwarePackage && softwarePackage !== "") conditions.softwarePackage = softwarePackage;
  if (revenue && revenue !== "0") conditions.revenue = revenue;
  if (note) conditions.note = note;
  if (tenNhanVien) conditions.tenNhanVien = tenNhanVien;
  if (maNhanVien) conditions.maNhanVien = maNhanVien;

  const data = {
    action: "searchTransactions",
    maNhanVien: userInfo.maNhanVien,
    conditions: conditions
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      transactionList = result.data;
      currentPage = 1;
      updateTable();
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể tìm kiếm giao dịch!";
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi khi tìm kiếm giao dịch: ${err.message}`;
    console.error("Lỗi khi tìm kiếm giao dịch", err);
  }
}

async function loadTransactions() {
  const { BACKEND_URL } = getConstants();
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "getTransactions", maNhanVien: userInfo.maNhanVien })
    });

    const result = await response.json();
    if (result.status === "success") {
      transactionList = result.data;
      currentPage = 1;
      updateTable();
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể tải danh sách giao dịch!";
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi khi tải danh sách giao dịch: ${err.message}`;
    console.error("Lỗi khi tải danh sách giao dịch", err);
  }
}

  function updateTable() {
    const tableBody = document.querySelector("#transactionTable tbody");
    tableBody.innerHTML = "";
  
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = transactionList.slice(startIndex, endIndex);
  
    paginatedItems.forEach((transaction, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${transaction.transactionId}</td>
        <td>${formatDateTime(transaction.transactionDate)}</td> <!-- Định dạng ngày giờ -->
        <td>${transaction.transactionType}</td>
        <td>${transaction.customerName}</td>
        <td>${transaction.customerEmail}</td>
        <td>${transaction.customerPhone}</td>
        <td>${transaction.duration}</td>
        <td>${transaction.startDate}</td>
        <td>${transaction.endDate}</td>
        <td>${transaction.deviceCount}</td>
        <td>${transaction.softwareName}</td>
        <td>${transaction.softwarePackage}</td>
        <td>${transaction.revenue}</td>
        <td>${transaction.note}</td>
        <td>${transaction.tenNhanVien}</td>
        <td>${transaction.maNhanVien}</td>
        <td>
          <button class="edit-btn" onclick="editTransaction(${startIndex + index})">Sửa</button>
          <button class="delete-btn" onclick="deleteTransaction(${startIndex + index})">Xóa</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  
    document.getElementById("pageInfo").textContent = `Trang ${currentPage} / ${Math.ceil(transactionList.length / itemsPerPage)}`;
  }

function updatePagination() {
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  document.getElementById("pageInfo").textContent = `Trang ${currentPage} / ${totalPages}`;
  document.querySelector(".pagination button:first-child").disabled = currentPage === 1;
  document.querySelector(".pagination button:last-child").disabled = currentPage === totalPages;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updateTable();
  }
}

function nextPage() {
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updateTable();
  }
}

window.editRow = function (index) {
  const t = transactionList[index];
  document.getElementById("transactionType").value = t.transactionType || '';
  document.getElementById("customerName").value = t.customerName || '';
  document.getElementById("customerEmail").value = t.customerEmail || '';
  document.getElementById("customerPhone").value = t.customerPhone || '';
  document.getElementById("softwareName").value = t.softwareName || '';
  document.getElementById("softwarePackage").value = t.softwarePackage || '';
  document.getElementById("duration").value = t.duration || '';
  document.getElementById("startDate").value = t.startDate || '';
  document.getElementById("endDate").value = t.endDate || '';
  document.getElementById("revenue").value = t.revenue || '';
  document.getElementById("deviceCount").value = t.deviceCount || '';
  document.getElementById("note").value = t.note || '';
  currentEditIndex = index;
};

window.deleteRow = function (index) {
  currentEditIndex = index;
  handleDelete();
};

// Hàm định dạng ngày giờ từ ISO sang dd/mm/yyyy hh:mm
function formatDateTime(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
