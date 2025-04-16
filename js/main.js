let userInfo = null;
let currentEditIndex = -1; // Biến lưu chỉ số của giao dịch đang chỉnh sửa
let currentEditTransactionId = null; // Biến lưu Mã giao dịch của giao dịch đang chỉnh sửa
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

  fetchSoftwareList(null);
  document.getElementById("softwareName").addEventListener("change", updatePackageList);
  document.getElementById("softwarePackage").addEventListener("change", updateAccountList);

  loadTransactions();
});

function logout() {
  // Xóa thông tin người dùng khỏi localStorage
  localStorage.removeItem("employeeInfo");
  
  // Chuyển hướng về trang đăng nhập
  window.location.href = "index.html";
}

async function updateAccountList(accountNameToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const accountNameSelect = document.getElementById("accountName");

  accountNameSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';

  if (softwareName && softwarePackage) {
    // Lấy tất cả tài khoản tương ứng với Tên phần mềm và Gói phần mềm
    const allAccounts = [...new Set(softwareData
      .filter(item =>
        item.softwareName === softwareName &&
        item.softwarePackage === softwarePackage
      )
      .map(item => item.accountName)
    )];

    // Lấy các tài khoản khả dụng (activeUsers < allowedUsers)
    const availableAccounts = [...new Set(softwareData
      .filter(item =>
        item.softwareName === softwareName &&
        item.softwarePackage === softwarePackage &&
        item.activeUsers < item.allowedUsers
      )
      .map(item => item.accountName)
    )];

    const unavailableAccounts = allAccounts.filter(account => !availableAccounts.includes(account));

    // Thêm các tài khoản khả dụng
    availableAccounts.forEach(account => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      accountNameSelect.appendChild(option);
    });

    // Thêm các tài khoản không khả dụng (in nghiêng)
    unavailableAccounts.forEach(account => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    });

    // Thêm giá trị cần giữ nếu không có trong danh sách (in nghiêng)
    if (accountNameToKeep && !allAccounts.includes(accountNameToKeep)) {
      const option = document.createElement("option");
      option.value = accountNameToKeep;
      option.textContent = accountNameToKeep;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    }

    // Khôi phục giá trị
    accountNameSelect.value = accountNameToKeep || "";
  }
}

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
function updateCustomerInfo() {
  const email = document.getElementById("customerEmail").value.toLowerCase();
  const customerNameInput = document.getElementById("customerName");
  const customerPhoneInput = document.getElementById("customerPhone");

  // Hiển thị "Đang tìm kiếm..." ngay khi nhấn icon
  customerNameInput.value = "";
  customerPhoneInput.value = "";
  customerNameInput.placeholder = "Đang tìm kiếm...";
  customerPhoneInput.placeholder = "Đang tìm kiếm...";

  // Tìm kiếm trong transactionList
  const transaction = transactionList.find(t => t.customerEmail.toLowerCase() === email);

  // Cập nhật kết quả
  if (transaction) {
    customerNameInput.value = transaction.customerName || "";
    customerPhoneInput.value = transaction.customerPhone || "";
  } else {
    // Nếu không tìm thấy, để trống và đảm bảo định dạng mặc định
    customerNameInput.value = "";
    customerPhoneInput.value = "";
  }

  // Xóa placeholder sau khi tìm kiếm
  customerNameInput.placeholder = "";
  customerPhoneInput.placeholder = "";
}

