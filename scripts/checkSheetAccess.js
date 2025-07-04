import { getConstants } from './constants.js';
import { showProcessingModal } from './showProcessingModal.js';
import { closeProcessingModal } from './closeProcessingModal.js';
import { showResultModal } from './showResultModal.js';

/**
 * Check sheet access for emails in a transaction
 */
export async function checkSheetAccess(transaction) {
  if (!transaction.accountSheetId || !transaction.accountSheetId.trim()) {
    showResultModal("Giao dịch này không có ID Sheet Tài khoản", false);
    return;
  }

  // Show modal
  const modal = document.getElementById('accessCheckModal');
  if (!modal) {
    console.error('Access check modal not found');
    return;
  }

  // Reset modal state
  document.getElementById('accessCheckLoading').style.display = 'block';
  document.getElementById('accessCheckResults').style.display = 'none';
  document.getElementById('accessCheckError').style.display = 'none';
  modal.style.display = 'flex';

  // Display sheet ID
  document.getElementById('sheetIdDisplay').textContent = transaction.accountSheetId;

  try {
    const { BACKEND_URL } = getConstants();
    
    // Extract emails from transaction (could be in customerEmail field)
    const emails = extractEmails(transaction.customerEmail);
    
    if (emails.length === 0) {
      throw new Error("Không tìm thấy email để kiểm tra");
    }

    // Call backend to check access
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "checkSheetAccess",
        sheetId: transaction.accountSheetId,
        emails: emails
      })
    });

    const result = await response.json();
    
    if (result.status === "success") {
      displayAccessResults(result.data, transaction.accountSheetId);
    } else {
      throw new Error(result.message || "Không thể kiểm tra quyền truy cập");
    }
    
  } catch (error) {
    console.error("Error checking sheet access:", error);
    document.getElementById('accessCheckLoading').style.display = 'none';
    document.getElementById('accessCheckError').style.display = 'block';
    document.querySelector('#accessCheckError .error-message').textContent = 
      `Lỗi: ${error.message}`;
  }
}

/**
 * Extract emails from string (comma-separated)
 */
function extractEmails(emailString) {
  if (!emailString) return [];
  
  // Split by comma and clean up
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email && email.includes('@'));
}

/**
 * Display access check results in table
 */
function displayAccessResults(accessData, sheetId) {
  document.getElementById('accessCheckLoading').style.display = 'none';
  document.getElementById('accessCheckResults').style.display = 'block';
  
  const tbody = document.querySelector('#accessCheckTable tbody');
  tbody.innerHTML = '';
  
  accessData.forEach(item => {
    const row = document.createElement('tr');
    
    // Email column
    const emailCell = document.createElement('td');
    emailCell.textContent = item.email;
    row.appendChild(emailCell);
    
    // Permission column
    const permissionCell = document.createElement('td');
    const badge = createPermissionBadge(item.permission);
    permissionCell.appendChild(badge);
    row.appendChild(permissionCell);
    
    // Action column
    const actionCell = document.createElement('td');
    const actionButton = createActionButton(item.email, item.permission, sheetId);
    actionCell.appendChild(actionButton);
    row.appendChild(actionCell);
    
    tbody.appendChild(row);
  });
}

/**
 * Create permission badge
 */
function createPermissionBadge(permission) {
  const badge = document.createElement('span');
  badge.className = 'access-badge';
  
  switch(permission) {
    case 'owner':
      badge.textContent = 'Chủ sở hữu';
      badge.classList.add('access-owner');
      break;
    case 'writer':
    case 'editor':
      badge.textContent = 'Quyền chỉnh sửa';
      badge.classList.add('access-editor');
      break;
    case 'reader':
    case 'viewer':
      badge.textContent = 'Quyền xem';
      badge.classList.add('access-viewer');
      break;
    default:
      badge.textContent = 'Không có quyền';
      badge.classList.add('access-none');
  }
  
  return badge;
}

/**
 * Create action button (grant/revoke)
 */
function createActionButton(email, permission, sheetId) {
  const button = document.createElement('button');
  
  if (permission === 'none' || !permission) {
    // Grant access button
    button.className = 'btn-grant';
    button.textContent = 'Cấp quyền ngay';
    button.onclick = () => grantAccess(email, sheetId, button);
  } else if (permission !== 'owner') {
    // Revoke access button
    button.className = 'btn-revoke';
    button.textContent = 'Hủy quyền truy cập';
    button.onclick = () => revokeAccess(email, sheetId, button);
  } else {
    // Owner - no action
    button.className = 'btn-grant';
    button.textContent = 'Chủ sở hữu';
    button.disabled = true;
  }
  
  return button;
}

/**
 * Grant access to sheet
 */
async function grantAccess(email, sheetId, button) {
  button.disabled = true;
  button.textContent = 'Đang cấp quyền...';
  
  try {
    const { BACKEND_URL } = getConstants();
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "grantSheetAccess",
        sheetId: sheetId,
        email: email,
        role: "viewer" // Default to viewer permission
      })
    });

    const result = await response.json();
    
    if (result.status === "success") {
      // Update UI
      button.className = 'btn-revoke';
      button.textContent = 'Hủy quyền truy cập';
      button.onclick = () => revokeAccess(email, sheetId, button);
      button.disabled = false;
      
      // Update permission badge
      const row = button.closest('tr');
      const permissionCell = row.cells[1];
      permissionCell.innerHTML = '';
      permissionCell.appendChild(createPermissionBadge('viewer'));
      
      showResultModal(`Đã cấp quyền xem cho ${email}`, true);
    } else {
      throw new Error(result.message || "Không thể cấp quyền");
    }
    
  } catch (error) {
    console.error("Error granting access:", error);
    button.textContent = 'Cấp quyền ngay';
    button.disabled = false;
    showResultModal(`Lỗi: ${error.message}`, false);
  }
}

/**
 * Revoke access from sheet
 */
async function revokeAccess(email, sheetId, button) {
  button.disabled = true;
  button.textContent = 'Đang hủy quyền...';
  
  try {
    const { BACKEND_URL } = getConstants();
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "revokeSheetAccess",
        sheetId: sheetId,
        email: email
      })
    });

    const result = await response.json();
    
    if (result.status === "success") {
      // Update UI
      button.className = 'btn-grant';
      button.textContent = 'Cấp quyền ngay';
      button.onclick = () => grantAccess(email, sheetId, button);
      button.disabled = false;
      
      // Update permission badge
      const row = button.closest('tr');
      const permissionCell = row.cells[1];
      permissionCell.innerHTML = '';
      permissionCell.appendChild(createPermissionBadge('none'));
      
      showResultModal(`Đã hủy quyền truy cập của ${email}`, true);
    } else {
      throw new Error(result.message || "Không thể hủy quyền");
    }
    
  } catch (error) {
    console.error("Error revoking access:", error);
    button.textContent = 'Hủy quyền truy cập';
    button.disabled = false;
    showResultModal(`Lỗi: ${error.message}`, false);
  }
}

/**
 * Close access check modal
 */
window.closeAccessCheckModal = function() {
  const modal = document.getElementById('accessCheckModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Copy sheet ID to clipboard
 */
window.copySheetId = function() {
  const sheetId = document.getElementById('sheetIdDisplay').textContent;
  navigator.clipboard.writeText(sheetId).then(() => {
    showResultModal("Đã sao chép ID Sheet", true);
  });
}

// Make function available globally
window.checkSheetAccess = checkSheetAccess;