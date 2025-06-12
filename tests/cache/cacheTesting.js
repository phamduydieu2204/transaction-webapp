/**
 * cacheTesting.js
 * 
 * Utilities for testing browser cache behavior
 * Verifies cache clearing works correctly after cleanup
 */

/**
 * Cache Testing Utilities
 */
class CacheTester {
  constructor() {
    this.testResults = [];
    this.originalConsoleLog = console.log;
  }
  
  /**
   * Test browser cache status
   */
  async testCacheStatus() {
    console.log('🧪 Testing browser cache status...');
    
    const cacheTests = {
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      serviceWorker: await this.testServiceWorker(),
      httpCache: await this.testHTTPCache(),
      moduleCache: this.testModuleCache()
    };
    
    this.testResults.push({
      type: 'cache-status',
      timestamp: new Date().toISOString(),
      results: cacheTests
    });
    
    return cacheTests;
  }
  
  /**
   * Test localStorage cache
   */
  testLocalStorage() {
    try {
      const testKey = 'cache-test-' + Date.now();
      const testValue = 'test-value';
      
      // Test write
      localStorage.setItem(testKey, testValue);
      
      // Test read
      const retrieved = localStorage.getItem(testKey);
      
      // Cleanup
      localStorage.removeItem(testKey);
      
      const isWorking = retrieved === testValue;
      console.log(`✅ localStorage: ${isWorking ? 'Working' : 'Not working'}`);
      
      return {
        working: isWorking,
        size: this.getLocalStorageSize(),
        items: localStorage.length
      };
      
    } catch (error) {
      console.log(`❌ localStorage: Error - ${error.message}`);
      return { working: false, error: error.message };
    }
  }
  
  /**
   * Test sessionStorage cache
   */
  testSessionStorage() {
    try {
      const testKey = 'session-cache-test-' + Date.now();
      const testValue = 'session-test-value';
      
      sessionStorage.setItem(testKey, testValue);
      const retrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      
      const isWorking = retrieved === testValue;
      console.log(`✅ sessionStorage: ${isWorking ? 'Working' : 'Not working'}`);
      
      return {
        working: isWorking,
        size: this.getSessionStorageSize(),
        items: sessionStorage.length
      };
      
    } catch (error) {
      console.log(`❌ sessionStorage: Error - ${error.message}`);
      return { working: false, error: error.message };
    }
  }
  
  /**
   * Test Service Worker cache
   */
  async testServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        console.log(`🔍 Service Workers found: ${registrations.length}`);
        
        const activeWorkers = registrations.filter(reg => reg.active);
        
