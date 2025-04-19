/**
 * Quản lý giao dịch trên giao diện người dùng
 * Tải danh sách giao dịch, thêm, sửa, xóa, tìm kiếm giao dịch, và hiển thị chi tiết
 */
let userInfo = null;
let currentEditIndex = -1;
let currentEditTransactionId = null;
let transactionList = [];
let today = new Date();
let todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
let currentPage = 1;
const itemsPerPage = 10;
let softwareData = [];
let confirmCallback = null;

// Khởi tạo trang khi DOM được tải
document.addEventListener("DOMContentLoaded", () => {
  // Lấy thông tin người dùng từ sessionStorage
  const userData = sessionStorage.getItem("employeeInfo");
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
  const endDateInput = document.getElementById("endDate");
  const transactionDateInput = document.getElementById("transactionDate");

  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;

  // Tính ngày kết thúc dựa trên ngày bắt đầu và số tháng
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

  // Gắn sự kiện thay đổi để tự động tính ngày kết thúc
  startDateInput.addEventListener("change", calculateEndDate);
  durationInput.addEventListener("input", calculateEndDate);

  // Tải danh sách phần mềm và giao dịch
  fetchSoftwareList(null).then(() => {
    loadTransactions();
  });

  // Gắn sự kiện cho select phần mềm và gói
  document.getElementById("softwareName").addEventListener("change", () => updatePackageList());
  document.getElementById("softwarePackage").addEventListener("change", () => updateAccountList());
});

// Đăng xuất
function logout() {
  sessionStorage.removeItem("employeeInfo");
  window.location.href = "index.html";
}

// Hàm chung để điền dữ liệu vào select
function populateSelect(element, items, defaultOption, selectedValue, unavailableItems = []) {
  element.innerHTML = `<option value="">${defaultOption}</option>`;
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    if (unavailableItems.includes(item)) option.className = "unavailable";
    element.appendChild(option);
  });
  if (selectedValue && !items.includes(selectedValue)) {
    const option = document.createElement("option");
    option.value = selectedValue;
    option.textContent = selectedValue;
    option.className = "unavailable";
    element.appendChild(option);
  }
  element.value = selectedValue || "";
}

// Cập nhật danh sách gói phần mềm
function updatePackageList(softwarePackageToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackageSelect = document.getElementById("softwarePackage");

  if (softwareName) {
    const allPackages = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName)
      .map(item => item.softwarePackage)
    )];
    populateSelect(softwarePackageSelect, allPackages, "-- Chọn gói --", softwarePackageToKeep);
  } else {
    softwarePackageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';
  }
  updateAccountList();
}

// Cập nhật danh sách tài khoản
function updateAccountList(accountNameToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const accountNameSelect = document.getElementById("accountName");

  if (softwareName && softwarePackage) {
    const allAccounts = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName && item.softwarePackage === softwarePackage)
      .map(item => item.accountName)
    )];
    const availableAccounts = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName && item.softwarePackage === softwarePackage && item.activeUsers < item.allowedUsers)
      .map(item => item.accountName)
    )];
    const unavailableAccounts = allAccounts.filter(account => !availableAccounts.includes(account));

    populateSelect(accountNameSelect, availableAccounts, "-- Chọn tài khoản --", accountNameToKeep, unavailableAccounts);
  } else {
    accountNameSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';
  }
}

// Mở lịch để chọn ngày
function openCalendar(inputId) {
  flatpickr(`#${inputId}`, {
    dateFormat: "Y/m/d",
    onChange: function(selectedDates, dateStr) {
      document.getElementById(inputId).value = dateStr;
      if (inputId === "startDate") {
        calculateEndDate();
      }
    }
  }).open();
}

// Cập nhật thông tin khách hàng dựa trên email
function updateCustomerInfo() {
  const email = document.getElementById("customerEmail").value.toLowerCase();
  const customerNameInput = document.getElementById("customerName");
  const customerPhoneInput = document.getElementById("customerPhone");

  customerNameInput.value = "";
  customerPhoneInput.value = "";
  customerNameInput.placeholder = "Đang tìm kiếm...";
  customerPhoneInput.placeholder = "Đang tìm kiếm...";

  const transaction = transactionList.find(t => t.customerEmail.toLowerCase() === email);

  if (transaction) {
    customerNameInput.value = transaction.customerName || "";
    customerPhoneInput.value = transaction.customerPhone || "";
  }

  customerNameInput.placeholder = "Nhập tên khách hàng";
  customerPhoneInput.placeholder = "Nhập số điện thoại";
}

