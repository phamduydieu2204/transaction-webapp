/**
 * UI Blocker - Ngăn người dùng tương tác khi đang xử lý
 */

class UIBlocker {
  constructor() {
    this.overlay = null;
    this.isBlocked = false;
  }

  /**
   * Tạo overlay để khóa UI
   */
  createOverlay() {
    if (this.overlay) return this.overlay;

    this.overlay = document.createElement('div');
    this.overlay.id = 'ui-blocker-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      cursor: not-allowed;
    `;

    // Spinner loading
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // CSS animation cho spinner
    if (!document.querySelector('#ui-blocker-styles')) {
      const style = document.createElement('style');
      style.id = 'ui-blocker-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    this.overlay.appendChild(spinner);
    return this.overlay;
  }

  /**
   * Khóa UI
   */
  block() {
    if (this.isBlocked) return;

    const overlay = this.createOverlay();
    document.body.appendChild(overlay);
    this.isBlocked = true;

    // Ngăn scroll
    document.body.style.overflow = 'hidden';

    // console.log('🔒 UI blocked');
  }

  /**
   * Mở khóa UI
   */
  unblock() {
    if (!this.isBlocked || !this.overlay) return;

    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    
    this.isBlocked = false;

    // Khôi phục scroll
    document.body.style.overflow = '';

// console.log('🔓 UI unblocked');
  }

  /**
   * Kiểm tra trạng thái
   */
  get blocked() {
    return this.isBlocked;
  }
}

// Export singleton instance
export const uiBlocker = new UIBlocker();

// Make available globally for debugging
window.uiBlocker = uiBlocker;