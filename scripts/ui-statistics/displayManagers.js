/**
 * displayManagers.js
 * 
 * UI display control và state management
 * Handles loading states, notifications, modal management
 */

/**
 * Shows success message to user
 * @param {string} message - Success message
 */
export function showSuccessMessage(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = 'success';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
}

/**
 * Shows error message to user
 * @param {string} message - Error message
 */
export function showErrorMessage(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = 'error';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
  
  console.error("❌ Error:", message);
}

/**
 * Shows warning message to user
 * @param {string} message - Warning message
 */
export function showWarningMessage(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = 'warning';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 4000);
  }
  
  console.warn("⚠️ Warning:", message);
}

/**
 * Shows info message to user
 * @param {string} message - Info message
 */
export function showInfoMessage(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = 'info';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  console.log("ℹ️ Info:", message);
}

/**
 * Manages loading state for UI elements
 */
  }
  
  /**
   * Setup keyboard event handlers for modal
   * @param {string} modalId - Modal ID
   */
  setupKeyboardHandlers(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const handleKeydown = (event) => {
      // ESC key to close modal
      if (event.key === 'Escape') {
        this.hideModal(modalId);
      }
      
      // Tab key for focus management
      if (event.key === 'Tab') {
        this.handleTabNavigation(event, modal);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    modal.dataset.keydownHandler = 'true';
  }
  
  /**
   * Clean up keyboard event handlers
   * @param {string} modalId - Modal ID
   */
  cleanupKeyboardHandlers(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || !modal.dataset.keydownHandler) return;
    
    // Note: In a real implementation, you'd need to store the handler reference
    // to properly remove it. This is a simplified version.
    delete modal.dataset.keydownHandler;
  }
  
  /**
   * Handle tab navigation within modal
   * @param {Event} event - Keyboard event
   * @param {Element} modal - Modal element
   */
  handleTabNavigation(event, modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  });

  }
  
  /**
   * Restore stored state of element
   * @param {string} elementId - Element ID
   */
    }
  }
  
  /**
   * Hide element with animation
   * @param {string} elementId - Element ID
   * @param {string} animation - Animation type
   */
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.display = 'none';
        }, 300);
        break;
        
      case 'slide':
    }
  }
  
  /**
   * Toggle element visibility
   * @param {string} elementId - Element ID
   * @param {string} animation - Animation type
   */
    }
    
    .loading-spinner {
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-message {
    }
    
    .notification {
    }
    
    .notification.success {
    }
    
    .notification.error {
    }
    
    .notification.warning {
    }
    
    .notification.info {
    }
    
    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
  `;
  
  document.head.appendChild(styles);
}

// Initialize styles on module load
initializeDisplayStyles();

// Make functions available globally for legacy compatibility
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.showWarningMessage = showWarningMessage;
window.showInfoMessage = showInfoMessage;
window.loadingManager = loadingManager;
window.modalManager = modalManager;
window.uiStateManager = uiStateManager;
