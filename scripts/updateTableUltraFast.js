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

  // Get background color based on transaction type
  const getTransactionRowColor = (transactionType, transactionId) => {
    // Normalize the transaction type (remove invisible chars, trim, replace spaces, lowercase)
    const normalizedType = (transactionType || "")
      .replace(/[\u200B-\u200F\u2028-\u202F\u205F-\u206F\uFEFF]/g, '') // Remove invisible chars
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .toLowerCase();
    
    // Debug specific transaction with detailed character analysis
    if (transactionId === 'GD2506241556') {
      console.log('🔍 DEEP DEBUG GD2506241556:', {
        rawType: transactionType,
        rawTypeLength: transactionType.length,
        rawCharCodes: [...transactionType].map(char => ({ char, code: char.charCodeAt(0) })),
        normalizedType: normalizedType,
        normalizedLength: normalizedType.length,
        normalizedCharCodes: [...normalizedType].map(char => ({ char, code: char.charCodeAt(0) })),
        expectedMatch: normalizedType === "đã hoàn tất",
        exactBytes: new TextEncoder().encode(transactionType),
        hasInvisibleChars: /[\u200B-\u200F\u2028-\u202F\u205F-\u206F\uFEFF]/.test(transactionType)
      });
    }
    
    switch (normalizedType) {
      case "chưa thanh toán":
        return "#FFF8DC"; // Light beige
      case "đã thanh toán":
        return "#E0F7FA"; // Light cyan
      case "hoàn tiền":
        if (transactionId === 'GD2506241556') {
          console.log('❌ GD2506241556 WRONGLY matched HOÀN TIỀN!');
        }
        return "#FFEBEE"; // Light red
      case "hủy giao dịch":
        return "#F5F5F5"; // Light gray
      case "đã hoàn tất":
        if (transactionId === 'GD2506241556') {
          console.log('✅ GD2506241556 correctly matched ĐÃ HOÀN TẤT');
        }
        return ""; // Keep default/current color
      default:
        if (transactionId === 'GD2506241556') {
          console.log('❓ GD2506241556 fell to DEFAULT case, normalized:', normalizedType);
        }
        return ""; // Keep default/current color
    }
  };

  // ✅ Build minimal HTML for visible rows only
  const rowsHtml = paginatedItems.map((transaction, index) => {
    // For search results, use the local index in the search results
    // For normal view, use globalIndex for pagination
    // Always find the actual index in the global list to handle sorting changes and new transactions
    const globalList = window.transactionList || transactionList;
    const actualIndex = globalList.findIndex(t => t.transactionId === transaction.transactionId);
    const dataIndex = actualIndex !== -1 ? actualIndex : (window.isSearching ? index : startIndex + index);
    
    // Debug log cho giao dịch hoàn tiền
    if (transaction.transactionType === "Hoàn tiền" || transaction.transactionType === "Hoàn Tiền") {
      console.log(`🔍 DEBUG Hoàn tiền - ID: ${transaction.transactionId}`);
      console.log(`   - index trong page: ${index}`);
      console.log(`   - startIndex: ${startIndex}`);
      console.log(`   - actualIndex tìm được: ${actualIndex}`);
      console.log(`   - dataIndex sẽ dùng: ${dataIndex}`);
      console.log(`   - transactionList.length: ${transactionList.length}`);
    }
    
    
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

    // Info cell with 3-line layout: employee code (right), contact, order info
    const infoCell = `
      <div class="info-cell-container" style="position: relative; line-height: 1.2;">
        <!-- Line 1: Employee Code (right aligned) -->
        <div class="employee-line" style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: 2px; white-space: nowrap; overflow: hidden;">
          <span class="employee-badge" style="font-size: 10px; color: ${employeeColor.textColor}; font-weight: bold; background: ${employeeColor.bg}; padding: 1px 4px; border-radius: 3px; border: 1px solid ${employeeColor.border}; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">${employeeCode}</span>
        </div>
        
        <!-- Line 2: Contact Info -->
        <div class="contact-info-line" style="display: flex; align-items: center; margin-bottom: 2px; white-space: nowrap; overflow: hidden;">
          <span style="margin-right: 4px; font-size: 12px;">${contactIcon}</span>
          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; font-size: 12px;">${contactDisplay}</span>
          <button class="copy-btn" data-content="${contactInfo.replace(/"/g, '&quot;')}" title="Sao chép thông tin liên hệ" style="margin-left: 4px; padding: 2px; font-size: 12px; border: 1px solid #ccc; background: #f8f9fa; cursor: pointer; border-radius: 3px;">📄</button>
        </div>
        
        <!-- Line 3: Order Info -->
        <div class="order-info-line" style="display: flex; align-items: center; white-space: nowrap; overflow: hidden;">
          <span style="margin-right: 4px; font-size: 12px;">📦</span>
          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; font-size: 12px;">Thông tin đơn hàng</span>
          <button class="copy-btn" data-content="${(transaction.orderInfo || "").replace(/"/g, '&quot;')}" title="Sao chép thông tin đơn hàng" style="margin-left: 4px; padding: 2px; font-size: 12px; border: 1px solid #ccc; background: #f8f9fa; cursor: pointer; border-radius: 3px;">📄</button>
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
        <div class="customer-name" style="display: flex; align-items: center; margin-bottom: 2px;">
          <span style="display: inline-block; width: 16px; text-align: center; margin-right: 4px; font-size: 12px;">👤</span>
          <strong style="flex: 1;">${transaction.customerName}</strong>
        </div>
        <div class="customer-email" style="display: flex; align-items: center;">
          <button class="copy-btn" data-content="${(transaction.customerEmail || "").replace(/"/g, '&quot;')}" title="Sao chép email khách hàng" style="display: inline-block; width: 16px; text-align: center; margin-right: 4px; padding: 2px; font-size: 12px; border: 1px solid #ccc; background: #f8f9fa; cursor: pointer; border-radius: 3px;">📄</button>
          <span style="flex: 1;">${transaction.customerEmail}</span>
        </div>
      </div>
    `;

    // Create transaction ID cell with copy order button
    const transactionIdCell = `
      <div class="transaction-id-cell">
        <div style="font-weight: bold; margin-bottom: 4px;">${transaction.transactionId}</div>
        <button class="copy-order-btn" data-transaction='${JSON.stringify(transaction).replace(/'/g, "&apos;")}' title="Copy thông tin đơn hàng" style="display: flex; align-items: center; padding: 4px 8px; font-size: 14px; border: 1px solid #007bff; background: #e7f3ff; color: #007bff; cursor: pointer; border-radius: 3px; white-space: nowrap;">
          📋
        </button>
      </div>
    `;

    return `
      <tr class="${isExpired ? 'expired-row' : ''}" data-index="${dataIndex}">
        <td>${transactionIdCell}</td>
        <td>${formatDate(transaction.transactionDate)}</td>
        <td>${transaction.transactionType}</td>
        <td>${customerInfoCell}</td>
        <td>${usageCycleCell}</td>
        <td>${transaction.deviceCount}</td>
        <td>${softwareInfo}</td>
        <td>${transaction.revenue}</td>
        <td>${(transaction.note || "").replace(/\n/g, "<br>")}</td>
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
    
    // Apply background colors to rows after they're in the DOM
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
      if (index < paginatedItems.length) {
        const transaction = paginatedItems[index];
        const rowBackgroundColor = getTransactionRowColor(transaction.transactionType, transaction.transactionId);
        
        // Apply background colors based on transaction type
        if (rowBackgroundColor) {
          row.style.backgroundColor = rowBackgroundColor;
          row.style.setProperty('background-color', rowBackgroundColor, 'important');
        }
      }
    });
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
          
          console.log(`📌 Action select changed - action: ${action}, data-index: ${index}`);
          console.log(`   - window.isSearching: ${window.isSearching}`);
          
          // Always use the global window.transactionList which is updated after refund
          const currentList = window.transactionList || transactionList;
          console.log(`   - Using list with length: ${currentList.length}`);
          console.log(`   - window.transactionList.length: ${window.transactionList ? window.transactionList.length : 'undefined'}`);
          console.log(`   - transactionList (closure).length: ${transactionList.length}`);
          
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
        
        // Handle copy order button clicks
        if (e.target.matches('.copy-order-btn') || e.target.closest('.copy-order-btn')) {
          const button = e.target.matches('.copy-order-btn') ? e.target : e.target.closest('.copy-order-btn');
          const transactionData = button.dataset.transaction;
          
          if (transactionData) {
            try {
              const transaction = JSON.parse(transactionData.replace(/&apos;/g, "'"));
              copyOrderInfo(transaction, button);
            } catch (error) {
              console.error('Error parsing transaction data:', error);
            }
          }
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
 * Copy order information to clipboard
 */
function copyOrderInfo(transaction, button) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Không có';
    // Convert YYYY/MM/DD to DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' VNĐ';
  };

  const orderInfo = `👤 Tên khách hàng: ${transaction.customerName || 'Không có'}
📧 Email: ${transaction.customerEmail || 'Không có'}
🔧 Dịch vụ: ${transaction.softwareName || ''} - ${transaction.softwarePackage || ''} - ${transaction.accountName || ''}
📅 Số tháng: ${transaction.duration || 0} tháng
🗓️ Chu kỳ: ${formatDate(transaction.startDate)} - ${formatDate(transaction.endDate)}
💰 Doanh thu: ${formatCurrency(transaction.revenue)}
📞 Liên hệ: ${transaction.customerPhone || 'Không có'}
📝 Ghi chú: ${transaction.note || 'Không có'}
🆔 Mã giao dịch: ${transaction.transactionId || 'Không có'}`;

  // Copy to clipboard
  navigator.clipboard.writeText(orderInfo).then(() => {
    // Show success feedback
    const originalContent = button.innerHTML;
    button.innerHTML = '<span style="margin-right: 2px;">✅</span><span>Đã copy!</span>';
    button.style.background = '#d4edda';
    button.style.color = '#155724';
    button.style.borderColor = '#c3e6cb';
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.background = '#e7f3ff';
      button.style.color = '#007bff';
      button.style.borderColor = '#007bff';
    }, 2000);
  }).catch((err) => {
    console.error('Failed to copy order info:', err);
    
    // Show error feedback
    const originalContent = button.innerHTML;
    button.innerHTML = '<span style="margin-right: 2px;">❌</span><span>Lỗi copy!</span>';
    button.style.background = '#f8d7da';
    button.style.color = '#721c24';
    button.style.borderColor = '#f5c6cb';
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.background = '#e7f3ff';
      button.style.color = '#007bff';
      button.style.borderColor = '#007bff';
    }, 2000);
  });
}

/**
 * Handle table actions efficiently
 */
function handleTableAction(action, index, transactionList) {
  console.log(`🎯 handleTableAction called - action: ${action}, index: ${index}`);
  console.log(`   - transactionList.length: ${transactionList.length}`);
  
  // Get the actual transaction object
  const transaction = transactionList[index];
  
  if (!transaction) {
    console.error(`❌ Không tìm thấy transaction tại index ${index}`);
    return;
  }
  
  console.log(`   - Transaction found: ${transaction.transactionId} - ${transaction.transactionType}`);
  if (transaction.transactionType === "Hoàn tiền" || transaction.transactionType === "Hoàn Tiền") {
    console.log(`   🔍 Đây là giao dịch hoàn tiền!`);
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