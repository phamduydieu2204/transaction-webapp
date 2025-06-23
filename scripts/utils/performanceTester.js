/**
 * performanceTester.js
 * 
 * Performance testing and monitoring utilities
 * for template optimization verification
 */

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
    this.observers = [];
    this.isSupported = 'performance' in window && 'measure' in performance;
  }
  
  /**
   * Start timing a specific operation
   */
  startTiming(name) {
    if (!this.isSupported) return;
    
    const markName = `${name}-start`;
    performance.mark(markName);
    this.marks.set(name, { start: markName, startTime: performance.now() });
    
    console.log(`⏱️ Started timing: ${name}`);
  }
  
  /**
   * End timing and calculate duration
   */
  endTiming(name) {
    if (!this.isSupported || !this.marks.has(name)) return 0;
    
    const mark = this.marks.get(name);
    const endMarkName = `${name}-end`;
    const measureName = `${name}-duration`;
    
    performance.mark(endMarkName);
    performance.measure(measureName, mark.start, endMarkName);
    
    const measure = performance.getEntriesByName(measureName)[0];
    const duration = measure ? measure.duration : performance.now() - mark.startTime;
    
    this.measures.set(name, duration);
    
    return duration;
  }
  
  /**
   * Get all timing results
   */
  getResults() {
    return Object.fromEntries(this.measures);
  }
  
  /**
   * Clear all measurements
   */
  clear() {
    if (this.isSupported) {
      performance.clearMarks();
      performance.clearMeasures();
    }
    this.marks.clear();
    this.measures.clear();
  }
  
  /**
   * Monitor Core Web Vitals
   */
  monitorWebVitals() {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
        }
      });
    });
    
    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
    
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }
    
    // Cumulative Layout Shift
    let cumulativeLayoutShift = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      });
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }
  
  /**
   * Monitor resource loading
   */
  monitorResourceLoading() {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('.css') || entry.name.includes('.js') || entry.name.includes('.html')) {
        }
      });
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }
  
  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Template Performance Tester
 */
class TemplatePerformanceTester {
  constructor() {
    this.monitor = new PerformanceMonitor();
    this.results = {};
  }
  
  /**
   * Test template loading performance
   */
  async testTemplateLoading() {
    
    this.monitor.startTiming('template-total');
    this.monitor.startTiming('template-fetch');
    
    try {
      const response = await fetch('./partials/tabs/report-pages/overview-report.html', {
        cache: 'no-cache' // Force fresh fetch for accurate testing
      });
      
      this.monitor.endTiming('template-fetch');
      this.monitor.startTiming('template-parse');
      
      const html = await response.text();
      
      this.monitor.endTiming('template-parse');
      this.monitor.startTiming('template-render');
      
      // Test DOM manipulation
      const testContainer = document.createElement('div');
      testContainer.innerHTML = html;
      
      this.monitor.endTiming('template-render');
      this.monitor.endTiming('template-total');
      
      this.results.templateLoading = this.monitor.getResults();
      
      
    } catch (error) {
      console.error('❌ Template loading test failed:', error);
    }
  }
  
  /**
   * Test CSS loading performance
   */
  async testCSSLoading() {
    
    this.monitor.startTiming('css-critical');
    
    // Test critical CSS loading
    const criticalCSS = `
      .test-element { color: red; }
      .kpi-card { background: white; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
    
    this.monitor.endTiming('css-critical');
    
    // Test lazy CSS loading
    this.monitor.startTiming('css-lazy');
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'data:text/css,body { margin: 0; }';
    
    await new Promise(resolve => {
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
    
    this.monitor.endTiming('css-lazy');
    
    // Cleanup
    document.head.removeChild(style);
    document.head.removeChild(link);
    
    this.results.cssLoading = this.monitor.getResults();
  }
  
  /**
   * Test lazy loading performance
   */
  async testLazyLoading() {
    
    this.monitor.startTiming('lazy-observer');
    
    // Create test elements
    const testElements = [];
    for (let i = 0; i < 5; i++) {
      const element = document.createElement('div');
      element.dataset.lazy = 'true';
      element.style.height = '200px';
      element.style.background = '#f0f0f0';
      element.style.margin = '10px';
      document.body.appendChild(element);
      testElements.push(element);
    }
    
    // Test intersection observer
    let observedCount = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observedCount++;
          entry.target.style.background = '#4CAF50';
        }
      });
    });
    
    testElements.forEach(element => observer.observe(element));
    
    this.monitor.endTiming('lazy-observer');
    
    // Trigger intersection
    testElements[0].scrollIntoView();
    
    // Wait for observation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Cleanup
    observer.disconnect();
    testElements.forEach(element => document.body.removeChild(element));
    
    this.results.lazyLoading = this.monitor.getResults();
  }
  
  /**
   * Run comprehensive performance test
   */
  async runFullTest() {
    
    // Start monitoring
    this.monitor.monitorWebVitals();
    this.monitor.monitorResourceLoading();
    
    // Run individual tests
    await this.testTemplateLoading();
    await this.testCSSLoading();
    await this.testLazyLoading();
    
    // Generate report
    this.generateReport();
    
  }
  
  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      results: this.results,
      summary: this.generateSummary()
    };
    
    console.group('📊 PERFORMANCE TEST REPORT');
    console.table(this.results);
    console.log('Summary:', report.summary);
    console.groupEnd();
    
    // Store in sessionStorage for analysis
    sessionStorage.setItem('performanceTestResults', JSON.stringify(report));
    
    return report;
  }
  
  /**
   * Generate performance summary
   */
  generateSummary() {
    const allTimes = Object.values(this.results).flatMap(Object.values);
    const totalTime = allTimes.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / allTimes.length;
    
    return {
      totalTime: totalTime.toFixed(2) + 'ms',
      averageTime: averageTime.toFixed(2) + 'ms',
      fastestOperation: Math.min(...allTimes).toFixed(2) + 'ms',
      slowestOperation: Math.max(...allTimes).toFixed(2) + 'ms',
      operationCount: allTimes.length
    };
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    this.monitor.disconnect();
    this.monitor.clear();
  }
}

/**
 * Quick performance test for overview report
 */
export async function testOverviewPerformance() {
  const tester = new TemplatePerformanceTester();
  
  try {
    await tester.runFullTest();
    return tester.results;
  } finally {
    tester.cleanup();
  }
}

/**
 * Performance utilities
 */
export const PerfUtils = {
  // Measure function execution time
  measureFunction: (fn, name) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
  
  // Check if page is loaded
  isPageLoaded: () => document.readyState === 'complete',
  
  // Wait for page load
  waitForPageLoad: () => new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  })
};

export { PerformanceMonitor, TemplatePerformanceTester };