// Hiển thị modal xử lý
function showProcessingModal(message = "Hệ thống đang thực thi...") {
  const modal = document.getElementById("processingModal");
  const modalMessage = document.getElementById("modalMessage");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  modalTitle.textContent = "Thông báo";
  modalMessage.textContent = message;
  modalClose.style.display = "none";
  modal.style.display = "block";

  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = true;
  });
}

// Hiển thị modal kết quả
function showResultModal(message, isSuccess) {
  const modal = document.getElementById("processingModal");
  const modalMessage = document.getElementById("modalMessage");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  const friendlyMessages = {
    "Không thể kết nối tới server": "Không thể kết nối tới server. Vui lòng kiểm tra mạng và thử lại.",
    "Giao dịch không tồn tại": "Giao dịch không tồn tại. Vui lòng kiểm tra lại mã giao dịch.",
    "Không thể lưu giao dịch!": "Không thể lưu giao dịch. Vui lòng kiểm tra dữ liệu và thử lại.",
    "Không thể cập nhật giao dịch!": "Không thể cập nhật giao dịch. Vui lòng kiểm tra dữ liệu và thử lại.",
    "Không thể tìm kiếm giao dịch!": "Không thể tìm kiếm giao dịch. Vui lòng thử lại."
  };

  modalTitle.textContent = isSuccess ? "Thành công" : "Lỗi";
  modalMessage.textContent = friendlyMessages[message] || message;
  modalMessage.style.color = isSuccess ? "green" : "red";
  modalClose.style.display = "block";

  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });

  setTimeout(closeProcessingModal, 3000);
}

// Đóng modal xử lý
function closeProcessingModal() {
  const modal = document.getElementById("processingModal");
  modal.style.display = "none";
  document.getElementById("modalMessage").style.color = "black";
}

// Xác thực dữ liệu giao dịch
function validateTransactionData(data) {
  if (!data.transactionType) return "Vui lòng chọn loại giao dịch.";
  if (!data.customerEmail || !/\S+@\S+\.\S+/.test(data.customerEmail)) return "Email không hợp lệ.";
  if (!data.customerName) return "Vui lòng nhập tên khách hàng.";
  if (!data.softwareName) return "Vui lòng chọn tên phần mềm.";
  if (!data.softwarePackage) return "Vui lòng chọn gói phần mềm.";
  if (data.duration < 0) return "Số tháng đăng ký không thể âm.";
  if (data.deviceCount < 0) return "Số thiết bị không thể âm.";
  if (data.revenue < 0) return "Doanh thu không thể âm.";
  return null;
}

// Reset form
async function handleReset() {
  showProcessingModal("Đang làm mới dữ liệu...");
  try {
    const startDateInput = document.getElementById("startDate");
    const transactionDateInput = document.getElementById("transactionDate");

    startDateInput.value = todayFormatted;
    transactionDateInput.value = todayFormatted;

    document.getElementById("transactionForm").reset();
    document.getElementById("transactionType").value = "";
    document.getElementById("softwareName").value = "";
    document.getElementById("softwarePackage").value = "";
    document.getElementById("accountName").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("customerEmail").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("deviceCount").value = "";
    document.getElementById("note").value = "";
    document.getElementById("revenue").value = "";

    currentEditIndex = -1;
    currentEditTransactionId = null;

    await fetchSoftwareList();
    showResultModal("Dữ liệu đã được làm mới!", true);
  } catch (err) {
    showResultModal(`Lỗi khi làm mới dữ liệu: ${err.message}`, false);
    console.error("Lỗi reset:", err);
  }
}

// Định dạng ngày
function formatDate(dateString) {
  return dateString || "";
}

