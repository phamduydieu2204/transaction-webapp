/**
 * sessionValidator.js
 * 
 * Session validation system
 * Validates user sessions against server data
 */

import { getConstants } from '../constants.js';
import { getState, updateState } from './stateManager.js';

/**
 * Session validation configuration
 */
const VALIDATION_CONFIG = {
  checkInterval: 5 * 60 * 1000, // Check every 5 minutes
  onPageLoadCheck: true, // Check immediately on page load
  retryAttempts: 3,
  retryDelay: 2000,
  immediateTimeout: 5000, // Faster timeout for immediate validation
  operationCacheTime: 30 * 1000 // Cache validation for 30 seconds for operations
};

// Cache for operation validations
let lastOperationValidation = 0;
let lastOperationResult = false;

/**
 * Last validation timestamp
 */
let lastValidation = 0;

/**
 * Validation in progress flag
 */
let validationInProgress = false;

/**
 * Handle legacy user logout
 */
async function handleLegacyUserLogout() {
  console.log('🚪 Handling legacy user logout...');
  
  // Show user-friendly message for legacy users
  const message = 'Hệ thống bảo mật đã được cập nhật. Vui lòng đăng nhập lại để tiếp tục sử dụng.';
  
  if (window.showResultModal) {
    window.showResultModal(message, false);
  } else {
    alert(message);
  }
  
  // Wait a moment for user to see the message
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Force logout
  if (window.logout) {
    window.logout();
  } else {
    // Fallback logout
    localStorage.clear();
    window.location.reload();
  }
}

/**
 * Initialize session validation system
 */
export function initializeSessionValidation() {
  // '🔐 Initializing session validation system...';
  
  // Check on page load if user is logged in
  if (VALIDATION_CONFIG.onPageLoadCheck) {
    setTimeout(() => {
      validateCurrentSession();
    }, 500); // Quick check after basic initialization
  }
  
  // '✅ Session validation enabled';
  
  // Set up periodic validation
  setInterval(() => {
    validateCurrentSession();
  }, VALIDATION_CONFIG.checkInterval);
  
  // '✅ Session validation system initialized';
}

/**
 * Validate session immediately (blocking)
 * Used during app initialization to prevent loading invalid sessions
 */
export async function validateSessionImmediate() {
  // '⚡ Immediate session validation...';
  
  const user = getState().user;
  
  if (!user || !user.maNhanVien) {
    // console.log('👤 No user session to validate immediately');
    return true;
  }
  
  // Check if user has passwordHash (new login) or is legacy user
  if (!user.passwordHash) {
    // console.log('⚠️ Legacy user without passwordHash detected - forcing re-login immediately');
    await handleLegacyUserLogout();
    return false;
  }
  
  try {
    // Use faster validation for immediate check
    const isValid = await validateWithServerFast(user);
    if (!isValid) {
      console.error('❌ Immediate session validation failed - forcing logout');
      await handleInvalidSession();
      return false;
    }
    
    // '✅ Immediate session validation successful';
    return true;
    
  } catch (error) {
    console.error('❌ Immediate session validation error:', error);
    // On network errors during startup, allow login but show warning
    // console.log('⚠️ Network error during immediate validation - allowing login with warning');
    return true;
  }
}

/**
 * Validate current session against server
 */
export async function validateCurrentSession() {
  const user = getState().user;
  
  if (!user || !user.maNhanVien) {
    // console.log('👤 No user session to validate');
    return true; // No session to validate
  }
  
  // Check if user has passwordHash (new login) or is legacy user
  if (!user.passwordHash) {
    // console.log('⚠️ Legacy user without passwordHash detected - forcing re-login');
    await handleLegacyUserLogout();
    return false;
  }
  
  // Prevent multiple simultaneous validations
  if (validationInProgress) {
    console.log('⏳ Session validation already in progress');
    return;
  }
  
  // Check if we validated recently
  const now = Date.now();
  if (now - lastValidation < 60000) { // Don't validate more than once per minute
    // '⚡ Session validated recently, skipping';
    return;
  }
  
  // '🔍 Validating session for user:', user.tenNhanVien;
  // '🔑 User has passwordHash:', !!user.passwordHash;
  if (user.passwordHash) {
    // '🔑 PasswordHash preview:', user.passwordHash.substring(0, 8 + '...');
  }
  validationInProgress = true;
  
  try {
    const isValid = await validateWithServer(user);
    lastValidation = now;
    
    if (!isValid) {
      console.error('❌ Session validation failed - forcing logout');
      await handleInvalidSession();
    } else {
      // '✅ Session validation successful';
    }
    
  } catch (error) {
    console.error('❌ Session validation error:', error);
    // Don't logout on network errors, just log them
  } finally {
    validationInProgress = false;
  }
}

/**
 * Fast session validation with server (for immediate checks)
 * @param {Object} user - User object to validate
 * @returns {Promise<boolean>} True if session is valid
 */
