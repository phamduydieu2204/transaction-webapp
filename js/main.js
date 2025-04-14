let userInfo = null;
let currentEditIndex = -1;
let transactionList = [];
let today = new Date();
let todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`; // Định dạng yyyy/mm/dd
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

  // Đặt giá trị mặc định cho các trường ngày
  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;

  function calculateEndDate() {
    const start = new Date(startDateInput.value);
    const months = parseInt(durationInput.value || 0);
    if (!isNaN(months)) {
      const estimated = new Date(start.getTime() + months * 30 * 24 * 60 * 60 * 1000);
      const year = estimated.getFullYear();
      const month = String(estimated.getMonth() + 1).padStart(2, '0');
      const day = String(estimated.getDate()).padStart(2, '0');
      endDateInput.value = `${year}/${month}/${day}`;
    }
  }

  startDateInput.addEventListener("change", calculateEndDate);
  durationInput.addEventListener("input", calculateEndDate);

  fetchSoftwareList();
  document.getElementById("softwareName").addEventListener("change", updatePackageList);

  loadTransactions();
});

// Hàm mở lịch Flatpickr
function openCalendar(inputId) {
  flatpickr(`#${inputId}`, {
    dateFormat: "Y/m/d", // Định dạng yyyy/mm/dd
    onChange: function(selectedDates, dateStr) {
      document.getElementById(inputId).value = dateStr;
      if (inputId === "startDate") {
        calculateEndDate(); // Cập nhật Ngày kết thúc nếu thay đổi Ngày bắt đầu
      }
    }
  }).open();
}

// Hàm tự động cập nhật Tên khách hàng và Liên hệ khi nhập Email
async function updateCustomerInfo() {
  const email = document.getElementById("customerEmail").value.toLowerCase();
  if (!email) return;

  const { BACKEND_URL } = getConstants();
  const data = {
    action: "searchTransactions",
    maNhanVien: userInfo.maNhanVien,
    conditions: { customerEmail: email }
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
    if (result.status === "success" && result.data.length > 0) {
      // Lấy giao dịch có mã giao dịch lớn nhất (gần nhất)
      const sortedTransactions = result.data.sort((a, b) => {
        const idA = parseInt(a.transactionId.replace("GD", ""));
        const idB = parseInt(b.transactionId.replace("GD", ""));
        return idB - idA; // Giảm dần
      });
      const latestTransaction = sortedTransactions[0];
      document.getElementById("customerName").value = latestTransaction.customerName;
      document.getElementById("customerPhone").value = latestTransaction.customerPhone;
    }
  } catch (err) {
    console.error("Lỗi khi tìm kiếm giao dịch theo Email:", err);
  }
}

// Hàm xử lý khi nhấn "Làm mới"
function handleReset() {
  const startDateInput = document.getElementById("startDate");
  const transactionDateInput = document.getElementById("transactionDate");
  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;
  currentEditIndex = -1; // Đặt lại trạng thái chỉnh sửa
}

