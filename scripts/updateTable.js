import { updatePagination } from './pagination.js';

export function updateTable(transactionList, currentPage, itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  const tableBody = document.querySelector("#transactionTable tbody");
  tableBody.innerHTML = "";

  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = transactionList.slice(startIndex, endIndex);

  let totalRevenue = 0;
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

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
    editButton.addEventListener("click", () => {
      console.log("🛠️ Gọi window.editTransaction từ updateTable với index:", startIndex + index);
      console.log("window.editTransaction =", typeof window.editTransaction);
      if (typeof window.editTransaction === "function") {
        window.editTransaction(startIndex + index, transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
      } else {
        console.error("❌ window.editTransaction chưa được khởi tạo hoặc không phải là hàm.");
        console.error("editTransaction chưa được khởi tạo đúng.");
      }
    });
    

    const deleteButton = row.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => deleteTransaction(startIndex + index));

    tableBody.appendChild(row);

    // Tính doanh thu
    if (transaction.transactionDate && (window.isSearching || transaction.transactionDate.startsWith(todayFormatted))) {
      totalRevenue += parseFloat(transaction.revenue) || 0;
    }
  });

  updatePagination(totalPages);

  const todayRevenueElement = document.getElementById("todayRevenue");
  if (todayRevenueElement) {
    if (window.userInfo && window.userInfo.vaiTro && window.userInfo.vaiTro.toLowerCase() === "admin") {
      todayRevenueElement.textContent = `Tổng doanh thu: ${totalRevenue.toLocaleString()} VNĐ`;
    } else {
      todayRevenueElement.textContent = "";
    }
  }
}
