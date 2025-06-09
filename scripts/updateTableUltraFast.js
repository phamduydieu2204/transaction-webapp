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
    // Process contact info with proper icons and formatting
    const contactInfo = transaction.customerPhone || "";
    const isContactLink = isLink(contactInfo);
    
    let contactIcon = '📞'; // Default phone icon
    let contactDisplay = contactInfo;
    let truncatedContactDisplay = contactInfo;
    
    // Truncate contact info to 15 characters for display
    if (contactInfo.length > 15) {
      truncatedContactDisplay = contactInfo.substring(0, 15) + '...';
    }
    
    if (isContactLink) {
      if (contactInfo.includes('mailto:')) {
        contactIcon = '📧';
        const emailContent = contactInfo.replace('mailto:', '');
        const truncatedEmail = emailContent.length > 15 ? emailContent.substring(0, 15) + '...' : emailContent;
        contactDisplay = `<a href="${contactInfo}" target="_blank" style="color: inherit; text-decoration: underline;" title="${emailContent}">${truncatedEmail}</a>`;
      } else if (contactInfo.includes('tel:')) {
        contactIcon = '📞';
        const telContent = contactInfo.replace('tel:', '');
        const truncatedTel = telContent.length > 15 ? telContent.substring(0, 15) + '...' : telContent;
        contactDisplay = `<a href="${contactInfo}" target="_blank" style="color: inherit; text-decoration: underline;" title="${telContent}">${truncatedTel}</a>`;
      } else {
        contactIcon = '🔗';
        contactDisplay = `<a href="${contactInfo}" target="_blank" style="color: inherit; text-decoration: underline;" title="${contactInfo}">${truncatedContactDisplay}</a>`;
      }
    } else if (contactInfo.includes('@')) {
      contactIcon = '📧';
      contactDisplay = `<span title="${contactInfo}">${truncatedContactDisplay}</span>`;
    } else if (contactInfo.match(/^\+?[\d\s\-\(\)]+$/)) {
      contactIcon = '📞';
      contactDisplay = `<span title="${contactInfo}">${truncatedContactDisplay}</span>`;
    } else {
      contactIcon = '👤';
      contactDisplay = `<span title="${contactInfo}">${truncatedContactDisplay}</span>`;
    }

    // Get employee code from various possible fields
    const employeeCode = transaction.maNhanVien || 
                        transaction.employeeCode || 
                        transaction.staffCode || 
                        transaction.user || 
                        transaction.creator || 
                        'ADMIN';

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

    // Debug employee code for first transaction
    if (index === 0) {
      console.log('🔍 [UltraFast] First transaction employee data:', {
        maNhanVien: transaction.maNhanVien,
        tenNhanVien: transaction.tenNhanVien,
        employeeCode: employeeCode,
        color: employeeColor,
        allKeys: Object.keys(transaction)
      });
      console.log('🔍 [UltraFast] Employee code determined:', employeeCode);
    }

    // Info cell with employee badge and improved layout
    const infoCell = `
      <div class="info-cell-container" style="position: relative; line-height: 1.2;">
        <span class="employee-badge" style="position: absolute; top: 0; right: 0; font-size: 11px; color: ${employeeColor.textColor}; font-weight: bold; background: ${employeeColor.bg}; padding: 2px 6px; border-radius: 0 0 0 4px; z-index: 10; border: 1px solid ${employeeColor.border}; box-shadow: 0 1px 2px rgba(0,0,0,0.2); display: block !important;">${employeeCode}</span>
        
        <div class="info-cell-content" style="position: relative; z-index: 1; padding-right: 50px;">
          <!-- Contact Info Line -->
          <div class="contact-info-line" style="display: flex; align-items: center; margin-bottom: 3px; white-space: nowrap; overflow: hidden;">
            <span style="margin-right: 4px; font-size: 12px;">${contactIcon}</span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; font-size: 12px;">${contactDisplay}</span>
            <button class="copy-btn" data-content="${contactInfo.replace(/"/g, '&quot;')}" title="Sao chép thông tin liên hệ" style="margin-left: 4px; padding: 1px 3px; font-size: 10px; border: none; background: none; cursor: pointer;">📋</button>
          </div>
          
          <!-- Order Info Line -->
          <div class="order-info-line" style="display: flex; align-items: center; white-space: nowrap; overflow: hidden;">
            <span style="margin-right: 4px; font-size: 12px;">📦</span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; font-size: 12px;">Thông tin đơn hàng</span>
            <button class="copy-btn" data-content="${(transaction.orderInfo || "").replace(/"/g, '&quot;')}" title="Sao chép thông tin đơn hàng" style="margin-left: 4px; padding: 1px 3px; font-size: 10px; border: none; background: none; cursor: pointer;">📋</button>
          </div>
        </div>
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