// Hàm định dạng ngày từ yyyy/mm/dd sang yyyy/mm/dd (giữ nguyên định dạng)
function formatDate(dateString) {
  if (!dateString) return "";
  return dateString; // Giữ nguyên định dạng yyyy/mm/dd
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
    transactionDate: document.getElementById("transactionDate").value,
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
      document.getElementById("startDate").value = todayFormatted;
      document.getElementById("transactionDate").value = todayFormatted;
      document.getElementById("endDate").value = "yyyy/mm/dd";
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
  const { BACKEND_URL } = getConstants();
  if (!userInfo) {
    alert("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
    return;
  }

  if (currentEditIndex === -1) {
    alert("Vui lòng chọn một giao dịch để chỉnh sửa!");
    return;
  }

  const transaction = transactionList[currentEditIndex];
  const data = {
    action: "updateTransaction",
    transactionId: transaction.transactionId, // Gửi Mã giao dịch để xác định giao dịch cần cập nhật
    transactionType: document.getElementById("transactionType").value,
    transactionDate: document.getElementById("transactionDate").value,
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

  console.log("📤 Dữ liệu cập nhật gửi đi:", JSON.stringify(data, null, 2));

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
      document.getElementById("startDate").value = todayFormatted;
      document.getElementById("transactionDate").value = todayFormatted;
      document.getElementById("endDate").value = "yyyy/mm/dd";
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
  if (transactionDate && transactionDate !== "yyyy/mm/dd") conditions.transactionDate = transactionDate;
  if (customerName) conditions.customerName = customerName;
  if (customerEmail) conditions.customerEmail = customerEmail;
  if (customerPhone) conditions.customerPhone = customerPhone;
  if (duration && duration !== "0") conditions.duration = duration;
  if (startDate && startDate !== "yyyy/mm/dd") conditions.startDate = startDate;
  if (endDate && endDate !== "yyyy/mm/dd") conditions.endDate = endDate;
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
      transactionList.sort((a, b) => {
        const idA = parseInt(a.transactionId.replace("GD", ""));
        const idB = parseInt(b.transactionId.replace("GD", ""));
        return idB - idA; // Giảm dần
      });
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
  const data = {
    action: "getTransactions",
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
      transactionList = result.data;
      transactionList.sort((a, b) => {
        const idA = parseInt(a.transactionId.replace("GD", ""));
        const idB = parseInt(b.transactionId.replace("GD", ""));
        return idB - idA; // Giảm dần
      });
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

  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = transactionList.slice(startIndex, endIndex);

  paginatedItems.forEach((transaction, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${transaction.transactionId}</td>
      <td>${formatDate(transaction.transactionDate)}</td>
      <td>${transaction.transactionType}</td>
      <td>${transaction.customerName}</td>
      <td>${transaction.customerEmail}</td>
      <td>${transaction.customerPhone}</td>
      <td>${transaction.duration}</td>
      <td>${formatDate(transaction.startDate)}</td>
      <td>${formatDate(transaction.endDate)}</td>
      <td>${transaction.deviceCount}</td>
      <td>${transaction.softwareName}</td>
      <td>${transaction.softwarePackage}</td>
      <td>${transaction.revenue}</td>
      <td>${transaction.note}</td>
      <td>${transaction.tenNhanVien}</td>
      <td>${transaction.maNhanVien}</td>
      <td>
        <button class="edit-btn">Sửa</button>
        <button class="delete-btn">Xóa</button>
      </td>
    `;

    // Gán sự kiện click cho nút "Sửa"
    const editButton = row.querySelector(".edit-btn");
    editButton.addEventListener("click", () => editTransaction(startIndex + index));

    // Gán sự kiện click cho nút "Xóa"
    const deleteButton = row.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => deleteTransaction(startIndex + index));

    tableBody.appendChild(row);
  });

  updatePagination(totalPages);
}

function updatePagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Nút "Trang đầu" (<<)
  const firstButton = document.createElement("button");
  firstButton.textContent = "«";
  firstButton.onclick = () => firstPage();
  firstButton.disabled = currentPage === 1;
  pagination.appendChild(firstButton);

  // Nút "Trang trước" (<)
  const prevButton = document.createElement("button");
  prevButton.textContent = "‹";
  prevButton.onclick = () => prevPage();
  prevButton.disabled = currentPage === 1;
  pagination.appendChild(prevButton);

  // Hiển thị các số trang
  const maxVisiblePages = 5; // Số trang tối đa hiển thị trước khi thêm "..."
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Thêm "..." nếu có nhiều trang trước
  if (startPage > 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "4px 8px";
    pagination.appendChild(dots);
  }

  // Hiển thị các số trang
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.onclick = () => goToPage(i);
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pagination.appendChild(pageButton);
  }

  // Thêm "..." nếu có nhiều trang sau
  if (endPage < totalPages) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "4px 8px";
    pagination.appendChild(dots);
  }

  // Nút "Trang sau" (>)
  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.onclick = () => nextPage();
  nextButton.disabled = currentPage === totalPages;
  pagination.appendChild(nextButton);

  // Nút "Trang cuối" (>>)
  const lastButton = document.createElement("button");
  lastButton.textContent = "»";
  lastButton.onclick = () => lastPage();
  lastButton.disabled = currentPage === totalPages;
  pagination.appendChild(lastButton);
}

function firstPage() {
  currentPage = 1;
  updateTable();
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

function lastPage() {
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  currentPage = totalPages;
  updateTable();
}

function goToPage(page) {
  currentPage = page;
  updateTable();
}

function editTransaction(index) {
  currentEditIndex = index; // Lưu chỉ số giao dịch đang chỉnh sửa
  const transaction = transactionList[index];

  // Điền dữ liệu giao dịch lên form
  document.getElementById("transactionDate").value = transaction.transactionDate;
  document.getElementById("transactionType").value = transaction.transactionType;
  document.getElementById("customerName").value = transaction.customerName;
  document.getElementById("customerEmail").value = transaction.customerEmail;
  document.getElementById("customerPhone").value = transaction.customerPhone;
  document.getElementById("duration").value = transaction.duration;
  document.getElementById("startDate").value = transaction.startDate;
  document.getElementById("endDate").value = transaction.endDate;
  document.getElementById("deviceCount").value = transaction.deviceCount;
  document.getElementById("softwareName").value = transaction.softwareName;
  document.getElementById("softwarePackage").value = transaction.softwarePackage;
  document.getElementById("revenue").value = transaction.revenue;
  document.getElementById("note").value = transaction.note;
}


// Hàm định dạng ngày từ yyyy-mm-dd sang yyyy/mm/dd để hiển thị trên form
function formatToInputDate(isoDate) {
  if (!isoDate) return "yyyy/mm/dd";
  const [year, month, day] = isoDate.split("-");
  return `${year}/${month}/${day}`;
}

// Hàm định dạng ngày từ dd/mm/yyyy sang yyyy/mm/dd để gửi lên server
function parseInputDate(inputDate) {
  if (!inputDate || inputDate === "dd/mm/yyyy") return "";
  const [day, month, year] = inputDate.split("/");
  return `${year}/${month}/${day}`;
}

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

