import { updatePagination } from './pagination.js';
import { updateTotalDisplay } from './updateTotalDisplay.js';

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

  console.log("📌 BẮT ĐẦU HIỂN THỊ GIAO DỊCH");
  console.log("🟢 Vai trò:", window.userInfo?.vaiTro);
  console.log("🟢 isSearching:", window.isSearching);
  console.log("🟢 todayFormatted:", todayFormatted);

  
      // ✅ Sắp xếp giao dịch mới nhất lên đầu (timestamp giảm dần)
      window.transactionList.sort((a, b) => {
        const timestampA = (a.transactionId || "").replace(/[^0-9]/g, "");
        const timestampB = (b.transactionId || "").replace(/[^0-9]/g, "");
        return timestampB.localeCompare(timestampA);
      });
  
  // ✅ Tính tổng doanh thu
  if (window.isSearching === true) {
    totalRevenue = transactionList.reduce((sum, t) => {
      return sum + (parseFloat(t.revenue) || 0);
    }, 0);
    console.log("🔍 Đang tìm kiếm - Tổng doanh thu:", totalRevenue);
  } else {
    totalRevenue = transactionList.reduce((sum, t) => {
      if (t.transactionDate && t.transactionDate.startsWith(todayFormatted)) {
        return sum + (parseFloat(t.revenue) || 0);
      }
      return sum;
    }, 0);
    console.log("📅 Không tìm kiếm - Tổng doanh thu hôm nay:", totalRevenue);
  }

  // ✅ Hiển thị dữ liệu bảng
  paginatedItems.forEach((transaction, index) => {
    const globalIndex = startIndex + index;
    const row = document.createElement("tr");

    const parseDate = (str) => {
      const [y, m, d] = (str || "").split("/").map(Number);
      return new Date(y, m - 1, d);
    };
    const endDate = parseDate(transaction.endDate);
    if (endDate < today) {
      row.classList.add("expired-row");
    }

    const software = (transaction.softwareName || '').toLowerCase();
    const softwarePackage = (transaction.softwarePackage || '').trim().toLowerCase();
    const actions = [
      { value: "", label: "-- Chọn --" },
      { value: "view", label: "Xem" },
      { value: "edit", label: "Sửa" },
      { value: "delete", label: "Xóa" }
    ];
    const shouldShowCookie = (
      software === "helium10 diamon".toLowerCase() ||
      software === "helium10 platinum".toLowerCase() ||
      (software === "netflix" && softwarePackage === "share")
    );

    if (shouldShowCookie) {
      actions.push({ value: "updateCookie", label: "Cập nhật Cookie" });
    } else {
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
  });

  // ✅ Cập nhật phân trang
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

  // ✅ Lưu tổng doanh thu vào biến global và cập nhật hiển thị
  window.totalRevenue = totalRevenue;
  console.log("✅ Đã lưu totalRevenue:", totalRevenue);

  // Gọi hàm cập nhật hiển thị tổng số
  if (typeof updateTotalDisplay === 'function') {
    updateTotalDisplay();
  } else if (typeof window.updateTotalDisplay === 'function') {
    window.updateTotalDisplay();
  } else {
    // Fallback nếu hàm chưa load
    console.warn("⚠️ updateTotalDisplay chưa sẵn sàng, sử dụng fallback");
    const todayRevenueElement = document.getElementById("todayRevenue");
    if (todayRevenueElement && window.userInfo && window.userInfo.vaiTro && window.userInfo.vaiTro.toLowerCase() === "admin") {
      const displayText = window.isSearching 
        ? `Tổng doanh thu (kết quả tìm kiếm): ${totalRevenue.toLocaleString()} VNĐ`
        : `Tổng doanh thu hôm nay: ${totalRevenue.toLocaleString()} VNĐ`;
      todayRevenueElement.textContent = displayText;
      console.log("💰 Fallback - Hiển thị doanh thu:", displayText);
    }
  }
}