// Thêm giao dịch mới
async function handleAdd() {
  showProcessingModal("Đang thêm giao dịch...");
  const { BACKEND_URL } = getConstants();
  if (!userInfo) {
    showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }

  const transactionType = document.getElementById("transactionType").value;
  let note = document.getElementById("note").value;

  if (transactionType === "Hoàn Tiền" && currentEditTransactionId) {
    note = note ? `${note}\nHoàn tiền cho đơn hàng có mã giao dịch ${currentEditTransactionId}` : `Hoàn tiền cho đơn hàng có mã giao dịch ${currentEditTransactionId}`;
  }

  const data = {
    action: "addTransaction",
    transactionType,
    transactionDate: todayFormatted,
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value.toLowerCase(),
    customerPhone: document.getElementById("customerPhone").value,
    duration: parseInt(document.getElementById("duration").value) || 0,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    deviceCount: parseInt(document.getElementById("deviceCount").value) || 0,
    softwareName: document.getElementById("softwareName").value,
    softwarePackage: document.getElementById("softwarePackage").value,
    accountName: document.getElementById("accountName").value,
    revenue: parseFloat(document.getElementById("revenue").value) || 0,
    note,
    tenNhanVien: userInfo.tenNhanVien,
    maNhanVien: userInfo.maNhanVien,
    originalTransactionId: transactionType === "Hoàn Tiền" ? currentEditTransactionId : null
  };

  const validationError = validateTransactionData(data);
  if (validationError) {
    showResultModal(validationError, false);
    return;
  }

  console.log("📤 Dữ liệu gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      await refreshTransactionList();
      updateTable();
      await handleReset();
      showResultModal("Giao dịch đã được lưu!", true);
    } else {
      showResultModal(result.message || "Không thể lưu giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi thêm giao dịch:", err);
  }
}

// Cập nhật giao dịch
async function handleUpdate() {
  showProcessingModal("Đang cập nhật giao dịch...");
  const { BACKEND_URL } = getConstants();
  if (!userInfo) {
    showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }

  if (currentEditTransactionId === null) {
    showResultModal("Vui lòng chọn một giao dịch để chỉnh sửa!", false);
    return;
  }

  const transaction = transactionList.find(t => t.transactionId === currentEditTransactionId);
  if (!transaction) {
    showResultModal("Giao dịch không tồn tại hoặc đã bị xóa. Vui lòng thử lại!", false);
    await handleReset();
    return;
  }

  const data = {
    action: "updateTransaction",
    transactionId: currentEditTransactionId,
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
    accountName: document.getElementById("accountName").value,
    revenue: parseFloat(document.getElementById("revenue").value) || 0,
    note: document.getElementById("note").value,
    tenNhanVien: transaction.tenNhanVien,
    maNhanVien: transaction.maNhanVien,
    editorTenNhanVien: userInfo.tenNhanVien,
    editorMaNhanVien: userInfo.maNhanVien
  };

  const validationError = validateTransactionData(data);
  if (validationError) {
    showResultModal(validationError, false);
    return;
  }

  console.log("📤 Dữ liệu cập nhật gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      await refreshTransactionList();
      updateTable();
      await handleReset();
      showResultModal("Giao dịch đã được cập nhật!", true);
    } else {
      showResultModal(result.message || "Không thể cập nhật giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi cập nhật giao dịch:", err);
  }
}

// Tìm kiếm giao dịch
async function handleSearch() {
  if (!userInfo || !userInfo.vaiTro) {
    showResultModal("Thông tin vai trò không hợp lệ. Vui lòng đăng nhập lại.", false);
    return;
  }

  showProcessingModal("Đang tìm kiếm giao dịch...");
  const { BACKEND_URL } = getConstants();
  const conditions = {};

  const fields = [
    { id: "transactionType", key: "transactionType", check: val => val && val !== "" },
    { id: "transactionDate", key: "transactionDate", check: val => val && val !== "yyyy/mm/dd" },
    { id: "customerName", key: "customerName", check: val => val },
    { id: "customerEmail", key: "customerEmail", check: val => val },
    { id: "customerPhone", key: "customerPhone", check: val => val },
    { id: "duration", key: "duration", check: val => val && val !== "0" },
    { id: "startDate", key: "startDate", check: val => val && val !== "yyyy/mm/dd" },
    { id: "endDate", key: "endDate", check: val => val && val !== "yyyy/mm/dd" },
    { id: "deviceCount", key: "deviceCount", check: val => val && val !== "0" },
    { id: "softwareName", key: "softwareName", check: val => val && val !== "" },
    { id: "softwarePackage", key: "softwarePackage", check: val => val && val !== "" },
    { id: "accountName", key: "accountName", check: val => val && val !== "" },
    { id: "revenue", key: "revenue", check: val => val && val !== "0" },
    { id: "note", key: "note", check: val => val }
  ];

  fields.forEach(field => {
    const value = document.getElementById(field.id).value;
    if (field.check(value)) conditions[field.key] = value;
  });

  conditions.maNhanVien = userInfo.maNhanVien;

  const data = {
    action: "searchTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: userInfo.vaiTro.toLowerCase(),
    conditions
  };

  console.log("📤 Dữ liệu tìm kiếm gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      transactionList = result.data;
      transactionList.sort((a, b) => parseInt(b.transactionId.replace("GD", "")) - parseInt(a.transactionId.replace("GD", "")));
      currentPage = 1;
      updateTable();
      showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} giao dịch.`, true);
    } else {
      showResultModal(result.message || "Không thể tìm kiếm giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi khi tìm kiếm giao dịch: ${err.message}`, false);
    console.error("Lỗi tìm kiếm:", err);
  }
}

