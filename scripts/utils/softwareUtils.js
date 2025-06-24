/**
 * Software Utilities
 * Helper functions for working with software data and file types
 */

/**
 * Get file type from software data based on software name, package, and account
 * @param {string} softwareName - Name of the software
 * @param {string} softwarePackage - Package of the software
 * @param {string} accountName - Account name
 * @returns {string|null} File type ('docs', 'sheet', etc.) or null if not found
 */
export function getSoftwareFileType(softwareName, softwarePackage, accountName) {
  if (!window.softwareData || !Array.isArray(window.softwareData)) {
    return null;
  }
  
  // Find matching software entry
  const matchingSoftware = window.softwareData.find(software => {
    const nameMatch = (software.softwareName || '').toLowerCase() === (softwareName || '').toLowerCase();
    const packageMatch = (software.softwarePackage || '').toLowerCase() === (softwarePackage || '').toLowerCase();
    const accountMatch = (software.accountName || '').toLowerCase() === (accountName || '').toLowerCase();
    
    return nameMatch && packageMatch && accountMatch;
  });
  
  return matchingSoftware ? matchingSoftware.fileType : null;
}

/**
 * Determine if Cookie actions should be shown based on file type
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Cookie actions should be shown
 */
export function shouldShowCookieActions(transaction) {
  // Get file type from software data to determine action options
  const fileType = getSoftwareFileType(
    transaction.softwareName,
    transaction.softwarePackage, 
    transaction.accountName
  );
  
  // Only show Cookie if fileType is exactly "docs" (case insensitive)
  return fileType && fileType.toLowerCase() === 'docs';
}

/**
 * Determine if Password Change actions should be shown based on file type
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Password Change actions should be shown
 */
export function shouldShowPasswordActions(transaction) {
  // Get file type from software data to determine action options
  const fileType = getSoftwareFileType(
    transaction.softwareName,
    transaction.softwarePackage, 
    transaction.accountName
  );
  
  // Only show Password Change if fileType is exactly "sheet" (case insensitive)
  return fileType && fileType.toLowerCase() === 'sheet';
}

/**
 * Determine if Check Access actions should be shown
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Check Access actions should be shown
 */
export function shouldShowCheckAccessActions(transaction) {
  // First check if accountSheetId exists
  if (!transaction.accountSheetId || transaction.accountSheetId.trim() === '') {
    return false;
  }
  
  // Get file type from software data
  const fileType = getSoftwareFileType(
    transaction.softwareName,
    transaction.softwarePackage, 
    transaction.accountName
  );
  
  // Show Check Access only if fileType is "docs" or "sheet"
  return fileType && (fileType.toLowerCase() === 'docs' || fileType.toLowerCase() === 'sheet');
}

/**
 * Build action options for transaction table based on file type
 * @param {Object} transaction - Transaction object
 * @returns {string} HTML string of option elements
 */
export function buildTransactionActionOptions(transaction) {
  // Always show basic actions
  let actionOptions = `<option value="">--</option><option value="view">Xem</option><option value="edit">Sửa</option><option value="delete">Xóa</option>`;
  
  // Add Cookie action if fileType is "docs"
  if (shouldShowCookieActions(transaction)) {
    actionOptions += `<option value="updateCookie">Cookie</option>`;
  }
  
  // Add Password Change action if fileType is "sheet"
  if (shouldShowPasswordActions(transaction)) {
    actionOptions += `<option value="changePassword">Đổi MK</option>`;
  }
  
  // Add Check Access action if conditions are met
  if (shouldShowCheckAccessActions(transaction)) {
    actionOptions += `<option value="checkAccess">Kiểm tra quyền</option>`;
  }
  
  return actionOptions;
}

/**
 * Build action array for transaction table (used in updateTable.js)
 * @param {Object} transaction - Transaction object
 * @returns {Array} Array of action objects with value and label
 */
export function buildTransactionActionArray(transaction) {
  // Always show basic actions
  const actions = [
    { value: "", label: "-- Chọn --" },
    { value: "view", label: "Xem" },
    { value: "edit", label: "Sửa" },
    { value: "delete", label: "Xóa" }
  ];
  
  // Add Cookie action if fileType is "docs"
  if (shouldShowCookieActions(transaction)) {
    actions.push({ value: "updateCookie", label: "Cookie" });
  }
  
  // Add Password Change action if fileType is "sheet"
  if (shouldShowPasswordActions(transaction)) {
    actions.push({ value: "changePassword", label: "Đổi MK" });
  }
  
  // Add Check Access action if conditions are met
  if (shouldShowCheckAccessActions(transaction)) {
    actions.push({ value: "checkAccess", label: "Kiểm tra quyền" });
  }
  
  return actions;
}

// Make functions available globally for backward compatibility
window.getSoftwareFileType = getSoftwareFileType;
window.shouldShowCookieActions = shouldShowCookieActions;
window.shouldShowPasswordActions = shouldShowPasswordActions;
window.shouldShowCheckAccessActions = shouldShowCheckAccessActions;
window.buildTransactionActionOptions = buildTransactionActionOptions;
window.buildTransactionActionArray = buildTransactionActionArray;