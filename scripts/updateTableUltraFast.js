import { updatePagination } from './pagination.js';
import { batchWrite } from './core/domOptimizer.js';

/**
 * Ultra-fast table update - only renders first page immediately
 */
export function updateTableUltraFast(transactionList, currentPage, itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  const tableBody = document.querySelector("#transactionTable tbody");
  if (!tableBody) return;

  console.log(`🚀 Ultra-fast table update: ${transactionList.length} total transactions`);

  // For ultra-fast loading, limit initial render to 25 rows max
  const FAST_LIMIT = 25;
  const actualItemsPerPage = Math.min(itemsPerPage, FAST_LIMIT);
  
  const totalPages = Math.ceil(transactionList.length / actualItemsPerPage);
  const startIndex = (currentPage - 1) * actualItemsPerPage;
  const endIndex = startIndex + actualItemsPerPage;
  
  // Only process visible items
  const paginatedItems = transactionList.slice(startIndex, endIndex);
  
  console.log(`⚡ Rendering ${paginatedItems.length} rows out of ${transactionList.length} total`);

  let totalRevenue = 0;
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  const isLink = (text) => /^https?:\/\//i.test(text);

  // ✅ Calculate total revenue ONLY for visible items initially
  if (window.isSearching === true) {
    totalRevenue = paginatedItems.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  } else {
    totalRevenue = paginatedItems.reduce((sum, t) => {
      if (t.transactionDate && t.transactionDate.startsWith(todayFormatted)) {
        return sum + (parseFloat(t.revenue) || 0);
      }
      return sum;
    }, 0);
  }

  // ✅ Pre-calculate common values
  const parseDate = (str) => {
    const [y, m, d] = (str || "").split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  // ✅ Build minimal HTML for visible rows only
  const rowsHtml = paginatedItems.map((transaction, index) => {
    const globalIndex = startIndex + index;
    const endDate = parseDate(transaction.endDate);
    const isExpired = endDate < today;
    
    const software = (transaction.softwareName || '').toLowerCase();
    const softwarePackage = (transaction.softwarePackage || '').trim().toLowerCase();
    
    const shouldShowCookie = (
      software.includes("helium10") ||
      (software === "netflix" && softwarePackage === "share")
    );

    // Simplified phone display
    const phoneDisplay = isLink(transaction.customerPhone)
      ? `<a href="${transaction.customerPhone}" target="_blank">🔗</a>`
      : (transaction.customerPhone || "").substring(0, 20);

    // Simplified info cell
    const infoCell = `
      <div>${phoneDisplay}</div>
      <div>
        <button class="copy-btn" data-content="${(transaction.orderInfo || "").replace(/"/g, '&quot;')}" title="Copy order info">📋</button>
      </div>
    `;

    // Minimal action dropdown
    const actionOptions = shouldShowCookie
      ? `<option value="">--</option><option value="view">Xem</option><option value="edit">Sửa</option><option value="delete">Xóa</option><option value="updateCookie">Cookie</option>`
      : `<option value="">--</option><option value="view">Xem</option><option value="edit">Sửa</option><option value="delete">Xóa</option><option value="changePassword">Đổi MK</option>`;

    return `
      <tr class="${isExpired ? 'expired-row' : ''}" data-index="${globalIndex}">
        <td>${transaction.transactionId}</td>
        <td>${formatDate(transaction.transactionDate)}</td>
        <td>${transaction.transactionType}</td>
        <td>${transaction.customerName}</td>
        <td>${transaction.customerEmail}</td>
        <td>${transaction.duration}</td>
        <td>${formatDate(transaction.startDate)}</td>
        <td>${formatDate(transaction.endDate)}</td>
        <td>${transaction.deviceCount}</td>
        <td title="${transaction.softwareName} - ${transaction.softwarePackage} - ${transaction.accountName || ""}">${transaction.softwareName.substring(0, 15)}...</td>
        <td>${transaction.revenue}</td>
        <td>${infoCell}</td>
        <td>
          <select class="action-select" data-index="${globalIndex}">
            ${actionOptions}
          </select>
        </td>
      </tr>
    `;
  }).join('');

  // ✅ Single ultra-fast DOM update
  batchWrite(() => {
    tableBody.innerHTML = rowsHtml;
  });

  // ✅ Single event delegation setup (if not already done)
  if (!tableBody.hasAttribute('data-events-attached')) {
    batchWrite(() => {
      tableBody.setAttribute('data-events-attached', 'true');
      
      // Ultra-lightweight event delegation
      tableBody.addEventListener('change', (e) => {
        if (e.target.matches('.action-select')) {
          const action = e.target.value;
          const index = parseInt(e.target.dataset.index);
          
          if (action && index >= 0) {
            handleTableAction(action, index, transactionList);
            e.target.value = "";
          }
        }
      });

      tableBody.addEventListener('click', (e) => {
        if (e.target.matches('.copy-btn')) {
          const content = e.target.dataset.content || "";
          navigator.clipboard.writeText(content);
          e.target.textContent = '✓';
          setTimeout(() => e.target.textContent = '📋', 800);
        }
      });
    });
  }

  // ✅ Update pagination with corrected page size
  const refreshTable = () =>
    updateTableUltraFast(window.transactionList, window.currentPage, actualItemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);

  updatePagination(
    totalPages,
    window.currentPage,
    () => window.firstPage(refreshTable),
    () => window.prevPage(refreshTable),
    () => window.nextPage(refreshTable, actualItemsPerPage),
    () => window.lastPage(refreshTable, actualItemsPerPage),
    (page) => window.goToPage(page, refreshTable)
  );

  // ✅ Save revenue and log performance
  window.totalRevenue = totalRevenue;
  console.log(`⚡ Ultra-fast render complete: ${paginatedItems.length} rows, revenue: ${totalRevenue}`);
  
  // ✅ Schedule background calculation of full revenue if needed
  if (!window.isSearching && paginatedItems.length < transactionList.length) {
    setTimeout(() => {
      const fullRevenue = transactionList.reduce((sum, t) => {
        if (t.transactionDate && t.transactionDate.startsWith(todayFormatted)) {
          return sum + (parseFloat(t.revenue) || 0);
        }
        return sum;
      }, 0);
      window.totalRevenue = fullRevenue;
      console.log(`📊 Background revenue calculation complete: ${fullRevenue}`);
    }, 100);
  }
}

/**
 * Handle table actions efficiently
 */
function handleTableAction(action, index, transactionList) {
  switch(action) {
    case 'edit':
      window.editTransaction?.(index, transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
      break;
    case 'delete':
      window.deleteTransaction?.(index);
      break;
    case 'view':
      window.viewTransaction?.(index, transactionList, window.formatDate, window.copyToClipboard);
      break;
    case 'updateCookie':
      window.handleUpdateCookie?.(index);
      break;
    case 'changePassword':
      window.handleChangePassword?.(index);
      break;
  }
}

// Export as default updateTable
export { updateTableUltraFast as updateTable };