// Làm mới danh sách giao dịch
async function refreshTransactionList() {
  if (!userInfo) {
    console.error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
    return { status: "error", message: "Không tìm thấy thông tin nhân viên." };
  }

  const { BACKEND_URL } = getConstants();
  const data = {
    action: "getTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: userInfo.vaiTro.toLowerCase()
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      transactionList = result.data;
      transactionList.sort((a, b) => parseInt(b.transactionId.replace("GD", "")) - parseInt(a.transactionId.replace("GD", "")));
      return { status: "success", data: result.data };
    } else {
      console.error("Lỗi tải giao dịch:", result.message);
      return { status: "error", message: result.message || "Không thể tải danh sách giao dịch!" };
    }
  } catch (err) {
    console.error("Lỗi tải giao dịch:", err);
    return { status: "error", message: `Lỗi kết nối server: ${err.message}` };
  }
}

// Tải danh sách giao dịch
async function loadTransactions() {
  const result = await refreshTransactionList();
  if (result.status === "success") {
    updateTable();
  } else {
    showResultModal(result.message, false);
  }
  return result;
}

// Cập nhật bảng giao dịch
function updateTable() {
  const tableBody = document.querySelector("#transactionTable tbody");
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, transactionList.length);
  const paginatedItems = transactionList.slice(startIndex, endIndex);

  let newContent = '';
  paginatedItems.forEach((transaction, index) => {
    newContent += `
      <tr>
        <td>${transaction.transactionId}</td>
        <td>${formatDate(transaction.transactionDate)}</td>
        <td>${transaction.transactionType}</td>
        <td>${transaction.customerName}</td>
        <td>${transaction.customerEmail}</td>
        <td>${transaction.duration}</td>
        <td>${formatDate(transaction.startDate)}</td>
        <td>${formatDate(transaction.endDate)}</td>
        <td>${transaction.deviceCount}</td>
        <td>${transaction.softwareName}</td>
        <td>${transaction.softwarePackage}</td>
        <td>${transaction.accountName || ""}</td>
        <td>${transaction.revenue}</td>
        <td>${transaction.tenNhanVien}</td>
        <td>
          <button class="edit-btn" onclick="editTransaction(${startIndex + index})">Sửa</button>
          <button class="delete-btn" onclick="deleteTransaction(${startIndex + index})">Xóa</button>
          <button class="view-btn" onclick="viewTransaction(${startIndex + index})">Xem</button>
        </td>
      </tr>`;
  });

  tableBody.innerHTML = newContent;
  updatePagination(totalPages);
}

// Xem chi tiết giao dịch
function viewTransaction(index) {
  const transaction = transactionList[index];
  const modal = document.getElementById("transactionDetailModal");
  const detailContent = document.getElementById("transactionDetailContent");

  if (!modal || !detailContent) {
    showResultModal("Lỗi giao diện. Vui lòng thử lại.", false);
    return;
  }

  detailContent.innerHTML = "";

  const fields = [
    { label: "Mã giao dịch", value: transaction.transactionId, showCopy: true },
    { label: "Ngày giao dịch", value: formatDate(transaction.transactionDate), showCopy: false },
    { label: "Loại giao dịch", value: transaction.transactionType, showCopy: false },
    { label: "Tên khách hàng", value: transaction.customerName, showCopy: false },
    { label: "Email", value: transaction.customerEmail, showCopy: true },
    { label: "Liên hệ", value: transaction.customerPhone, showCopy: true },
    { label: "Số tháng đăng ký", value: transaction.duration, showCopy: false },
    { label: "Ngày bắt đầu", value: formatDate(transaction.startDate), showCopy: false },
    { label: "Ngày kết thúc", value: formatDate(transaction.endDate), showCopy: false },
    { label: "Số thiết bị", value: transaction.deviceCount, showCopy: false },
    { label: "Tên phần mềm", value: transaction.softwareName, showCopy: false },
    { label: "Gói phần mềm", value: transaction.softwarePackage, showCopy: false },
    { label: "Tên tài khoản", value: transaction.accountName || "", showCopy: false },
    { label: "ID Sheet Tài Khoản", value: transaction.accountSheetId || "", showCopy: false },
    { label: "Thông tin đơn hàng", value: transaction.orderInfo || "", showCopy: true },
    { label: "Doanh thu", value: transaction.revenue, showCopy: false },
    { label: "Ghi chú", value: transaction.note, showCopy: false },
    { label: "Tên nhân viên", value: transaction.tenNhanVien, showCopy: false },
    { label: "Mã nhân viên", value: transaction.maNhanVien, showCopy: false }
  ];

  fields.forEach(field => {
    const row = document.createElement("div");
    row.className = "detail-row";
    row.innerHTML = `
      <span class="detail-label">${field.label}:</span>
      <span class="detail-value">${field.value}</span>
      ${field.showCopy ? '<i class="fas fa-copy copy-icon"></i>' : ''}`;
    detailContent.appendChild(row);

    if (field.showCopy) {
      const copyIcon = row.querySelector(".copy-icon");
      copyIcon.addEventListener("click", () => copyToClipboard(field.value, copyIcon));
    }
  });

  modal.style.display = "block";

  modal.addEventListener("click", function handler(event) {
    if (event.target === modal) {
      closeModal();
      modal.removeEventListener("click", handler);
    }
  });
}

