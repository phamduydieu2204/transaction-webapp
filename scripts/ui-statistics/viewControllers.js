/**
 * viewControllers.js
 * 
 * View switching và layout management
 * Handles view transitions, layout changes, and responsive behavior
 */

console.log('📦 viewControllers.js module loading...');

import { showInfoMessage, showWarningMessage } from './displayManagers.js';

/**
 * View controller for managing different statistics views
 */
export class StatisticsViewController {
  constructor() {
    this.currentView = 'overview';
    this.viewHistory = [];
    this.viewConfig = new Map();
    this.responsiveBreakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    };
  }
  
  /**
   * Switch to a specific view
   * @param {string} viewName - Name of the view to switch to
   * @param {Object} options - View options
   */
  async switchToView(viewName, options = {}) {
    try {
      console.log(`🔄 Switching to view: ${viewName}`);
      
      const {
        animate = true,
        pushToHistory = true,
        beforeSwitch = null,
        afterSwitch = null
      } = options;
      
      // Execute before switch callback
      if (beforeSwitch && typeof beforeSwitch === 'function') {
        await beforeSwitch(this.currentView, viewName);
      }
      
      // Store current view in history
      if (pushToHistory && this.currentView !== viewName) {
        this.viewHistory.push(this.currentView);
      }
      
      // Hide current view
      if (animate) {
        await this.hideView(this.currentView);
      } else {
        this.setViewVisibility(this.currentView, false);
      }
      
      // Update current view
      const previousView = this.currentView;
      this.currentView = viewName;
      
      // Show new view
      if (animate) {
        await this.showView(viewName);
      } else {
        this.setViewVisibility(viewName, true);
      }
      
      // Update active navigation
      this.updateActiveNavigation(viewName);
      
      // Execute after switch callback
      if (afterSwitch && typeof afterSwitch === 'function') {
        await afterSwitch(previousView, viewName);
      }
      
      // Trigger view switched event
      this.triggerViewEvent('viewSwitched', {
        from: previousView,
        to: viewName,
        options
      });
      
      console.log(`✅ Switched to view: ${viewName}`);
      
    } catch (error) {
      console.error(`❌ Error switching to view ${viewName}:`, error);
      showWarningMessage(`Không thể chuyển đến view ${viewName}`);
    }
  }
  
  /**
   * Go back to previous view
   */
  async goBack() {
    if (this.viewHistory.length === 0) {
      console.log("📝 No previous view in history");
      return;
    }
    
    const previousView = this.viewHistory.pop();
    await this.switchToView(previousView, { pushToHistory: false });
  }
  
  /**
   * Show view with animation
   * @param {string} viewName - View name
   */
  async showView(viewName) {
    const viewElement = this.getViewElement(viewName);
    if (!viewElement) return;
    
    return new Promise((resolve) => {
      viewElement.style.display = 'block';
      viewElement.style.opacity = '0';
      viewElement.style.transform = 'translateX(20px)';
      viewElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // Force reflow
      viewElement.offsetHeight;
      
      viewElement.style.opacity = '1';
      viewElement.style.transform = 'translateX(0)';
      
      setTimeout(() => {
        viewElement.style.transition = '';
        resolve();
      }, 300);
    });
  }
  
  /**
   * Hide view with animation
   * @param {string} viewName - View name
   */
  async hideView(viewName) {
    const viewElement = this.getViewElement(viewName);
    if (!viewElement) return;
    
    return new Promise((resolve) => {
      viewElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      viewElement.style.opacity = '0';
      viewElement.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        viewElement.style.display = 'none';
        viewElement.style.transition = '';
        resolve();
      }, 300);
    });
  }
  
  /**
   * Set view visibility without animation
   * @param {string} viewName - View name
   * @param {boolean} visible - Visibility state
   */
  setViewVisibility(viewName, visible) {
    const viewElement = this.getViewElement(viewName);
    if (!viewElement) return;
    
    viewElement.style.display = visible ? 'block' : 'none';
    viewElement.style.opacity = visible ? '1' : '0';
  }
  
  /**
   * Get view element by name
   * @param {string} viewName - View name
   * @returns {Element|null}
   */
  getViewElement(viewName) {
    // Try different possible selectors
    const selectors = [
      `#stats-${viewName}`,
      `#${viewName}-view`,
      `[data-view="${viewName}"]`,
      `.stats-view-${viewName}`
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    
    console.warn(`View element not found for: ${viewName}`);
    return null;
  }
  
  /**
   * Update active navigation indicators
   * @param {string} viewName - Active view name
   */
  updateActiveNavigation(viewName) {
    // Update main navigation
    const navButtons = document.querySelectorAll('[data-view], [data-subtab]');
    navButtons.forEach(button => {
      const buttonView = button.dataset.view || button.dataset.subtab;
      if (buttonView === viewName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Update breadcrumb if exists
    this.updateBreadcrumb(viewName);
  }
  
  /**
   * Update breadcrumb navigation
   * @param {string} viewName - Current view name
   */
  updateBreadcrumb(viewName) {
    const breadcrumb = document.querySelector('.breadcrumb, .nav-breadcrumb');
    if (!breadcrumb) return;
    
    const viewLabels = {
      overview: 'Tổng quan',
      expenses: 'Chi phí',
      revenue: 'Doanh thu',
      reports: 'Báo cáo',
      settings: 'Cài đặt'
    };
    
    const currentLabel = viewLabels[viewName] || viewName;
    breadcrumb.innerHTML = `
      <span class="breadcrumb-item">Thống kê</span>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">${currentLabel}</span>
    `;
  }
  
  /**
   * Register view configuration
   * @param {string} viewName - View name
   * @param {Object} config - View configuration
   */
  registerView(viewName, config) {
    this.viewConfig.set(viewName, {
      title: config.title || viewName,
      icon: config.icon || '',
      beforeShow: config.beforeShow || null,
      afterShow: config.afterShow || null,
      beforeHide: config.beforeHide || null,
      afterHide: config.afterHide || null,
      responsive: config.responsive || true
    });
  }
  
  /**
   * Get view configuration
   * @param {string} viewName - View name
   * @returns {Object|null}
   */
  getViewConfig(viewName) {
    return this.viewConfig.get(viewName) || null;
  }
  
  /**
   * Handle responsive layout changes
   */
  handleResponsiveLayout() {
    const width = window.innerWidth;
    let deviceType = 'desktop';
    
    if (width <= this.responsiveBreakpoints.mobile) {
      deviceType = 'mobile';
    } else if (width <= this.responsiveBreakpoints.tablet) {
      deviceType = 'tablet';
    }
    
    // Update body class for responsive styling
    document.body.className = document.body.className.replace(/device-\w+/, '');
    document.body.classList.add(`device-${deviceType}`);
    
    // Trigger responsive event
    this.triggerViewEvent('responsiveChange', {
      deviceType,
      width,
      height: window.innerHeight
    });
    
    // Handle mobile-specific view adjustments
    if (deviceType === 'mobile') {
      this.handleMobileLayout();
    }
  }
  
  /**
   * Handle mobile-specific layout adjustments
   */
  handleMobileLayout() {
    // Collapse sidebars on mobile
    const sidebars = document.querySelectorAll('.sidebar, .side-panel');
    sidebars.forEach(sidebar => {
      sidebar.classList.add('collapsed');
    });
    
    // Adjust table layouts for mobile
    const tables = document.querySelectorAll('.stats-table');
    tables.forEach(table => {
      if (!table.classList.contains('mobile-optimized')) {
        this.optimizeTableForMobile(table);
      }
    });
  }
  
  /**
   * Optimize table layout for mobile
   * @param {Element} table - Table element
   */
  optimizeTableForMobile(table) {
    table.classList.add('mobile-optimized');
    
    // Add horizontal scroll if needed
    if (!table.parentElement.classList.contains('table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  }
  
  /**
   * Trigger view event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  triggerViewEvent(eventName, data) {
    const event = new CustomEvent(`statistics${eventName}`, {
      detail: data,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Get current view state
   * @returns {Object}
   */
  getState() {
    return {
      currentView: this.currentView,
      viewHistory: [...this.viewHistory],
      registeredViews: Array.from(this.viewConfig.keys())
    };
  }
  
  /**
   * Reset view controller state
   */
  reset() {
    this.currentView = 'overview';
    this.viewHistory = [];
    this.switchToView('overview', { animate: false });
  }
}

// Create global view controller instance
export const viewController = new StatisticsViewController();

/**
 * Layout manager for responsive design
 */
export class LayoutManager {
  constructor() {
    this.currentLayout = 'default';
    this.layoutConfigs = new Map();
    this.setupResponsiveListener();
  }
  
  /**
   * Setup responsive window listener
   */
  setupResponsiveListener() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100);
    });
    
    // Initial resize check
    this.handleResize();
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    viewController.handleResponsiveLayout();
    this.adjustLayoutForScreenSize();
  }
  
  /**
   * Adjust layout based on screen size
   */
  adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    const containers = document.querySelectorAll('.stats-container, .dashboard-container');
    
    containers.forEach(container => {
      if (width <= 768) {
        container.classList.add('mobile-layout');
        container.classList.remove('tablet-layout', 'desktop-layout');
      } else if (width <= 1024) {
        container.classList.add('tablet-layout');
        container.classList.remove('mobile-layout', 'desktop-layout');
      } else {
        container.classList.add('desktop-layout');
        container.classList.remove('mobile-layout', 'tablet-layout');
      }
    });
  }
  
  /**
   * Toggle sidebar visibility
   * @param {string} sidebarId - Sidebar element ID
   */
  toggleSidebar(sidebarId) {
    const sidebar = document.getElementById(sidebarId);
    if (!sidebar) return;
    
    sidebar.classList.toggle('collapsed');
    
    // Adjust main content area
    const mainContent = document.querySelector('.main-content, .content-area');
    if (mainContent) {
      mainContent.classList.toggle('sidebar-collapsed');
    }
  }
  
  /**
   * Set grid layout
   * @param {string} containerId - Container ID
   * @param {string} layout - Layout type (grid-2, grid-3, grid-4, etc.)
   */
  setGridLayout(containerId, layout) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Remove existing grid classes
    container.className = container.className.replace(/grid-\w+/g, '');
    
    // Add new grid class
    container.classList.add(layout);
  }
}

