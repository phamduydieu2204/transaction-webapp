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

    // Xây dựng menu động dựa theo phần mềm
    const software = (transaction.softwareName || '').toLowerCase();
    const actions = [
      { value: "", label: "-- Chọn --" },
      { value: "view", label: "Xem" },
      { value: "edit", label: "Sửa" },
      { value: "delete", label: "Xóa" }
    ];

    if (software === "helium10" || software === "netflix") {
      actions.push({ value: "updateCookie", label: "Cập nhật Cookie" });
    }
    if (software === "netflix" || software !== "helium10") {
      actions.push({ value: "changePassword", label: "Đổi mật khẩu" });
    }

    const actionOptions = actions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join("\n");

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
          ${actionOptions}
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
      } else if (selected === "updateCookie") {
        if (typeof window.handleUpdateCookie === 'function') window.handleUpdateCookie(globalIndex);
        else alert("Chức năng Cập nhật Cookie chưa được triển khai.");
      } else if (selected === "changePassword") {
        if (typeof window.handleChangePassword === 'function') window.handleChangePassword(globalIndex);
        else alert("Chức năng Đổi mật khẩu chưa được triển khai.");
      }
      e.target.value = "";
    });

    tableBody.appendChild(row);

    // Tính doanh thu
    if (transaction.transactionDate && (window.isSearching || transaction.transactionDate.startsWith(todayFormatted))) {
      totalRevenue += parseFloat(transaction.revenue) || 0;
    }
  });

  const refreshTable = () =>
    updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);

  if (!window.firstPage || !window.prevPage || !window.nextPage || !window.lastPage || !window.goToPage) {
    console.warn("⚠️ Một hoặc nhiều hàm phân trang chưa được gán vào window.");
  }

  updatePagination(
    totalPages,
    window.currentPage,
    () => window.firstPage(refreshTable),
    () => window.prevPage(refreshTable),
    () => window.nextPage(refreshTable, window.itemsPerPage),
    () => window.lastPage(refreshTable, window.itemsPerPage),
    (page) => window.goToPage(page, refreshTable)
  );

  const todayRevenueElement = document.getElementById("todayRevenue");
  if (todayRevenueElement) {
    if (window.userInfo && window.userInfo.vaiTro && window.userInfo.vaiTro.toLowerCase() === "admin") {
      todayRevenueElement.textContent = `Tổng doanh thu: ${totalRevenue.toLocaleString()} VNĐ`;
    } else {
      todayRevenueElement.textContent = "";
    }
  }
}
