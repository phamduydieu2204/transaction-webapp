/**
 * renderHelpers.js
 * 
 * Utility functions and helpers for rendering statistics
 * Handles loading states, error states, and common UI patterns
 */

/**
 * Renders loading state for statistics
 * @param {string} containerId - Container ID
 * @param {string} message - Loading message
 */
export function renderLoadingState(containerId, message = "Đang tải dữ liệu thống kê...") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;

  addLoadingStyles();
}

/**
 * Renders error state for statistics
 * @param {string} containerId - Container ID
 * @param {string} error - Error message
 */
export function renderErrorState(containerId, error = "Có lỗi xảy ra khi tải dữ liệu") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>${error}</p>
      <button class="retry-btn" onclick="location.reload()">Thử Lại</button>
    </div>
  `;

  addErrorStyles();
}

/**
 * Checks if an element exists and is visible
 * @param {string} selector - CSS selector
 * @returns {boolean} - True if element exists and is visible
 */
export function isElementVisible(selector) {
  const element = document.querySelector(selector);
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

/**
 * Safely gets container element
 * @param {string} containerId - Container ID
 * @returns {HTMLElement|null} - Container element or null
 */
export function getContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container #${containerId} not found`);
    return null;
  }
  return container;
}

/**
 * Creates and adds a style element if it doesn't exist
 * @param {string} styleId - Style element ID
 * @param {string} styles - CSS styles
 */
export function addStyles(styleId, styles) {
  if (document.getElementById(styleId)) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

/**
 * Adds CSS styles for loading state
 */
function addLoadingStyles() {
  const styles = `
    .loading-state {
      text-align: center;
      padding: 40px;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  addStyles('loading-styles', styles);
}

/**
 * Adds CSS styles for error state
 */
function addErrorStyles() {
  const styles = `
    .error-state {
      text-align: center;
      padding: 40px;
      color: #dc3545;
    }
    .error-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .retry-btn {
      margin-top: 15px;
      padding: 10px 20px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .retry-btn:hover {
      background: #c82333;
    }
  `;
  
  addStyles('error-styles', styles);
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Formats a number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Creates a safe HTML string
 * @param {string} html - HTML string
 * @returns {string} - Escaped HTML string
 */
export function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Checks if statistics tab is active
 * @returns {boolean} - True if statistics tab is active
 */
export function isStatisticsTabActive() {
  const currentTab = document.querySelector(".tab-button.active");
  return currentTab && currentTab.dataset.tab === "tab-thong-ke";
}