// Create global layout manager instance
export const layoutManager = new LayoutManager();

/**
 * Initialize view controllers
 */
export function initializeViewControllers() {
  console.log("🎮 Initializing view controllers...");
  
  // Register default views
  viewController.registerView('overview', {
    title: 'Tổng quan',
    icon: '📊'
  });
  
  viewController.registerView('expenses', {
    title: 'Chi phí',
    icon: '💸'
  });
  
  viewController.registerView('revenue', {
    title: 'Doanh thu',
    icon: '💰'
  });
  
  viewController.registerView('reports', {
    title: 'Báo cáo',
    icon: '📈'
  });
  
  // Setup navigation event listeners
  setupNavigationListeners();
  
  // Initial layout setup
  layoutManager.handleResize();
  
  console.log("✅ View controllers initialized");
}

/**
 * Setup navigation event listeners
 */
function setupNavigationListeners() {
  // Handle view switching buttons
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-view], [data-subtab]');
    if (!button) return;
    
    const viewName = button.dataset.view || button.dataset.subtab;
    if (viewName) {
      event.preventDefault();
      viewController.switchToView(viewName);
    }
  });
  
  // Handle back button
  document.addEventListener('click', (event) => {
    if (event.target.matches('.back-button, [data-action="back"]')) {
      event.preventDefault();
      viewController.goBack();
    }
  });
  
  // Handle sidebar toggle
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle="sidebar"]');
    if (toggle) {
      event.preventDefault();
      const sidebarId = toggle.dataset.target || 'sidebar';
      layoutManager.toggleSidebar(sidebarId);
    }
  });
}

// Initialize on module load
document.addEventListener('DOMContentLoaded', () => {
  initializeViewControllers();
});

// Make functions available globally for legacy compatibility
window.viewController = viewController;
window.layoutManager = layoutManager;
window.initializeViewControllers = initializeViewControllers;

console.log('✅ viewControllers.js module loaded successfully');