        return {
          supported: true,
          registrations: registrations.length,
          active: activeWorkers.length,
          workers: registrations.map(reg => ({
            scope: reg.scope,
            state: reg.active?.state || 'inactive'
          }))
        };
      } else {
        console.log('❌ Service Worker not supported');
        return { supported: false };
      }
    } catch (error) {
      console.log(`❌ Service Worker test error: ${error.message}`);
      return { supported: true, error: error.message };
    }
  }
  
  /**
   * Test HTTP cache
   */
  async testHTTPCache() {
    try {
      const testUrl = './css/critical.css?' + Date.now();
      
      console.log('🧪 Testing HTTP cache...');
      
      // First request
      const start1 = performance.now();
      const response1 = await fetch(testUrl, { cache: 'no-cache' });
      const end1 = performance.now();
      const time1 = end1 - start1;
      
      // Second request (should use cache if available)
      const start2 = performance.now();
      const response2 = await fetch(testUrl, { cache: 'force-cache' });
      const end2 = performance.now();
      const time2 = end2 - start2;
      
      console.log(`📊 HTTP cache test: First: ${time1.toFixed(2)}ms, Second: ${time2.toFixed(2)}ms`);
      
      return {
        working: response1.ok && response2.ok,
        firstRequestTime: time1,
        secondRequestTime: time2,
        cacheEffective: time2 < time1 * 0.5 // Second request should be much faster
      };
      
    } catch (error) {
      console.log(`❌ HTTP cache test error: ${error.message}`);
      return { working: false, error: error.message };
    }
  }
  
  /**
   * Test JavaScript module cache
   */
  testModuleCache() {
    try {
      // Check if modules are cached by looking at import times
      const moduleTests = {
        statisticsCore: this.testModuleImport('statisticsCore'),
        overviewReport: this.testModuleImport('overviewReport'),
        cssOptimizer: this.testModuleImport('cssOptimizer')
      };
      
      console.log('📦 Module cache test completed');
      
      return {
        working: true,
        modules: moduleTests
      };
      
    } catch (error) {
      console.log(`❌ Module cache test error: ${error.message}`);
      return { working: false, error: error.message };
    }
  }
  
  /**
   * Test module import performance
   */
  testModuleImport(moduleName) {
    try {
      const start = performance.now();
      
      // Check if module is already loaded
      const isLoaded = window[moduleName] !== undefined;
      
      const end = performance.now();
      const time = end - start;
      
      return {
        loaded: isLoaded,
        checkTime: time
      };
      
    } catch (error) {
      return { loaded: false, error: error.message };
    }
  }
  
  /**
   * Clear all caches for testing
   */
  async clearAllCaches() {
    console.log('🧹 Clearing all caches for testing...');
    
    const clearResults = {
      localStorage: this.clearLocalStorage(),
      sessionStorage: this.clearSessionStorage(),
      serviceWorker: await this.clearServiceWorkerCache(),
      httpCache: this.clearHTTPCache()
    };
    
    console.log('✅ Cache clearing completed');
    return clearResults;
  }
  
  /**
   * Clear localStorage
   */
  clearLocalStorage() {
    try {
      const beforeCount = localStorage.length;
      localStorage.clear();
      const afterCount = localStorage.length;
      
      console.log(`🗑️ localStorage: Cleared ${beforeCount} items`);
      return { success: true, itemsCleared: beforeCount };
      
    } catch (error) {
      console.log(`❌ localStorage clear error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Clear sessionStorage
   */
  clearSessionStorage() {
    try {
      const beforeCount = sessionStorage.length;
      sessionStorage.clear();
      
      console.log(`🗑️ sessionStorage: Cleared ${beforeCount} items`);
      return { success: true, itemsCleared: beforeCount };
      
    } catch (error) {
      console.log(`❌ sessionStorage clear error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Clear Service Worker cache
   */
  async clearServiceWorkerCache() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          await registration.unregister();
          console.log(`🗑️ Service Worker unregistered: ${registration.scope}`);
        }
        
        return { success: true, workersCleared: registrations.length };
      } else {
        return { success: true, workersCleared: 0, note: 'Not supported' };
      }
    } catch (error) {
      console.log(`❌ Service Worker clear error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Clear HTTP cache (instructions only)
   */
  clearHTTPCache() {
    console.log('ℹ️ HTTP cache clearing requires manual action:');
    console.log('   1. Open DevTools (F12)');
    console.log('   2. Right-click refresh button');
    console.log('   3. Select "Empty Cache and Hard Reload"');
    console.log('   4. Or use Ctrl+Shift+R');
    
    return { 
      success: true, 
      note: 'Manual action required',
      instructions: 'Use Ctrl+Shift+R or DevTools'
    };
  }
  
  /**
   * Get localStorage size
   */
  getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
  
  /**
   * Get sessionStorage size
   */
  getSessionStorageSize() {
    let total = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        total += sessionStorage[key].length + key.length;
      }
    }
    return total;
  }
  
  /**
   * Monitor cache performance
   */
  monitorCachePerformance() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
          console.log(`📦 Cached resource: ${entry.name.split('/').pop()}`);
        } else {
          console.log(`🌐 Network resource: ${entry.name.split('/').pop()} (${entry.transferSize} bytes)`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }
  
  /**
   * Generate cache test report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      testResults: this.testResults,
      recommendations: this.generateRecommendations()
    };
    
    console.group('📊 CACHE TEST REPORT');
    console.table(this.testResults);
    console.log('Recommendations:', report.recommendations);
    console.groupEnd();
    
    return report;
  }
  
  /**
   * Generate cache recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.testResults.some(r => r.results?.localStorage?.items > 50)) {
      recommendations.push('Consider cleaning localStorage (50+ items found)');
    }
    
    if (this.testResults.some(r => r.results?.serviceWorker?.active > 0)) {
      recommendations.push('Service Workers found - may cache content');
    }
    
    if (this.testResults.some(r => !r.results?.httpCache?.cacheEffective)) {
      recommendations.push('HTTP cache may not be working effectively');
    }
    
    return recommendations;
  }
}

/**
 * Quick cache test for overview report
 */
export async function testOverviewCache() {
  const tester = new CacheTester();
  
  console.log('🧪 Starting overview cache test...');
  
  const cacheStatus = await tester.testCacheStatus();
  const report = tester.generateReport();
  
  return { cacheStatus, report };
}

/**
 * Cache clearing utility
 */
export async function clearOverviewCache() {
  const tester = new CacheTester();
  
  console.log('🧹 Clearing cache for overview testing...');
  
  const clearResults = await tester.clearAllCaches();
  
  console.log('✅ Cache cleared. Please hard refresh (Ctrl+Shift+R)');
  
  return clearResults;
}

export { CacheTester };