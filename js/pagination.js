import { editTransaction } from './edit.js';
import { deleteTransaction } from './delete.js';
import { viewTransaction } from './view.js';

let transactionList = [];
let currentPage = 1;
const itemsPerPage = 10;

export async function loadTransactions() {
  const userInfo = JSON.parse(localStorage.getItem('employeeInfo'));
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
      headers: { "Content-Type": "application/json" },
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

export function updateTable() {
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

export function updatePagination(totalPages) {
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
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
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

export function firstPage() {
  currentPage = 1;
  updateTable();
}

export function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updateTable();
  }
}

export function nextPage() {
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updateTable();
  }
}

export function lastPage() {
  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  currentPage = totalPages;
  updateTable();
}

export function goToPage(page) {
  currentPage = page;
  updateTable();
}