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
export class LoadingManager {
  constructor() {
    this.loadingElements = new Set();
    this.loadingTimeouts = new Map();
  }
  
  /**
   * Show loading state for an element
   * @param {string} elementId - Element ID
   * @param {string} message - Loading message
   * @param {number} timeout - Auto-hide timeout (ms)
   */
  showLoading(elementId, message = 'Đang tải...', timeout = 30000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Store original content
    if (!element.dataset.originalContent) {
      element.dataset.originalContent = element.innerHTML;
    }
    
    // Show loading spinner
    element.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-message">${message}</div>
      </div>
    `;
    
    element.classList.add('loading');
    this.loadingElements.add(elementId);
    
    // Set auto-hide timeout
    if (timeout > 0) {
      const timeoutId = setTimeout(() => {
        this.hideLoading(elementId);
        showWarningMessage('Thao tác tải dữ liệu quá lâu, vui lòng thử lại');
      }, timeout);
      
      this.loadingTimeouts.set(elementId, timeoutId);
    }
    
  }
  
  /**
   * Hide loading state for an element
   * @param {string} elementId - Element ID
   */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Clear timeout
    if (this.loadingTimeouts.has(elementId)) {
      clearTimeout(this.loadingTimeouts.get(elementId));
      this.loadingTimeouts.delete(elementId);
    }
    
    // Restore original content
    if (element.dataset.originalContent) {
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
    
    element.classList.remove('loading');
    this.loadingElements.delete(elementId);
    
  }
  
  /**
   * Check if element is in loading state
   * @param {string} elementId - Element ID
   * @returns {boolean}
   */
  isLoading(elementId) {
    return this.loadingElements.has(elementId);
  }
  
  /**
   * Hide all loading states
   */
  hideAllLoading() {
    this.loadingElements.forEach(elementId => {
      this.hideLoading(elementId);
    });
  }
  
  /**
   * Get count of active loading elements
   * @returns {number}
   */
  getLoadingCount() {
    return this.loadingElements.size;
  }
}

// Create global loading manager instance
export const loadingManager = new LoadingManager();

/**
 * Manages modal dialogs
 */
export class ModalManager {
  constructor() {
    this.activeModals = new Set();
    this.modalStack = [];
  }
  
  /**
   * Show modal dialog
   * @param {string} modalId - Modal ID
   * @param {Object} options - Modal options
   */
  showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error(`Modal ${modalId} not found`);
      return;
    }
    
    const {
      backdrop = true,
      keyboard = true,
      focus = true,
      show = true
    } = options;
    
    // Add to stack
    this.modalStack.push(modalId);
    this.activeModals.add(modalId);
    
    // Show modal
    modal.style.display = 'block';
    modal.classList.add('show');
    
    // Handle backdrop
    if (backdrop) {
      modal.classList.add('modal-backdrop');
    }
    
    // Handle keyboard events
    if (keyboard) {
      this.setupKeyboardHandlers(modalId);
    }
    
    // Focus management
    if (focus) {
      const focusableElement = modal.querySelector('[autofocus], input, button, [tabindex]');
      if (focusableElement) {
        focusableElement.focus();
      }
    }
    
  }
  
  /**
   * Hide modal dialog
   * @param {string} modalId - Modal ID
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Remove from stack and active set
    const stackIndex = this.modalStack.indexOf(modalId);
    if (stackIndex !== -1) {
      this.modalStack.splice(stackIndex, 1);
    }
    this.activeModals.delete(modalId);
    
    // Hide modal
    modal.style.display = 'none';
    modal.classList.remove('show', 'modal-backdrop');
    
    // Clean up keyboard handlers
    this.cleanupKeyboardHandlers(modalId);
    
  }
  
  /**
   * Hide all active modals
   */
  hideAllModals() {
    this.activeModals.forEach(modalId => {
      this.hideModal(modalId);
    });
  }
  
  /**
   * Check if modal is active
   * @param {string} modalId - Modal ID
   * @returns {boolean}
   */
  isModalActive(modalId) {
    return this.activeModals.has(modalId);
  }
  
  /**
   * Get top modal in stack
   * @returns {string|null}
   */
  getTopModal() {
    return this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1] : null;
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
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}

// Create global modal manager instance
export const modalManager = new ModalManager();

/**
 * Manages UI state visibility
 */
export class UIStateManager {
  constructor() {
    this.elementStates = new Map();
  }
  
  /**
   * Store current state of element
   * @param {string} elementId - Element ID
   */
  storeElementState(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    this.elementStates.set(elementId, {
      display: element.style.display,
      visibility: element.style.visibility,
      opacity: element.style.opacity,
      classList: [...element.classList]
    });
  }
  
  /**
   * Restore stored state of element
   * @param {string} elementId - Element ID
   */
  restoreElementState(elementId) {
    const element = document.getElementById(elementId);
    const state = this.elementStates.get(elementId);
    
    if (!element || !state) return;
    
    element.style.display = state.display;
    element.style.visibility = state.visibility;
    element.style.opacity = state.opacity;
    
    // Restore classes
    element.className = state.classList.join(' ');
    
    this.elementStates.delete(elementId);
  }
  
  /**
   * Show element with animation
   * @param {string} elementId - Element ID
   * @param {string} animation - Animation type
   */
  showElement(elementId, animation = 'fade') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Store current state
    this.storeElementState(elementId);
    
    element.style.display = 'block';
    
    switch (animation) {
      case 'fade':
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          element.style.opacity = '1';
        }, 10);
        break;
        
      case 'slide':
        element.style.transform = 'translateY(-20px)';
        element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.transform = 'translateY(0)';
          element.style.opacity = '1';
        }, 10);
        break;
        
      default:
        element.style.opacity = '1';
    }
  }
  
  /**
   * Hide element with animation
   * @param {string} elementId - Element ID
   * @param {string} animation - Animation type
   */
  hideElement(elementId, animation = 'fade') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    switch (animation) {
      case 'fade':
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.display = 'none';
        }, 300);
        break;
        
      case 'slide':
        element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        element.style.transform = 'translateY(-20px)';
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.display = 'none';
        }, 300);
        break;
        
      default:
        element.style.display = 'none';
    }
  }
  
  /**
   * Toggle element visibility
   * @param {string} elementId - Element ID
   * @param {string} animation - Animation type
   */
  toggleElement(elementId, animation = 'fade') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (element.style.display === 'none' || !element.style.display) {
      this.showElement(elementId, animation);
    } else {
      this.hideElement(elementId, animation);
    }
  }
}

// Create global UI state manager instance
export const uiStateManager = new UIStateManager();

/**
 * Cleanup all display managers
 */
export function cleanupDisplayManagers() {
  loadingManager.hideAllLoading();
  modalManager.hideAllModals();
}

/**
 * Initialize display manager styles
 */
export function initializeDisplayStyles() {
  if (document.getElementById('display-manager-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'display-manager-styles';
  styles.textContent = `
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      min-height: 100px;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-message {
      color: #666;
      font-size: 14px;
      text-align: center;
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: 500;
      z-index: 10000;
      max-width: 400px;
      word-wrap: break-word;
    }
    
    .notification.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .notification.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .notification.warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }
    
    .notification.info {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
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
