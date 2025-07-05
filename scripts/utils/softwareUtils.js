/**
 * Software Utilities
 * Helper functions for working with software data and file types
 */

/**
 * Temporary file type mapping based on standardName (Tên chuẩn)
 * This is a fallback until backend provides proper fileType from column Q
 * @param {string} standardName - Standard name of the software (Tên chuẩn)
 * @returns {string|null} File type or null
 */
function getTempFileTypeMappingByStandardName(standardName) {
  const name = (standardName || '').toLowerCase();
  
  // Based on common software patterns - this should be replaced with actual data from backend
  
  // Google-based services that typically use Docs
  if (name.includes('google') || name.includes('drive') || name.includes('docs')) {
    return 'docs';
  }
  
  // Services that typically use Sheets
  if (name.includes('sheet') || name.includes('excel') || name.includes('airtable')) {
    return 'sheet';
  }
  
  // Helium10 - based on existing business logic, appears to be docs-based
  if (name.includes('helium10') || name.includes('helium 10')) {
    return 'docs';
  }
  
  // Netflix - based on existing logic, share accounts use docs
  if (name.includes('netflix')) {
    return 'docs';
  }
  
  // ChatGPT and AI services - typically docs
  if (name.includes('chatgpt') || name.includes('openai') || name.includes('gpt')) {
    return 'docs';
  }
  
  // Office 365, OneDrive - typically docs
  if (name.includes('office') || name.includes('onedrive') || name.includes('365')) {
    return 'docs';
  }
  
  // CapCut and video editing - typically docs
  if (name.includes('capcut') || name.includes('video')) {
    return 'docs';
  }
  
  // For now, return null for unknown software
  // This means only basic actions (view, edit, delete) will be shown
  return null;
}

/**
 * Get file type from transaction data (column W: "Loại tệp")
 * @param {Object} transaction - Transaction object
 * @returns {string|null} File type ('docs', 'sheet', etc.) or null if not found
 */
export function getTransactionFileType(transaction) {
  // Get fileType directly from transaction (column W: "Loại tệp")
  const directFileType = transaction.fileType || 
                         transaction.loaiTep || 
                         transaction['Loại tệp'] || 
                         transaction.type;
  
  if (directFileType && directFileType.trim() !== '') {
    return directFileType.toLowerCase().trim();
  }
  
  return null;
}

/**
 * Get file type from software data based on standardName (Tên chuẩn) - FALLBACK METHOD
 * @param {string} standardName - Standard name from transaction
 * @returns {string|null} File type or null if not found
 */
function getSoftwareFileTypeByStandardName(standardName) {
  if (!window.softwareData || !Array.isArray(window.softwareData)) {
    console.warn('❌ softwareData not available or not an array');
    return null;
  }
  
  console.log('🔍 Fallback: Looking for software match by standardName:', standardName);
  
  // Find matching software entry by standardName
  const matchingSoftware = window.softwareData.find(software => {
    const softwareStandardName = software.standardName || 
                                  software.tenChuan || 
                                  software['Tên chuẩn'] || 
                                  software.softwareName || 
                                  '';
    
    return softwareStandardName.toLowerCase() === standardName.toLowerCase();
  });
  
  if (!matchingSoftware) {
    // Final fallback: use temporary mapping
    console.warn('⚠️ No software match, using temporary mapping for:', standardName);
    return getTempFileTypeMappingByStandardName(standardName);
  }
  
  // Try to get fileType from software data
  const fileType = matchingSoftware.fileType || 
                   matchingSoftware.loaiTep || 
                   matchingSoftware['loại tệp'] || 
                   matchingSoftware.FileType ||
                   matchingSoftware['Loại tệp'] ||
                   matchingSoftware.file_type ||
                   matchingSoftware.type;
  
  if (fileType && fileType.trim() !== '') {
    return fileType.toLowerCase().trim();
  }
  
  // Final fallback: temporary mapping
  console.warn('⚠️ No fileType in software data, using temporary mapping for:', standardName);
  return getTempFileTypeMappingByStandardName(standardName);
}

/**
 * Determine if Cookie actions should be shown based on file type from column W
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Cookie actions should be shown
 */
export function shouldShowCookieActions(transaction) {
  // Get file type directly from transaction (column W: "Loại tệp")
  const fileType = getTransactionFileType(transaction);
  
  // Only show Cookie if fileType is exactly "docs" (case insensitive)
  return fileType && fileType.toLowerCase() === 'docs';
}

/**
 * Determine if Password Change actions should be shown based on file type from column W
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Password Change actions should be shown
 */
