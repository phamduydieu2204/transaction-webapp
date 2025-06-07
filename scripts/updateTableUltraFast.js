import { updatePagination } from './pagination.js';
import { batchWrite } from './core/domOptimizer.js';

/**
 * Ultra-fast table update - only renders first page immediately
 */
export function updateTableUltraFast(transactionList, currentPage, itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  const tableBody = document.querySelector("#transactionTable tbody");
  if (!tableBody) return;


  // For ultra-fast loading, limit initial render to 25 rows max
  const FAST_LIMIT = 25;
  const actualItemsPerPage = Math.min(itemsPerPage, FAST_LIMIT);
  
  const totalPages = Math.ceil(transactionList.length / actualItemsPerPage);
  const startIndex = (currentPage - 1) * actualItemsPerPage;
  const endIndex = startIndex + actualItemsPerPage;
  
  // Only process visible items
  const paginatedItems = transactionList.slice(startIndex, endIndex);
  

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
    // For search results, use the local index in the search results
    // For normal view, use globalIndex for pagination
    const dataIndex = window.isSearching ? index : startIndex + index;
    
    
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

    // Build action options
    let actionOptions = `<option value="">--</option><option value="view">Xem</option><option value="edit">Sửa</option><option value="delete">Xóa</option>`;
    
    if (shouldShowCookie) {
      actionOptions += `<option value="updateCookie">Cookie</option>`;
    } else {
      actionOptions += `<option value="changePassword">Đổi MK</option>`;
    }
    
    // Add check access option if accountSheetId exists
    if (transaction.accountSheetId && transaction.accountSheetId.trim() !== '') {
      actionOptions += `<option value="checkAccess">Kiểm tra quyền</option>`;
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

    // Create customer info cell with name and email
    const customerInfoCell = `
      <div class="customer-info-cell">
        <div class="customer-name"><strong>${transaction.customerName}</strong></div>
        <div class="customer-email">${transaction.customerEmail}</div>
      </div>
    `;

    return `
      <tr class="${isExpired ? 'expired-row' : ''}" data-index="${dataIndex}">
        <td>${transaction.transactionId}</td>
        <td>${formatDate(transaction.transactionDate)}</td>
        <td>${transaction.transactionType}</td>
        <td>${customerInfoCell}</td>
        <td>${usageCycleCell}</td>
        <td>${transaction.deviceCount}</td>
        <td>${softwareInfo}</td>
        <td>${transaction.revenue}</td>
        <td>${transaction.note || ""}</td>
        <td>${infoCell}</td>
        <td>
          <select class="action-select" data-index="${dataIndex}">
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
          
          // Use current active list
          const currentList = window.isSearching ? window.transactionList : transactionList;
          
          if (action && index >= 0) {
            handleTableAction(action, index, currentList);
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
    }, 100);
  }
}

/**
 * Handle table actions efficiently
 */
function handleTableAction(action, index, transactionList) {
  
  // Get the actual transaction object
  const transaction = transactionList[index];
  
  if (!transaction) {
    return;
  }
  
  switch(action) {
    case 'edit':
      // For edit, pass the correct list and index
      if (window.isSearching) {
        // When searching, pass the search results list and the index within that list
        window.editTransaction?.(index, transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
      } else {
        // Normal view, pass global list and index
        window.editTransaction?.(index, window.transactionList, window.fetchSoftwareList, window.updatePackageList, window.updateAccountList);
      }
      break;
    case 'delete':
      // For delete, we need to find the index in the global list
      if (window.isSearching && window.transactionList) {
        const globalIndex = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        if (globalIndex !== -1) {
          window.deleteTransaction?.(globalIndex);
        }
      } else {
        window.deleteTransaction?.(index);
      }
      break;
    case 'view':
      // Pass the transaction object directly, not the index
      window.viewTransaction?.(transaction, null, window.formatDate, window.copyToClipboard);
      break;
    case 'updateCookie':
      // For cookie update, find global index if searching
      if (window.isSearching && window.transactionList) {
        const globalIndex = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        if (globalIndex !== -1) {
          window.handleUpdateCookie?.(globalIndex, window.transactionList);
        }
      } else {
        window.handleUpdateCookie?.(index, transactionList);
      }
      break;
    case 'changePassword':
      // For password change, find global index if searching
      if (window.isSearching && window.transactionList) {
        const globalIndex = window.transactionList.findIndex(t => t.transactionId === transaction.transactionId);
        if (globalIndex !== -1) {
          window.handleChangePassword?.(globalIndex, window.transactionList);
        }
      } else {
        window.handleChangePassword?.(index, transactionList);
      }
      break;
    case 'checkAccess':
      if (window.checkSheetAccess) {
        window.checkSheetAccess(transaction);
      }
      break;
  }
}

// Export as default updateTable
export { updateTableUltraFast as updateTable };