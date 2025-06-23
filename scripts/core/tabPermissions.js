/**
 * tabPermissions.js
 * 
 * Tab permission management system
 * Handles tab visibility and access control based on user permissions
 */

import { getStateProperty } from './stateManager.js';

/**
 * Tab mapping from Vietnamese to internal IDs
 */
const TAB_MAPPING = {
  'tất cả': ['giao-dich', 'phan-mem', 'chi-phi', 'thong-ke', 'bao-cao', 'cai-dat'],
  'giao dịch': ['giao-dich'],
  'phần mềm': ['phan-mem'],
  'chi phí': ['chi-phi'],
  'thống kê': ['thong-ke'],
  'báo cáo': ['bao-cao'],
  'cài đặt': ['cai-dat']
};

/**
 * Parse tab permissions from user data
 * @param {string} tabNhinThay - Tab permissions string from backend
 * @returns {Array} Array of allowed tab IDs
 */
export function parseTabPermissions(tabNhinThay) {
  if (!tabNhinThay) {
    console.warn('⚠️ No tab permissions found, defaulting to giao-dich');
    return ['giao-dich'];
  }

  
  // Split by | or , and trim
  const permissions = tabNhinThay.split(/[|,]/).map(p => p.trim()).filter(p => p.length > 0);

  // Check for "tất cả" first (gives all permissions)
  if (permissions.includes('tất cả')) {
    return TAB_MAPPING['tất cả'];
  }
  
  // Convert to internal tab IDs
  const allowedTabs = new Set();
  
  permissions.forEach(permission => {
    if (TAB_MAPPING[permission]) {
      TAB_MAPPING[permission].forEach(tabId => allowedTabs.add(tabId));
    } else {
      console.warn(`⚠️ Unknown tab permission: "${permission}"`);
    }
  });

  const result = Array.from(allowedTabs);
  
  return result.length > 0 ? result : ['giao-dich'];
}

/**
 * Get current user's allowed tabs
 * @returns {Array} Array of allowed tab IDs
 */
export function getUserAllowedTabs() {
  const user = getStateProperty('user');
  if (!user) {
    console.warn('⚠️ No user found, no tabs allowed');
    return [];
  }

  return parseTabPermissions(user.tabNhinThay);
}

/**
 * Check if user can access a specific tab
 * @param {string} tabId - Tab ID to check
 * @returns {boolean} True if user can access tab
 */
export function canAccessTab(tabId) {
  const allowedTabs = getUserAllowedTabs();
  const canAccess = allowedTabs.includes(tabId);
  
  
  // Fallback: if no tabs are allowed but user exists, allow giao-dich
  if (!canAccess && allowedTabs.length === 0 && tabId === 'giao-dich') {
    return true;
  }
  
  return canAccess;
}

/**
 * Get the first allowed tab for user (for default navigation)
 * @returns {string} First allowed tab ID
 */
export function getDefaultAllowedTab() {
  const allowedTabs = getUserAllowedTabs();
  const defaultTab = allowedTabs[0] || 'giao-dich';
  
  return defaultTab;
}

/**
 * Filter tabs to show only allowed ones
 * @param {Array} allTabs - Array of all available tabs
 * @returns {Array} Array of allowed tabs
 */
export function filterAllowedTabs(allTabs) {
  const allowedTabIds = getUserAllowedTabs();
  
  const filtered = allTabs.filter(tab => allowedTabIds.includes(tab.id));
  
  return filtered;
}

/**
 * Hide tabs that user doesn't have permission to see
 */
export function hideUnauthorizedTabs() {
  
  const allowedTabs = getUserAllowedTabs();
  const allTabButtons = document.querySelectorAll('.tab-button');
  
  allTabButtons.forEach(button => {
    const tabId = button.getAttribute('data-tab');
    
    if (allowedTabs.includes(tabId)) {
      button.style.display = 'block';
      button.removeAttribute('disabled');
    } else {
      button.style.display = 'none';
      button.setAttribute('disabled', 'true');
    }
  });
  
}

/**
 * Validate tab access and redirect if necessary
 * @param {string} requestedTab - Tab user wants to access
 * @returns {string} Valid tab to redirect to (might be different from requested)
 */
export function validateTabAccess(requestedTab) {
  
  if (!requestedTab) {
    const defaultTab = getDefaultAllowedTab();
    return defaultTab;
  }
  
  if (canAccessTab(requestedTab)) {
    return requestedTab;
  } else {
    const defaultTab = getDefaultAllowedTab();
    
    // Show access denied message
    showAccessDeniedMessage(requestedTab);
    
    return defaultTab;
  }
}

/**
 * Show access denied message to user
 * @param {string} deniedTab - Tab that was denied access
 */
function showAccessDeniedMessage(deniedTab) {
  const tabNames = {
    'giao-dich': 'Nhập giao dịch',
    'phan-mem': 'Phần mềm',
    'chi-phi': 'Nhập chi phí',
    'thong-ke': 'Thống kê',
    'bao-cao': 'Báo cáo',
    'cai-dat': 'Cài đặt'
  };
  
  const tabName = tabNames[deniedTab] || deniedTab;
  const message = `Bạn không có quyền truy cập tab "${tabName}". Vui lòng liên hệ quản trị viên để cấp quyền.`;
  
  // Try to show using existing result modal
  if (window.showResultModal) {
    setTimeout(() => {
      window.showResultModal(message, false);
    }, 500); // Delay to avoid conflicts with page load
  } else {
    // Fallback to alert
    setTimeout(() => {
      alert(message);
    }, 500);
  }
  
  console.warn(`🚫 Access denied message shown for tab: ${deniedTab}`);
}

/**
 * Initialize tab permissions system
 */
export function initializeTabPermissions() {
  
  const user = getStateProperty('user');
  if (!user) {
    console.warn('⚠️ No user found, skipping tab permissions');
    return false;
  }
  
  
  // Hide unauthorized tabs
  hideUnauthorizedTabs();
  
  return true;
}