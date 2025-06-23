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
  immediateTimeout: 5000, // Faster timeout for immediate validation
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
  
  // Check on page load if user is logged in
  if (VALIDATION_CONFIG.onPageLoadCheck) {
    setTimeout(() => {
      validateCurrentSession();
    }, 500); // Quick check after basic initialization
  }

  // Set up periodic validation
  setInterval(() => {
    validateCurrentSession();
  }, VALIDATION_CONFIG.checkInterval);
  
}

/**
 * Validate session immediately (blocking)
 * Used during app initialization to prevent loading invalid sessions
 */
export async function validateSessionImmediate() {
  
  const user = getState().user;
  
  if (!user || !user.maNhanVien) {
    return true;
  }
  
  // Check if user has passwordHash (new login) or is legacy user
  if (!user.passwordHash) {
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
    
    return true;
  } catch (error) {
    console.error('❌ Immediate session validation error:', error);
    // On network errors during startup, allow login but show warning
    return true;
  }
}

/**
 * Validate current session against server
 */
export async function validateCurrentSession() {
  const user = getState().user;
  
  if (!user || !user.maNhanVien) {
    return true; // No session to validate
  }
  
  // Check if user has passwordHash (new login) or is legacy user
  if (!user.passwordHash) {
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
    return;
  }
  
  if (user.passwordHash) {
  }
  validationInProgress = true;
  
  try {
    const isValid = await validateWithServer(user);
    lastValidation = now;
    
    if (!isValid) {
      console.error('❌ Session validation failed - forcing logout');
      await handleInvalidSession();
    } else {
    }
  } catch (error) {
    console.error('❌ Session validation error:', error);
    // Don't logout on network errors, just log them
  } finally {
    }
  };
  });

        'Content-Type': 'application/json'
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      if (result.sessionValid === false) {
        return false;
      }
      
      // Check if user data has changed significantly
      if (result.updatedUserData) {
        updateUserDataFromServer(result.updatedUserData);
      }
      
      return true;
    } else {
      console.error('❌ Server validation error (fast):', result.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Fast session validation failed:', error);
    passwordHash: user.passwordHash, // Include password hash for validation
    }
  };
  });

          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        if (result.sessionValid === false) {
          return false;
        }
        
        // Check if user data has changed significantly
        if (result.updatedUserData) {
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
}

/**
 * Handle invalid session
 */
async function handleInvalidSession() {
  
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
  
  const user = getState().user;
  if (!user) {
    return false;
  }
  
  // Check cache first
  const now = Date.now();
  if (now - lastOperationValidation < VALIDATION_CONFIG.operationCacheTime) {
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
    
    return true;
  } catch (error) {
    console.error('❌ Session validation failed for operation:', error);
    // Don't block operation on network errors
      };
    }
    
    return originalFunction.apply(this, args);
  };
}