async function validateWithServerFast(user) {
  const { BACKEND_URL } = getConstants();
  
  const data = {
    action: 'validateSession',
    maNhanVien: user.maNhanVien,
    tenNhanVien: user.tenNhanVien,
    passwordHash: user.passwordHash,
    currentSessionData: {
      vaiTro: user.vaiTro,
      tabNhinThay: user.tabNhinThay,
      giaoDichNhinThay: user.giaoDichNhinThay,
      nhinThayGiaoDichCuaAi: user.nhinThayGiaoDichCuaAi,
      duocSuaGiaoDichCuaAi: user.duocSuaGiaoDichCuaAi,
      duocXoaGiaoDichCuaAi: user.duocXoaGiaoDichCuaAi
    }
  };
  
  // '⚡ Fast session validation request...';
  
  try {
    // Single attempt with faster timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VALIDATION_CONFIG.immediateTimeout);

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      if (result.sessionValid === false) {
        // '📋 Server says session is invalid:', result.reason || 'Unknown reason';
        return false;
      }
      
      // Check if user data has changed significantly
      if (result.updatedUserData) {
        // '🔄 User data updated from server (fast');
        updateUserDataFromServer(result.updatedUserData);
      }
      
      return true;
    } else {
      console.error('❌ Server validation error (fast):', result.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Fast session validation failed:', error);
    throw error; // Re-throw for caller to handle
  }
}

/**
 * Validate session with server
 * @param {Object} user - User object to validate
 * @returns {Promise<boolean>} True if session is valid
 */
async function validateWithServer(user) {
  const { BACKEND_URL } = getConstants();
  
  const data = {
    action: 'validateSession',
    maNhanVien: user.maNhanVien,
    tenNhanVien: user.tenNhanVien,
    passwordHash: user.passwordHash, // Include password hash for validation
    currentSessionData: {
      vaiTro: user.vaiTro,
      tabNhinThay: user.tabNhinThay,
      giaoDichNhinThay: user.giaoDichNhinThay,
      nhinThayGiaoDichCuaAi: user.nhinThayGiaoDichCuaAi,
      duocSuaGiaoDichCuaAi: user.duocSuaGiaoDichCuaAi,
      duocXoaGiaoDichCuaAi: user.duocXoaGiaoDichCuaAi
    }
  };
  
  // '📡 Sending session validation request...';
  // '📋 Request data:', JSON.stringify(data, null, 2);
  
  for (let attempt = 1; attempt <= VALIDATION_CONFIG.retryAttempts; attempt++) {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        if (result.sessionValid === false) {
          // '📋 Server says session is invalid:', result.reason || 'Unknown reason';
          return false;
        }
        
        // Check if user data has changed significantly
        if (result.updatedUserData) {
          // '🔄 User data updated from server';
          updateUserDataFromServer(result.updatedUserData);
        }
        
        return true;
      } else {
        console.error('❌ Server validation error:', result.message);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Session validation attempt ${attempt} failed:`, error);
      
      if (attempt < VALIDATION_CONFIG.retryAttempts) {
        console.log(`⏳ Retrying in ${VALIDATION_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, VALIDATION_CONFIG.retryDelay));
      } else {
        throw error; // Re-throw on final attempt
      }
    }
  }
}

/**
 * Update user data from server response
 * @param {Object} updatedData - Updated user data from server
 */
function updateUserDataFromServer(updatedData) {
  const currentUser = getState().user;
  
  const updatedUser = {
    ...currentUser,
    ...updatedData
  };
  
  updateState({ user: updatedUser });
  // '✅ User data updated from server';
}

/**
 * Handle invalid session
 */
async function handleInvalidSession() {
  console.log('🚪 Handling invalid session...');
  
  // Show user-friendly message
  const message = 'Phiên đăng nhập của bạn đã hết hạn hoặc tài khoản đã bị thay đổi. Vui lòng đăng nhập lại.';
  
  if (window.showResultModal) {
    window.showResultModal(message, false);
  } else {
    alert(message);
  }
  
  // Wait a moment for user to see the message
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Force logout
  if (window.logout) {
    window.logout();
  } else {
    // Fallback logout
    localStorage.clear();
    window.location.reload();
  }
}

/**
 * Force session validation (can be called manually)
 */
export async function forceSessionValidation() {
  // '🔄 Forcing session validation...';
  lastValidation = 0; // Reset last validation time
  await validateCurrentSession();
}

/**
 * Get last validation time
 */
export function getLastValidationTime() {
  return lastValidation;
}

/**
 * Check if validation is in progress
 */
export function isValidationInProgress() {
  return validationInProgress;
}

/**
 * Validate session before critical operations
 * @returns {Promise<boolean>} True if session is valid
 */
export async function validateBeforeOperation() {
  // '🔍 Validating session before operation...';
  
  const user = getState().user;
  if (!user) {
    // console.log('❌ No user session for operation');
    return false;
  }
  
  // Check cache first
  const now = Date.now();
  if (now - lastOperationValidation < VALIDATION_CONFIG.operationCacheTime) {
    // '✅ Using cached validation result:', lastOperationResult;
    return lastOperationResult;
  }
  
  try {
    const isValid = await validateWithServer(user);
    
    // Update cache
    lastOperationValidation = now;
    lastOperationResult = isValid;
    
    if (!isValid) {
      console.error('❌ Session invalid for operation');
      await handleInvalidSession();
      return false;
    }
    
    // '✅ Session valid for operation';
    return true;
  } catch (error) {
    console.error('❌ Session validation failed for operation:', error);
    // Don't block operation on network errors
    return true;
  }
}

/**
 * Add session validation to existing functions
 */
export function wrapWithSessionValidation(originalFunction, functionName) {
  return async function(...args) {
    // `🔐 Session check for ${functionName}`;
    
    const isValid = await validateBeforeOperation();
    if (!isValid) {
      console.error(`❌ Operation ${functionName} blocked due to invalid session`);
      return {
        status: 'error',
        message: 'Phên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'
      };
    }
    
    return originalFunction.apply(this, args);
  };
}