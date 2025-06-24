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
 * Determine if Cookie actions should be shown based on file type or fallback logic
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Cookie actions should be shown, false for password change actions
 */
export function shouldShowCookieActions(transaction) {
  // Get file type from software data to determine action options
  const fileType = getSoftwareFileType(
    transaction.softwareName,
    transaction.softwarePackage, 
    transaction.accountName
  );
  
  // Determine action options based on file type from sheet PhanMem
  // - "docs" -> show Cookie + Kiểm tra quyền
  // - "sheet" -> show Đổi MK + Kiểm tra quyền
  // - fallback to old logic if fileType not found
  if (fileType) {
    return fileType.toLowerCase() === 'docs';
  } else {
    // Fallback to old hardcoded logic if fileType not available
    const software = (transaction.softwareName || '').toLowerCase();
    const softwarePackage = (transaction.softwarePackage || '').trim().toLowerCase();
    return (
      software === "helium10 diamon".toLowerCase() ||
      software === "helium10 platinum".toLowerCase() ||
      (software === "netflix" && softwarePackage === "share")
    );
  }
}

/**
 * Build action options for transaction table based on file type
 * @param {Object} transaction - Transaction object
 * @returns {string} HTML string of option elements
 */
export function buildTransactionActionOptions(transaction) {
  let actionOptions = `<option value="">--</option><option value="view">Xem</option><option value="edit">Sửa</option><option value="delete">Xóa</option>`;
  
  const showCookie = shouldShowCookieActions(transaction);
  
  if (showCookie) {
    actionOptions += `<option value="updateCookie">Cookie</option>`;
  } else {
    actionOptions += `<option value="changePassword">Đổi MK</option>`;
  }
  
  // Add check access option if accountSheetId exists
  if (transaction.accountSheetId && transaction.accountSheetId.trim() !== '') {
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
  const actions = [
    { value: "", label: "-- Chọn --" },
    { value: "view", label: "Xem" },
    { value: "edit", label: "Sửa" },
    { value: "delete", label: "Xóa" }
  ];
  
  const showCookie = shouldShowCookieActions(transaction);
  
  if (showCookie) {
    actions.push({ value: "updateCookie", label: "Cookie" });
  } else {
    actions.push({ value: "changePassword", label: "Đổi MK" });
  }
  
  // Add "Check access" option if transaction has accountSheetId
  if (transaction.accountSheetId && transaction.accountSheetId.trim() !== '') {
    actions.push({ value: "checkAccess", label: "Kiểm tra quyền" });
  }
  
  return actions;
}

// Make functions available globally for backward compatibility
window.getSoftwareFileType = getSoftwareFileType;
window.shouldShowCookieActions = shouldShowCookieActions;
window.buildTransactionActionOptions = buildTransactionActionOptions;
window.buildTransactionActionArray = buildTransactionActionArray;