export function shouldShowPasswordActions(transaction) {
  // Get file type directly from transaction (column W: "Loại tệp")
  const fileType = getTransactionFileType(transaction);
  
  // Only show Password Change if fileType is exactly "sheet" (case insensitive)
  return fileType && fileType.toLowerCase() === 'sheet';
}

/**
 * Determine if Check Access actions should be shown based on file type from column W
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Check Access actions should be shown
 */
export function shouldShowCheckAccessActions(transaction) {
  // First check if accountSheetId exists
  if (!transaction.accountSheetId || transaction.accountSheetId.trim() === '') {
    return false;
  }
  
  // Get file type directly from transaction (column W: "Loại tệp")
  const fileType = getTransactionFileType(transaction);
  
  // Show Check Access only if fileType is "docs" or "sheet"
  return fileType && (fileType.toLowerCase() === 'docs' || fileType.toLowerCase() === 'sheet');
}

/**
 * Build action options for transaction table based on file type from column W
 * @param {Object} transaction - Transaction object
 * @returns {string} HTML string of option elements
 */
export function buildTransactionActionOptions(transaction) {
  // Always show basic actions
  let actionOptions = `<option value="">--</option><option value="view">Xem</option><option value="edit">Sửa</option><option value="delete">Xóa</option>`;
  
  // Get file type from column W
  const fileType = getTransactionFileType(transaction);
  
  if (fileType) {
    const fileTypeLower = fileType.toLowerCase();
    
    // Add specific actions based on file type
    if (fileTypeLower === 'docs') {
      actionOptions += `<option value="updateCookie">Xem Cookie</option>`;
      actionOptions += `<option value="checkAccess">Kiểm tra quyền</option>`;
    } else if (fileTypeLower === 'sheet') {
      actionOptions += `<option value="changePassword">Đổi mật khẩu</option>`;
      actionOptions += `<option value="checkAccess">Kiểm tra quyền</option>`;
    }
  }
  
  return actionOptions;
}

/**
 * Build action array for transaction table based on file type from column W
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
  
  // Get file type from column W
  const fileType = getTransactionFileType(transaction);
  
  if (fileType) {
    const fileTypeLower = fileType.toLowerCase();
    
    // Add specific actions based on file type
    if (fileTypeLower === 'docs') {
      actions.push({ value: "updateCookie", label: "Xem Cookie" });
      actions.push({ value: "checkAccess", label: "Kiểm tra quyền" });
    } else if (fileTypeLower === 'sheet') {
      actions.push({ value: "changePassword", label: "Đổi mật khẩu" });
      actions.push({ value: "checkAccess", label: "Kiểm tra quyền" });
    }
  }
  
  return actions;
}

// Debug function to check software data
export function debugSoftwareData() {
  if (!window.softwareData) {
    console.error('❌ No software data loaded');
    return;
  }
  
  console.log('📊 Software Data Summary:');
  console.log(`Total entries: ${window.softwareData.length}`);
  
  // Group by fileType
  const fileTypeGroups = {};
  window.softwareData.forEach(item => {
    const type = item.fileType || 'null/empty';
    if (!fileTypeGroups[type]) {
      fileTypeGroups[type] = [];
    }
    fileTypeGroups[type].push({
      name: item.softwareName,
      package: item.softwarePackage,
      account: item.accountName
    });
  });
  
  console.log('\n📄 Software grouped by fileType:');
  Object.entries(fileTypeGroups).forEach(([type, items]) => {
    console.log(`\n${type} (${items.length} items):`);
    console.table(items.slice(0, 5)); // Show first 5 of each type
  });
  
  // Sample entries with fileType
  const withFileType = window.softwareData.filter(item => item.fileType);
  console.log(`\n✅ Entries with fileType: ${withFileType.length}`);
  if (withFileType.length > 0) {
    console.table(withFileType.slice(0, 10).map(item => ({
      softwareName: item.softwareName,
      softwarePackage: item.softwarePackage,
      accountName: item.accountName,
      fileType: item.fileType
    })));
  }
}

// Make functions available globally for backward compatibility
window.getSoftwareFileTypeByStandardName = getSoftwareFileTypeByStandardName;
window.shouldShowCookieActions = shouldShowCookieActions;
window.shouldShowPasswordActions = shouldShowPasswordActions;
window.shouldShowCheckAccessActions = shouldShowCheckAccessActions;
window.buildTransactionActionOptions = buildTransactionActionOptions;
window.buildTransactionActionArray = buildTransactionActionArray;
window.debugSoftwareData = debugSoftwareData;