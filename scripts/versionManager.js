/**
 * Version Manager - Tự động thêm version vào URL để buộc tải lại khi có thay đổi
 */

class VersionManager {
  constructor() {
    // Sử dụng timestamp hoặc version number
    this.version = this.generateVersion();
    this.isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('github.io');
  }

  generateVersion() {
    // Trong development: dùng timestamp để luôn tải mới
    // Trong production: dùng version cố định (cập nhật khi deploy)
    if (this.isDevelopment) {
      return Date.now();
    }
    // Version production - cập nhật khi deploy (incremented for new layout)
    return '1.1.0';
  }

  // Thêm version vào URL
  addVersionToUrl(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${this.version}`;
  }

  // Load CSS với version
  loadCSS(href, id = null) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = this.addVersionToUrl(href);
    if (id) link.id = id;
    document.head.appendChild(link);
  }

  // Load JS với version
  loadJS(src, async = true, defer = true) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.addVersionToUrl(src);
      script.async = async;
      script.defer = defer;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Reload CSS động (cho hot reload)
  reloadCSS(id) {
    const existingLink = document.getElementById(id);
    if (existingLink) {
      const newHref = existingLink.href.split('?')[0];
      existingLink.href = this.addVersionToUrl(newHref);
    }
  }

  // Check và reload nếu có phiên bản mới
  async checkForUpdates() {
    try {
      const response = await fetch('/version.json?' + Date.now());
      const data = await response.json();
      
      if (data.version !== this.version && !this.isDevelopment) {
        // Có version mới trong production
        this.showUpdateNotification();
      }
    } catch (error) {
      console.log('Version check skipped:', error.message);
    }
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'version-update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <i class="fas fa-sync-alt"></i>
        <span>Có phiên bản mới! Click để cập nhật.</span>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    notification.onclick = () => {
      window.location.reload(true);
    };
    
    document.body.appendChild(notification);
  }

  // Auto check for updates mỗi 5 phút
  startAutoCheck() {
    if (!this.isDevelopment) {
      setInterval(() => this.checkForUpdates(), 5 * 60 * 1000);
    }
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('Service Worker registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Clear all caches
  async clearAllCaches() {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
    
    // Tell service worker to clear cache
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'clearCache' });
    }
  }
}

// Export instance
window.versionManager = new VersionManager();

// Auto register service worker on load
window.addEventListener('load', () => {
  window.versionManager.registerServiceWorker();
});