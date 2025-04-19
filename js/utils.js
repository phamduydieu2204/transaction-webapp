// Biến toàn cục
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

// Hiển thị kết quả thực thi và cho phép đóng modal
function showResultModal(message, isSuccess) {
  const modal = document.getElementById("processingModal");
  const modalMessage = document.getElementById("modalMessage");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  modalTitle.textContent = isSuccess ? "Thành công" : "Lỗi";
  modalMessage.textContent = message;
  modalMessage.style.color = isSuccess ? "green" : "red";
  modalClose.style.display = "block";

  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });

  modal.addEventListener("click", function handler(event) {
    if (event.target === modal) {
      closeProcessingModal();
      modal.removeEventListener("click", handler);
    }
  });
}

// Đóng modal xử lý
function closeProcessingModal() {
  const modal = document.getElementById("processingModal");
  modal.style.display = "none";
  document.getElementById("modalMessage").style.color = "black";
}

// Định dạng ngày
function formatDate(dateString) {
  if (!dateString) return "";
  return dateString;
}

// Định dạng ngày giờ
function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
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
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300);
      }, 1000);
    })
    .catch(err => {
      console.error("Lỗi khi copy nội dung: ", err);
    });
}

// Đóng modal chi tiết
function closeModal() {
  const modal = document.getElementById("transactionDetailModal");
  modal.style.display = "none";
}

// Mở modal xác nhận
function openConfirmModal(message, callback) {
  console.log("Mở modal xác nhận:", message);
  const modal = document.getElementById("confirmDeleteModal");
  const messageEl = document.getElementById("confirmMessage");
  messageEl.textContent = message;
  confirmCallback = callback;
  modal.style.display = "block";
}

// Đóng modal xác nhận
function closeConfirmModal() {
  console.log("Đóng modal xác nhận");
  const modal = document.getElementById("confirmDeleteModal");
  modal.style.display = "none";
  confirmCallback = null;
}

// Xử lý xác nhận
function confirmDelete(result) {
  console.log("Kết quả xác nhận:", result);
  if (confirmCallback) {
    confirmCallback(result);
  }
  closeConfirmModal();
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

// Hàm tính ngày kết thúc (được sử dụng bởi handleReset và openCalendar)
function calculateEndDate() {
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");
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
  } else {
    customerNameInput.value = "";
    customerPhoneInput.value = "";
  }

  customerNameInput.placeholder = "";
  customerPhoneInput.placeholder = "";
}

// Tải danh sách giao dịch
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

// Cập nhật bảng giao dịch
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

    const editButton = row.querySelector(".edit-btn");
    editButton.addEventListener("click", () => editTransaction(startIndex + index));

    const deleteButton = row.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      console.log("Nút xóa được nhấn, index:", startIndex + index);
      deleteTransaction(startIndex + index);
    });

    tableBody.appendChild(row);
  });

  updatePagination(totalPages);
}

// Tải danh sách phần mềm
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

      softwareNameSelect.innerHTML = '<option value="">-- Chọn phần mềm --</option>';

      softwareNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        softwareNameSelect.appendChild(option);
      });

      if (softwareNameToKeep && !softwareNames.includes(softwareNameToKeep)) {
        const option = document.createElement("option");
        option.value = softwareNameToKeep;
        option.textContent = softwareNameToKeep;
        option.className = "unavailable";
        softwareNameSelect.appendChild(option);
      }

      softwareNameSelect.value = softwareNameToKeep || "";
      updatePackageList(softwareNameToKeep ? softwareData.find(item => item.softwareName === softwareNameToKeep)?.softwarePackage : "");
    } else {
      console.error("Lỗi khi lấy danh sách phần mềm:", result.message);
    }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phần mềm:", err);
  }
}

// Cập nhật danh sách gói phần mềm
function updatePackageList(softwarePackageToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackageSelect = document.getElementById("softwarePackage");

  softwarePackageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

  if (softwareName) {
    const allPackages = [...new Set(softwareData
      .map(item => item.softwareName === softwareName ? item.softwarePackage : null)
      .filter(item => item !== null)
    )];

    const availablePackages = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName)
      .map(item => item.softwarePackage)
    )];

    const unavailablePackages = allPackages.filter(pkg => !availablePackages.includes(pkg));

    availablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      softwarePackageSelect.appendChild(option);
    });

    unavailablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    });

    if (softwarePackageToKeep && !allPackages.includes(softwarePackageToKeep)) {
      const option = document.createElement("option");
      option.value = softwarePackageToKeep;
      option.textContent = softwarePackageToKeep;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    }

    softwarePackageSelect.value = softwarePackageToKeep || "";
    updateAccountList(softwarePackageToKeep ? softwareData.find(item => item.softwareName === softwareName && item.softwarePackage === softwarePackageToKeep)?.accountName : "");
}

// Cập nhật danh sách tài khoản dựa trên phần mềm và gói phần mềm
function updateAccountList(accountNameToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const accountNameSelect = document.getElementById("accountName");

  accountNameSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';

  if (softwareName && softwarePackage) {
    const allAccounts = [...new Set(softwareData
      .filter(item =>
        item.softwareName === softwareName &&
        item.softwarePackage === softwarePackage
      )
      .map(item => item.accountName)
    )];

    const availableAccounts = [...new Set(softwareData
      .filter(item =>
        item.softwareName === softwareName &&
        item.softwarePackage === softwarePackage &&
        item.activeUsers < item.allowedUsers
      )
      .map(item => item.accountName)
    )];

    const unavailableAccounts = allAccounts.filter(account => !availableAccounts.includes(account));

    availableAccounts.forEach(account => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      accountNameSelect.appendChild(option);
    });

    unavailableAccounts.forEach(account => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    });

    if (accountNameToKeep && !allAccounts.includes(accountNameToKeep)) {
      const option = document.createElement("option");
      option.value = accountNameToKeep;
      option.textContent = accountNameToKeep;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    }

    accountNameSelect.value = accountNameToKeep || "";
  }
}
