let userInfo = null;
let currentEditIndex = -1;
let transactionList = [];
let today = new Date().toISOString().split("T")[0];
let currentPage = 1;
const itemsPerPage = 10;

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
  loadStats();
});

async function handleAdd() {
  const { BACKEND_URL } = getConstants();
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
    customerEmail: document.getElementById("customerEmail").value.toLowerCase(),
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
  console.log("📤 Gửi lên:", data);

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
      document.getElementById("endDate").value = "";
      await loadTransactions();
      await loadStats();
      currentEditIndex = -1;
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
    maNhanVien: userInfo.maNhanVien,
    tenNhanVien: userInfo.tenNhanVien,
    transactionType: document.getElementById("transactionType").value,
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value.toLowerCase(),
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
      await loadStats();
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
      await loadStats();
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
  const conditions = {
    transactionType: document.getElementById("searchTransactionType").value,
    customerName: document.getElementById("searchCustomerName").value,
    customerEmail: document.getElementById("searchCustomerEmail").value.toLowerCase(),
    softwareName: document.getElementById("searchSoftwareName").value
  };

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

async function loadStats() {
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
      const transactions = result.data;
      const timeRange = document.getElementById("timeRange").value;

      let totalRevenue = 0;
      let totalTransactions = transactions.length;
      const softwareCount = {};
      const packageCount = {};
      const revenueByTime = {};

      transactions.forEach(t => {
        totalRevenue += t.revenue;

        softwareCount[t.softwareName] = (softwareCount[t.softwareName] || 0) + 1;
        packageCount[t.softwarePackage] = (packageCount[t.softwarePackage] || 0) + 1;

        const date = new Date(t.startDate);
        let key;
        if (timeRange === "day") {
          key = date.toISOString().split("T")[0];
        } else if (timeRange === "month") {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        } else {
          key = date.getFullYear().toString();
        }
        revenueByTime[key] = (revenueByTime[key] || 0) + t.revenue;
      });

      document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString();
      document.getElementById("totalTransactions").textContent = totalTransactions;

      const popularSoftware = Object.keys(softwareCount).reduce((a, b) => softwareCount[a] > softwareCount[b] ? a : b, "");
      const popularPackage = Object.keys(packageCount).reduce((a, b) => packageCount[a] > packageCount[b] ? a : b, "");
      document.getElementById("popularSoftware").textContent = popularSoftware || "Không có";
      document.getElementById("popularPackage").textContent = popularPackage || "Không có";

      const revenueLabels = Object.keys(revenueByTime).sort();
      const revenueData = revenueLabels.map(label => revenueByTime[label]);
      const revenueChart = new Chart(document.getElementById("revenueChart"), {
        type: 'bar',
        data: {
          labels: revenueLabels,
          datasets: [{
            label: 'Doanh thu',
            data: revenueData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      const softwareChart = new Chart(document.getElementById("softwareChart"), {
        type: 'pie',
        data: {
          labels: Object.keys(softwareCount),
          datasets: [{
            label: 'Số lượng',
            data: Object.values(softwareCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1
          }]
        }
      });

      const expiredTableBody = document.querySelector("#expiredTransactionsTable tbody");
      expiredTableBody.innerHTML = "";
      transactions.forEach(t => {
        if (t.endDate === today) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${t.transactionId}</td>
            <td>${t.customerName}</td>
            <td>${t.customerEmail}</td>
            <td>${t.softwareName}</td>
            <td>${t.softwarePackage}</td>
            <td>${t.endDate}</td>
          `;
          expiredTableBody.appendChild(row);
        }
      });
    }
  } catch (err) {
    document.getElementById("errorMessage").textContent = `Lỗi khi tải thống kê: ${err.message}`;
    console.error("Lỗi khi tải thống kê", err);
  }
}

function updateTable() {
  const tableBody = document.querySelector("#transactionTable tbody");
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = transactionList.slice(start, end);

  paginatedItems.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.transactionId}</td>
      <td>${t.transactionDate}</td>
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
        <button class="edit-btn" onclick="editRow(${start + i})">Sửa</button>
        <button class="delete-btn" onclick="deleteRow(${start + i})">Xóa</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  updatePagination();
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
  currentEditIndex = index;
  handleDelete();
};

function openTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`button[onclick="openTab('${tabId}')"]`).classList.add('active');
}
