/**
 * lazyLoader.js
 * 
 * Utility for lazy loading heavy components like charts and tables
 * to improve initial page load performance
 */

/**
 * Intersection Observer for lazy loading
 */
class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '100px', // Load when 100px away from viewport
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
    
    this.loadedElements = new Set();
  }
  
  /**
   * Handle element intersection
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
        this.loadElement(entry.target);
        this.loadedElements.add(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  /**
   * Load lazy element
   */
  async loadElement(element) {
    const loadType = element.dataset.lazy;
    
    try {
      switch (loadType) {
        case 'chart':
          await this.loadChart(element);
          break;
        case 'table':
          await this.loadTable(element);
          break;
        case 'true':
          await this.loadGeneric(element);
          break;
        default:
          console.warn('Unknown lazy load type:', loadType);
      }
    } catch (error) {
      console.error('Lazy loading failed:', error);
    }
  }
  
  /**
   * Load chart component
   */
  async loadChart(chartContainer) {
    // console.log('⚡ Lazy loading chart:', chartContainer.id);
    
    // Add loading indicator
    chartContainer.classList.add('loading');
    
    // Simulate chart loading (replace with actual chart library)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
      const canvas = chartContainer.querySelector('canvas');
      if (canvas) {
        // Initialize actual chart here
        // console.log('📊 Chart initialized:', canvas.id);
      }
    }
    
    chartContainer.classList.remove('loading');
    chartContainer.classList.add('loaded');
  }
  
  /**
   * Load table component
   */
  async loadTable(tableContainer) {
    // console.log('⚡ Lazy loading table:', tableContainer.id);
    
    // Add loading indicator
    tableContainer.classList.add('loading');
    
    // Load table data (replace with actual data loading)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    tableContainer.classList.remove('loading');
    tableContainer.classList.add('loaded');
  }
  
  /**
   * Load generic lazy component
   */
  async loadGeneric(element) {
    // console.log('⚡ Lazy loading element:', element.className);
    
    element.classList.add('loading');
    
    // Generic loading logic
    await new Promise(resolve => setTimeout(resolve, 10));
    
    element.classList.remove('loading');
    element.classList.add('loaded');
  }
  
  /**
   * Observe elements for lazy loading
   */
  observe(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      this.observer.observe(element);
    });
    
    // console.log(`👁️ Observing ${elements.length} lazy elements`);
  }
  
  /**
   * Stop observing all elements
   */
  disconnect() {
    this.observer.disconnect();
    this.loadedElements.clear();
  }
}

/**
 * Global lazy loader instance
 */
const lazyLoader = new LazyLoader();

/**
 * Initialize lazy loading for overview report
 */
export function initOverviewLazyLoading() {
  // Observe charts and tables
  lazyLoader.observe('[data-lazy="true"]');
  lazyLoader.observe('[data-lazy="chart"]');
  lazyLoader.observe('[data-lazy="table"]');
  
  // console.log('✅ Lazy loading initialized for overview report');
}

/**
 * Preload critical elements immediately
 */
export function preloadCriticalElements() {
  const criticalElements = document.querySelectorAll('.kpi-card, .status-card');
  criticalElements.forEach(element => {
    element.classList.add('loaded');
  });
  
  // console.log(`⚡ Preloaded ${criticalElements.length} critical elements`);
}

/**
 * CSS for lazy loading states
 */
export function addLazyLoadingStyles() {
  if (document.getElementById('lazy-loading-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'lazy-loading-styles';
  styles.textContent = `
    /* Lazy loading states */
    [data-lazy] {
      transition: opacity 0.3s ease;
    }
    
    [data-lazy].loading {
      opacity: 0.5;
      position: relative;
    }
    
    [data-lazy].loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    [data-lazy].loaded {
      opacity: 1;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Performance optimizations */
    .charts-row, .tables-row {
      contain: layout style paint;
    }
    
    .chart-container, .data-table-container {
      contain: layout style;
    }
  `;
  
  document.head.appendChild(styles);
}

// Auto-initialize styles
addLazyLoadingStyles();

export { lazyLoader };
export default LazyLoader;