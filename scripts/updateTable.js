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

  const isLink = (text) => /^https?:\/\//i.test(text);

  paginatedItems.forEach((transaction, index) => {
    const globalIndex = startIndex + index;
    const row = document.createElement("tr");

    const software = (transaction.softwareName || '').toLowerCase();
    const actions = [
      { value: "", label: "-- Chọn --" },
      { value: "view", label: "Xem" },
      { value: "edit", label: "Sửa" },
      { value: "delete", label: "Xóa" }
    ];

    if (software === "helium10") {
      actions.push({ value: "updateCookie", label: "Cập nhật Cookie" });
    }
    if (software !== "helium10") {
      actions.push({ value: "changePassword", label: "Đổi mật khẩu" });
    }

    const actionOptions = actions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join("\n");

    const linkHtml = isLink(transaction.customerPhone)
      ? `<a href="${transaction.customerPhone}" target="_blank" title="${transaction.customerPhone}">Liên hệ 🔗</a>`
      : transaction.customerPhone || "";

    const infoCell = `
      <div>${linkHtml}</div>
      <div>
        Thông tin đơn hàng
        <button class="copy-btn" data-content="${(transaction.orderInfo || "").replace(/"/g, '&quot;')}">📋</button>
      </div>
    `;

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
      <td>${transaction.softwareName} - ${transaction.softwarePackage} - ${transaction.accountName || ""}</td>
      <td>${transaction.revenue}</td>
      <td>${infoCell}</td>
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

    const copyBtn = row.querySelector(".copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const content = copyBtn.getAttribute("data-content") || "";
        navigator.clipboard.writeText(content);
        alert("Đã sao chép thông tin đơn hàng.");
      });
    }

    tableBody.appendChild(row);

    if (transaction.transactionDate && (window.isSearching || transaction.transactionDate.startsWith(todayFormatted))) {
      totalRevenue += parseFloat(transaction.revenue) || 0;
    }
  });

  const refreshTable = () =>
    updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);

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
