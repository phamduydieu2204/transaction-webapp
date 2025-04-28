import { fetchSoftwareList } from './fetchSoftwareList.js';
import { updatePackageList } from './updatePackageList.js';
import { updateAccountList } from './updateAccountList.js';
import { updatePagination } from './pagination.js';

export function updateTable(transactionList, currentPage, itemsPerPage,
                             formatDate, editTransaction, deleteTransaction, viewTransaction) {
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
    // Gắn sự kiện cho nút Sửa
    const editButton = row.querySelector(".edit-btn");
    editButton.addEventListener("click", () =>
      editTransaction(startIndex + index, transactionList,
                     fetchSoftwareList, updatePackageList, updateAccountList)
    );
    // Gắn sự kiện cho nút Xóa (dùng hàm window.deleteTransaction toàn cục)
    const deleteButton = row.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      console.log("Nút xóa được nhấn, index:", startIndex + index);
      window.deleteTransaction(startIndex + index);
    });
    tableBody.appendChild(row);
  });

  // Cập nhật thanh phân trang
  updatePagination(totalPages);

  // Tính tổng doanh thu
let totalRevenue = paginatedItems.reduce((sum, transaction) => {
  const revenue = parseFloat(transaction.revenue) || 0;
  return sum + revenue;
}, 0);

// Cập nhật tổng doanh thu lên giao diện
const todayRevenueElement = document.getElementById("todayRevenue");
if (todayRevenueElement) {
  todayRevenueElement.textContent = `Tổng doanh thu: ${totalRevenue.toLocaleString()} VNĐ`;
}

}
