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
 * Get file type from software data based on standardName (Tên chuẩn)
 * @param {string} standardName - Standard name from transaction (Tên chuẩn từ cột T sheet GiaoDich)
 * @returns {string|null} File type ('docs', 'sheet', etc.) or null if not found
 */
export function getSoftwareFileType(standardName) {
  if (!window.softwareData || !Array.isArray(window.softwareData)) {
    console.warn('❌ softwareData not available or not an array');
    return null;
  }
  
  if (!standardName || standardName.trim() === '') {
    console.warn('❌ No standardName provided');
    return null;
  }
  
  console.log('🔍 Looking for software match by standardName:', standardName);
  
  // Find matching software entry by standardName (Tên chuẩn - column M in PhanMem sheet)
  const matchingSoftware = window.softwareData.find(software => {
    // Try different possible field names for standardName in software data
    const softwareStandardName = software.standardName || 
                                  software.tenChuan || 
                                  software['Tên chuẩn'] || 
                                  software.softwareName || // fallback to softwareName if standardName not available
                                  '';
    
    const match = softwareStandardName.toLowerCase() === standardName.toLowerCase();
    
    if (match) {
      console.log('📋 Found matching software by standardName:', {
        inputStandardName: standardName,
        foundStandardName: softwareStandardName,
        softwareName: software.softwareName
      });
    }
    
    return match;
  });
  
  if (!matchingSoftware) {
    return null;
  }
  
  // Try different possible field names for fileType (column Q)
  const fileType = matchingSoftware.fileType || 
                   matchingSoftware.loaiTep || 
                   matchingSoftware['loại tệp'] || 
                   matchingSoftware.FileType ||
                   matchingSoftware['Loại tệp'] ||
                   matchingSoftware.file_type ||
                   matchingSoftware.type;
  
  // Log only when no fileType found for debugging
  if (!fileType || fileType.trim() === '') {
    console.log('🗂️ No fileType found, available fields:', Object.keys(matchingSoftware));
  }
  
  // If fileType is found, return it
  if (fileType && fileType.trim() !== '') {
    return fileType;
  }
  
  // If no fileType in data, use temporary mapping based on standardName
  // This is a fallback until backend provides proper fileType data
  console.warn('⚠️ No fileType in data, using temporary mapping for standardName:', standardName);
  
  const tempFileTypeMapping = getTempFileTypeMappingByStandardName(standardName);
  
  if (tempFileTypeMapping) {
    console.log('🔄 Using temporary fileType mapping:', tempFileTypeMapping);
  }
  
  return tempFileTypeMapping;
}

/**
 * Determine if Cookie actions should be shown based on file type
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Cookie actions should be shown
 */
export function shouldShowCookieActions(transaction) {
  // Get standardName from transaction (Tên chuẩn - column T from GiaoDich sheet)
  const standardName = transaction.standardName || 
                       transaction.tenChuan || 
                       transaction['Tên chuẩn'] || 
                       transaction.softwareName; // fallback to softwareName
  
  // Debug: Log available transaction fields for standardName
  if (!transaction.standardName && !transaction.tenChuan && !transaction['Tên chuẩn']) {
    console.log('⚠️ No standardName field found in transaction, available fields:', Object.keys(transaction));
    console.log('🔄 Using fallback:', standardName);
  }
  
  // Get file type from software data to determine action options
  const fileType = getSoftwareFileType(standardName);
  
  // Only show Cookie if fileType is exactly "docs" (case insensitive)
  return fileType && fileType.toLowerCase() === 'docs';
}

/**
 * Determine if Password Change actions should be shown based on file type
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if Password Change actions should be shown
 */
export function shouldShowPasswordActions(transaction) {
  // Get standardName from transaction (Tên chuẩn - column T from GiaoDich sheet)
  const standardName = transaction.standardName || 
                       transaction.tenChuan || 
                       transaction['Tên chuẩn'] || 
                       transaction.softwareName; // fallback to softwareName
  
  // Get file type from software data to determine action options
  const fileType = getSoftwareFileType(standardName);
  
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
  
  // Get standardName from transaction (Tên chuẩn - column T from GiaoDich sheet)
  const standardName = transaction.standardName || 
                       transaction.tenChuan || 
                       transaction['Tên chuẩn'] || 
                       transaction.softwareName; // fallback to softwareName
  
  // Get file type from software data
  const fileType = getSoftwareFileType(standardName);
  
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
window.getSoftwareFileType = getSoftwareFileType;
window.shouldShowCookieActions = shouldShowCookieActions;
window.shouldShowPasswordActions = shouldShowPasswordActions;
window.shouldShowCheckAccessActions = shouldShowCheckAccessActions;
window.buildTransactionActionOptions = buildTransactionActionOptions;
window.buildTransactionActionArray = buildTransactionActionArray;
window.debugSoftwareData = debugSoftwareData;