// Hàm xử lý khi nhấn "Làm mới"
function handleReset() {
  const startDateInput = document.getElementById("startDate");
  const transactionDateInput = document.getElementById("transactionDate");
  
  startDateInput.value = todayFormatted;
  transactionDateInput.value = todayFormatted;

  document.getElementById("transactionForm").reset();

  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");

  // Xóa các trình xử lý focus
  softwareNameSelect.removeEventListener("focus", softwareNameSelect.focusHandler);
  softwarePackageSelect.removeEventListener("focus", softwarePackageSelect.focusHandler);
  accountNameSelect.removeEventListener("focus", accountNameSelect.focusHandler);

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
  
  fetchSoftwareList();
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

  const today = new Date();
  const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  const data = {
    action: "addTransaction",
    transactionType: document.getElementById("transactionType").value,
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
      handleReset();
      await loadTransactions();
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

  if (currentEditTransactionId === null) {
    alert("Vui lòng chọn một giao dịch để chỉnh sửa!");
    return;
  }

  const loadResult = await loadTransactions();
  if (loadResult.status === "error") {
    alert(loadResult.message);
    return;
  }

  const transaction = transactionList.find(t => t.transactionId === currentEditTransactionId);
  if (!transaction) {
    alert("Giao dịch không tồn tại hoặc đã bị xóa. Vui lòng thử lại!");
    handleReset();
    return;
  }

  const softwareNameElement = document.getElementById("softwareName");
  const softwarePackageElement = document.getElementById("softwarePackage");
  const accountNameElement = document.getElementById("accountName");

  if (!softwareNameElement || !softwarePackageElement || !accountNameElement) {
    alert("Không tìm thấy các trường dữ liệu trên form. Vui lòng thử lại!");
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
    softwareName: softwareNameElement.value,
    softwarePackage: softwarePackageElement.value,
    accountName: accountNameElement.value,
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
      handleReset();
      await loadTransactions(); // Giữ lại lần gọi này
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
  const accountName = document.getElementById("accountName").value;
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
  if (accountName && accountName !== "") conditions.accountName = accountName;
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
        return idB - idA;
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
  if (!userInfo) {
    console.error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
    return { status: "error", message: "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại." };
  }

  const { BACKEND_URL } = getConstants();
  const vaiTro = userInfo.vaiTro ? userInfo.vaiTro.toLowerCase() : "";
  const data = {
    action: "getTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: vaiTro
  };

  console.log("Dữ liệu gửi lên backend:", data);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Dữ liệu trả về từ backend:", result);

    if (result.status === "success") {
      transactionList = result.data;
      transactionList.sort((a, b) => {
        const idA = parseInt(a.transactionId.replace("GD", ""));
        const idB = parseInt(b.transactionId.replace("GD", ""));
        return idB - idA;
      });
      currentPage = 1;
      updateTable();
      return { status: "success", data: result.data };
    } else {
      document.getElementById("errorMessage").textContent = result.message || "Không thể tải danh sách giao dịch!";
      return { status: "error", message: result.message || "Không thể tải danh sách giao dịch!" };
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi khi tải danh sách giao dịch: ${err.message}`;
    console.error("Lỗi khi tải danh sách giao dịch", err);
    return { status: "error", message: `Lỗi khi tải danh sách giao dịch: ${err.message}` };
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
        <button class="edit-btn">Sửa</button>
        <button class="delete-btn">Xóa</button>
        <button class="view-btn" onclick="viewTransaction(${startIndex + index})">Xem</button>
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

function viewTransaction(index) {
  const transaction = transactionList[index];
  const modal = document.getElementById("transactionDetailModal");
  const detailContent = document.getElementById("transactionDetailContent");

  // Kiểm tra xem modal và detailContent có tồn tại không
  if (!modal) {
    console.error("Lỗi: Không tìm thấy phần tử transactionDetailModal trong DOM");
    return;
  }
  if (!detailContent) {
    console.error("Lỗi: Không tìm thấy phần tử transactionDetailContent trong DOM");
    return;
  }

  // Xóa nội dung cũ
  detailContent.innerHTML = "";

  // Danh sách các trường và giá trị tương ứng
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

  // Thêm các dòng dữ liệu dạng text
  fields.forEach(field => {
    const row = document.createElement("div");
    row.className = "detail-row";
    row.innerHTML = `
      <span class="detail-label">${field.label}:</span>
      <span class="detail-value">${field.value}</span>
      ${field.showCopy ? '<i class="fas fa-copy copy-icon"></i>' : ''}
    `;
    detailContent.appendChild(row);

    // Gán sự kiện click cho icon copy (nếu có)
    if (field.showCopy) {
      const copyIcon = row.querySelector(".copy-icon");
      copyIcon.addEventListener("click", () => copyToClipboard(field.value, copyIcon));
    }
  });

  // Hiển thị modal
  modal.style.display = "block";

  // Thêm sự kiện click để đóng modal khi click ra ngoài
  modal.addEventListener("click", function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
}

function copyToClipboard(text, iconElement) {
  // Sử dụng Clipboard API để copy nội dung
  navigator.clipboard.writeText(text)
    .then(() => {
      // Tạo phần tử thông báo "Đã copy"
      const message = document.createElement("span");
      message.className = "copy-message";
      message.textContent = "Đã copy";
      iconElement.appendChild(message);

      // Hiển thị thông báo
      message.classList.add("show");

      // Ẩn thông báo sau 1 giây
      setTimeout(() => {
        message.classList.remove("show");
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300); // Đợi thêm 0.3 giây để hoàn thành hiệu ứng mờ dần
      }, 1000);
    })
    .catch(err => {
      console.error("Lỗi khi copy nội dung: ", err);
    });
}

function closeModal() {
  const modal = document.getElementById("transactionDetailModal");
  modal.style.display = "none";
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
  currentEditIndex = index;
  const transaction = transactionList[index];
  currentEditTransactionId = transaction.transactionId;

  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");

  const softwareNameValue = transaction.softwareName || "";
  const softwarePackageValue = transaction.softwarePackage || "";
  const accountNameValue = transaction.accountName || "";

  console.log("Dữ liệu giao dịch để sửa:", {
    softwareName: softwareNameValue,
    softwarePackage: softwarePackageValue,
    accountName: accountNameValue
  });

  const softwareNameChangeHandler = softwareNameSelect.onchange;
  const softwarePackageChangeHandler = softwarePackageSelect.onchange;
  softwareNameSelect.onchange = null;
  softwarePackageSelect.onchange = null;

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

  // Điền giá trị vào dropdown
  fetchSoftwareList(softwareNameValue);
  softwareNameSelect.value = softwareNameValue;

  updatePackageList(softwarePackageValue);
  softwarePackageSelect.value = softwarePackageValue;

  updateAccountList(accountNameValue);
  accountNameSelect.value = accountNameValue;

  console.log("Giá trị sau khi điền lên form:", {
    softwareName: softwareNameSelect.value,
    softwarePackage: softwarePackageSelect.value,
    accountName: accountNameSelect.value
  });

  softwareNameSelect.onchange = softwareNameChangeHandler;
  softwarePackageSelect.onchange = softwarePackageChangeHandler;

  // Xóa các trình xử lý focus cũ trước khi thêm mới
  softwareNameSelect.removeEventListener("focus", softwareNameSelect.focusHandler);
  softwarePackageSelect.removeEventListener("focus", softwarePackageSelect.focusHandler);
  accountNameSelect.removeEventListener("focus", accountNameSelect.focusHandler);

  // Thêm sự kiện focus mới
  softwareNameSelect.focusHandler = function() {
    fetchSoftwareList(softwareNameValue);
  };
  softwarePackageSelect.focusHandler = function() {
    updatePackageList(softwarePackageValue);
  };
  accountNameSelect.focusHandler = function() {
    updateAccountList(accountNameValue);
  };

  softwareNameSelect.addEventListener("focus", softwareNameSelect.focusHandler);
  softwarePackageSelect.addEventListener("focus", softwarePackageSelect.focusHandler);
  accountNameSelect.addEventListener("focus", accountNameSelect.focusHandler);
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
async function fetchSoftwareList(softwareNameToKeep) {
  const { BACKEND_URL } = getConstants();
  const data = {
    action: "getSoftwareList"
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
      softwareData = result.data;

      const softwareNames = [...new Set(softwareData.map(item => item.softwareName))];
      const softwareNameSelect = document.getElementById("softwareName");

      // Làm mới danh sách tùy chọn
      softwareNameSelect.innerHTML = '<option value="">-- Chọn phần mềm --</option>';

      // Thêm các giá trị khả dụng
      softwareNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        softwareNameSelect.appendChild(option);
      });

      // Thêm giá trị cần giữ nếu không có trong danh sách (in nghiêng)
      if (softwareNameToKeep && !softwareNames.includes(softwareNameToKeep)) {
        const option = document.createElement("option");
        option.value = softwareNameToKeep;
        option.textContent = softwareNameToKeep;
        option.className = "unavailable";
        softwareNameSelect.appendChild(option);
      }

      // Khôi phục giá trị
      softwareNameSelect.value = softwareNameToKeep || "";

      updatePackageList();
    } else {
      console.error("Lỗi khi lấy danh sách phần mềm:", result.message);
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
function updatePackageList(softwarePackageToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackageSelect = document.getElementById("softwarePackage");

  softwarePackageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

  if (softwareName) {
    // Lấy tất cả gói phần mềm tương ứng với Tên phần mềm
    const allPackages = [...new Set(softwareData
      .map(item => item.softwareName === softwareName ? item.softwarePackage : null)
      .filter(item => item !== null)
    )];

    // Lấy các gói phần mềm khả dụng
    const availablePackages = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName)
      .map(item => item.softwarePackage)
    )];

    const unavailablePackages = allPackages.filter(pkg => !availablePackages.includes(pkg));

    // Thêm các gói phần mềm khả dụng
    availablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      softwarePackageSelect.appendChild(option);
    });

    // Thêm các gói phần mềm không khả dụng (in nghiêng)
    unavailablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    });

    // Thêm giá trị cần giữ nếu không có trong danh sách (in nghiêng)
    if (softwarePackageToKeep && !allPackages.includes(softwarePackageToKeep)) {
      const option = document.createElement("option");
      option.value = softwarePackageToKeep;
      option.textContent = softwarePackageToKeep;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    }

    // Khôi phục giá trị
    softwarePackageSelect.value = softwarePackageToKeep || "";
  }

  updateAccountList();
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