// Sao chép nội dung vào clipboard
function copyToClipboard(text, iconElement) {
  navigator.clipboard.writeText(text)
    .then(() => {
      const message = document.createElement("span");
      message.className = "copy-message";
      message.textContent = "Đã copy";
      iconElement.appendChild(message);
      message.classList.add("show");
      setTimeout(() => {
        message.classList.remove("show");
        setTimeout(() => message.remove(), 300);
      }, 1000);
    })
    .catch(err => console.error("Lỗi khi copy:", err));
}

// Đóng modal chi tiết
function closeModal() {
  const modal = document.getElementById("transactionDetailModal");
  modal.style.display = "none";
}

// Cập nhật phân trang
function updatePagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const firstButton = document.createElement("button");
  firstButton.textContent = "«";
  firstButton.onclick = firstPage;
  firstButton.disabled = currentPage === 1;
  pagination.appendChild(firstButton);

  const prevButton = document.createElement("button");
  prevButton.textContent = "‹";
  prevButton.onclick = prevPage;
  prevButton.disabled = currentPage === 1;
  pagination.appendChild(prevButton);

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "4px 8px";
    pagination.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.onclick = () => goToPage(i);
    if (i === currentPage) pageButton.classList.add("active");
    pagination.appendChild(pageButton);
  }

  if (endPage < totalPages) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "4px 8px";
    pagination.appendChild(dots);
  }

  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.onclick = nextPage;
  nextButton.disabled = currentPage === totalPages;
  pagination.appendChild(nextButton);

  const lastButton = document.createElement("button");
  lastButton.textContent = "»";
  lastButton.onclick = lastPage;
  lastButton.disabled = currentPage === totalPages;
  pagination.appendChild(lastButton);
}

// Điều hướng phân trang
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

// Chỉnh sửa giao dịch
function editTransaction(index) {
  const transaction = transactionList[index];
  currentEditTransactionId = transaction.transactionId;
  currentEditIndex = index;

  document.getElementById("transactionDate").value = transaction.transactionDate;
  document.getElementById("transactionType").value = transaction.transactionType;
  document.getElementById("customerName").value = transaction.customerName;
  document.getElementById("customerEmail").value = transaction.customerEmail;
  document.getElementById("customerPhone").value = transaction.customerPhone;
  document.getElementById("duration").value = transaction.duration;
  document.getElementById("startDate").value = transaction.startDate;
  document.getElementById("endDate").value = transaction.endDate;
  document.getElementById("deviceCount").value = transaction.deviceCount;
  document.getElementById("revenue").value = transaction.revenue;
  document.getElementById("note").value = transaction.note;

  fetchSoftwareList(transaction.softwareName).then(() => {
    document.getElementById("softwareName").value = transaction.softwareName;
    updatePackageList(transaction.softwarePackage);
    document.getElementById("softwarePackage").value = transaction.softwarePackage;
    updateAccountList(transaction.accountName);
    document.getElementById("accountName").value = transaction.accountName;
  });
}

