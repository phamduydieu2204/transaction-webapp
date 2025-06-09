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
 * Handle transaction action dropdown selection - using index
 */
function handleTransactionActionByIndex(selectElement) {
  const action = selectElement.value;
  if (!action) return;
  
  const globalIndex = parseInt(selectElement.dataset.index);
  console.log('🔍 Transaction action:', action, 'Index:', globalIndex);
  
  // Reset dropdown to default
  selectElement.value = '';
  
  // Get transaction from window.transactionList
  const transaction = window.transactionList[globalIndex];
  if (!transaction) {
    console.error('❌ Transaction not found at index:', globalIndex);
    return;
  }
  
  console.log('🔍 Found transaction:', {
    action,
    globalIndex,
    transaction,
    transactionId: transaction.transactionId,
    transactionListLength: window.transactionList ? window.transactionList.length : 0
  });
  
  // Execute action based on selection
  switch (action) {
    case 'view':
      if (typeof window.viewTransaction === 'function') {
        // Pass globalIndex directly - it's already the correct index
        console.log('🔍 View action - using globalIndex:', globalIndex);
        window.viewTransaction(globalIndex, window.transactionList, window.formatDate);
      }
      break;
    case 'edit':
      if (typeof window.editTransaction === 'function') {
        window.editTransaction(globalIndex, window.transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
      }
      break;
    case 'delete':
      if (typeof window.deleteTransaction === 'function') {
        window.deleteTransaction(globalIndex);
      }
      break;
    case 'updateCookie':
      if (typeof window.handleUpdateCookie === 'function') {
        window.handleUpdateCookie(globalIndex);
      }
      break;
    case 'changePassword':
      if (typeof window.handleChangePassword === 'function') {
        window.handleChangePassword(globalIndex);
      }
      break;
    case 'checkAccess':
      if (typeof window.checkSheetAccess === 'function') {
        window.checkSheetAccess(transaction);
      } else {
        console.error('checkSheetAccess function not found');
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
window.handleTransactionActionByIndex = handleTransactionActionByIndex;

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
  if (!tableBody) {
    console.error("❌ Không tìm thấy tbody của transactionTable");
    return;
  }
  
  // Clear table immediately (not in batch)
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

  // ✅ Build and append rows
  paginatedItems.forEach((transaction, index) => {
    // For search results, use the actual index in the current list
    const actualIndex = window.isSearching ? 
      transactionList.findIndex(t => t.transactionId === transaction.transactionId) : 
      startIndex + index;
    
    const globalIndex = actualIndex;
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
    
    // Add "Check access" option if transaction has accountSheetId
    if (transaction.accountSheetId && transaction.accountSheetId.trim() !== '') {
      actions.push({ value: "checkAccess", label: "Kiểm tra quyền truy cập" });
    }

    const actionOptions = actions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join("\n");

    const linkHtml = isLink(transaction.customerPhone)
      ? `<a href="${transaction.customerPhone}" target="_blank" title="${transaction.customerPhone}">Liên hệ 🔗</a>`
      : transaction.customerPhone || "";

    // Get employee code from various possible fields
    const employeeCode = transaction.maNhanVien || 
                        transaction.employeeCode || 
                        transaction.staffCode || 
                        transaction.user || 
                        transaction.creator || 
                        'DEBUG';

    // Generate consistent color for employee code
    const getEmployeeColor = (code) => {
      // Predefined colors that work well with white text
      const colors = [
        { bg: '#007bff', border: '#0056b3' }, // Blue
        { bg: '#28a745', border: '#1e7e34' }, // Green
        { bg: '#dc3545', border: '#bd2130' }, // Red
        { bg: '#fd7e14', border: '#e65100' }, // Orange
        { bg: '#6f42c1', border: '#5a3597' }, // Purple
        { bg: '#20c997', border: '#17a085' }, // Teal
        { bg: '#e83e8c', border: '#d21b7c' }, // Pink
        { bg: '#6c757d', border: '#545b62' }, // Gray
        { bg: '#17a2b8', border: '#138496' }, // Cyan
        { bg: '#ffc107', border: '#d39e00' }, // Yellow (darker text)
      ];
      
      // Simple hash function to get consistent color for same employee code
      let hash = 0;
      for (let i = 0; i < code.length; i++) {
        const char = code.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      const colorIndex = Math.abs(hash) % colors.length;
      const color = colors[colorIndex];
      
      // Use black text for yellow background
      const textColor = colorIndex === 9 ? '#000' : '#fff';
      
      return { ...color, textColor };
    };

    const employeeColor = getEmployeeColor(employeeCode);

    // Debug employee code
    if (index === 0) {
      console.log('🔍 First transaction employee data:', {
        maNhanVien: transaction.maNhanVien,
        tenNhanVien: transaction.tenNhanVien,
        employeeCode: employeeCode,
        color: employeeColor,
        allKeys: Object.keys(transaction)
      });
      console.log('🔍 Employee code determined:', employeeCode);
    }
    
    const infoCell = `
      <div class="info-cell-container" style="position: relative; min-height: 40px; padding-top: 12px;">
        <span class="employee-badge" style="position: absolute; top: 2px; right: 2px; font-size: 11px; color: ${employeeColor.textColor}; font-weight: bold; background: ${employeeColor.bg}; padding: 2px 6px; border-radius: 4px; z-index: 10; border: 1px solid ${employeeColor.border}; box-shadow: 0 1px 2px rgba(0,0,0,0.2); display: block !important;">${employeeCode}</span>
        <div class="info-cell-content">
          <div>${linkHtml}</div>
          <div>
            Thông tin đơn hàng
            <button class="copy-btn" data-content="${(transaction.orderInfo || "").replace(/"/g, '&quot;')}">📋</button>
          </div>
        </div>
      </div>
    `;

    // Create usage cycle cell with icons and 3 lines
    const usageCycleCell = `
      <div class="usage-cycle-cell">
        <div class="cycle-line">📅 ${transaction.duration || 0} tháng</div>
        <div class="cycle-line">▶️ ${formatDate(transaction.startDate)}</div>
        <div class="cycle-line">⏹️ ${formatDate(transaction.endDate)}</div>
      </div>
    `;
    
    // Software info - allow full content and wrap
    const softwareInfo = `
      <div class="software-info-cell">
        ${transaction.softwareName} - ${transaction.softwarePackage}${transaction.accountName ? ` - ${transaction.accountName}` : ""}
      </div>
    `;

    // Gộp tên và email khách hàng trong 1 ô
    const customerInfo = `${transaction.customerName}<br><small>${transaction.customerEmail}</small>`;
    
    row.innerHTML = `
      <td>${transaction.transactionId}</td>
      <td>${formatDate(transaction.transactionDate)}</td>
      <td>${transaction.transactionType}</td>
      <td>${customerInfo}</td>
      <td>${usageCycleCell}</td>
      <td>${transaction.deviceCount}</td>
      <td>${softwareInfo}</td>
      <td>${transaction.revenue}</td>
      <td>${transaction.note || ""}</td>
      <td>${infoCell}</td>
      <td>
        <select class="action-select" data-index="${globalIndex}" onchange="handleTransactionActionByIndex(this)">
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
  
  // Đã loại bỏ debugTable để tăng performance
}