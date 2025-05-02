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
    const globalIndex = startIndex + index;
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
        <select class="action-select">
          <option value="">-- Chọn --</option>
          <option value="view">Xem</option>
          <option value="edit">Sửa</option>
          <option value="delete">Xóa</option>
        </select>
      </td>
    `;

    const actionSelect = row.querySelector(".action-select");
    actionSelect.addEventListener("change", (e) => {
      const selected = e.target.value;
      if (selected === "edit") {
        window.editTransaction(globalIndex, transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
      } else if (selected === "delete") {
        window.deleteTransaction(globalIndex);
      } else if (selected === "view") {
        window.viewTransaction(globalIndex, transactionList, window.formatDate, window.copyToClipboard);
      }
      e.target.value = "";
    });

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
