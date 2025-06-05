import { updatePagination } from './pagination.js';
import { updateTotalDisplay } from './updateTotalDisplay.js';
import { batchWrite, debounce } from './core/domOptimizer.js';

// Transaction pagination functions - Giống expense table
function transactionFirstPage() {
  window.currentPage = 1;
  if (typeof window.loadTransactions === 'function') {
    window.loadTransactions();
  }
}

function transactionPrevPage() {
  if (window.currentPage > 1) {
    window.currentPage--;
    if (typeof window.loadTransactions === 'function') {
      window.loadTransactions();
    }
  }
}

function transactionNextPage() {
  const itemsPerPage = window.itemsPerPage || 10;
  const totalPages = Math.ceil(window.transactionList.length / itemsPerPage);
  if (window.currentPage < totalPages) {
    window.currentPage++;
    if (typeof window.loadTransactions === 'function') {
      window.loadTransactions();
    }
  }
}

function transactionLastPage() {
  const itemsPerPage = window.itemsPerPage || 10;
  const totalPages = Math.ceil(window.transactionList.length / itemsPerPage);
  window.currentPage = totalPages;
  if (typeof window.loadTransactions === 'function') {
    window.loadTransactions();
  }
}

function transactionGoToPage(page) {
  window.currentPage = page;
  if (typeof window.loadTransactions === 'function') {
    window.loadTransactions();
  }
}

/**
 * Handle transaction action dropdown selection
 */
function handleTransactionAction(selectElement, transactionData) {
  const action = selectElement.value;
  if (!action) return;
  
  // Reset dropdown to default
  selectElement.value = '';
  
  // Parse transaction data if it's a string
  const transaction = typeof transactionData === 'string' ? JSON.parse(transactionData) : transactionData;
  
  console.log('🔍 handleTransactionAction:', {
    action,
    transactionData,
    transaction,
    transactionId: transaction.transactionId,
    transactionListLength: window.transactionList ? window.transactionList.length : 0
  });
  
  // Execute action based on selection
  switch (action) {
    case 'view':
      if (typeof window.viewTransaction === 'function') {
        // Find index in transactionList
        const index = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        console.log('🔍 View action - index found:', index);
        if (index !== -1) {
          window.viewTransaction(index, window.transactionList, window.formatDate);
        } else {
          console.error('❌ Transaction not found in list, trying direct view with transaction object');
          // Try passing the transaction object directly
          window.viewTransaction(transaction, window.transactionList, window.formatDate);
        }
      }
      break;
    case 'edit':
      if (typeof window.editTransaction === 'function') {
        const index = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        if (index !== -1) {
          window.editTransaction(index, window.transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
        }
      }
      break;
    case 'delete':
      if (typeof window.deleteTransaction === 'function') {
        const index = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        if (index !== -1) {
          window.deleteTransaction(index);
        }
      }
      break;
    case 'updateCookie':
      if (typeof window.handleUpdateCookie === 'function') {
        const index = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        if (index !== -1) {
          window.handleUpdateCookie(index);
        }
      }
      break;
    case 'changePassword':
      if (typeof window.handleChangePassword === 'function') {
        const index = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        if (index !== -1) {
          window.handleChangePassword(index);
        }
      }
      break;
  }
}

// Make transaction pagination functions available globally
window.transactionFirstPage = transactionFirstPage;
window.transactionPrevPage = transactionPrevPage;
window.transactionNextPage = transactionNextPage;
window.transactionLastPage = transactionLastPage;
window.transactionGoToPage = transactionGoToPage;
window.handleTransactionAction = handleTransactionAction;

/**
 * Update transaction pagination - Giống hoàn toàn expense table
 */
function updateTransactionPagination(totalPages, currentPage) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  // Thêm nút "Tất cả" nếu đang trong trạng thái tìm kiếm
  if (window.isSearching) {
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tất cả";
    allBtn.className = "pagination-btn all-btn";
    allBtn.addEventListener("click", () => {
      window.isSearching = false;
      window.currentPage = 1;
      if (typeof window.loadTransactions === 'function') {
        window.loadTransactions();
      }
    });
    pagination.appendChild(allBtn);
  }

  if (totalPages <= 1) return;

  // First button
  const firstButton = document.createElement("button");
  firstButton.textContent = "«";
  firstButton.className = "pagination-btn";
  firstButton.onclick = transactionFirstPage;
  firstButton.disabled = currentPage === 1;
  pagination.appendChild(firstButton);

  // Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "‹";
  prevButton.className = "pagination-btn";
  prevButton.onclick = transactionPrevPage;
  prevButton.disabled = currentPage === 1;
  pagination.appendChild(prevButton);

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "pagination-dots";
    pagination.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = "pagination-btn";
    pageButton.onclick = () => transactionGoToPage(i);
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pagination.appendChild(pageButton);
  }

  if (endPage < totalPages) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "pagination-dots";
    pagination.appendChild(dots);
  }

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.className = "pagination-btn";
  nextButton.onclick = transactionNextPage;
  nextButton.disabled = currentPage === totalPages;
  pagination.appendChild(nextButton);

  // Last button
  const lastButton = document.createElement("button");
  lastButton.textContent = "»";
  lastButton.className = "pagination-btn";
  lastButton.onclick = transactionLastPage;
  lastButton.disabled = currentPage === totalPages;
  pagination.appendChild(lastButton);
}

export function updateTable(transactionList, currentPage, itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  const tableBody = document.querySelector("#transactionTable tbody");
  if (!tableBody) return;
  
  // Batch DOM operations
  batchWrite(() => {
    tableBody.innerHTML = "";
  });

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

  // ✅ Build all rows HTML first (no DOM manipulation yet)
  const rowsHtml = paginatedItems.map((transaction, index) => {
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
        <select class="action-select" data-transaction='${JSON.stringify(transaction).replace(/'/g, "&#39;")}' onchange="handleTransactionAction(this, this.dataset.transaction)">
          ${actionOptions}
        </select>
      </td>
    `;

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

  // ✅ Cập nhật phân trang - Sử dụng structure giống expense table
  updateTransactionPagination(totalPages, currentPage);

  // ✅ Lưu tổng doanh thu vào biến global và cập nhật hiển thị
  window.totalRevenue = totalRevenue;
  console.log("✅ Đã lưu totalRevenue:", totalRevenue);

  // Không cần cập nhật hiển thị totals nữa - đã xóa
  console.log("✅ Đã lưu totalRevenue:", totalRevenue, "- Không hiển thị totals");
}