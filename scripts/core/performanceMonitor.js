/**
 * Performance Monitor
 * Tracks and reports application performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadStart: performance.now(),
      domContentLoaded: null,
      windowLoaded: null,
      firstPaint: null,
      firstContentfulPaint: null,
      moduleLoadTimes: new Map(),
      tabSwitchTimes: new Map(),
      apiCallTimes: new Map()
    };
    
    this.setupEventListeners();
  }

  /**
   * Setup performance event listeners
   */
  setupEventListeners() {
    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now();
    });

    // Window Load
    window.addEventListener('load', () => {
      this.metrics.windowLoaded = performance.now();
      this.collectPaintMetrics();
      this.generateReport();
    });

    // Navigation API for SPA routing
    if ('navigation' in window) {
      navigation.addEventListener('navigate', (event) => {
        this.trackNavigation(event.destination.url);
      });
    }
  }

  /**
   * Collect paint timing metrics
   */
  collectPaintMetrics() {
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    }
  }

  /**
   * Track module loading time
   */
  trackModuleLoad(moduleName, startTime = null) {
    const start = startTime || performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        this.metrics.moduleLoadTimes.set(moduleName, duration);
        console.log(`📊 Module ${moduleName} loaded in ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Track tab switch performance
   */
  trackTabSwitch(tabName, startTime = null) {
    const start = startTime || performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        this.metrics.tabSwitchTimes.set(tabName, duration);
        console.log(`📊 Tab ${tabName} switched in ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Track API call performance
   */
  trackApiCall(apiName, startTime = null) {
    const start = startTime || performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        const existing = this.metrics.apiCallTimes.get(apiName) || [];
        existing.push(duration);
        this.metrics.apiCallTimes.set(apiName, existing);
        console.log(`📊 API ${apiName} completed in ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Track navigation performance
   */
  trackNavigation(url) {
    const start = performance.now();
    console.log(`🧭 Navigating to: ${url}`);
    
    // Return a tracker for the navigation completion
    return {
      end: () => {
        const duration = performance.now() - start;
        console.log(`📊 Navigation to ${url} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Get Core Web Vitals
   */
  async getCoreWebVitals() {
    const vitals = {};
    
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }
    }

    // First Input Delay (FID) would be measured on user interaction
    // Cumulative Layout Shift (CLS) would be measured over time
    
    return vitals;
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const now = performance.now();
    const memory = this.getMemoryUsage();
    
    const report = {
      timing: {
        totalLoadTime: now - this.metrics.loadStart,
        domContentLoaded: this.metrics.domContentLoaded - this.metrics.loadStart,
        windowLoaded: this.metrics.windowLoaded - this.metrics.loadStart,
        firstPaint: this.metrics.firstPaint,
        firstContentfulPaint: this.metrics.firstContentfulPaint
      },
      modules: {
        count: this.metrics.moduleLoadTimes.size,
        average: this.calculateAverage(Array.from(this.metrics.moduleLoadTimes.values())),
        slowest: this.findSlowest(this.metrics.moduleLoadTimes),
        details: Object.fromEntries(this.metrics.moduleLoadTimes)
      },
      tabs: {
        count: this.metrics.tabSwitchTimes.size,
        average: this.calculateAverage(Array.from(this.metrics.tabSwitchTimes.values())),
        slowest: this.findSlowest(this.metrics.tabSwitchTimes),
        details: Object.fromEntries(this.metrics.tabSwitchTimes)
      },
      api: {
        endpoints: this.metrics.apiCallTimes.size,
        calls: Array.from(this.metrics.apiCallTimes.values()).reduce((sum, arr) => sum + arr.length, 0),
        averages: this.calculateApiAverages(),
        details: Object.fromEntries(this.metrics.apiCallTimes)
      },
      memory: memory,
      recommendations: this.generateRecommendations()
    };

    console.group('📊 Performance Report');
    console.table(report.timing);
    console.log('Module Loading:', report.modules);
    console.log('Tab Switching:', report.tabs);
    console.log('API Calls:', report.api);
    if (memory) console.log('Memory Usage:', memory);
    console.log('Recommendations:', report.recommendations);
    console.groupEnd();

    return report;
  }

  /**
   * Calculate average from array of numbers
   */
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Find slowest entry in a Map
   */
  findSlowest(map) {
    let slowest = { name: '', time: 0 };
    map.forEach((time, name) => {
      if (time > slowest.time) {
        slowest = { name, time };
      }
    });
    return slowest;
  }

  /**
   * Calculate API call averages
   */
  calculateApiAverages() {
    const averages = {};
    this.metrics.apiCallTimes.forEach((times, name) => {
      averages[name] = this.calculateAverage(times);
    });
    return averages;
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check total load time
    const totalLoad = this.metrics.windowLoaded - this.metrics.loadStart;
    if (totalLoad > 3000) {
      recommendations.push('🐌 Total load time is over 3 seconds. Consider lazy loading more modules.');
    }

    // Check module count
    if (this.metrics.moduleLoadTimes.size > 50) {
      recommendations.push('📦 Large number of modules loaded. Consider code splitting.');
    }

    // Check slow modules
    const slowModules = Array.from(this.metrics.moduleLoadTimes.entries())
      .filter(([name, time]) => time > 500);
    if (slowModules.length > 0) {
      recommendations.push(`⚠️ Slow modules detected: ${slowModules.map(([name]) => name).join(', ')}`);
    }

    // Check memory usage
    const memory = this.getMemoryUsage();
    if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      recommendations.push('💾 High memory usage detected. Consider cleaning up unused objects.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance looks good!');
    }

    return recommendations;
  }

  /**
   * Get current performance snapshot
   */
  getSnapshot() {
    return {
      timestamp: Date.now(),
      ...this.metrics,
      memory: this.getMemoryUsage()
    };
  }
}

// Create global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Export functions bound to the instance
export const trackModuleLoad = (moduleName, startTime) => performanceMonitor.trackModuleLoad(moduleName, startTime);
export const trackTabSwitch = (tabName, startTime) => performanceMonitor.trackTabSwitch(tabName, startTime);
export const trackApiCall = (apiName, startTime) => performanceMonitor.trackApiCall(apiName, startTime);
export const trackNavigation = (url) => performanceMonitor.trackNavigation(url);
export const getMemoryUsage = () => performanceMonitor.getMemoryUsage();
export const getCoreWebVitals = () => performanceMonitor.getCoreWebVitals();
export const generateReport = () => performanceMonitor.generateReport();
export const getSnapshot = () => performanceMonitor.getSnapshot();

// Make available globally
window.performanceMonitor = performanceMonitor;

export default performanceMonitor;