// Xóa giao dịch
async function deleteTransaction(index) {
  const transaction = transactionList[index];
  if (!transaction) {
    showResultModal("Giao dịch không tồn tại. Vui lòng thử lại.", false);
    return;
  }

  const confirmMessage = `Bạn có chắc muốn xóa giao dịch ${transaction.transactionId}? ${
    transaction.accountSheetId && transaction.customerEmail
      ? "Giao dịch này sẽ được xóa và quyền chia sẻ tệp với email " + transaction.customerEmail + " sẽ bị hủy."
      : ""
  }`;

  const confirmDelete = await new Promise(resolve => openConfirmModal(confirmMessage, resolve));

  if (!confirmDelete) return;

  showProcessingModal("Đang xóa giao dịch...");

  const { BACKEND_URL } = getConstants();
  const data = {
    action: "deleteTransaction",
    transactionId: transaction.transactionId,
    maNhanVien: userInfo.maNhanVien,
    vaiTro: userInfo.vaiTro.toLowerCase()
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      await refreshTransactionList();
      updateTable();
      showResultModal(
        transaction.accountSheetId && transaction.customerEmail
          ? "Giao dịch đã được xóa và quyền chia sẻ đã được hủy!"
          : "Giao dịch đã được xóa!",
        true
      );
    } else {
      showResultModal(result.message || "Không thể xóa giao dịch!", false);
    }
  } catch (err) {
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    console.error("Lỗi xóa giao dịch:", err);
  }
}

// Tải danh sách phần mềm
async function fetchSoftwareList(softwareNameToKeep) {
  const { BACKEND_URL } = getConstants();
  const data = { action: "getSoftwareList" };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      softwareData = result.data;
      const softwareNames = [...new Set(softwareData.map(item => item.softwareName))];
      populateSelect(document.getElementById("softwareName"), softwareNames, "-- Chọn phần mềm --", softwareNameToKeep);
      updatePackageList();
    } else {
      console.error("Lỗi tải danh sách phần mềm:", result.message);
    }
  } catch (err) {
    console.error("Lỗi tải danh sách phần mềm:", err);
  }
}

// Mở modal xác nhận
function openConfirmModal(message, callback) {
  const modal = document.getElementById("confirmDeleteModal");
  const messageEl = document.getElementById("confirmMessage");
  messageEl.textContent = message;
  confirmCallback = callback;
  modal.style.display = "block";
}

// Đóng modal xác nhận
function closeConfirmModal() {
  const modal = document.getElementById("confirmDeleteModal");
  modal.style.display = "none";
  confirmCallback = null;
}

// Xử lý xác nhận
function confirmDelete(result) {
  if (confirmCallback) confirmCallback(result);
  closeConfirmModal();
}
// Xuất các hàm để kiểm thử (đã loại bỏ để tương thích trình duyệt)
// Thay vào đó, gắn các hàm vào window để kiểm thử nếu cần
window.testUtils = {
  updateTable,
  validateTransactionData,
  populateSelect,
  refreshTransactionList,
  handleAdd,
  handleDelete,
  checkServerHealth
};

// Hàm hỗ trợ kiểm tra kết nối server
async function checkServerHealth() {
  const { BACKEND_URL } = getConstants();
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ping" })
    });
    const result = await response.json();
    return result.status === "success";
  } catch (err) {
    console.error("Lỗi kiểm tra server:", err);
    return false;
  }
}

// Hàm kiểm tra phiên người dùng
function checkUserSession() {
  if (!userInfo) {
    showResultModal("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.", false);
    setTimeout(() => window.location.href = "index.html", 2000);
    return false;
  }
  return true;
}

// Hàm định dạng ngày giờ
function formatDateTime(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Hàm hỗ trợ tương thích cũ
window.editRow = function(index) {
  editTransaction(index);
};

window.deleteRow = function(index) {
  deleteTransaction(index);
};

// Hàm xử lý lỗi mạng
function handleNetworkError(err) {
  showResultModal("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.", false);
  console.error("Lỗi mạng:", err);
}

// Hàm retry cho các yêu cầu API
async function retryFetch(url, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

// Hàm khởi tạo lại giao diện
async function resetUI() {
  await handleReset();
  await refreshTransactionList();
  updateTable();
}

// Hàm debug để ghi log chi tiết
function debugLog(message, data) {
  console.log(`[DEBUG] ${message}`, JSON.stringify(data, null, 2));
}

// Gắn sự kiện kiểm tra kết nối định kỳ
setInterval(async () => {
  if (!(await checkServerHealth())) {
    showResultModal("Mất kết nối với server. Vui lòng kiểm tra lại.", false);
  }
}, 60000); // Kiểm tra mỗi 60 giây
