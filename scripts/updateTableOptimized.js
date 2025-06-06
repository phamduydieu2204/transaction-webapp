import { updatePagination } from './pagination.js';
import { updateTotalDisplay } from './updateTotalDisplay.js';
import { batchWrite } from './core/domOptimizer.js';

export function updateTableOptimized(transactionList, currentPage, itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  const tableBody = document.querySelector("#transactionTable tbody");
  if (!tableBody) return;

  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = transactionList.slice(startIndex, endIndex);

  let totalRevenue = 0;
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  const isLink = (text) => /^https?:\/\//i.test(text);

  // ✅ Sort transactions (already done in loadTransactions)
  
  // ✅ Calculate total revenue
  if (window.isSearching === true) {
    totalRevenue = transactionList.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  } else {
    totalRevenue = transactionList.reduce((sum, t) => {
      if (t.transactionDate && t.transactionDate.startsWith(todayFormatted)) {
        return sum + (parseFloat(t.revenue) || 0);
      }
      return sum;
    }, 0);
  }

  // ✅ Build all rows HTML in memory first
  const parseDate = (str) => {
    const [y, m, d] = (str || "").split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  const rowsHtml = paginatedItems.map((transaction, index) => {
    const globalIndex = startIndex + index;
    const endDate = parseDate(transaction.endDate);
    const isExpired = endDate < today;
    
    const software = (transaction.softwareName || '').toLowerCase();
    const softwarePackage = (transaction.softwarePackage || '').trim().toLowerCase();
    
    const shouldShowCookie = (
      software === "helium10 diamon".toLowerCase() ||
      software === "helium10 platinum".toLowerCase() ||
      (software === "netflix" && softwarePackage === "share")
    );

    const linkHtml = isLink(transaction.customerPhone)
      ? `<a href="${transaction.customerPhone}" target="_blank" title="${transaction.customerPhone}">Liên hệ 🔗</a>`
      : transaction.customerPhone || "";

    const infoCell = `
      <div>${linkHtml}</div>
      <div>
        Thông tin đơn hàng
        <button class="copy-btn" data-content="${(transaction.orderInfo || "").replace(/"/g, '&quot;')}" data-index="${globalIndex}">📋</button>
      </div>
    `;

    // Build action options
    let actionOptions = `
      <option value="">-- Chọn --</option>
      <option value="view">Xem</option>
      <option value="edit">Sửa</option>
      <option value="delete">Xóa</option>`;
    
    if (shouldShowCookie) {
      actionOptions += `<option value="updateCookie">Cập nhật Cookie</option>`;
    } else {
      actionOptions += `<option value="changePassword">Đổi mật khẩu</option>`;
    }

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

    return `
      <tr class="${isExpired ? 'expired-row' : ''}" data-index="${globalIndex}">
        <td>${transaction.transactionId}</td>
        <td>${formatDate(transaction.transactionDate)}</td>
        <td>${transaction.transactionType}</td>
        <td>${transaction.customerName}</td>
        <td>${transaction.customerEmail}</td>
        <td>${usageCycleCell}</td>
        <td>${transaction.deviceCount}</td>
        <td>${softwareInfo}</td>
        <td>${transaction.revenue}</td>
        <td>${transaction.note || ""}</td>
        <td>${infoCell}</td>
        <td>
          <select class="action-select" data-index="${globalIndex}">
            ${actionOptions}
          </select>
        </td>
      </tr>
    `;
  }).join('');

  // ✅ Single DOM update with all rows
  batchWrite(() => {
    tableBody.innerHTML = rowsHtml;
  });

  // ✅ Add event listeners using event delegation (more efficient)
  batchWrite(() => {
    // Single event listener for all action selects
    tableBody.addEventListener('change', (e) => {
      if (e.target.classList.contains('action-select')) {
        const selected = e.target.value;
        const globalIndex = parseInt(e.target.dataset.index);
        
        console.log(`🎯 Action selected: ${selected} for index: ${globalIndex}`);
        
        switch(selected) {
          case 'edit':
            window.editTransaction(globalIndex, transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
            break;
          case 'delete':
            window.deleteTransaction(globalIndex);
            break;
          case 'view':
            window.viewTransaction(globalIndex, transactionList, window.formatDate, window.copyToClipboard);
            break;
          case 'updateCookie':
            if (typeof window.handleUpdateCookie === 'function') {
              window.handleUpdateCookie(globalIndex);
            } else {
              alert("Chức năng Cập nhật Cookie chưa được triển khai.");
            }
            break;
          case 'changePassword':
            if (typeof window.handleChangePassword === 'function') {
              window.handleChangePassword(globalIndex);
            } else {
              alert("Chức năng Đổi mật khẩu chưa được triển khai.");
            }
            break;
        }
        
        e.target.value = "";
      }
    });

    // Single event listener for all copy buttons
    tableBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-btn')) {
        const content = e.target.getAttribute("data-content") || "";
        navigator.clipboard.writeText(content).then(() => {
          // Show temporary feedback instead of alert
          const originalText = e.target.textContent;
          e.target.textContent = '✓';
          setTimeout(() => {
            e.target.textContent = originalText;
          }, 1000);
        });
      }
    });
  });

  // ✅ Update pagination
  const refreshTable = () =>
    updateTableOptimized(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);

  updatePagination(
    totalPages,
    window.currentPage,
    () => window.firstPage(refreshTable),
    () => window.prevPage(refreshTable),
    () => window.nextPage(refreshTable, window.itemsPerPage),
    () => window.lastPage(refreshTable, window.itemsPerPage),
    (page) => window.goToPage(page, refreshTable)
  );

  // ✅ Save total revenue
  window.totalRevenue = totalRevenue;
  console.log("✅ Total revenue calculated:", totalRevenue);
}

// Export as default updateTable
export { updateTableOptimized as updateTable };